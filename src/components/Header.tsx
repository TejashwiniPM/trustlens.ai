import React, { useState } from 'react';
import {
  ShieldCheck,
  History,
  BookOpen,
  Bot,
  Mic,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Cloud,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenMethodology: () => void;
  onOpenChat: () => void;
  onOpenLiveVoice: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenMethodology,
  onOpenChat,
  onOpenLiveVoice,
  historyCount,
}) => {
  const { user, loading, signInWithGoogle, signOutUser, authError } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#080e24]/90 backdrop-blur-md border-b border-blue-900/40 shadow-lg shadow-blue-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 via-indigo-700 to-cyan-500 p-px shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#091129] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-display">
                TrustLens<span className="text-cyan-400">.ai</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 hidden xs:inline-flex shadow-xs">
                Digital Trust
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Evidence-based scam & manipulation analysis
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Gemini Chatbot trigger */}
          <button
            type="button"
            id="open-gemini-chat-btn"
            onClick={onOpenChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-linear-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800 hover:to-indigo-800 border border-blue-700/50 hover:border-cyan-400/60 rounded-xl transition-all min-h-[40px] shadow-xs cursor-pointer"
            title="Chat with TrustLens Gemini Assistant"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Gemini Chat</span>
          </button>

          {/* Real-time Live API voice trigger */}
          <button
            type="button"
            id="open-live-voice-btn"
            onClick={onOpenLiveVoice}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 hover:border-cyan-400 rounded-xl transition-all min-h-[40px] shadow-xs cursor-pointer"
            title="Start Live Voice session with gemini-3.8-live"
          >
            <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">Voice Call</span>
          </button>

          {/* History */}
          <button
            type="button"
            id="history-button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#0e1938]/80 hover:bg-[#14234d] border border-blue-900/60 hover:border-cyan-500/50 rounded-xl transition-all min-h-[40px] shadow-xs cursor-pointer"
            title="View saved analysis history"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {user && (
              <span title="Cloud synced with Firestore">
                <Cloud className="w-3 h-3 text-cyan-400 ml-0.5" />
              </span>
            )}
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950 min-w-[18px] text-center shadow-xs">
                {historyCount}
              </span>
            )}
          </button>

          {/* Methodology */}
          <button
            type="button"
            id="methodology-button"
            onClick={onOpenMethodology}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-950/70 border border-transparent hover:border-blue-800/50 rounded-xl transition-all min-h-[40px] cursor-pointer"
            title="View Evaluation Methodology"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Methodology</span>
          </button>

          {/* Download Project for GitHub */}
          <a
            href="/api/download-zip"
            download="trustlens-ai.zip"
            id="download-project-btn"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0e1938]/80 hover:bg-[#14234d] border border-blue-900/60 hover:border-cyan-500/50 rounded-xl transition-all min-h-[40px] shadow-xs cursor-pointer"
            title="Download full project ZIP to upload to GitHub"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Download ZIP</span>
          </a>

          {/* Google Sign-in / User Profile */}
          <div className="relative">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-blue-950/80 border border-blue-900 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0e1938] hover:bg-[#152554] border border-blue-900/60 text-xs font-semibold text-slate-200 min-h-[40px] cursor-pointer"
                  title={user.email || 'User Account'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-400/50"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[70px] truncate hidden sm:inline text-xs">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#09122e] border border-blue-900/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-blue-950 text-xs">
                      <p className="font-bold text-white truncate">{user.displayName || 'Google User'}</p>
                      <p className="text-slate-400 truncate text-[11px]">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-cyan-300 font-semibold">
                        <Cloud className="w-3 h-3 text-cyan-400" />
                        Firestore Persistent Sync
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        signOutUser();
                      }}
                      className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="google-signin-btn"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all shadow-md shadow-cyan-500/20 min-h-[40px] cursor-pointer"
                title="Sign in with Google to sync analyses to Firestore"
              >
                <LogIn className="w-3.5 h-3.5 text-white" />
                <span className="hidden xs:inline">Sign in with Google</span>
                <span className="xs:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
