"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle, Circle, ChevronDown, ChevronLeft, ChevronRight,
  MessageSquare, Send, FileText, PlayCircle, Award, Menu, X,
  HelpCircle, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoUrl: string | null;
  documentUrl: string | null;
  content: string | null;
  duration: number | null;
  isFree: boolean;
  order: number;
  discussions: Array<{
    id: string;
    body: string;
    createdAt: Date;
    user: { name: string | null; image: string | null };
    replies: Array<{
      id: string;
      body: string;
      createdAt: Date;
      user: { name: string | null; image: string | null };
    }>;
  }>;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Array<{ id: string; title: string; type: string; duration: number | null; isFree: boolean; order: number }>;
}

interface ProgressRecord {
  lessonId: string;
  completedAt: Date | null;
}

interface Enrollment {
  id: string;
  progressPct: number;
  certificateId: string | null;
  progress: ProgressRecord[];
  course: {
    id: string;
    title: string;
    hasCertificate: boolean;
    sections: Section[];
    instructor: { name: string | null; image: string | null };
  };
}

interface LearnPageClientProps {
  enrollment: Enrollment;
  currentLesson: Lesson;
  userId: string;
  userName: string;
  userImage: string;
}

export function LearnPageClient({
  enrollment,
  currentLesson,
  userId,
  userName,
  userImage,
}: LearnPageClientProps) {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(enrollment.progress.filter((p) => p.completedAt).map((p) => p.lessonId))
  );
  const [progressPct, setProgressPct] = useState(enrollment.progressPct);
  const [comment, setComment] = useState("");
  const [discussions, setDiscussions] = useState(currentLesson.discussions);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Certificate state
  const [issuedCertId, setIssuedCertId] = useState<string | null>(enrollment.certificateId ?? null);
  const [claimingCert, setClaimingCert] = useState(false);

  // Quiz state (keyed by lessonId so switching lessons resets state)
  const [quizAnswers, setQuizAnswers]     = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset quiz state whenever the lesson changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [currentLesson.id]);

  const allLessons = enrollment.course.sections.flatMap((s) => s.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const claimCertificate = async () => {
    if (issuedCertId || claimingCert) return;
    setClaimingCert(true);
    try {
      const res = await fetch("/api/certificates/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIssuedCertId(data.certificateId);
      }
    } finally {
      setClaimingCert(false);
    }
  };

  const markComplete = async () => {
    if (completedLessons.has(currentLesson.id)) return;
    const newCompleted = new Set([...completedLessons, currentLesson.id]);
    setCompletedLessons(newCompleted);
    const newPct = (newCompleted.size / allLessons.length) * 100;
    setProgressPct(newPct);

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId: enrollment.id, lessonId: currentLesson.id }),
    });

    // Auto-issue certificate when course is fully complete
    if (newPct >= 100 && enrollment.course.hasCertificate && !issuedCertId) {
      await claimCertificate();
    }
  };

  const handleVideoEnded = () => {
    markComplete();
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    const res = await fetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: currentLesson.id, body: comment }),
    });
    const data = await res.json();
    if (res.ok) {
      setDiscussions((prev) => [{
        ...data.discussion,
        user: { name: userName, image: userImage },
        replies: [],
      }, ...prev]);
      setComment("");
    }
  };

  const isCompleted = completedLessons.has(currentLesson.id);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-72" : "w-0"} shrink-0 bg-white border-r overflow-y-auto transition-all duration-200 flex flex-col`}>
        {sidebarOpen && (
          <>
            <div className="p-4 border-b">
              <Link href="/student/dashboard" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mb-2">
                <ChevronLeft className="w-3 h-3" /> Back to Dashboard
              </Link>
              <h2 className="font-semibold text-slate-900 text-sm line-clamp-2">{enrollment.course.title}</h2>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <Progress value={progressPct} className="h-1.5" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {enrollment.course.sections.map((section) => (
                <details key={section.id} className="border-b" open>
                  <summary className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 flex items-center justify-between">
                    <span>{section.title}</span>
                    <ChevronDown className="w-3 h-3" />
                  </summary>
                  <div>
                    {section.lessons.map((lesson) => {
                      const done = completedLessons.has(lesson.id);
                      const active = lesson.id === currentLesson.id;
                      return (
                        <Link
                          key={lesson.id}
                          href={`/student/learn/${enrollment.course.id}/${lesson.id}`}
                        >
                          <div className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                            active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                          }`}>
                            {done ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className={`w-4 h-4 shrink-0 ${active ? "text-indigo-400" : "text-slate-300"}`} />
                            )}
                            <span className="flex-1 text-xs line-clamp-2">{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-xs text-slate-400 shrink-0">
                                {Math.floor(lesson.duration / 60)}m
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 w-8 h-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <h1 className="text-sm font-medium flex-1 truncate">{currentLesson.title}</h1>
          {isCompleted && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />Completed
            </Badge>
          )}
        </div>

        {/* Video / Content area */}
        <div className="flex-1 overflow-y-auto bg-slate-900">
          {currentLesson.type === "VIDEO" && currentLesson.videoUrl ? (
            <div className="w-full bg-black">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                controls
                className="w-full max-h-[70vh]"
                onEnded={handleVideoEnded}
              />
            </div>
          ) : currentLesson.type === "TEXT" && currentLesson.content ? (
            <div className="bg-white max-w-4xl mx-auto m-6 rounded-xl p-8">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            </div>
          ) : currentLesson.type === "DOCUMENT" && currentLesson.documentUrl ? (
            <div className="bg-white max-w-4xl mx-auto m-6 rounded-xl p-8 text-center space-y-4">
              <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
              <h3 className="font-semibold text-slate-900">{currentLesson.title}</h3>
              <a
                href={`/api/documents/signed?url=${encodeURIComponent(currentLesson.documentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="gradient">Download Document</Button>
              </a>
            </div>
          ) : currentLesson.type === "QUIZ" ? (
            <QuizPlayer
              lesson={currentLesson}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizSubmitted={quizSubmitted}
              setQuizSubmitted={setQuizSubmitted}
              onPassed={markComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-slate-400">
                <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>Content not available</p>
              </div>
            </div>
          )}

          {/* Lesson controls */}
          <div className="bg-white border-t p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                {prevLesson && (
                  <Link href={`/student/learn/${enrollment.course.id}/${prevLesson.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                  </Link>
                )}
              </div>

              {!isCompleted && (
                <Button onClick={markComplete} size="sm" variant="outline" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <CheckCircle className="w-4 h-4" />
                  Mark as Complete
                </Button>
              )}

              <div className="flex gap-2">
                {nextLesson ? (
                  <Link href={`/student/learn/${enrollment.course.id}/${nextLesson.id}`}>
                    <Button size="sm" variant="gradient" className="gap-1">
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    {/* Course complete — show certificate actions if enabled */}
                    {enrollment.course.hasCertificate && (
                      issuedCertId ? (
                        <Link href={`/certificate/${issuedCertId}`} target="_blank">
                          <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
                            <Award className="w-4 h-4" /> View Certificate
                          </Button>
                        </Link>
                      ) : progressPct >= 100 ? (
                        <Button
                          size="sm"
                          className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={claimCertificate}
                          disabled={claimingCert}
                        >
                          <Award className="w-4 h-4" />
                          {claimingCert ? "Generating…" : "Get Certificate"}
                        </Button>
                      ) : null
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Discussion */}
          <div className="bg-white mt-2 p-6">
            <Tabs defaultValue="discussion">
              <TabsList>
                <TabsTrigger value="discussion" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discussion ({discussions.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="discussion" className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={userImage} />
                    <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Ask a question or leave a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button size="sm" onClick={postComment} disabled={!comment.trim()} className="gap-2">
                      <Send className="w-3.5 h-3.5" /> Post
                    </Button>
                  </div>
                </div>

                {discussions.map((d) => (
                  <div key={d.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={d.user.image || ""} />
                      <AvatarFallback className="text-xs">{getInitials(d.user.name || "U")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 rounded-xl p-3">
                      <p className="text-sm font-medium text-slate-900">{d.user.name}</p>
                      <p className="text-sm text-slate-700 mt-1">{d.body}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Quiz Player ───────────────────────────────────────────────────── */

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

function parseQuiz(content: string | null): QuizQuestion[] {
  try {
    if (!content) return [];
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as QuizQuestion[];
    if (parsed && typeof parsed === "object" && "question" in parsed) return [parsed as QuizQuestion];
  } catch { /* fall through */ }
  return [];
}

function QuizPlayer({
  lesson,
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  setQuizSubmitted,
  onPassed,
}: {
  lesson: Lesson;
  quizAnswers: Record<number, number>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onPassed: () => void;
}) {
  const questions = parseQuiz(lesson.content);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <HelpCircle className="w-14 h-14 opacity-40" />
        <p>No quiz questions have been added yet.</p>
      </div>
    );
  }

  const allAnswered = questions.every((_, i) => quizAnswers[i] !== undefined);
  const score       = questions.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
  const passMark    = Math.ceil(questions.length * 0.6); // 60 % to pass
  const passed      = quizSubmitted && score >= passMark;

  const handleSubmit = () => {
    setQuizSubmitted(true);
    if (score >= passMark) onPassed();
  };

  const handleRetry = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{lesson.title}</h2>
          <p className="text-xs text-slate-500">{questions.length} question{questions.length !== 1 ? "s" : ""} · Pass mark: {passMark}/{questions.length}</p>
        </div>
      </div>

      {/* Result banner */}
      {quizSubmitted && (
        <div className={`rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 ${
          passed ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
        }`}>
          <div className="flex items-center gap-3">
            {passed
              ? <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              : <HelpCircle  className="w-6 h-6 text-red-500 shrink-0" />}
            <div>
              <p className={`font-semibold ${passed ? "text-emerald-800" : "text-red-800"}`}>
                {passed ? "Well done! You passed 🎉" : "Not quite — try again!"}
              </p>
              <p className={`text-sm ${passed ? "text-emerald-600" : "text-red-600"}`}>
                Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
              </p>
            </div>
          </div>
          {!passed && (
            <Button size="sm" variant="outline" onClick={handleRetry} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retry Quiz
            </Button>
          )}
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qi) => {
        const chosen   = quizAnswers[qi];
        const correct  = q.correctIndex;
        const answered = chosen !== undefined;

        return (
          <div key={qi} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b bg-slate-50">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                Question {qi + 1}
              </p>
              <p className="font-semibold text-slate-900">{q.question}</p>
            </div>
            <div className="p-4 space-y-2">
              {q.options.map((opt, oi) => {
                let optClass = "border-slate-200 bg-white text-slate-700 hover:border-purple-400 hover:bg-purple-50 cursor-pointer";
                if (!quizSubmitted && chosen === oi) {
                  optClass = "border-purple-500 bg-purple-50 text-purple-800";
                } else if (quizSubmitted) {
                  if (oi === correct) {
                    optClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  } else if (oi === chosen && chosen !== correct) {
                    optClass = "border-red-400 bg-red-50 text-red-700";
                  } else {
                    optClass = "border-slate-200 bg-white text-slate-400 cursor-default";
                  }
                }

                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${optClass}`}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {quizSubmitted && oi === correct && (
                      <CheckCircle className="w-4 h-4 text-emerald-600 inline ml-2 align-middle" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit / Retry */}
      {!quizSubmitted ? (
        <Button
          className="w-full gap-2"
          disabled={!allAnswered}
          onClick={handleSubmit}
        >
          <CheckCircle className="w-4 h-4" />
          Submit Quiz ({Object.keys(quizAnswers).length}/{questions.length} answered)
        </Button>
      ) : passed ? (
        <div className="text-center text-sm text-emerald-700 font-medium py-2">
          ✓ Quiz completed — this lesson has been marked as complete.
        </div>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={handleRetry}>
          <RotateCcw className="w-4 h-4" /> Try Again
        </Button>
      )}
    </div>
  );
}
