import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Clipboard, 
  Trash2, 
  ArrowRight, 
  Briefcase, 
  CreditCard, 
  ShieldAlert, 
  Tag, 
  Package, 
  Users, 
  HelpCircle, 
  Wand2, 
  CheckCircle2, 
  UploadCloud, 
  FileCheck2,
  Lock,
  Cpu
} from 'lucide-react';
import { CommunicationCategory, SampleScenario } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface AnalysisFormProps {
  onAnalyze: (text: string, category: CommunicationCategory) => Promise<void>;
  isAnalyzing: boolean;
  statusMessage: string;
}

const CATEGORIES: { id: CommunicationCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'auto', label: 'Auto-Detect', icon: <Wand2 className="w-4 h-4" /> },
  { id: 'job_offer', label: 'Job Offer', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'financial_payment', label: 'Payment / Bank', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'account_security', label: 'Account / Security', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'delivery_shopping', label: 'Delivery / Parcel', icon: <Package className="w-4 h-4" /> },
  { id: 'social_personal', label: 'Family / Social', icon: <Users className="w-4 h-4" /> },
  { id: 'promotional', label: 'Promo / Prize', icon: <Tag className="w-4 h-4" /> },
  { id: 'other', label: 'Other', icon: <HelpCircle className="w-4 h-4" /> },
];

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onAnalyze,
  isAnalyzing,
  statusMessage,
}) => {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunicationCategory>('auto');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileNotice, setFileNotice] = useState<string | null>(null);
  const [sampleFilter, setSampleFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileContent(file);
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        setFileNotice(`Loaded "${file.name}" (${file.size} bytes)`);
        setTimeout(() => setFileNotice(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file);
    } else {
      const droppedText = e.dataTransfer.getData('text');
      if (droppedText) {
        setText(droppedText);
      }
    }
  };

  const handleSelectSample = (sample: SampleScenario) => {
    setText(sample.text);
    setSelectedCategory(sample.category);
    const inputEl = document.getElementById('message-input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isAnalyzing) return;
    onAnalyze(text, selectedCategory);
  };

  const filteredSamples = SAMPLE_SCENARIOS.filter((s) => {
    if (sampleFilter === 'all') return true;
    return s.expectedRisk === sampleFilter;
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1a3d]/90 border border-cyan-800/60 text-cyan-300 text-xs font-semibold mb-3 sm:mb-4 shadow-lg shadow-cyan-950/40">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span>Evidence-Based Scam & Manipulation Analysis</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display mb-3 leading-tight text-white">
          Verify suspicious messages <br className="hidden sm:inline" />
          <span className="bg-linear-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
            before taking action.
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
          Analyze suspicious texts, emails, job offers, or payment demands.
          TrustLens identifies concrete risk triggers, extracts observable evidence, and delivers an independent verification roadmap.
        </p>
      </div>

      {/* Main Analysis Input Card */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-[#0b132e]/90 backdrop-blur-xl rounded-2xl border transition-all duration-200 shadow-2xl shadow-[#040817]/80 p-4 sm:p-7 relative ${
          isDragging 
            ? 'border-cyan-400 ring-4 ring-cyan-500/20 bg-[#0e1d44]' 
            : 'border-blue-900/50 hover:border-blue-800/80'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-20 bg-[#09132f]/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 pointer-events-none">
            <UploadCloud className="w-12 h-12 text-cyan-400 animate-bounce mb-2" />
            <p className="text-base font-bold text-white font-display">Drop communication file here</p>
            <p className="text-xs text-cyan-300 mt-1">Supports .txt, .eml, or plain text</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Communication Category
              </label>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Tailors context-specific safety checks
              </span>
            </div>

            {/* Horizontal scroll container on mobile, wrapped on desktop */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin sm:flex-wrap">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`category-btn-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[40px] sm:min-h-[36px] cursor-pointer ${
                      isSelected
                        ? 'bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/80 scale-100'
                        : 'bg-[#0e193b]/70 text-slate-300 hover:text-white hover:bg-[#142352] border border-blue-900/50 hover:border-blue-700/60'
                    }`}
                  >
                    <span className={isSelected ? 'text-white' : 'text-cyan-400'}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea Input */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label 
                htmlFor="message-input" 
                className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"
              >
                <span>Suspicious Message, Email, or Offer</span>
                <span className="text-rose-400 font-bold">*</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.eml,.md,.log"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  id="upload-file-button"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#14234d] border border-blue-900/60 hover:border-cyan-500/40 transition-colors min-h-[34px] cursor-pointer"
                  title="Upload text file or email"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden xs:inline">Upload file</span>
                </button>

                <button
                  type="button"
                  onClick={handlePaste}
                  id="paste-button"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#14234d] border border-blue-900/60 hover:border-cyan-500/40 transition-colors min-h-[34px] cursor-pointer"
                  title="Paste from clipboard"
                >
                  {pasteSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Pasted!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Paste</span>
                    </>
                  )}
                </button>

                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    id="clear-button"
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-colors min-h-[34px] cursor-pointer"
                    title="Clear text"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification if file was loaded */}
            {fileNotice && (
              <div className="mb-2 p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{fileNotice}</span>
              </div>
            )}

            <div className="relative">
              <textarea
                id="message-input"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the suspicious communication here...

Examples:
• 'Dear Customer, your bank account will be blocked within 24 hours. Update your KYC here: http://bit.ly/bank-update...'
• 'You are selected for Amazon remote product reviewer job! Daily payout $200. Kindly pay $45 onboarding fee via CashApp...'
• 'Hi Dad, my phone broke. This is my new temporary number. Can you transfer $350 urgently for my rent?'"
                className="w-full px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 bg-[#070e24]/90 border border-blue-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-[#09122e] transition-all font-sans leading-relaxed resize-y min-h-[160px] sm:min-h-[175px]"
              />
            </div>

            {/* Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mt-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Zero telemetry: TrustLens does not crawl suspicious links or store credentials.</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-slate-400 self-end sm:self-auto">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
              </div>
            </div>
          </div>

          {/* Analysis Active Pipeline View */}
          {isAnalyzing && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#060c1f] border border-cyan-500/40 shadow-xl shadow-cyan-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    TrustLens Multi-Stage Analysis Running
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  {statusMessage || 'Processing...'}
                </span>
              </div>

              {/* Steps Visualizer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-[#0c1738] border border-cyan-500/30 flex items-center gap-1.5 text-cyan-200">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="truncate">1. Structural Regex</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1738] border border-cyan-500/30 flex items-center gap-1.5 text-cyan-200">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <span className="truncate">2. Deception Signals</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1738] border border-cyan-500/30 flex items-center gap-1.5 text-cyan-200">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <span className="truncate">3. Gemini 3.8 Reasoning</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1738] border border-cyan-500/30 flex items-center gap-1.5 text-cyan-200">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <span className="truncate">4. Safety Checklist</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-blue-950">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Observable signals + Contextual Gemini reasoning</span>
            </div>

            <button
              type="submit"
              id="analyze-submit-button"
              disabled={!text.trim() || isAnalyzing}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold tracking-tight transition-all min-h-[48px] ${
                !text.trim() || isAnalyzing
                  ? 'bg-[#0f1b3d] text-slate-500 cursor-not-allowed border border-blue-950'
                  : 'bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-cyan-500/30 cursor-pointer'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Risk Signals...</span>
                </>
              ) : (
                <>
                  <span>Analyze Communication</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Synthetic Benchmark Gallery */}
      <div className="mt-8 sm:mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Synthetic Benchmark Gallery
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                1-Click Scenarios
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select realistic test cases to evaluate how TrustLens identifies various scam archetypes:
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {(['all', 'high', 'moderate', 'low'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSampleFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all min-h-[32px] cursor-pointer ${
                  sampleFilter === filter
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0e193b]/70 text-slate-300 border border-blue-900/50 hover:bg-[#142352] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid of Benchmark Scenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              id={`sample-btn-${sample.id}`}
              onClick={() => handleSelectSample(sample)}
              className="text-left p-4 rounded-xl bg-[#0b1430]/85 border border-blue-900/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/20 transition-all group flex flex-col justify-between min-h-[140px] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {sample.categoryLabel}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      sample.expectedRisk === 'high'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : sample.expectedRisk === 'moderate'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {sample.expectedRisk}
                  </span>
                </div>

                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {sample.title}
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-blue-950 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="text-[11px] text-slate-500">Click to populate</span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Load scenario</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
