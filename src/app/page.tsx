'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Flame,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Layers,
  HelpCircle,
  Timer,
  AlertCircle,
  PlusCircle,
  Award
} from 'lucide-react';

interface DashboardData {
  user: {
    name: string;
    targetGpa: number;
    studyStreak: number;
    totalStudyMinutes: number;
  };
  stats: {
    totalSubjects: number;
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    totalNotes: number;
    totalDecks: number;
    totalCards: number;
    studyStreak: number;
    totalStudyHours: number;
    weekStudyHours: number;
    targetGpa: number;
  };
  weeklyChart: { day: string; minutes: number; hours: number }[];
  subjectBreakdown: { title: string; color: string; minutes: number }[];
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    priority: string;
    status: string;
    subject?: { code: string; color: string } | null;
  }>;
  subjects: Array<{
    id: string;
    code: string;
    title: string;
    color: string;
    attendancePresent: number;
    attendanceTotal: number;
    targetGrade: string;
    credits: number;
  }>;
  recentQuizzes: Array<{
    id: string;
    title: string;
    topic: string;
    score: number | null;
    totalQuestions: number;
    completedAt: string | null;
    subject?: { code: string; color: string } | null;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading Smart Study OS...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Failed to load study data.</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, weeklyChart, subjectBreakdown, upcomingDeadlines, subjects, recentQuizzes } = data;
  const maxWeeklyMinutes = Math.max(...weeklyChart.map((d) => d.minutes), 60);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI-Powered Academic System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-indigo-300">{data.user.name}</span>!
            </h1>
            <p className="text-indigo-100/80 text-sm max-w-xl">
              You are on a <span className="text-amber-300 font-bold">{stats.studyStreak}-day streak</span>! You have {stats.pendingTasks} pending tasks and {upcomingDeadlines.length > 0 ? 'urgent deadlines coming up.' : 'all caught up.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ai-tools"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-bold text-xs sm:text-sm text-white shadow-lg shadow-purple-900/30 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Study Suite</span>
            </Link>
            <Link
              href="/pomodoro"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs sm:text-sm text-white backdrop-blur-sm transition-transform active:scale-95"
            >
              <Timer className="w-4 h-4 text-amber-300" />
              <span>Focus Timer</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-10 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA Goal */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target GPA</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.targetGpa.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-medium">/ 4.00</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> On track for Magna Cum Laude
            </p>
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Streak</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.studyStreak}</span>
              <span className="text-xs text-slate-500 font-medium">days in a row</span>
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              Keep going! 2 days to 1 week goal
            </p>
          </div>
        </div>

        {/* Focus Hours This Week */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Week Focus Time</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.weekStudyHours}</span>
              <span className="text-xs text-slate-500 font-medium">hours</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">
              {stats.totalStudyHours} total all-time hours
            </p>
          </div>
        </div>

        {/* Tasks Pending */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.pendingTasks}</span>
              <span className="text-xs text-slate-500 font-medium">remaining / {stats.totalTasks} total</span>
            </div>
            <p className="text-[11px] text-violet-600 font-semibold mt-1">
              {stats.completedTasks} completed
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Study Effort</h2>
              <p className="text-xs text-slate-500">Focus minutes recorded over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-indigo-600"></span>
              <span className="text-xs font-semibold text-slate-600">Pomodoro / Study</span>
            </div>
          </div>

          {/* Bar Chart visualization */}
          <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100">
            {weeklyChart.map((item) => {
              const heightPercent = maxWeeklyMinutes > 0 ? (item.minutes / maxWeeklyMinutes) * 100 : 0;
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mb-1">
                    {item.minutes} min ({item.hours}h)
                  </div>

                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.minutes > 0
                          ? 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400'
                          : 'bg-slate-200'
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.day}</span>
                </div>
              );
            })}
          </div>

          {/* Subject Breakdown Progress */}
          <div className="mt-6 pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Subject Time Distribution
            </h3>
            <div className="space-y-3">
              {subjectBreakdown.map((subj) => (
                <div key={subj.title} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{subj.title}</span>
                    <span className="font-medium text-slate-500">{subj.minutes} mins</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min((subj.minutes / 180) * 100, 100)}%`,
                        backgroundColor: subj.color,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks & Deadlines */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
              <p className="text-xs text-slate-500">Sorted by urgency</p>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                No urgent pending deadlines!
              </div>
            ) : (
              upcomingDeadlines.map((task) => {
                const isUrgent = task.priority === 'URGENT';
                const isHigh = task.priority === 'HIGH';
                const formattedDate = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'No date';

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-indigo-600'
                        }`}
                        title="Mark Completed"
                      >
                        {task.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                      </button>

                      <div className="space-y-1">
                        <p
                          className={`text-xs font-bold leading-snug ${
                            task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px]">
                          {task.subject && (
                            <span
                              style={{ color: task.subject.color }}
                              className="font-bold uppercase tracking-wider"
                            >
                              {task.subject.code}
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700'
                          : isHigh
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/tasks"
            className="mt-4 w-full py-2 px-3 border border-dashed border-indigo-300 rounded-xl text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Task</span>
          </Link>
        </div>
      </div>

      {/* Courses & Quick Academic Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((subj) => {
          const attendancePercent =
            subj.attendanceTotal > 0
              ? Math.round((subj.attendancePresent / subj.attendanceTotal) * 100)
              : 100;
          const isLowAttendance = attendancePercent < 75;

          return (
            <div
              key={subj.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{ backgroundColor: `${subj.color}15`, color: subj.color }}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wider uppercase"
                  >
                    {subj.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{subj.credits} Credits</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{subj.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Target Grade: <span className="font-bold text-slate-700">{subj.targetGrade}</span></p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Attendance</span>
                  <span
                    className={`font-bold ${
                      isLowAttendance ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {attendancePercent}% ({subj.attendancePresent}/{subj.attendanceTotal})
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${attendancePercent}%` }}
                    className={`h-full rounded-full ${
                      isLowAttendance ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  ></div>
                </div>
                {isLowAttendance && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Minimum 75% required!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Feature Hub */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Smart Study Tools Hub</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/ai-tools"
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300">AI Summarizer</h4>
            <p className="text-xs text-slate-400 mt-1">Transform lengthy lecture notes into executive takeaways & key terms.</p>
          </Link>

          <Link
            href="/flashcards"
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">Interactive Flashcards</h4>
            <p className="text-xs text-slate-400 mt-1">Active recall with 3D flip cards, difficulty marks & mastery ratings.</p>
          </Link>

          <Link
            href="/quizzes"
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Practice Quiz Simulator</h4>
            <p className="text-xs text-slate-400 mt-1">Test your recall with instant rationale explanations & scoring.</p>
          </Link>

          <Link
            href="/pomodoro"
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Timer className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Pomodoro Focus Timer</h4>
            <p className="text-xs text-slate-400 mt-1">25m focus blocks with ambient rain & white noise audio synth.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
