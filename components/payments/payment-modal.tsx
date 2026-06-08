"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Smartphone, CreditCard, CheckCircle, AlertCircle, Loader2, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatPrice, detectOperator, formatPhone } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: "SUBSCRIPTION" | "COURSE" | "LESSON";
  courseId?: string;
  subscriptionPlan?: "MONTHLY" | "YEARLY";
  amount: number;
  description: string;
}

type Step = "method" | "momo" | "card" | "processing" | "success" | "error";

const OPERATORS: Record<string, { name: string; color: string }> = {
  AIRTEL: { name: "Airtel Money", color: "text-red-600 bg-red-50" },
  MTN: { name: "MTN Mobile Money", color: "text-yellow-600 bg-yellow-50" },
  ZAMTEL: { name: "Zamtel Kwacha", color: "text-green-600 bg-green-50" },
  UNKNOWN: { name: "Mobile Money", color: "text-slate-600 bg-slate-50" },
};

export function PaymentModal({
  open,
  onClose,
  type,
  courseId,
  subscriptionPlan,
  amount,
  description,
}: PaymentModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>("method");
  const [payMethod, setPayMethod] = useState<"momo" | "card">("momo");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [cardUrl, setCardUrl] = useState("");

  const operator = phone.length >= 6 ? detectOperator(phone) : null;
  const operatorInfo = operator ? OPERATORS[operator] : null;

  const handleMomoPayment = async () => {
    if (!session) return;
    if (!phone || phone.length < 9) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }

    setStep("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/payments/lipila", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "momo",
          amount,
          phoneNumber: phone,
          paymentType: type,
          courseId,
          subscriptionPlan,
          email: session.user.email,
          name: session.user.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      setReferenceId(data.referenceId);
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setStep("error");
    }
  };

  const handleCardPayment = async () => {
    if (!session) return;
    setStep("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/payments/lipila", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          amount,
          phoneNumber: phone || "260970000000",
          paymentType: type,
          courseId,
          subscriptionPlan,
          email: session.user.email,
          name: session.user.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      if (data.paymentUrl) {
        setCardUrl(data.paymentUrl);
        setStep("processing");
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 2000);
      } else {
        setReferenceId(data.referenceId);
        setStep("success");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setStep("error");
    }
  };

  const handleClose = () => {
    if (step === "success") {
      router.refresh();
    }
    setStep("method");
    setPhone("");
    setErrorMsg("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {description} — <strong>{formatPrice(amount, "ZMW")}</strong>
          </DialogDescription>
        </DialogHeader>

        {step === "method" && (
          <div className="space-y-4">
            <Tabs value={payMethod} onValueChange={(v) => setPayMethod(v as "momo" | "card")}>
              <TabsList className="w-full">
                <TabsTrigger value="momo" className="flex-1 gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile Money
                </TabsTrigger>
                <TabsTrigger value="card" className="flex-1 gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card
                </TabsTrigger>
              </TabsList>

              <TabsContent value="momo" className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Zambian Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="0970 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
                      className="pl-9"
                      type="tel"
                    />
                  </div>
                  {operatorInfo && operator !== "UNKNOWN" && (
                    <p className={`text-xs px-2 py-1 rounded-md font-medium w-fit ${operatorInfo.color}`}>
                      {operatorInfo.name} detected
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Supports Airtel, MTN, and Zamtel numbers</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Amount</span>
                    <span>{formatPrice(amount, "ZMW")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t pt-2">
                    <span>Total</span>
                    <span>{formatPrice(amount, "ZMW")}</span>
                  </div>
                </div>

                <Button onClick={handleMomoPayment} className="w-full" size="lg" variant="gradient">
                  <Smartphone className="w-4 h-4" />
                  Pay with Mobile Money
                </Button>
                <p className="text-xs text-center text-slate-500">
                  You&apos;ll receive a payment prompt on your phone
                </p>
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-4">
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1">
                  <p className="font-medium">Secure Card Payment via Lipila</p>
                  <p className="text-xs text-blue-600">You&apos;ll be redirected to Lipila&apos;s secure checkout page to complete your payment.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number (optional)</Label>
                  <Input
                    placeholder="0970 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
                    type="tel"
                  />
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatPrice(amount, "ZMW")}</span>
                  </div>
                </div>
                <Button onClick={handleCardPayment} className="w-full" size="lg">
                  <CreditCard className="w-4 h-4" />
                  Pay with Card
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">
                {cardUrl ? "Redirecting to payment page..." : "Processing payment..."}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {payMethod === "momo"
                  ? "Please approve the payment on your phone"
                  : "You will be redirected shortly"}
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900 text-lg">Payment Initiated!</p>
              <p className="text-sm text-slate-500 mt-1">
                {payMethod === "momo"
                  ? "Check your phone and approve the payment to complete enrollment."
                  : "Your payment is being processed."}
              </p>
              {referenceId && (
                <p className="text-xs text-slate-400 mt-2">Reference: {referenceId}</p>
              )}
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Payment Failed</p>
              <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
                Try Again
              </Button>
              <Button variant="ghost" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
