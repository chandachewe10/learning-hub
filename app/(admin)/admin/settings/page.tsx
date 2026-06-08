import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Settings, Globe, Shield, CreditCard, Mail, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  const settings = [
    {
      icon: Globe, title: "General", color: "text-blue-600 bg-blue-50",
      items: ["Platform Name: LearnHub", "Default Language: English", "Timezone: Africa/Lusaka", "Currency: ZMW (K)"],
    },
    {
      icon: CreditCard, title: "Payments", color: "text-green-600 bg-green-50",
      items: ["Payment Gateway: Lipila", "Mobile Money: Airtel, MTN, Zamtel", "Card Payments: Enabled", "Payout Threshold: K500"],
    },
    {
      icon: Mail, title: "Email", color: "text-purple-600 bg-purple-50",
      items: ["Provider: Resend", "Welcome Email: Enabled", "Enrollment Email: Enabled", "Payment Receipt: Enabled"],
    },
    {
      icon: Shield, title: "Security", color: "text-red-600 bg-red-50",
      items: ["Auth Provider: NextAuth v5", "2FA: Optional", "Session Strategy: JWT", "OAuth: Google"],
    },
    {
      icon: Bell, title: "Notifications", color: "text-yellow-600 bg-yellow-50",
      items: ["In-app Notifications: Enabled", "Email Notifications: Enabled", "Push Notifications: Coming Soon"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">Platform configuration overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map(({ icon: Icon, title, color, items }) => (
          <Card key={title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-700">
        <strong>Note:</strong> To change settings, update the corresponding environment variables in your Vercel dashboard and redeploy.
      </div>
    </div>
  );
}
