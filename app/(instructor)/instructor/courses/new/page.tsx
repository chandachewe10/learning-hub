"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";

interface FormState {
  title: string;
  description: string;
  shortDesc: string;
  level: Level;
  language: string;
  price: string;
  originalPrice: string;
  isSubscriptionOnly: boolean;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    shortDesc: "",
    level: "ALL_LEVELS",
    language: "English",
    price: "0",
    originalPrice: "",
    isSubscriptionOnly: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.title.length < 5) e.title = "Title must be at least 5 characters";
    if (form.description.length < 20) e.description = "Description must be at least 20 characters";
    if (form.shortDesc.length > 200) e.shortDesc = "Max 200 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setThumbnail(data.url);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          shortDesc: form.shortDesc || undefined,
          level: form.level,
          language: form.language,
          price: parseFloat(form.price) || 0,
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
          isSubscriptionOnly: form.isSubscriptionOnly,
          thumbnail,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create course");
        return;
      }
      router.push(`/instructor/courses/${json.id}/edit`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof FormState) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Course</h1>
          <p className="text-slate-500 text-sm">Fill in the details to get started</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Course Title <span className="text-red-500">*</span></Label>
              <Input value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="e.g. Complete Web Development Bootcamp" />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Input value={form.shortDesc} onChange={(e) => set("shortDesc")(e.target.value)} placeholder="One-line summary (max 200 chars)" maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label>Full Description <span className="text-red-500">*</span></Label>
              <Textarea value={form.description} onChange={(e) => set("description")(e.target.value)} placeholder="Describe what students will learn..." rows={6} />
              {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => set("level")(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={form.language} onValueChange={(v) => set("language")(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Bemba">Bemba</SelectItem>
                    <SelectItem value="Nyanja">Nyanja</SelectItem>
                    <SelectItem value="Tonga">Tonga</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price (ZMW)</Label>
                <Input value={form.price} onChange={(e) => set("price")(e.target.value)} type="number" min="0" placeholder="0 for free" />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (optional)</Label>
                <Input value={form.originalPrice} onChange={(e) => set("originalPrice")(e.target.value)} type="number" min="0" placeholder="For showing discount" />
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={form.isSubscriptionOnly} onChange={(e) => set("isSubscriptionOnly")(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Subscription Only</p>
                <p className="text-xs text-slate-500">Only subscribers can access this course</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course Thumbnail</CardTitle></CardHeader>
          <CardContent>
            {thumbnail ? (
              <div className="relative">
                <img src={thumbnail} alt="Thumbnail" className="w-full aspect-video object-cover rounded-xl" />
                <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setThumbnail("")}>Remove</Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{uploading ? "Uploading..." : "Upload thumbnail"}</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB — 16:9 recommended</p>
                </div>
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              </label>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="gradient" size="lg" loading={submitting} className="flex-1">
            <Save className="w-4 h-4" />
            Create Course & Continue
          </Button>
          <Link href="/instructor/courses">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
