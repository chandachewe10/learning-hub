"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, XCircle, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  image: string | null;
  _count: { courses: number; enrollments: number };
}

interface Props {
  users: User[];
  total: number;
  page: number;
}

export function AdminUsersClient({ users: initialUsers, total, page }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (userId: string, approve: boolean) => {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: approve }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isApproved: approve } : u));
    setLoading(null);
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: active } : u));
    setLoading(null);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm">{total} total users</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3 hidden md:table-cell">Role</th>
              <th className="px-5 py-3 hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3 hidden sm:table-cell">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="text-xs">{getInitials(user.name || "U")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <Badge variant={user.role === "ADMIN" ? "default" : user.role === "INSTRUCTOR" ? "warning" : "secondary"} className="text-xs capitalize">
                    {user.role.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell text-xs text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <div className="flex gap-1">
                    {user.isActive ? (
                      <Badge variant="success" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Suspended</Badge>
                    )}
                    {user.role === "INSTRUCTOR" && (
                      user.isApproved ? (
                        <Badge variant="success" className="text-xs">Approved</Badge>
                      ) : (
                        <Badge variant="warning" className="text-xs">Pending</Badge>
                      )
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    {user.role === "INSTRUCTOR" && !user.isApproved && (
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleApprove(user.id, true)}
                        disabled={loading === user.id}
                      >
                        <CheckCircle className="w-3 h-3" />Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-7 px-2 text-xs gap-1 ${user.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-emerald-600"}`}
                      onClick={() => handleToggleActive(user.id, !user.isActive)}
                      disabled={loading === user.id}
                    >
                      {user.isActive ? <><XCircle className="w-3 h-3" />Suspend</> : <><CheckCircle className="w-3 h-3" />Activate</>}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No users found</div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-slate-50 text-sm text-slate-500">
          <span>Showing {filteredUsers.length} of {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => router.push(`/admin/users?page=${page - 1}`)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => router.push(`/admin/users?page=${page + 1}`)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
