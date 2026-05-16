import { useEffect } from "react";

const SITE_NAME = "StreamFetch";
const BASE_URL = "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

interface SEOOptions {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  ogImage?: string;
  jsonLd?: object | object[];
}

function setMeta(selector: string, attribute: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attr, val] = selector.replace("meta[", "").replace("]", "").split('="');
    el.setAttribute(attr, val.replace('"', ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function injectJsonLd(data: object | object[]) {
  const existing = document.querySelector('script[data-seo-jsonld]');
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo-jsonld", "true");
  script.textContent = JSON.stringify(Array.isArray(data) ? data : [data]);
  document.head.appendChild(script);
}

function removeJsonLd() {
  const existing = document.querySelector('script[data-seo-jsonld]');
  if (existing) existing.remove();
}

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}: SEOOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;

    setMeta('meta[name="title"]', "content", fullTitle);
    setMeta('meta[name="description"]', "content", description);
    if (keywords) {
      setMeta('meta[name="keywords"]', "content", keywords);
    }
    setMeta(
      'meta[name="robots"]',
      "content",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    const canonicalUrl = canonical
      ? `${BASE_URL}${canonical}`
      : `${BASE_URL}${window.location.pathname}`;
    setLink("canonical", canonicalUrl);

    setMeta('meta[property="og:site_name"]', "content", SITE_NAME);
    setMeta('meta[property="og:locale"]', "content", "en_US");
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", ogType);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", ogImage);

    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", ogImage);
    setMeta('meta[name="twitter:url"]', "content", canonicalUrl);

    if (jsonLd) {
      injectJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }
  }, [title, description, keywords, canonical, noindex, ogType, ogImage, jsonLd]);
}
