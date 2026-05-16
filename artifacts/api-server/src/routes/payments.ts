import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1";

const PLAN_PRICES_MONTHLY: Record<string, number> = {
  basic: 1.99,
  pro: 5.99,
  elite: 8.99,
};

// Annual = monthly * 12 with 20% off
const PLAN_PRICES_ANNUAL: Record<string, number> = {
  basic: Math.round(1.99 * 12 * 0.8 * 100) / 100,  // 19.10
  pro:   Math.round(5.99 * 12 * 0.8 * 100) / 100,  // 57.50
  elite: Math.round(8.99 * 12 * 0.8 * 100) / 100,  // 86.30
};

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, unknown>, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

// POST /payments/create-order
router.post("/create-order", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, billing = "monthly" } = req.body as { plan: string; billing?: "monthly" | "annual" };

    if (!["basic", "pro", "elite"].includes(plan)) {
      res.status(400).json({ error: "Invalid plan" });
      return;
    }
    if (!["monthly", "annual"].includes(billing)) {
      res.status(400).json({ error: "Invalid billing period" });
      return;
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "Payment not configured", message: "NOWPayments credentials are not set up yet." });
      return;
    }

    const priceTable = billing === "annual" ? PLAN_PRICES_ANNUAL : PLAN_PRICES_MONTHLY;
    const amount = priceTable[plan];
    const billingLabel = billing === "annual" ? "Annual" : "Monthly";
    const planLabel = `YTSave ${plan.charAt(0).toUpperCase() + plan.slice(1)} – ${billingLabel}`;

    const orderId = `SF-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const appDomain = process.env.APP_DOMAIN || `https://${process.env.REPLIT_DEV_DOMAIN}`;

    const invoiceBody = {
      price_amount: amount,
      price_currency: "usd",
      order_id: orderId,
      order_description: planLabel,
      ipn_callback_url: `${appDomain}/api/payments/webhook`,
      success_url: `${appDomain}/pricing?payment=success`,
      cancel_url: `${appDomain}/pricing?payment=cancelled`,
    };

    const nowRes = await fetch(`${NOWPAYMENTS_API}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceBody),
    });

    const nowData = await nowRes.json() as {
      id?: string;
      invoice_url?: string;
      status?: string;
      message?: string;
    };

    if (!nowRes.ok || !nowData.invoice_url) {
      console.error("NOWPayments error:", nowData);
      res.status(502).json({ error: "Payment error", message: nowData.message || "Failed to create payment invoice." });
      return;
    }

    await Order.create({
      userId: req.userId,
      plan,
      billing,
      amountUsd: amount,
      merchantTradeNo: orderId,
      nowpaymentsOrderId: nowData.id,
      status: "pending",
    });

    res.json({
      orderId,
      invoiceId: nowData.id,
      invoiceUrl: nowData.invoice_url,
      plan,
      billing,
      amount,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /payments/order-status/:orderId
router.get("/order-status/:orderId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ merchantTradeNo: req.params.orderId, userId: req.userId });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({ status: order.status, plan: order.plan });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /payments/webhook  (called by NOWPayments IPN, no auth middleware)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    const signature = req.headers["x-nowpayments-sig"] as string;

    if (ipnSecret && signature) {
      const sorted = sortObjectKeys(req.body as Record<string, unknown>);
      const expected = crypto
        .createHmac("sha512", ipnSecret)
        .update(JSON.stringify(sorted))
        .digest("hex");

      if (expected !== signature) {
        res.status(401).json({ error: "Invalid signature" });
        return;
      }
    }

    const { payment_status, order_id, payment_id } = req.body as {
      payment_status: string;
      order_id: string;
      payment_id: string;
    };

    if (payment_status === "finished" || payment_status === "confirmed") {
      const order = await Order.findOneAndUpdate(
        { merchantTradeNo: order_id },
        { status: "paid", nowpaymentsOrderId: payment_id },
        { new: true }
      );

      if (order) {
        const expiry = new Date();
        if (order.billing === "annual") {
          expiry.setFullYear(expiry.getFullYear() + 1);
        } else {
          expiry.setMonth(expiry.getMonth() + 1);
        }
        await User.findByIdAndUpdate(order.userId, {
          plan: order.plan,
          planExpiresAt: expiry,
        });
      }
    } else if (payment_status === "expired" || payment_status === "failed") {
      await Order.findOneAndUpdate(
        { merchantTradeNo: order_id },
        { status: payment_status === "expired" ? "expired" : "failed" }
      );
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
