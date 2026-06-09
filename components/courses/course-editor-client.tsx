"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Plus, Trash2, Video, FileText, GripVertical,
  Eye, EyeOff, Upload, CheckCircle, Save, Send, Lock, Unlock,
  AlignLeft, HelpCircle, File, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoUrl: string | null;
  documentUrl: string | null;
  content: string | null;
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
interface Props { course: Course; categories: Category[] }

const TYPE_ICONS: Record<string, React.ReactNode> = {
  VIDEO:    <Video      className="w-4 h-4 text-indigo-500 shrink-0" />,
  DOCUMENT: <File       className="w-4 h-4 text-orange-500 shrink-0" />,
  TEXT:     <AlignLeft  className="w-4 h-4 text-green-500  shrink-0" />,
  QUIZ:     <HelpCircle className="w-4 h-4 text-purple-500 shrink-0" />,
};

function parseQuiz(content: string | null): QuizData {
  try {
    if (content) return JSON.parse(content) as QuizData;
  } catch { /* fall through */ }
  return { question: "", options: ["", ""], correctIndex: 0 };
}

export function CourseEditorClient({ course, categories }: Props) {
  const router = useRouter();
  const [sections, setSections]           = useState<Section[]>(course.sections);
  const [publishing, setPublishing]       = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress]   = useState<Record<string, number>>({});
  const [uploadingDoc, setUploadingDoc]       = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson]   = useState<string | null>(null);
  // quiz drafts keyed by lessonId
  const [quizDrafts, setQuizDrafts] = useState<Record<string, QuizData>>({});
  const [savingQuiz, setSavingQuiz]   = useState<string | null>(null);

  /* ── helpers ─────────────────────────────────────────────────── */

  const toggleLesson = (lessonId: string) =>
    setExpandedLesson((prev) => (prev === lessonId ? null : lessonId));

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
      body: JSON.stringify({
        title: "New Lesson",
        type: "VIDEO",
        order: sections.find((s) => s.id === sectionId)?.lessons.length ?? 0,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSections((prev) =>
        prev.map((s) => s.id === sectionId ? { ...s, lessons: [...s.lessons, data] } : s)
      );
      setExpandedLesson(data.id);
    }
  };

  const updateLesson = async (
    sectionId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, ...updates } : l) }
          : s
      )
    );
    await fetch(
      `/api/instructor/courses/${course.id}/sections/${sectionId}/lessons/${lessonId}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) }
    );
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    await fetch(
      `/api/instructor/courses/${course.id}/sections/${sectionId}/lessons/${lessonId}`,
      { method: "DELETE" }
    );
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      )
    );
  };

  /* ── Video upload ─────────────────────────────────────────────── */

  const uploadVideo = async (sectionId: string, lessonId: string, file: File) => {
    setUploadingLesson(lessonId);
    setLessonProgress((prev) => ({ ...prev, [lessonId]: 0 }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "video");
    try {
      const res  = await fetch("/api/upload/video", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        await updateLesson(sectionId, lessonId, { videoUrl: data.url, duration: data.duration ?? null });
        setLessonProgress((prev) => ({ ...prev, [lessonId]: 100 }));
      }
    } finally {
      setUploadingLesson(null);
      setTimeout(() => setLessonProgress((prev) => { const n = { ...prev }; delete n[lessonId]; return n; }), 2000);
    }
  };

  /* ── Document upload ──────────────────────────────────────────── */

  const uploadDocument = async (sectionId: string, lessonId: string, file: File) => {
    setUploadingDoc(lessonId);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res  = await fetch("/api/upload/document", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        await updateLesson(sectionId, lessonId, { documentUrl: data.url });
      }
    } finally {
      setUploadingDoc(null);
    }
  };

  /* ── Quiz helpers ─────────────────────────────────────────────── */

  const getQuiz = (lesson: Lesson): QuizData =>
    quizDrafts[lesson.id] ?? parseQuiz(lesson.content);

  const setQuiz = (lessonId: string, update: Partial<QuizData>) =>
    setQuizDrafts((prev) => ({
      ...prev,
      [lessonId]: { ...getQuiz({ id: lessonId } as Lesson), ...update },
    }));

  const addOption = (lessonId: string) => {
    const q = getQuiz({ id: lessonId } as Lesson);
    if (q.options.length >= 6) return;
    setQuiz(lessonId, { options: [...q.options, ""] });
  };

  const removeOption = (lessonId: string, idx: number) => {
    const q    = getQuiz({ id: lessonId } as Lesson);
    const opts = q.options.filter((_, i) => i !== idx);
    setQuiz(lessonId, {
      options: opts,
      correctIndex: q.correctIndex >= opts.length ? 0 : q.correctIndex,
    });
  };

  const updateOption = (lessonId: string, idx: number, value: string) => {
    const q = getQuiz({ id: lessonId } as Lesson);
    const opts = [...q.options];
    opts[idx] = value;
    setQuiz(lessonId, { options: opts });
  };

  const saveQuiz = async (sectionId: string, lessonId: string, quiz: QuizData) => {
    setSavingQuiz(lessonId);
    await updateLesson(sectionId, lessonId, { content: JSON.stringify(quiz) });
    setSavingQuiz(null);
    setQuizDrafts((prev) => { const n = { ...prev }; delete n[lessonId]; return n; });
  };

  /* ── Publish ──────────────────────────────────────────────────── */

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

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 truncate">{course.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={course.status === "PUBLISHED" ? "success" : course.status === "PENDING" ? "warning" : "secondary"}>
              {course.status.toLowerCase()}
            </Badge>
          </div>
        </div>
        <Button
          variant={course.status === "PUBLISHED" ? "outline" : "gradient"}
          onClick={publishCourse}
          loading={publishing}
          className="gap-2"
        >
          {course.status === "PUBLISHED"
            ? <><EyeOff className="w-4 h-4" />Unpublish</>
            : <><Send className="w-4 h-4" />Submit for Review</>}
        </Button>
      </div>

      <Tabs defaultValue="curriculum">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ── Curriculum tab ──────────────────────────────────────── */}
        <TabsContent value="curriculum" className="mt-6 space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 border-b">
                <GripVertical className="w-5 h-5 text-slate-400" />
                <div className="flex-1 font-semibold text-slate-900">{section.title}</div>
                <span className="text-xs text-slate-500">{section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}</span>
                <Button
                  variant="ghost" size="icon"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 w-7 h-7"
                  onClick={() => deleteSection(section.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="divide-y">
                {section.lessons.map((lesson) => {
                  const isExpanded = expandedLesson === lesson.id;
                  const quiz       = getQuiz(lesson);

                  return (
                    <div key={lesson.id} className="p-4 space-y-3">
                      {/* Lesson row */}
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                        {TYPE_ICONS[lesson.type] ?? <FileText className="w-4 h-4 text-slate-400 shrink-0" />}

                        <Input
                          value={lesson.title}
                          onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                          onBlur={(e)   => updateLesson(section.id, lesson.id, { title: e.target.value })}
                          className="flex-1 h-8 text-sm"
                        />

                        {/* Type selector — no LIVE */}
                        <Select
                          value={lesson.type}
                          onValueChange={(v) => updateLesson(section.id, lesson.id, { type: v })}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIDEO">📹 Video</SelectItem>
                            <SelectItem value="DOCUMENT">📄 Document</SelectItem>
                            <SelectItem value="TEXT">📝 Text</SelectItem>
                            <SelectItem value="QUIZ">❓ Quiz</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Free / paid toggle */}
                        <button
                          onClick={() => updateLesson(section.id, lesson.id, { isFree: !lesson.isFree })}
                          className={`p-1.5 rounded-lg transition-colors ${lesson.isFree ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}
                          title={lesson.isFree ? "Free preview" : "Paid lesson"}
                        >
                          {lesson.isFree ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Expand/collapse content area */}
                        <button
                          onClick={() => toggleLesson(lesson.id)}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title={isExpanded ? "Collapse" : "Edit content"}
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <Button
                          variant="ghost" size="icon"
                          className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteLesson(section.id, lesson.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* ── Content panel ─────────────────────────────────── */}
                      {isExpanded && (
                        <div className="ml-10 rounded-xl border bg-slate-50 p-4 space-y-3">

                          {/* VIDEO ─────────────────────────────────────────── */}
                          {lesson.type === "VIDEO" && (
                            lesson.videoUrl ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-slate-600 truncate max-w-sm">{lesson.videoUrl}</span>
                                <Button
                                  variant="ghost" size="sm"
                                  className="text-red-400 h-6 px-2 text-xs"
                                  onClick={() => updateLesson(section.id, lesson.id, { videoUrl: null })}
                                >
                                  Replace
                                </Button>
                              </div>
                            ) : (
                              <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm text-slate-600 w-fit">
                                <Upload className="w-4 h-4" />
                                {uploadingLesson === lesson.id
                                  ? `Uploading… ${lessonProgress[lesson.id] ?? 0}%`
                                  : "Upload video file"}
                                <input
                                  type="file" accept="video/*" className="hidden"
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(section.id, lesson.id, f); }}
                                />
                              </label>
                            )
                          )}

                          {/* DOCUMENT ──────────────────────────────────────── */}
                          {lesson.type === "DOCUMENT" && (
                            <div className="space-y-2">
                              {lesson.documentUrl ? (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                  <File className="w-5 h-5 text-orange-500 shrink-0" />
                                  <a
                                    href={lesson.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-xs text-indigo-600 hover:underline truncate"
                                  >
                                    {lesson.documentUrl.split("/").pop()}
                                  </a>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-red-400 h-6 px-2 text-xs"
                                    onClick={() => updateLesson(section.id, lesson.id, { documentUrl: null })}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors text-sm text-slate-600 w-fit">
                                  <Upload className="w-4 h-4" />
                                  {uploadingDoc === lesson.id
                                    ? "Uploading document…"
                                    : "Attach PDF / document"}
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(section.id, lesson.id, f); }}
                                  />
                                </label>
                              )}
                              <p className="text-xs text-slate-400">Supported: PDF, Word, PowerPoint, Excel, TXT</p>
                            </div>
                          )}

                          {/* TEXT ───────────────────────────────────────────── */}
                          {lesson.type === "TEXT" && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-slate-600">Lesson content</p>
                              <Textarea
                                rows={8}
                                placeholder="Write your lesson content here. Supports plain text and markdown."
                                className="text-sm bg-white resize-y"
                                value={lesson.content ?? ""}
                                onChange={(e) =>
                                  setSections((prev) =>
                                    prev.map((s) =>
                                      s.id === section.id
                                        ? { ...s, lessons: s.lessons.map((l) => l.id === lesson.id ? { ...l, content: e.target.value } : l) }
                                        : s
                                    )
                                  )
                                }
                                onBlur={(e) => updateLesson(section.id, lesson.id, { content: e.target.value })}
                              />
                              <p className="text-xs text-slate-400">Content is auto-saved when you click outside.</p>
                            </div>
                          )}

                          {/* QUIZ ───────────────────────────────────────────── */}
                          {lesson.type === "QUIZ" && (
                            <div className="space-y-4">
                              {/* Question */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-700">Quiz Question</label>
                                <Textarea
                                  rows={2}
                                  placeholder="Enter your question…"
                                  className="text-sm bg-white resize-none"
                                  value={quiz.question}
                                  onChange={(e) => setQuiz(lesson.id, { question: e.target.value })}
                                />
                              </div>

                              {/* Answer options */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">
                                  Answer Options — select the correct one
                                </label>
                                {quiz.options.map((opt, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    {/* Correct answer radio */}
                                    <button
                                      type="button"
                                      onClick={() => setQuiz(lesson.id, { correctIndex: idx })}
                                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                        quiz.correctIndex === idx
                                          ? "border-green-500 bg-green-500"
                                          : "border-slate-300 hover:border-green-400"
                                      }`}
                                      title="Mark as correct answer"
                                    >
                                      {quiz.correctIndex === idx && (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      )}
                                    </button>
                                    <Input
                                      value={opt}
                                      onChange={(e) => updateOption(lesson.id, idx, e.target.value)}
                                      placeholder={`Option ${idx + 1}`}
                                      className={`flex-1 h-8 text-sm bg-white ${
                                        quiz.correctIndex === idx ? "border-green-400 ring-1 ring-green-200" : ""
                                      }`}
                                    />
                                    {quiz.options.length > 2 && (
                                      <button
                                        onClick={() => removeOption(lesson.id, idx)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                        title="Remove option"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}

                                {quiz.options.length < 6 && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-xs text-slate-500 hover:text-slate-700 gap-1 h-7"
                                    onClick={() => addOption(lesson.id)}
                                  >
                                    <Plus className="w-3 h-3" /> Add option
                                  </Button>
                                )}
                              </div>

                              {/* Correct answer indicator */}
                              {quiz.question && quiz.options.every(o => o.trim()) && (
                                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                                  ✓ Correct answer: <strong>{quiz.options[quiz.correctIndex]}</strong>
                                </div>
                              )}

                              {/* Save quiz button */}
                              <Button
                                size="sm"
                                variant="gradient"
                                className="gap-2 h-8"
                                disabled={!quiz.question.trim() || quiz.options.some(o => !o.trim()) || savingQuiz === lesson.id}
                                onClick={() => saveQuiz(section.id, lesson.id, quiz)}
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingQuiz === lesson.id ? "Saving…" : lesson.content ? "Update Quiz" : "Save Quiz"}
                              </Button>

                              {lesson.content && !quizDrafts[lesson.id] && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Quiz saved
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="p-3">
                  <Button
                    variant="ghost" size="sm"
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
              placeholder="New section title…"
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
              <p className="text-slate-500 text-sm">Additional course settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
