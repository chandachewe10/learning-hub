const LIPILA_BASE = "https://api.lipila.dev";

export interface MomoPayload {
  referenceId: string;
  amount: number;
  narration: string;
  accountNumber: string;
  currency: string;
  email: string;
}

export interface CardPayload {
  customerInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    city: string;
    country: string;
    address: string;
    zip: string;
    email: string;
  };
  collectionRequest: {
    referenceId: string;
    amount: number;
    narration: string;
    accountNumber: string;
    currency: string;
    backUrl: string;
    redirectUrl: string;
  };
}

export type LipilaPayload =
  | { type: "momo"; data: MomoPayload }
  | { type: "card"; data: CardPayload };

async function lipilaRequest(endpoint: string, data: unknown) {
  const apiKey = process.env.LIPILA_API_KEY;
  if (!apiKey || apiKey === "your-lipila-api-key") {
    throw new Error(
      "Payment gateway is not configured. Please contact support."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${LIPILA_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(data),
    });
  } catch (networkErr) {
    throw new Error("Could not reach the payment gateway. Check your connection and try again.");
  }

  // Parse body safely — Lipila occasionally returns empty bodies on errors
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Payment gateway returned an unexpected response (HTTP ${response.status})${text ? `: ${text.slice(0, 120)}` : "."}`
    );
  }

  if (!response.ok) {
    const msg =
      (json as Record<string, string>)?.message ||
      (json as Record<string, string>)?.error ||
      `Payment gateway error (${response.status})`;
    throw new Error(msg);
  }

  return json;
}

export async function initiateMobileMoney(payload: MomoPayload) {
  return lipilaRequest("/api/v1/collections/mobile-money", payload);
}

export async function initiateCardPayment(payload: CardPayload) {
  return lipilaRequest("/api/v1/collections/card", payload);
}

export function extractPaymentUrl(data: Record<string, unknown>): string | null {
  const d = data as Record<string, string>;
  const nested = (data.data as Record<string, string> | undefined)?.paymentUrl;
  return d.cardRedirectionUrl || d.paymentUrl || nested || d.redirectUrl || null;
}
