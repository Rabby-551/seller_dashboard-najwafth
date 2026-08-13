import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  const locale = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-IE" : "fr-FR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDate(value?: string | Date) {
  if (!value) {
    return "N/A";
  }

  const locale = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getStatusTone(status?: string) {
  switch (status) {
    case "delivered":
    case "verified":
    case "accepted":
      return "success";
    case "pending":
    case "in_progress":
      return "warning";
    case "cancelled":
    case "rejected":
    case "not verified":
      return "danger";
    default:
      return "default";
  }
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTPUBLICBASEURL || "http://localhost:5001/api/v1";
}

export function getAssetUrl(path?: unknown) {
  let value: string | undefined;
  if (typeof path === "string") {
    value = path;
  } else if (path && typeof path === "object") {
    const obj = path as Record<string, unknown>;
    const candidate = obj.url ?? obj.path ?? obj.src ?? obj.location;
    if (typeof candidate === "string") {
      value = candidate;
    }
  }
  if (!value) {
    return null;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const base = getBaseUrl().replace(/\/api\/v\d+\/?$/i, "").replace(/\/$/, "");
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalized}`;
}

export function toText(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const candidate = obj.orderId ?? obj.name ?? obj.title ?? obj._id;
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
    return fallback;
  }
  return fallback;
}

export function toCount(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (Array.isArray(value)) return value.length;
  return fallback;
}

export function timeAgo(value?: string | Date) {
  if (!value) return "";
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const french = typeof document === "undefined" || document.documentElement.lang !== "en";
  if (seconds < 60) return french ? `il y a ${seconds} s` : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return french ? `il y a ${minutes} min` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return french ? `il y a ${hours} h` : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return french ? `il y a ${days} j` : `${days} days ago`;
}
