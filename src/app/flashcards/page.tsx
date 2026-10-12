'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  mastered: boolean;
  reviewCount: number;
}

interface Deck {
  id: string;
  title: string;
  description: string | null;
  subject?: { code: string; color: string } | null;
  cards: Flashcard[];
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // Study mode states
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCompleted, setStudyCompleted] = useState(false);

  // Create Deck Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newCards, setNewCards] = useState<Array<{ front: string; back: string }>>([
    { front: '', back: '' },
    { front: '', back: '' },
  ]);
  const [subjects, setSubjects] = useState<Array<{ id: string; code: string; title: string }>>([]);

  useEffect(() => {
    fetchDecks();
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects) setSubjects(data.subjects);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/flashcards');
      if (res.ok) {
        const json = await res.json();
        setDecks(json.decks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startStudy = (deck: Deck) => {
    setActiveDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyCompleted(false);
  };

  const handleCardMastery = async (mastered: boolean) => {
    if (!activeDeck) return;
    const currentCard = activeDeck.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await fetch(`/api/flashcards/cards/${currentCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mastered,
          reviewCountIncrement: true,
        }),
      });

      // Update local deck state
      const updatedCards = [...activeDeck.cards];
      updatedCards[currentCardIndex].mastered = mastered;
      updatedCards[currentCardIndex].reviewCount += 1;
      setActiveDeck({ ...activeDeck, cards: updatedCards });
    } catch (err) {
      console.error(err);
    }

    // Advance to next card or complete
    if (currentCardIndex + 1 < activeDeck.cards.length) {
      setIsFlipped(false);
      setCurrentCardIndex((i) => i + 1);
    } else {
      setStudyCompleted(true);
      confetti({ particleCount: 60, spread: 70 });
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this flashcard deck?')) return;
    try {
      const res = await fetch(`/api/flashcards/${deckId}`, { method: 'DELETE' });
      if (res.ok) fetchDecks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    const validCards = newCards.filter((c) => c.front.trim() && c.back.trim());
    if (!newDeckTitle.trim() || validCards.length === 0) {
      alert('Please provide a title and at least one complete card.');
      return;
    }

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDeckTitle.trim(),
          description: newDeckDesc.trim() || null,
          subjectId: newSubjectId || null,
          cards: validCards,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewDeckTitle('');
        setNewDeckDesc('');
        setNewCards([
          { front: '', back: '' },
          { front: '', back: '' },
        ]);
        fetchDecks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Spaced Repetition & Recall</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Interactive Flashcards</h1>
          <p className="text-xs text-slate-500 mt-1">
            Master high-yield concepts and formulas using cognitive active-recall cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Deck</span>
          </button>
        </div>
      </div>

      {/* STUDY MODE VIEW */}
      {activeDeck ? (
        <div className="max-w-2xl mx-auto space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveDeck(null);
                fetchDecks();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Decks</span>
            </button>

            <span className="text-xs font-bold text-indigo-600">
              {activeDeck.title}
            </span>
          </div>

          {!studyCompleted ? (
            <div className="space-y-4">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Card {currentCardIndex + 1} of {activeDeck.cards.length}
                </span>
                <span>
                  Mastered:{' '}
                  <strong className="text-emerald-600">
                    {activeDeck.cards.filter((c) => c.mastered).length}
                  </strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  style={{
                    width: `${((currentCardIndex + 1) / activeDeck.cards.length) * 100}%`,
                  }}
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                ></div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[280px] sm:min-h-[320px] rounded-3xl bg-white border border-slate-200 shadow-xl p-8 flex flex-col justify-between cursor-pointer hover:border-indigo-400 hover:shadow-2xl transition-all select-none"
              >
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <span>{isFlipped ? '💡 ANSWER / EXPLANATION' : '❓ QUESTION / CONCEPT'}</span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    <RotateCw className="w-3.5 h-3.5" /> Click to flip
                  </span>
                </div>

                <div className="my-auto text-center py-6">
                  <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                    {isFlipped
                      ? activeDeck.cards[currentCardIndex].back
                      : activeDeck.cards[currentCardIndex].front}
                  </p>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-semibold uppercase">
                  {isFlipped ? 'Ready to grade your recall?' : 'Think of your answer before flipping'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => handleCardMastery(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Still Learning (Review Again)</span>
                </button>

                <button
                  onClick={() => handleCardMastery(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Know This! (Mastered)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Study Complete Summary */
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Deck Review Complete!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have reviewed all cards in <strong className="text-slate-800">{activeDeck.title}</strong>.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 max-w-xs mx-auto text-xs">
                <span className="text-slate-500">Mastered:</span>{' '}
                <strong className="text-emerald-600 text-sm">
                  {activeDeck.cards.filter((c) => c.mastered).length} / {activeDeck.cards.length}
                </strong>
              </div>
              <button
                onClick={() => {
                  setActiveDeck(null);
                  fetchDecks();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Back to Decks
              </button>
            </div>
          )}
        </div>
      ) : (
        /* DECKS DIRECTORY VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const masteredCount = deck.cards.filter((c) => c.mastered).length;
            const masteredPercent =
              deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;

            return (
              <div
                key={deck.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {deck.subject ? (
                      <span
                        style={{ color: deck.subject.color, backgroundColor: `${deck.subject.color}15` }}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider"
                      >
                        {deck.subject.code}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                        General
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                      title="Delete Deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{deck.title}</h3>
                  {deck.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{deck.description}</p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{deck.cards.length} Cards</span>
                    <span className="font-bold text-emerald-600">{masteredPercent}% Mastered</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${masteredPercent}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    ></div>
                  </div>

                  <button
                    onClick={() => startStudy(deck)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Study Deck ({deck.cards.length})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Deck Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <h2 className="text-base font-bold text-slate-900">Create New Flashcard Deck</h2>
            <form onSubmit={handleCreateDeck} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deck Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asymptotic Complexity & Heaps"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

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

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Cards</h4>
                  <button
                    type="button"
                    onClick={() => setNewCards([...newCards, { front: '', back: '' }])}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Another Card
                  </button>
                </div>

                {newCards.map((card, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Card #{idx + 1}</span>
                      {newCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewCards(newCards.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Front (Question / Prompt)"
                      value={card.front}
                      onChange={(e) => {
                        const copy = [...newCards];
                        copy[idx].front = e.target.value;
                        setNewCards(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Back (Answer / Explanation)"
                      value={card.back}
                      onChange={(e) => {
                        const copy = [...newCards];
                        copy[idx].back = e.target.value;
                        setNewCards(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    ></textarea>
                  </div>
                ))}
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
                  Save Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
