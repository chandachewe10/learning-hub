import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT" && session.user.role !== "ADMIN") {
    redirect("/instructor/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <StudentSidebar user={session.user} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
