'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Trash2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  question: string;
  options: string; // JSON string
  correctAnswer: number;
  userAnswer: number | null;
  explanation: string | null;
}

interface Quiz {
  id: string;
  title: string;
  topic: string;
  score: number | null;
  totalQuestions: number;
  completedAt: string | null;
  subject?: { code: string; color: string } | null;
  questions: QuizQuestion[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Active taking quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedResult, setSubmittedResult] = useState<{
    score: number;
    correctCount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const json = await res.json();
        setQuizzes(json.quizzes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setSubmittedResult(null);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedResult) return; // Prevent change after submit
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIdx,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    try {
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedResult({
          score: data.score,
          correctCount: data.correctCount,
          total: data.total,
        });

        if (data.score >= 70) {
          confetti({ particleCount: 80, spread: 90 });
        }
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      if (res.ok) fetchQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Formative Academic Assessments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Practice Quizzes & Exams</h1>
          <p className="text-xs text-slate-500 mt-1">
            Validate recall, identify knowledge gaps, and practice multiple choice questions with explanations.
          </p>
        </div>

        <Link
          href="/ai-tools"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Quiz with AI</span>
        </Link>
      </div>

      {/* QUIZ PLAYER VIEW */}
      {activeQuiz ? (
        <div className="max-w-2xl mx-auto space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveQuiz(null);
                fetchQuizzes();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Quizzes</span>
            </button>

            <span className="text-xs font-bold text-slate-800">
              {activeQuiz.title}
            </span>
          </div>

          {!submittedResult ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              {/* Stepper info */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="font-bold text-emerald-700">
                  Question {currentQIndex + 1} of {activeQuiz.questions.length}
                </span>
                <span>
                  Answered: {Object.keys(selectedAnswers).length}/{activeQuiz.questions.length}
                </span>
              </div>

              {/* Current Question */}
              {(() => {
                const q = activeQuiz.questions[currentQIndex];
                if (!q) return null;
                const options: string[] = JSON.parse(q.options || '[]');
                const selected = selectedAnswers[q.id];

                return (
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>

                    <div className="space-y-2.5 pt-2">
                      {options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                              isChosen
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                   className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isChosen
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white border border-slate-300 text-slate-600'
                                  }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Navigation stepper buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQIndex + 1 < activeQuiz.questions.length ? (
                  <button
                    onClick={() => setCurrentQIndex((i) => i + 1)}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-200 disabled:opacity-40"
                  >
                    Submit Final Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* SUBMITTED RESULTS SUMMARY & REVIEW */
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                    submittedResult.score >= 70
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {submittedResult.score >= 70 ? 'Excellent Performance!' : 'Practice Makes Perfect!'}
                </h2>
                <div className="text-4xl font-black text-emerald-600">
                  {submittedResult.score}%
                </div>
                <p className="text-xs text-slate-500">
                  You scored <strong>{submittedResult.correctCount}</strong> out of{' '}
                  <strong>{submittedResult.total}</strong> correct. (+15 Study Minutes added to your profile)
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => startQuiz(activeQuiz)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveQuiz(null);
                      fetchQuizzes();
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Return to Library
                  </button>
                </div>
              </div>

              {/* Answer Review Section */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Question Review & Detailed Explanations
                </h3>
                <div className="space-y-4">
                  {activeQuiz.questions.map((q, idx) => {
                    const options: string[] = JSON.parse(q.options || '[]');
                    const userSelected = selectedAnswers[q.id];
                    const isCorrect = userSelected === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500">Question {idx + 1}</span>
                          <span
                            className={`font-extrabold text-[10px] px-2 py-0.5 rounded uppercase ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">{q.question}</p>

                        <div className="space-y-1 pt-1">
                          {options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-1.5 rounded text-[11px] flex items-center justify-between ${
                                optIdx === q.correctAnswer
                                  ? 'bg-emerald-100/80 font-bold text-emerald-900'
                                  : optIdx === userSelected
                                  ? 'bg-rose-100/70 font-semibold text-rose-900'
                                  : 'text-slate-600'
                              }`}
                            >
                              <span>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </span>
                              {optIdx === q.correctAnswer && (
                                <span className="text-[10px] text-emerald-700 font-extrabold">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {optIdx === userSelected && optIdx !== q.correctAnswer && (
                                <span className="text-[10px] text-rose-700 font-extrabold">
                                  ✗ Your Answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className="pt-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                            <strong className="text-slate-800">Explanation: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ DIRECTORY LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {quiz.subject ? (
                    <span
                      style={{ color: quiz.subject.color, backgroundColor: `${quiz.subject.color}15` }}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider"
                    >
                      {quiz.subject.code}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                      General
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{quiz.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">Topic: {quiz.topic}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{quiz.questions.length} Questions</span>
                  {quiz.score !== null ? (
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Score: {quiz.score}%
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Not taken yet</span>
                  )}
                </div>

                <button
                  onClick={() => startQuiz(quiz)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{quiz.score !== null ? 'Retake Practice Assessment' : 'Start Assessment'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
