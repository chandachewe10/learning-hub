import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bell, BookOpen, DollarSign, Star, Info } from "lucide-react";

export const metadata = { title: "Notifications" };

const iconMap: Record<string, React.ElementType> = {
  ENROLLMENT: BookOpen, PAYMENT: DollarSign, REVIEW: Star, SYSTEM: Info, DEFAULT: Bell,
};

export default async function InstructorNotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No notifications yet</p>
          </div>
        ) : notifications.map(n => {
          const Icon = iconMap[n.type] ?? iconMap.DEFAULT;
          return (
            <div key={n.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${!n.isRead ? "border-indigo-200 bg-indigo-50/30" : ""}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? "bg-indigo-100" : "bg-slate-100"}`}>
                <Icon className={`w-4 h-4 ${!n.isRead ? "text-indigo-600" : "text-slate-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.isRead ? "text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
