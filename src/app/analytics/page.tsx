'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Calculator,
  Printer,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface AnalyticsData {
  user: {
    name: string;
    targetGpa: number;
    studyStreak: number;
    totalStudyMinutes: number;
  };
  stats: {
    totalSubjects: number;
    totalTasks: number;
    completedTasks: number;
    studyStreak: number;
    totalStudyHours: number;
    weekStudyHours: number;
    targetGpa: number;
  };
  weeklyChart: { day: string; minutes: number; hours: number }[];
  subjectBreakdown: { title: string; color: string; minutes: number }[];
  subjects: Array<{
    id: string;
    code: string;
    title: string;
    color: string;
    credits: number;
    targetGrade: string;
    attendancePresent: number;
    attendanceTotal: number;
  }>;
  recentQuizzes: Array<{
    id: string;
    title: string;
    score: number | null;
  }>;
}

const gradePointsMap: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // GPA simulator state (courseId -> grade)
  const [projectedGrades, setProjectedGrades] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.subjects) {
          const initGrades: Record<string, string> = {};
          json.subjects.forEach((s: { id: string; targetGrade: string }) => {
            initGrades[s.id] = s.targetGrade || 'A';
          });
          setProjectedGrades(initGrades);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, weeklyChart, subjectBreakdown, subjects, recentQuizzes } = data;

  // Compute simulated GPA
  let totalCredits = 0;
  let totalGradePoints = 0;
  subjects.forEach((s) => {
    const grade = projectedGrades[s.id] || 'A';
    const point = gradePointsMap[grade] ?? 4.0;
    totalCredits += s.credits;
    totalGradePoints += point * s.credits;
  });
  const simulatedGpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '4.00';

  // Quiz average calculation
  const completedQuizzes = recentQuizzes.filter((q) => q.score !== null);
  const quizAverage =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) /
            completedQuizzes.length
        )
      : 85;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Academic Performance Metrics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analytics & GPA Simulator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze time investment, predict weighted semester GPA, and review study habit efficiency.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Projected GPA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{simulatedGpa}</span>
            <span className="text-xs text-slate-400">/ 4.00</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Target: {stats.targetGpa.toFixed(2)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Study Consistency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">{stats.studyStreak}</span>
            <span className="text-xs text-slate-500">Days Active</span>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-2">
            Top 5% among cohort
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Quiz Assessment Avg
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{quizAverage}%</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">
            Consistent recall accuracy
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Task Completion Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-violet-600">
              {stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 100}
              %
            </span>
          </div>
          <p className="text-[11px] text-violet-600 font-semibold mt-2">
            {stats.completedTasks} of {stats.totalTasks} assignments done
          </p>
        </div>
      </div>

      {/* Interactive GPA Simulator */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Interactive Semester GPA Simulator</span>
            </h2>
            <p className="text-xs text-slate-500">
              Adjust expected grades below to evaluate cumulative GPA projections and credit weights.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-sm flex items-center gap-2">
            <span>Simulated GPA:</span>
            <span className="text-indigo-700 text-base">{simulatedGpa}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <span
                  style={{ color: s.color }}
                  className="font-black uppercase tracking-wider text-[11px] block"
                >
                  {s.code} • {s.credits} Credits
                </span>
                <span className="font-bold text-slate-800 line-clamp-1">{s.title}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 text-[11px]">Expected Grade:</span>
                <select
                  value={projectedGrades[s.id] || 'A'}
                  onChange={(e) =>
                    setProjectedGrades({
                      ...projectedGrades,
                      [s.id]: e.target.value,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-extrabold text-indigo-700"
                >
                  <option value="A+">A+ (4.0)</option>
                  <option value="A">A (4.0)</option>
                  <option value="A-">A- (3.7)</option>
                  <option value="B+">B+ (3.3)</option>
                  <option value="B">B (3.0)</option>
                  <option value="B-">B- (2.7)</option>
                  <option value="C+">C+ (2.3)</option>
                  <option value="C">C (2.0)</option>
                  <option value="F">F (0.0)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Habit Analysis & Time Investment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Day by Day Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Weekly Study Effort (Minutes Per Day)</span>
          </h3>

          <div className="space-y-3 pt-2">
            {weeklyChart.map((item) => (
              <div key={item.day} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.day}</span>
                  <span className="font-bold text-indigo-600">
                    {item.minutes} mins ({item.hours} hrs)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${Math.min((item.minutes / 120) * 100, 100)}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-wise Time Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Time Investment by Subject</span>
          </h3>

          <div className="space-y-3 pt-2">
            {subjectBreakdown.map((subj) => (
              <div key={subj.title} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{subj.title}</span>
                  <span className="font-extrabold text-slate-700">{subj.minutes} mins recorded</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min((subj.minutes / 180) * 100, 100)}%`,
                      backgroundColor: subj.color,
                    }}
                    className="h-full rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
