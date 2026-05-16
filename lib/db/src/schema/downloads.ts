import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const downloadsTable = pgTable("downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  videoTitle: text("video_title").notNull(),
  videoUrl: text("video_url").notNull(),
  selectedFormat: text("selected_format").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloadsTable).omit({ id: true, createdAt: true });
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloadsTable.$inferSelect;
