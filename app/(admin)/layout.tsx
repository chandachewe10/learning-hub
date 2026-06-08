import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar user={session.user} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
