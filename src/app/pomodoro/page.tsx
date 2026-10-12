'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Sparkles,
  CloudRain,
  Radio,
  Waves,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playAmbientSound,
  stopAmbientSound,
  playTimerChime,
  AmbientSoundType
} from '@/lib/audio-synth';

export default function PomodoroPage() {
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: string; code: string; title: string; color: string }>>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Ambient sound states
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);

  // Stats
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [recentSessions, setRecentSessions] = useState<
    Array<{ id: string; durationMinutes: number; sessionType: string; createdAt: string; subject?: { code: string; color: string } | null }>
  >([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Time durations in seconds
  const durations = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

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

    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/study-sessions');
      if (res.ok) {
        const json = await res.json();
        setRecentSessions(json.sessions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedSubjectId]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    playTimerChime();
    confetti({ particleCount: 70, spread: 80 });

    if (mode === 'focus') {
      setCompletedSessionsCount((c) => c + 1);

      // Record to database
      try {
        await fetch('/api/study-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: selectedSubjectId || null,
            durationMinutes: 25,
            sessionType: 'POMODORO',
            notes: sessionNotes || 'Focused Pomodoro interval',
          }),
        });
        fetchSessions();
      } catch (err) {
        console.error(err);
      }

      // Switch to break
      setMode('short_break');
      setTimeLeft(durations.short_break);
    } else {
      setMode('focus');
      setTimeLeft(durations.focus);
    }
  };

  const switchMode = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const handleSoundChange = (newSound: AmbientSoundType) => {
    setAmbientSound(newSound);
    if (newSound === 'none' || isMuted) {
      stopAmbientSound();
    } else {
      playAmbientSound(newSound, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (ambientSound !== 'none' && !isMuted) {
      playAmbientSound(ambientSound, newVol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (ambientSound !== 'none') playAmbientSound(ambientSound, volume);
    } else {
      setIsMuted(true);
      stopAmbientSound();
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>Deep Work Session Tracker</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pomodoro Study Focus</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build sustained academic momentum through structured intervals and ambient focus audio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-2">
            <span className="text-slate-400">Sessions Today:</span>
            <span className="text-indigo-600 font-extrabold text-sm">{completedSessionsCount}</span>
          </div>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 z-10">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 25m Focus
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ☕ 5m Short Break
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'long_break'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌿 15m Long Break
          </button>
        </div>

        {/* Circular Progress & Digital Display */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-8">
          {/* SVG Circular Progress Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-100 stroke-current"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`${
                mode === 'focus'
                  ? 'text-indigo-600'
                  : mode === 'short_break'
                  ? 'text-emerald-500'
                  : 'text-amber-500'
              } stroke-current transition-all duration-1000 ease-linear`}
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
              {mode === 'focus' ? 'Deep Focus Session' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4 mb-6 z-10">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-4 rounded-2xl font-black text-sm tracking-wide text-white shadow-lg flex items-center gap-3 transition-transform active:scale-95 ${
              isRunning
                ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-300'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>START FOCUS</span>
              </>
            )}
          </button>

          <button
            onClick={handleTimerComplete}
            className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Skip / Complete"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Subject & Note Input for Focus Credit */}
        <div className="w-full max-w-md pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-bold text-slate-600 text-left mb-1">
              Credit Study Time To:
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-bold text-slate-600 text-left mb-1">
              Session Goal / Note:
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Practice"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Ambient Sound Synthesizer Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Built-in Ambient Sound Synthesizer</h3>
              <p className="text-xs text-slate-500">Pure Web Audio generation — no internet streaming needed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Mute / Unmute"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
            </button>
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-24 accent-indigo-600"
              aria-label="Volume slider"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => handleSoundChange('none')}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              ambientSound === 'none'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <VolumeX className="w-4 h-4" />
            <span>Off (Silent)</span>
          </button>

          <button
            onClick={() => handleSoundChange('rain')}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              ambientSound === 'rain'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <CloudRain className="w-4 h-4 text-blue-500" />
            <span>Gentle Rain</span>
          </button>

          <button
            onClick={() => handleSoundChange('whitenoise')}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              ambientSound === 'whitenoise'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Radio className="w-4 h-4 text-purple-500" />
            <span>Pink Noise</span>
          </button>

          <button
            onClick={() => handleSoundChange('binaural')}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              ambientSound === 'binaural'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Alpha 432Hz</span>
          </button>

          <button
            onClick={() => handleSoundChange('waves')}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              ambientSound === 'waves'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Waves className="w-4 h-4 text-teal-500" />
            <span>Ocean Surf</span>
          </button>
        </div>
      </div>

      {/* Recent Logged Sessions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <span>Recently Completed Focus Sessions</span>
        </h3>

        <div className="space-y-2">
          {recentSessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="font-bold text-slate-800">
                  {session.durationMinutes} Minutes Pomodoro
                </span>
                {session.subject && (
                  <span
                    style={{ color: session.subject.color }}
                    className="font-extrabold text-[10px] uppercase bg-white px-2 py-0.5 rounded border border-slate-200"
                  >
                    {session.subject.code}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
