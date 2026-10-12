'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Save,
  BookOpen,
  ArrowRight,
  Zap,
  Key,
  Flame,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<'summarizer' | 'flashcards' | 'quiz'>('summarizer');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: string; code: string; title: string }>>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Summarizer state
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryTopic, setSummaryTopic] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{
    summary: string;
    keyPoints: string[];
    keyTerms: { term: string; definition: string }[];
    studyTips: string[];
  } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [savedAsNoteSuccess, setSavedAsNoteSuccess] = useState(false);

  // Flashcards generator state
  const [fcInput, setFcInput] = useState('');
  const [fcCount, setFcCount] = useState(5);
  const [fcLoading, setFcLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<
    Array<{ front: string; back: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD' }>
  >([]);
  const [fcDeckTitle, setFcDeckTitle] = useState('');
  const [fcSaveSuccess, setFcSaveSuccess] = useState(false);

  // Quiz generator state
  const [quizInput, setQuizInput] = useState('');
  const [quizCount, setQuizCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<
    Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }>
  >([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSaveSuccess, setQuizSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects) {
          setSubjects(data.subjects);
          if (data.subjects.length > 0) setSelectedSubjectId(data.subjects[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Pre-load sample academic texts
  const loadSampleDSA = () => {
    setSummaryTopic('Data Structures & Graph Traversal');
    setSummaryInput(`Graph Traversal Algorithms: Breadth-First Search (BFS) and Depth-First Search (DFS).
Breadth-First Search explores vertices level by level, radiating outward from a starting source node. BFS utilizes a First-In-First-Out (FIFO) queue data structure. The time complexity of BFS is O(V + E) when implemented with an adjacency list, where V is the number of vertices and E is the number of edges. Space complexity is O(V) to store the visited array and queue elements. Applications of BFS include finding the shortest path in unweighted graphs, peer-to-peer networking (such as BitTorrent), and web crawling.

Depth-First Search explores as deep as possible along each branch before backtracking. DFS can be implemented either recursively (utilizing the system call stack) or iteratively using an explicit Last-In-First-Out (LIFO) stack data structure. The time complexity of DFS is also O(V + E) for adjacency list representation, and space complexity is O(V) in the worst case (a linear tree graph). Important applications of DFS include Topological Sorting in Directed Acyclic Graphs (DAGs), detecting cycles in graphs, and identifying Strongly Connected Components via Tarjan's or Kosaraju's algorithms.`);
  };

  const loadSampleAI = () => {
    setSummaryTopic('Deep Learning & Convolutional Neural Networks');
    setSummaryInput(`Convolutional Neural Networks (CNNs) are specialized deep feed-forward neural networks designed primarily for processing structured grid data, such as images.
Key layers in a CNN:
1. Convolutional Layer: Applies discrete convolution kernels (filters) across the input receptive field to extract spatial feature hierarchies such as edges, textures, and patterns. Each filter produces a feature map.
2. Activation Function: Rectified Linear Unit (ReLU) introduces non-linearity (f(x) = max(0, x)), solving the vanishing gradient issue typical of Sigmoid activations in deep architectures.
3. Pooling Layer: Downsamples spatial dimensions (Max Pooling or Average Pooling) to reduce computational parameters, mitigate overfitting, and establish translation invariance.
4. Fully Connected (Dense) Layer: Flattens the feature maps and computes high-level classification class probabilities using Softmax activation.
Key hyperparameters include kernel size (e.g. 3x3), stride, and padding (Same vs Valid). Techniques to mitigate overfitting include Dropout, Batch Normalization, and Data Augmentation.`);
  };

  const handleGenerateSummary = async () => {
    if (!summaryInput.trim()) return;
    setSummaryLoading(true);
    setSavedAsNoteSuccess(false);

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: summaryInput,
          topic: summaryTopic,
          apiKey: apiKey || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSummaryResult(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSaveAsNote = async () => {
    if (!summaryResult) return;
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: summaryTopic ? `AI Summary: ${summaryTopic}` : 'AI Generated Study Summary',
          content: `${summaryResult.summary}\n\n### Key Takeaways:\n${summaryResult.keyPoints.map((k) => `• ${k}`).join('\n')}`,
          summary: summaryResult.summary,
          subjectId: selectedSubjectId || null,
          tags: 'AI-Generated, Summary, High-Yield',
        }),
      });

      if (res.ok) {
        setSavedAsNoteSuccess(true);
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!fcInput.trim()) return;
    setFcLoading(true);
    setFcSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fcInput,
          count: fcCount,
          apiKey: apiKey || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setGeneratedCards(json.cards || []);
        if (!fcDeckTitle) {
          setFcDeckTitle('AI Generated Deck');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFcLoading(false);
    }
  };

  const handleSaveFlashcardDeck = async () => {
    if (generatedCards.length === 0) return;
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fcDeckTitle || 'AI Concept Deck',
          description: `Auto-generated deck with ${generatedCards.length} high-yield flashcards.`,
          subjectId: selectedSubjectId || null,
          cards: generatedCards,
        }),
      });

      if (res.ok) {
        setFcSaveSuccess(true);
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizInput.trim()) return;
    setQuizLoading(true);
    setQuizSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quizInput,
          count: quizCount,
          apiKey: apiKey || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setGeneratedQuiz(json.questions || []);
        if (!quizTitle) {
          setQuizTitle('AI Generated Practice Quiz');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (generatedQuiz.length === 0) return;
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle || 'AI Practice Assessment',
          topic: summaryTopic || 'Syllabus Assessment',
          subjectId: selectedSubjectId || null,
          questions: generatedQuiz,
        }),
      });

      if (res.ok) {
        setQuizSaveSuccess(true);
        confetti({ particleCount: 60, spread: 70 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Title & API Key Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Study Assistant Suite</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Intelligent Academic Study Tools</h1>
          <p className="text-xs text-slate-500 mt-1">
            Synthesize lecture notes, generate spaced-repetition flashcards, and create practice exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>{apiKey ? 'API Key Configured' : 'Configure Gemini Key (Optional)'}</span>
          </button>
        </div>
      </div>

      {/* Gemini API Key Box (Optional) */}
      {showKeyInput && (
        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-600" /> Optional Google Gemini 1.5/2.0 API Key
            </span>
            <span className="text-[10px] bg-purple-200 px-2 py-0.5 rounded text-purple-800">
              Works 100% out-of-the-box even without key via built-in NLP engine
            </span>
          </div>
          <p className="text-slate-600">
            If provided, calls live Google Gemini models. If left blank, the system uses its built-in academic NLP heuristics automatically.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Paste your Gemini API key (AIzaSy...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('summarizer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'summarizer'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Note Summarizer</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'flashcards'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Flashcard Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Quiz Builder</span>
        </button>
      </div>

      {/* TAB 1: NOTE SUMMARIZER */}
      {activeTab === 'summarizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Input Lecture Notes / Textbook Content</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Samples:</span>
                <button
                  onClick={loadSampleDSA}
                  className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
                >
                  DSA
                </button>
                <button
                  onClick={loadSampleAI}
                  className="text-[11px] font-bold text-purple-600 hover:bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                >
                  CNN
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Topic / Subject Module (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Graph Traversal Algorithms, CNNs, Thermodynamics"
                value={summaryTopic}
                onChange={(e) => setSummaryTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes / Lecture Text
              </label>
              <textarea
                rows={12}
                placeholder="Paste paragraphs from lecture slides, textbooks, or student notes here..."
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {summaryInput.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                disabled={summaryLoading || !summaryInput.trim()}
                onClick={handleGenerateSummary}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-200 disabled:opacity-50 transition-transform active:scale-95"
              >
                {summaryLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            {summaryResult ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                      AI Synthesized
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {summaryTopic || 'Executive Summary'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(summaryResult.summary);
                        setCopiedSummary(true);
                        setTimeout(() => setCopiedSummary(false), 2000);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1"
                      title="Copy Summary"
                    >
                      {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Summary narrative */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-normal">
                  <p className="font-semibold text-slate-900 mb-1">Executive Summary:</p>
                  {summaryResult.summary}
                </div>

                {/* Key Bullet Takeaways */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    <span>High-Yield Key Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {summaryResult.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Terms */}
                {summaryResult.keyTerms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      <span>Essential Terminology & Definitions</span>
                    </h4>
                    <div className="space-y-2">
                      {summaryResult.keyTerms.map((termObj, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                          <span className="font-bold text-purple-900">{termObj.term}: </span>
                          <span className="text-slate-700">{termObj.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study & Exam Tips */}
                {summaryResult.studyTips.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Exam Revision Tips:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                      {summaryResult.studyTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleSaveAsNote}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savedAsNoteSuccess ? 'Saved to Notes!' : 'Save as Note'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setFcInput(summaryInput);
                      setActiveTab('flashcards');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Create Flashcards from this</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">No summary generated yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Paste your notes on the left or click a sample button, then click &quot;Generate AI Summary&quot;.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FLASHCARD GENERATOR */}
      {activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Generate Flashcards from Content</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deck Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Concurrency"
                  value={fcDeckTitle}
                  onChange={(e) => setFcDeckTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Quantity
                </label>
                <select
                  value={fcCount}
                  onChange={(e) => setFcCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={3}>3 Cards (Fast)</option>
                  <option value={5}>5 Cards (Standard)</option>
                  <option value={8}>8 Cards (Deep)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Source Text / Syllabus Topic
              </label>
              <textarea
                rows={10}
                placeholder="Paste notes, definitions, or bullet points here..."
                value={fcInput}
                onChange={(e) => setFcInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              disabled={fcLoading || !fcInput.trim()}
              onClick={handleGenerateFlashcards}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-200 disabled:opacity-50 transition-transform active:scale-95"
            >
              {fcLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Flashcards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {fcCount} High-Yield Flashcards</span>
                </>
              )}
            </button>
          </div>

          {/* Cards Result Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            {generatedCards.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Generated Flashcards ({generatedCards.length})
                    </h3>
                    <p className="text-xs text-slate-500">Review generated questions & answers</p>
                  </div>

                  <button
                    onClick={handleSaveFlashcardDeck}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{fcSaveSuccess ? 'Deck Saved to Library!' : 'Save Deck to Library'}</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {generatedCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-700 text-[11px]">
                          Card {idx + 1}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            card.difficulty === 'HARD'
                              ? 'bg-rose-100 text-rose-700'
                              : card.difficulty === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {card.difficulty}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">Q: {card.front}</span>
                        <span className="text-slate-600 block">A: {card.back}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">No flashcards generated yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Provide your lecture topic on the left to instantly generate cards ready for active recall.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ BUILDER */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Practice Quiz Builder</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Preparation Assessment"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Count
                </label>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Study Material or Subject Topic
              </label>
              <textarea
                rows={10}
                placeholder="Paste chapter text or topic overview for the quiz questions..."
                value={quizInput}
                onChange={(e) => setQuizInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              disabled={quizLoading || !quizInput.trim()}
              onClick={handleGenerateQuiz}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50 transition-transform active:scale-95"
            >
              {quizLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Quiz Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Practice Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Quiz Results Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            {generatedQuiz.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Generated Questions ({generatedQuiz.length})
                    </h3>
                    <p className="text-xs text-slate-500">Each with 4 options and detailed explanation</p>
                  </div>

                  <button
                    onClick={handleSaveQuiz}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{quizSaveSuccess ? 'Quiz Saved to Library!' : 'Save & Publish Quiz'}</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {generatedQuiz.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                    >
                      <span className="font-extrabold text-emerald-800 text-[11px] block">
                        Question {idx + 1}:
                      </span>
                      <p className="font-bold text-slate-900">{q.question}</p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-1.5 rounded border text-[11px] font-medium ${
                              optIdx === q.correctAnswer
                                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 pt-1 italic">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">No quiz generated yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Provide syllabus topics on the left to generate multiple choice questions with explanations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
