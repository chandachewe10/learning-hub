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
  const response = await fetch(`${LIPILA_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": process.env.LIPILA_API_KEY!,
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || `Lipila error: ${response.status}`);
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
