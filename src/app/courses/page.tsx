'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  GraduationCap,
  Users,
  MapPin,
  TrendingUp,
  Percent
} from 'lucide-react';

interface Subject {
  id: string;
  code: string;
  title: string;
  color: string;
  instructor: string | null;
  room: string | null;
  credits: number;
  targetGrade: string | null;
  attendancePresent: number;
  attendanceTotal: number;
  _count?: {
    tasks: number;
    notes: number;
    flashcardDecks: number;
    quizzes: number;
  };
}

export default function CoursesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // New course modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#4f46e5');
  const [newInstructor, setNewInstructor] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newTargetGrade, setNewTargetGrade] = useState('A');
  const [newPresent, setNewPresent] = useState(15);
  const [newTotal, setNewTotal] = useState(16);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const json = await res.json();
        setSubjects(json.subjects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (
    subjectId: string,
    presentDelta: number,
    totalDelta: number
  ) => {
    const subj = subjects.find((s) => s.id === subjectId);
    if (!subj) return;

    const newPresentVal = Math.max(0, subj.attendancePresent + presentDelta);
    const newTotalVal = Math.max(newPresentVal, subj.attendanceTotal + totalDelta);

    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendancePresent: newPresentVal,
          attendanceTotal: newTotalVal,
        }),
      });

      if (res.ok) fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to remove this course and its associated records?')) return;
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
      if (res.ok) fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim(),
          title: newTitle.trim(),
          color: newColor,
          instructor: newInstructor.trim() || null,
          room: newRoom.trim() || null,
          credits: newCredits,
          targetGrade: newTargetGrade,
          attendancePresent: newPresent,
          attendanceTotal: newTotal,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewCode('');
        setNewTitle('');
        setNewInstructor('');
        setNewRoom('');
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Overall attendance calculation
  const totalPresentAll = subjects.reduce((acc, s) => acc + s.attendancePresent, 0);
  const totalClassesAll = subjects.reduce((acc, s) => acc + s.attendanceTotal, 0);
  const overallAttendancePercent =
    totalClassesAll > 0 ? Math.round((totalPresentAll / totalClassesAll) * 100) : 100;
  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum & Compliance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Courses & Attendance Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track syllabus enrollment, instructor details, target grades, and 75% attendance compliance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Summary KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Enrolled</span>
            <div className="text-xl font-extrabold text-slate-900">
              {subjects.length} Courses ({totalCredits} Credits)
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              overallAttendancePercent >= 75
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Aggregate Attendance</span>
            <div className="text-xl font-extrabold text-slate-900">
              {overallAttendancePercent}% ({totalPresentAll}/{totalClassesAll} classes)
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Target Standing</span>
            <div className="text-xl font-extrabold text-slate-900">First Class with Distinction</div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subj) => {
          const attendancePercent =
            subj.attendanceTotal > 0
              ? Math.round((subj.attendancePresent / subj.attendanceTotal) * 100)
              : 100;
          const isLowAttendance = attendancePercent < 75;

          // Attendance calculation logic:
          // How many classes can be safely skipped while staying >= 75%?
          // (Present) / (Total + X) >= 0.75  =>  Total + X <= Present / 0.75 => X = floor(Present / 0.75) - Total
          const canMiss = Math.max(
            0,
            Math.floor(subj.attendancePresent / 0.75) - subj.attendanceTotal
          );

          // If attendance is below 75%, how many consecutive classes needed?
          // (Present + Y) / (Total + Y) >= 0.75 => Present + Y >= 0.75*Total + 0.75*Y => 0.25*Y >= 0.75*Total - Present
          // Y = ceil((0.75 * Total - Present) / 0.25)
          const neededToCatchUp = Math.max(
            0,
            Math.ceil((0.75 * subj.attendanceTotal - subj.attendancePresent) / 0.25)
          );

          return (
            <div
              key={subj.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: `${subj.color}15`, color: subj.color }}
                      className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider"
                    >
                      {subj.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {subj.credits} Credits • Target: {subj.targetGrade}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteSubject(subj.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{subj.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  {subj.instructor && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{subj.instructor}</span>
                    </span>
                  )}
                  {subj.room && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{subj.room}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Attendance Tracker Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Attendance Tracker</span>
                  <span
                    className={`font-black text-sm ${
                      isLowAttendance ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {attendancePercent}% ({subj.attendancePresent}/{subj.attendanceTotal})
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(attendancePercent, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLowAttendance ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  ></div>
                </div>

                {/* Smart Advisory Message */}
                <div className="text-[11px] font-medium pt-1">
                  {isLowAttendance ? (
                    <p className="text-rose-600 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Attendance below 75%! Must attend next {neededToCatchUp} consecutive classes.
                    </p>
                  ) : (
                    <p className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Attendance safe. You can miss up to {canMiss} class{canMiss === 1 ? '' : 'es'} without dropping below 75%.
                    </p>
                  )}
                </div>

                {/* Quick Increment Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-500">Record Today:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateAttendance(subj.id, 1, 1)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors"
                    >
                      + Attended
                    </button>
                    <button
                      onClick={() => handleUpdateAttendance(subj.id, 0, 1)}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] transition-colors"
                    >
                      + Missed
                    </button>
                  </div>
                </div>
              </div>

              {/* Course resources stats */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{subj._count?.tasks || 0} Assignments</span>
                <span>{subj._count?.notes || 0} Lecture Notes</span>
                <span>{subj._count?.flashcardDecks || 0} Flashcard Decks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h2 className="text-base font-bold text-slate-900">Add New Course / Subject</h2>
            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS305"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Arthur Mitchell"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    placeholder="e.g. SciTech Lab 402"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Grade</label>
                  <select
                    value={newTargetGrade}
                    onChange={(e) => setNewTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Color Theme</label>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classes Attended</label>
                  <input
                    type="number"
                    value={newPresent}
                    onChange={(e) => setNewPresent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    value={newTotal}
                    onChange={(e) => setNewTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
