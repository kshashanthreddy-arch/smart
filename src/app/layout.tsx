import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Smart Study OS - Intelligent Academic Study Management System',
  description:
    'All-in-one Smart Study Platform: AI Note Summarizer, Auto Flashcards, Quiz Simulator, Pomodoro Timer & GPA Planner',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 SmartStudy OS • Academic Major Project Implementation</p>
            <div className="flex items-center gap-4 text-slate-600">
              <span>Next.js 16 + React 19</span>
              <span>•</span>
              <span>SQLite & Prisma ORM</span>
              <span>•</span>
              <span>Smart AI NLP Engine</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
