"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Plus, Trash2, Video, FileText, GripVertical,
  Eye, EyeOff, Upload, CheckCircle, Save, Send, Lock, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoUrl: string | null;
  documentUrl: string | null;
  duration: number | null;
  isFree: boolean;
  isPremium: boolean;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  sections: Section[];
  thumbnail: string | null;
  previewVideo: string | null;
}

interface Category { id: string; name: string }

interface Props {
  course: Course;
  categories: Category[];
}

export function CourseEditorClient({ course, categories }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(course.sections);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    const res = await fetch(`/api/instructor/courses/${course.id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSectionTitle, order: sections.length }),
    });
    const data = await res.json();
    if (res.ok) {
      setSections((prev) => [...prev, { ...data, lessons: [] }]);
      setNewSectionTitle("");
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    await fetch(`/api/instructor/courses/${course.id}/sections/${sectionId}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const addLesson = async (sectionId: string) => {
    const res = await fetch(`/api/instructor/courses/${course.id}/sections/${sectionId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Lesson", type: "VIDEO", order: sections.find((s) => s.id === sectionId)?.lessons.length || 0 }),
    });
    const data = await res.json();
    if (res.ok) {
      setSections((prev) =>
        prev.map((s) => s.id === sectionId ? { ...s, lessons: [...s.lessons, data] } : s)
      );
    }
  };

  const updateLesson = async (sectionId: string, lessonId: string, updates: Partial<Lesson>) => {
    setSections((prev) =>
      prev.map((s) => s.id === sectionId
        ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, ...updates } : l) }
        : s
      )
    );
    await fetch(`/api/instructor/courses/${course.id}/sections/${sectionId}/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    await fetch(`/api/instructor/courses/${course.id}/sections/${sectionId}/lessons/${lessonId}`, { method: "DELETE" });
    setSections((prev) =>
      prev.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s)
    );
  };

  const uploadVideo = async (sectionId: string, lessonId: string, file: File) => {
    setUploadingLesson(lessonId);
    setLessonProgress((prev) => ({ ...prev, [lessonId]: 0 }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "video");

    try {
      const res = await fetch("/api/upload/video", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        await updateLesson(sectionId, lessonId, { videoUrl: data.url, duration: data.duration || null });
        setLessonProgress((prev) => ({ ...prev, [lessonId]: 100 }));
      }
    } finally {
      setUploadingLesson(null);
      setTimeout(() => setLessonProgress((prev) => { const n = { ...prev }; delete n[lessonId]; return n; }), 2000);
    }
  };

  const publishCourse = async () => {
    setPublishing(true);
    const res = await fetch(`/api/instructor/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: course.status === "PUBLISHED" ? "DRAFT" : "PENDING" }),
    });
    if (res.ok) router.refresh();
    setPublishing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 truncate">{course.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={course.status === "PUBLISHED" ? "success" : course.status === "PENDING" ? "warning" : "secondary"}>
              {course.status.toLowerCase()}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={course.status === "PUBLISHED" ? "outline" : "gradient"}
            onClick={publishCourse}
            loading={publishing}
            className="gap-2"
          >
            {course.status === "PUBLISHED" ? (
              <><EyeOff className="w-4 h-4" />Unpublish</>
            ) : (
              <><Send className="w-4 h-4" />Submit for Review</>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="curriculum">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="mt-6 space-y-4">
          {/* Sections list */}
          {sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-slate-50 border-b">
                <GripVertical className="w-5 h-5 text-slate-400" />
                <div className="flex-1 font-semibold text-slate-900">{section.title}</div>
                <span className="text-xs text-slate-500">{section.lessons.length} lessons</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 w-7 h-7"
                  onClick={() => deleteSection(section.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="divide-y">
                {section.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                      {lesson.type === "VIDEO" ? (
                        <Video className="w-4 h-4 text-indigo-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <Input
                        value={lesson.title}
                        onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                        className="flex-1 h-8 text-sm"
                        onBlur={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                      />
                      <Select
                        value={lesson.type}
                        onValueChange={(v) => updateLesson(section.id, lesson.id, { type: v })}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIDEO">Video</SelectItem>
                          <SelectItem value="DOCUMENT">Document</SelectItem>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="QUIZ">Quiz</SelectItem>
                          <SelectItem value="LIVE">Live</SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => updateLesson(section.id, lesson.id, { isFree: !lesson.isFree })}
                        className={`p-1.5 rounded-lg transition-colors ${lesson.isFree ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}
                        title={lesson.isFree ? "Free preview" : "Paid lesson"}
                      >
                        {lesson.isFree ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteLesson(section.id, lesson.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Video upload */}
                    {lesson.type === "VIDEO" && (
                      <div className="pl-10">
                        {lesson.videoUrl ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-slate-600 truncate max-w-xs">{lesson.videoUrl}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 h-6 px-2 text-xs"
                              onClick={() => updateLesson(section.id, lesson.id, { videoUrl: null })}
                            >
                              Replace
                            </Button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-xs text-slate-600">
                            <Upload className="w-3.5 h-3.5" />
                            {uploadingLesson === lesson.id
                              ? `Uploading... ${lessonProgress[lesson.id] || 0}%`
                              : "Upload video"}
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadVideo(section.id, lesson.id, file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <div className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1 text-xs"
                    onClick={() => addLesson(section.id)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Lesson
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add section */}
          <div className="flex gap-2">
            <Input
              placeholder="New section title..."
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
            />
            <Button onClick={addSection} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Section
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-500 text-sm">Use the &ldquo;Basic Information&rdquo; settings to update course details. Additional settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
