'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Calendar,
  Tag,
  Copy,
  Check,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; code: string; title: string; color: string } | null;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; code: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');

  // Active view note
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Create Note Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    fetchNotes();
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

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const json = await res.json();
        setNotes(json.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeNote = async (note: Note) => {
    setSummarizingId(note.id);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: note.content,
          topic: note.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const generatedSummary = data.summary;

        // Save to note in database
        await fetch(`/api/notes/${note.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: generatedSummary }),
        });

        confetti({ particleCount: 40, spread: 50 });
        fetchNotes();
        if (activeNote?.id === note.id) {
          setActiveNote({ ...activeNote, summary: generatedSummary });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this study note?')) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeNote?.id === noteId) setActiveNote(null);
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          subjectId: newSubjectId || null,
          tags: newTags.trim() || null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubjectId === 'ALL' || n.subject?.id === selectedSubjectId;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term) ||
      (n.tags && n.tags.toLowerCase().includes(term));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lecture Notes & AI Summaries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Store, search, and automatically summarize revision documents across all your courses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Search & Subject Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, terms, formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Filter by Course:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Courses ({notes.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Notes List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes Cards List */}
        <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {filteredNotes.map((note) => {
            const isSelected = activeNote?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  {note.subject ? (
                    <span
                      style={{ color: note.subject.color, backgroundColor: `${note.subject.color}15` }}
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                    >
                      {note.subject.code}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">General</span>
                  )}

                  <span className="text-[10px] text-slate-400">
                    {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{note.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{note.content}</p>

                {note.summary && (
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-indigo-700 font-bold">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>AI Summary Ready</span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">No matching notes found</div>
          )}
        </div>

        {/* Note Reader & AI Summarizer Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {activeNote ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {activeNote.subject && (
                      <span
                        style={{ color: activeNote.subject.color }}
                        className="text-xs font-black uppercase tracking-wider"
                      >
                        {activeNote.subject.code} • {activeNote.subject.title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{activeNote.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={summarizingId === activeNote.id}
                    onClick={() => handleSummarizeNote(activeNote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {summarizingId === activeNote.id
                        ? 'Summarizing...'
                        : activeNote.summary
                        ? 'Regenerate AI Summary'
                        : 'Summarize with AI'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Summary Banner if present */}
              {activeNote.summary && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>AI Executive Summary</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                    {activeNote.summary}
                  </p>
                </div>
              )}

              {/* Tags */}
              {activeNote.tags && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeNote.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Note Content */}
              <div className="pt-2 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {activeNote.content}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Select a note to read</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click any note from the left sidebar to view content and trigger AI summarization.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h2 className="text-base font-bold text-slate-900">Create New Lecture Note</h2>
            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Theorem & Asymptotics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course / Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">No Course (General)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Algorithms, Big-O, Midterm"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note Content *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Type or paste lecture slides, equations, and textbook explanations..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 leading-relaxed"
                ></textarea>
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
