import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "ZMW") {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateReferenceId(prefix = "lp"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.replace(/[^a-z0-9]/gi, "").substring(0, 20);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `260${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("260") && cleaned.length === 12) {
    return cleaned;
  }
  return cleaned;
}

export function detectOperator(phone: string): string {
  const num = formatPhone(phone);
  const prefix = num.substring(3, 5);
  const airtel = ["97", "77", "78", "79"];
  const mtn = ["96", "76"];
  const zamtel = ["95", "75"];
  if (airtel.includes(prefix)) return "AIRTEL";
  if (mtn.includes(prefix)) return "MTN";
  if (zamtel.includes(prefix)) return "ZAMTEL";
  return "UNKNOWN";
}

export function truncate(str: string, length = 100): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
