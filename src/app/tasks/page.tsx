'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Filter,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  estimatedMinutes: number | null;
  weight: number | null;
  subject?: { id: string; code: string; title: string; color: string } | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; code: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // New task modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newMinutes, setNewMinutes] = useState(45);
  const [newWeight, setNewWeight] = useState(10);

  useEffect(() => {
    fetchTasks();
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects) {
          setSubjects(data.subjects);
          if (data.subjects.length > 0) setNewSubjectId(data.subjects[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const json = await res.json();
        setTasks(json.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        if (nextStatus === 'COMPLETED') {
          confetti({ particleCount: 35, spread: 60 });
        }
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to remove this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          subjectId: newSubjectId || null,
          dueDate: newDueDate || null,
          priority: newPriority,
          status: 'TODO',
          estimatedMinutes: newMinutes,
          weight: newWeight,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    if (subjectFilter !== 'ALL' && task.subject?.id !== subjectFilter) return false;
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED');

  const totalFiltered = filteredTasks.length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Study Planner & Kanban</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Assignments & Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track coursework deadlines, prioritize exam reviews, and allocate study time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-700">
              Completion: <span className="text-indigo-600">{completionPercentage}%</span> ({completedCount}/{tasks.length})
            </div>
            <div className="w-36 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${completionPercentage}%` }}
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700"
            >
              <option value="ALL">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700"
            >
              <option value="ALL">All Courses</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: TODO */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">To Do</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[11px] font-bold shadow-xs">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {todoTasks.map((t) => renderKanbanCard(t, handleUpdateStatus, handleDeleteTask))}
              {todoTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 italic">No tasks in To Do</div>
              )}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-[11px] font-bold shadow-xs">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {inProgressTasks.map((t) => renderKanbanCard(t, handleUpdateStatus, handleDeleteTask))}
              {inProgressTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 italic">No tasks in progress</div>
              )}
            </div>
          </div>

          {/* Column 3: COMPLETED */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-emerald-700 text-[11px] font-bold shadow-xs">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {completedTasks.map((t) => renderKanbanCard(t, handleUpdateStatus, handleDeleteTask))}
              {completedTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 italic">No completed tasks yet</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Est. Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          t.id,
                          t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
                        )
                      }
                      className="p-1 rounded hover:bg-slate-100"
                    >
                      {t.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-indigo-600" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className={t.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}>
                      {t.title}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {t.subject && (
                      <span
                        style={{ color: t.subject.color, backgroundColor: `${t.subject.color}15` }}
                        className="px-2 py-0.5 rounded font-black text-[10px]"
                      >
                        {t.subject.code}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{t.estimatedMinutes}m</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h2 className="text-base font-bold text-slate-900">Add New Assignment / Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Dijkstra Algorithm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Additional assignment details, rubric requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade Weight %</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban Card Render Helper
function renderKanbanCard(
  t: Task,
  handleUpdateStatus: (id: string, s: string) => void,
  handleDeleteTask: (id: string) => void
) {
  const isCompleted = t.status === 'COMPLETED';

  return (
    <div
      key={t.id}
      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        {t.subject && (
          <span
            style={{ color: t.subject.color, backgroundColor: `${t.subject.color}15` }}
            className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
          >
            {t.subject.code}
          </span>
        )}
        <span
          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
            t.priority === 'URGENT'
              ? 'bg-rose-100 text-rose-700'
              : t.priority === 'HIGH'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {t.priority}
        </span>
      </div>

      <div>
        <h4
          className={`text-xs font-bold leading-snug ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {t.title}
        </h4>
        {t.description && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {t.dueDate && (
            <span className="flex items-center gap-1 text-[10px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}
          {t.estimatedMinutes && (
            <span className="flex items-center gap-1 text-[10px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {t.estimatedMinutes}m
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Status stepper button */}
          <button
            onClick={() => {
              const next =
                t.status === 'TODO'
                  ? 'IN_PROGRESS'
                  : t.status === 'IN_PROGRESS'
                  ? 'COMPLETED'
                  : 'TODO';
              handleUpdateStatus(t.id, next);
            }}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors"
          >
            {t.status === 'TODO' ? 'Start' : t.status === 'IN_PROGRESS' ? 'Done' : 'Restart'}
          </button>
          <button
            onClick={() => handleDeleteTask(t.id)}
            className="p-1 text-slate-300 hover:text-rose-500"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
