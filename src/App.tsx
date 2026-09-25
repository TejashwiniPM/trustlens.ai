import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalysisForm } from './components/AnalysisForm';
import { ReportView } from './components/ReportView';
import { HistoryModal } from './components/HistoryModal';
import { MethodologyModal } from './components/MethodologyModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  saveAnalysisToFirestore,
  subscribeToUserAnalyses,
  deleteAnalysisFromFirestore,
  clearAllAnalysesFromFirestore,
} from './services/firestoreService';
import { AnalysisReport, CommunicationCategory } from './types';
import { ShieldCheck, AlertTriangle, X, Bot, Mic, Sparkles, Cloud } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'trustlens_history_records';

function AppContent() {
  const { user } = useAuth();

  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState(false);

  // History state
  const [history, setHistory] = useState<AnalysisReport[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      // Load from localStorage for anonymous users
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        setHistory(saved ? JSON.parse(saved) : []);
      } catch {
        setHistory([]);
      }
      return;
    }

    // Subscribe to Firestore collection
    const unsubscribe = subscribeToUserAnalyses(
      user.uid,
      (cloudReports) => {
        setHistory(cloudReports);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Persist anonymous users to localStorage
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save history to localStorage', e);
      }
    }
  }, [history, user]);

  const handleAnalyze = async (text: string, category: CommunicationCategory) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setStatusMessage('Analyzing message structure and extracting signals...');

    try {
      setTimeout(() => {
        setStatusMessage('Evaluating risk signals and deception patterns...');
      }, 700);

      setTimeout(() => {
        setStatusMessage('Synthesizing structured verification guidance...');
      }, 1600);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed (${response.status})`);
      }

      const report: AnalysisReport = await response.json();
      setCurrentReport(report);

      // Save to Firestore if user logged in, or localStorage
      if (user) {
        saveAnalysisToFirestore(user.uid, report).catch((err) => {
          console.error('Failed to sync to Firestore:', err);
        });
      } else {
        setHistory((prev) => [report, ...prev.filter((item) => item.id !== report.id)].slice(0, 50));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Analyze error:', err);
      setErrorMessage(
        err.message || 'Unable to complete analysis. Please verify your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
    }
  };

  const handleAskQuestion = async (question: string): Promise<string> => {
    if (!currentReport) return 'No active analysis report to reference.';

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        originalText: currentReport.rawText,
        analysis: {
          risk_level: currentReport.risk_level,
          risk_score: currentReport.risk_score,
          summary: currentReport.summary,
          risk_indicators: currentReport.risk_indicators,
          recommended_action: currentReport.recommended_action,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve follow-up answer');
    }

    const data = await response.json();
    return data.reply;
  };

  const handleClearHistory = async () => {
    if (user) {
      try {
        await clearAllAnalysesFromFirestore(user.uid);
      } catch (e) {
        console.error('Failed to clear Firestore analyses:', e);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setHistory([]);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (user) {
      try {
        await deleteAnalysisFromFirestore(user.uid, id);
      } catch (e) {
        console.error('Failed to delete Firestore item:', e);
      }
    } else {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#060a17] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f1d42] via-[#080e22] to-[#050814] flex flex-col font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navigation Header */}
      <Header
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenMethodology={() => setShowMethodologyModal(true)}
        onOpenChat={() => setShowChatModal(true)}
        onOpenLiveVoice={() => setShowLiveVoiceModal(true)}
        historyCount={history.length}
      />

      {/* Cloud Sync Announcement banner if logged in */}
      {user && (
        <div className="max-w-4xl mx-auto mt-2 px-4 sm:px-6 w-full">
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Signed in as <strong>{user.email}</strong> • Reports securely stored in Firebase Firestore</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400">Live Synced</span>
          </div>
        </div>
      )}

      {/* In-app error toast banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 sm:px-6 w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg shadow-rose-950/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-400 hover:text-rose-200 rounded-lg hover:bg-rose-900/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {currentReport ? (
          <ReportView
            report={currentReport}
            onNewAnalysis={() => setCurrentReport(null)}
            onAskQuestion={handleAskQuestion}
          />
        ) : (
          <AnalysisForm
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            statusMessage={statusMessage}
          />
        )}
      </main>

      {/* Floating Action Quick Access for Chat and Voice (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
        <button
          type="button"
          id="floating-voice-btn"
          onClick={() => setShowLiveVoiceModal(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Open Live Voice Advisor (gemini-3.8-live)"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline">Live Voice</span>
        </button>

        <button
          type="button"
          id="floating-chat-btn"
          onClick={() => setShowChatModal(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#0c183b] hover:bg-[#122354] border border-blue-800 hover:border-cyan-400 text-white font-bold text-xs shadow-xl shadow-blue-950/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Open Gemini Chat Advisor"
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Gemini Chat</span>
        </button>
      </div>

      {/* Gemini Chatbot Modal */}
      <GeminiChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />

      {/* Real-time Voice Advisor Modal */}
      <LiveVoiceModal
        isOpen={showLiveVoiceModal}
        onClose={() => setShowLiveVoiceModal(false)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onSelectReport={(report) => {
          setCurrentReport(report);
          setShowHistoryModal(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClearHistory={handleClearHistory}
        onDeleteReport={handleDeleteHistoryItem}
      />

      {/* Methodology & Framework Modal */}
      <MethodologyModal
        isOpen={showMethodologyModal}
        onClose={() => setShowMethodologyModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-blue-950/80 bg-[#070c1d]/90 py-8 px-4 text-xs text-slate-400 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 font-semibold text-slate-200 mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold tracking-tight">TrustLens AI — Digital Trust & Safety Cockpit</span>
            </div>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Helping users understand why messages may be risky and what to verify independently. Powered by Gemini 3.8 & Firebase Firestore.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Gemini Chatbot
            </button>
            <button
              type="button"
              onClick={() => setShowLiveVoiceModal(true)}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Voice Call (Live)
            </button>
            <button
              type="button"
              onClick={() => setShowMethodologyModal(true)}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Methodology
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
