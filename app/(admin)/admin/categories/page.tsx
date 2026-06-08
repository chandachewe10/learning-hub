"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Category { id: string; name: string; slug: string; icon: string | null; _count: { courses: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => { setCategories(d); setLoading(false); });
  }, []);

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (editId) {
      setCategories(c => c.map(x => x.id === editId ? { ...x, ...data } : x));
      setEditId(null);
    } else {
      setCategories(c => [...c, data]);
      setAdding(false);
    }
    setForm({ name: "", icon: "" });
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories(c => c.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm">Manage course categories</p>
        </div>
        <Button onClick={() => { setAdding(true); setEditId(null); setForm({ name: "", icon: "" }); }} variant="gradient">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {(adding || editId) && (
        <div className="bg-white rounded-2xl border p-5 space-y-4">
          <h3 className="font-semibold text-slate-900">{editId ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Web Development" />
            </div>
            <div className="space-y-1.5">
              <Label>Icon (emoji)</Label>
              <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="💻" maxLength={4} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} loading={saving} variant="gradient" size="sm"><Save className="w-4 h-4" /> Save</Button>
            <Button onClick={() => { setAdding(false); setEditId(null); }} variant="outline" size="sm"><X className="w-4 h-4" /> Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Courses</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon || "📚"}</span>
                      <div>
                        <p className="font-medium text-slate-900">{cat.name}</p>
                        <p className="text-xs text-slate-400">{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{cat._count.courses}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditId(cat.id); setAdding(false); setForm({ name: cat.name, icon: cat.icon || "" }); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => del(cat.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-slate-400">No categories yet. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
