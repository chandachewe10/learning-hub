import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InstructorSidebar } from "@/components/layout/instructor-sidebar";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <InstructorSidebar user={session.user} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
