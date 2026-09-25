import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowLeft,
  Copy,
  Check,
  MessageSquare,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Link2,
  DollarSign,
  Clock,
  KeyRound,
  FileCheck2,
  RefreshCw,
  Share2,
  Printer,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { AnalysisReport, ChatMessage, RiskLevel, Severity } from '../types';

interface ReportViewProps {
  report: AnalysisReport;
  onNewAnalysis: () => void;
  onAskQuestion: (question: string) => Promise<string>;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  onNewAnalysis,
  onAskQuestion,
}) => {
  // Verification checklist state
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copiedChecklist, setCopiedChecklist] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeHighlightQuote, setActiveHighlightQuote] = useState<string | null>(null);

  // Ask TrustLens chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Evidence expand/collapse state
  const [showFullOriginal, setShowFullOriginal] = useState(true);
  const evidenceRef = useRef<HTMLDivElement>(null);

  const totalSteps = report.verification_steps.length;
  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyVerificationSteps = () => {
    const text = report.verification_steps
      .map((step, idx) => `${idx + 1}. ${step}`)
      .join('\n\n');
    navigator.clipboard.writeText(
      `TrustLens AI Verification Guide:\n\n${text}\n\nDisclaimer: ${report.limitations}`
    );
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2000);
  };

  const copyShareSummary = () => {
    const shareText = `TrustLens AI Risk Assessment: ${report.risk_level.toUpperCase()} (${report.risk_score}/100)\nCategory: ${report.inferredCategory}\n\nSummary:\n${report.summary}\n\nRecommended Action:\n${report.recommended_action}\n\nAlways verify independently before acting.`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToEvidence = (quote: string) => {
    setActiveHighlightQuote(quote);
    setShowFullOriginal(true);
    if (evidenceRef.current) {
      evidenceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const reply = await onAskQuestion(questionText);
      const assistantMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: 'Unable to evaluate this question right now. Please review the independent verification checklist.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const quickQuestions = [
    'Why did you flag this?',
    'What should I verify first?',
    'What information must I NOT share?',
    'What safe response should I send?',
    'How do scammers spoof this organization?'
  ];

  // Visual risk level configuration
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return {
          badge: 'HIGH ATTENTION REQUIRED',
          title: 'Potential Risk: HIGH',
          textColor: 'text-rose-200',
          bgBanner: 'bg-linear-to-br from-rose-950/60 via-[#180a1d] to-[#0d1430] border-rose-800/60 shadow-xl shadow-rose-950/30',
          badgeStyle: 'bg-rose-600 text-white shadow-md shadow-rose-600/30',
          iconBg: 'bg-rose-950/80 border border-rose-700/60',
          icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
          scoreBar: 'bg-linear-to-r from-rose-600 to-rose-400',
          scorePill: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
        };
      case 'moderate':
        return {
          badge: 'CAUTION RECOMMENDED',
          title: 'Potential Risk: MODERATE',
          textColor: 'text-amber-200',
          bgBanner: 'bg-linear-to-br from-amber-950/60 via-[#1a1412] to-[#0d1430] border-amber-800/60 shadow-xl shadow-amber-950/30',
          badgeStyle: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
          iconBg: 'bg-amber-950/80 border border-amber-700/60',
          icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
          scoreBar: 'bg-linear-to-r from-amber-600 to-amber-400',
          scorePill: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
        };
      case 'low':
      default:
        return {
          badge: 'LOW CONCERN DETECTED',
          title: 'Potential Risk: LOW',
          textColor: 'text-emerald-200',
          bgBanner: 'bg-linear-to-br from-emerald-950/60 via-[#0a1a24] to-[#0d1430] border-emerald-800/60 shadow-xl shadow-emerald-950/30',
          badgeStyle: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
          iconBg: 'bg-emerald-950/80 border border-emerald-700/60',
          icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
          scoreBar: 'bg-linear-to-r from-emerald-600 to-cyan-400',
          scorePill: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
        };
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-2xs">
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-2xs">
            Medium Severity
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-cyan-300 border border-blue-800/60 shadow-2xs">
            Low Severity
          </span>
        );
    }
  };

  const riskConfig = getRiskConfig(report.risk_level);

  // Helper to render text with highlighted active quote
  const renderMessageContent = (fullText: string) => {
    if (!activeHighlightQuote || !fullText.includes(activeHighlightQuote)) {
      return <span>{fullText}</span>;
    }

    const parts = fullText.split(activeHighlightQuote);
    return (
      <span>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <mark className="bg-amber-400/30 text-amber-200 border-b-2 border-amber-400 px-1 py-0.5 rounded font-semibold transition-all">
                {activeHighlightQuote}
              </mark>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-950">
        <button
          type="button"
          id="new-analysis-button"
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-[#0e193b]/80 hover:bg-[#152452] border border-blue-900/60 hover:border-cyan-500/50 transition-all shadow-xs min-h-[40px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Analyze Another Message</span>
        </button>

        <div className="flex items-center gap-2" id="export-buttons">
          <button
            type="button"
            id="print-report-button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-[#0e193b]/80 hover:bg-[#152452] border border-blue-900/60 transition-colors min-h-[40px] cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>

          <button
            type="button"
            id="share-report-button"
            onClick={copyShareSummary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-[#0e193b]/80 hover:bg-[#152452] border border-blue-900/60 hover:border-cyan-500/50 transition-colors min-h-[40px] cursor-pointer"
            title="Copy summary to clipboard"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Summary Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive 12-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Assessment, Signals, Indicators, Evidence (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION: Overall Risk Assessment Card */}
          <div className={`rounded-2xl border ${riskConfig.bgBanner} p-5 sm:p-7 backdrop-blur-xl`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-xl shadow-lg shrink-0 ${riskConfig.iconBg}`}>
                  {riskConfig.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${riskConfig.badgeStyle}`}>
                      {riskConfig.badge}
                    </span>
                    <span className="text-xs text-slate-300 font-bold bg-[#0a122e]/80 px-2.5 py-0.5 rounded-md border border-blue-900/60">
                      {report.inferredCategory}
                    </span>
                  </div>
                  <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${riskConfig.textColor} font-display`}>
                    {riskConfig.title}
                  </h2>
                </div>
              </div>

              {/* Visual Risk Gauge Widget */}
              <div className="bg-[#091129]/90 rounded-xl p-3.5 border border-blue-900/60 shadow-lg sm:min-w-[170px] self-start sm:self-auto text-left sm:text-right w-full sm:w-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Calculated Risk Score
                </div>
                <div className="text-2xl font-extrabold text-white mt-0.5 flex sm:justify-end items-baseline gap-1">
                  <span>{report.risk_score}</span>
                  <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
                <div className="w-full bg-[#060b1b] rounded-full h-2 mt-2 overflow-hidden border border-blue-950">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${riskConfig.scoreBar}`}
                    style={{ width: `${Math.max(report.risk_score, 6)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Assessment Narrative */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium mb-4">
              {report.summary}
            </p>

            {/* Notice Footer */}
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#070e24]/80 px-3.5 py-2.5 rounded-xl border border-blue-900/50">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Objective Assessment:</strong> Indicators represent observable patterns. Confirm identity through official channels before sharing info or transferring funds.
              </span>
            </div>
          </div>

          {/* SECTION: Detected Structural Signals Overview Bar */}
          <div className="bg-[#0b1430]/90 rounded-2xl border border-blue-900/50 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center justify-between">
              <span>Observable Structural Signals</span>
              <span className="text-[10px] font-semibold text-slate-400">Deterministic Extractor</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {report.detected_signals.urls.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e193b] text-cyan-200 border border-cyan-800/40">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">{report.detected_signals.urls.length} Link(s) found</span>
                </div>
              )}
              {report.detected_signals.amounts.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/70 text-rose-200 border border-rose-800/60">
                  <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold">Financial demand: {report.detected_signals.amounts.join(', ')}</span>
                </div>
              )}
              {report.detected_signals.hasUrgency && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 text-amber-200 border border-amber-800/60">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">Urgency cues: {report.detected_signals.urgencyPhrases.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {report.detected_signals.hasCredentialRequest && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 text-indigo-200 border border-indigo-800/60">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold">Credential ask: {report.detected_signals.credentialKeywords.join(', ')}</span>
                </div>
              )}
              {report.detected_signals.urls.length === 0 &&
                report.detected_signals.amounts.length === 0 &&
                !report.detected_signals.hasUrgency &&
                !report.detected_signals.hasCredentialRequest && (
                  <span className="text-slate-400 italic text-xs py-1">No overt high-pressure tokens or payment keywords detected.</span>
                )}
            </div>
          </div>

          {/* SECTION: Risk Indicators Breakdown */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-display">
                <span>Identified Risk Indicators</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {report.risk_indicators.length}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Click quote to highlight below
              </span>
            </div>

            <div className="space-y-3">
              {report.risk_indicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b1430]/85 rounded-2xl border border-blue-900/50 p-4 sm:p-5 shadow-lg hover:border-cyan-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                      {indicator.category}
                    </span>
                    {getSeverityBadge(indicator.severity)}
                  </div>

                  {/* Evidence snippet */}
                  <div 
                    onClick={() => scrollToEvidence(indicator.evidence)}
                    className="bg-[#070e24] hover:bg-[#0c1638] rounded-xl p-3 border border-blue-900/50 mb-3 cursor-pointer transition-colors"
                    title="Click to view and highlight in original message"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                      <span>Observed Evidence:</span>
                      <span className="text-cyan-300 group-hover:underline">Locate in text ↓</span>
                    </div>
                    <p className="text-xs text-slate-200 font-mono bg-[#050a1b] p-2.5 rounded-lg border border-blue-950 leading-relaxed">
                      "{indicator.evidence}"
                    </p>
                  </div>

                  {/* Why it matters */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Risk Analysis:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {indicator.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: Evidence From Message (Interactive Text Viewer) */}
          <div ref={evidenceRef} className="bg-[#0b1430]/90 rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden backdrop-blur-xl">
            <div className="p-4 bg-[#080f24] border-b border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Submitted Communication & Signal Quotes
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullOriginal(!showFullOriginal)}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold p-1 cursor-pointer"
              >
                {showFullOriginal ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {showFullOriginal && (
              <div className="p-4 sm:p-5 space-y-3">
                <div className="p-4 rounded-xl bg-[#060b1b] border border-blue-950 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-72 overflow-y-auto">
                  {renderMessageContent(report.rawText)}
                </div>

                {report.key_quotes && report.key_quotes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                      Extracted Signal Quotes (Click to highlight in text):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.key_quotes.map((kq, kidx) => {
                        const isActive = activeHighlightQuote === kq.quote;
                        return (
                          <button
                            key={kidx}
                            type="button"
                            onClick={() => scrollToEvidence(kq.quote)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                              isActive
                                ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                                : 'bg-[#0e1c42] hover:bg-[#152a5f] text-cyan-200 border border-cyan-800/40'
                            }`}
                          >
                            <span className="font-semibold text-cyan-300">{kq.tag}:</span>
                            <span className="truncate max-w-[200px]">"{kq.quote}"</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recommended Action, Verification Checklist, Ask TrustLens (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION: Recommended Action Card */}
          <div className="rounded-2xl border border-cyan-500/40 bg-linear-to-br from-[#0c1a40] via-[#091433] to-[#060b1d] text-white p-5 sm:p-6 shadow-xl shadow-cyan-950/30">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                  Recommended Immediate Action
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white font-display">
                  {report.risk_level === 'high' ? 'Stop & Do Not Respond' : 'Independent Verification Required'}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-200 mb-3 bg-[#060c20]/80 p-3.5 rounded-xl border border-blue-900/40">
              {report.recommended_action}
            </p>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Legitimate financial institutions and companies will never threaten forfeiture within minutes or ask you to pay via non-traditional methods to receive money.
            </p>
          </div>

          {/* SECTION: Interactive Verification Assistant */}
          <div className="bg-[#0b1430]/90 rounded-2xl border border-blue-900/50 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-blue-950">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-display">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span>Verification Checklist</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete these independent checks before taking action:
                </p>
              </div>

              <button
                type="button"
                id="copy-checklist-button"
                onClick={copyVerificationSteps}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-900/60 hover:bg-[#14234d] transition-colors shrink-0 cursor-pointer"
              >
                {copiedChecklist ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Checklist Progress Meter */}
            <div className="mb-4 bg-[#070e24] p-3 rounded-xl border border-blue-900/40">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Checklist Progress</span>
                <span className="text-cyan-300">{completedSteps} of {totalSteps} verified ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-[#050a1a] rounded-full h-2 overflow-hidden border border-blue-950">
                <div 
                  className="bg-linear-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {completedSteps === totalSteps && totalSteps > 0 && (
                <div className="mt-2 text-xs font-bold text-cyan-300 flex items-center gap-1.5 animate-fadeIn">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>All verification steps reviewed! You are ready to proceed safely.</span>
                </div>
              )}
            </div>

            {/* Steps List */}
            <div className="space-y-2.5">
              {report.verification_steps.map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : 'bg-[#070e24]/70 border-blue-900/40 hover:bg-[#0c173a] text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStep(idx)}
                      className="mt-0.5 rounded border-blue-800 bg-[#070e24] text-cyan-500 focus:ring-cyan-400 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs sm:text-sm leading-relaxed flex-1">
                      <span className={isChecked ? 'line-through text-slate-500' : 'font-medium'}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: Official Reporting Authorities Helper */}
          <div className="bg-[#0b1430]/90 rounded-2xl border border-blue-900/50 p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Flag className="w-4 h-4 text-cyan-400" />
              <span>Report to Official Consumer Portals</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              If this is confirmed fraud or unauthorized identity theft, report details to official safety authorities:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a
                href="https://reportfraud.ftc.gov"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#081029] border border-blue-900/60 hover:border-cyan-500/50 text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>FTC (US)</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#081029] border border-blue-900/60 hover:border-cyan-500/50 text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>Cybercrime (IN)</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
              <a
                href="https://www.actionfraud.police.uk"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#081029] border border-blue-900/60 hover:border-cyan-500/50 text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>Action Fraud (UK)</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
              <a
                href="https://www.ic3.gov"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#081029] border border-blue-900/60 hover:border-cyan-500/50 text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>FBI IC3</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            </div>
          </div>

          {/* SECTION: Ask TrustLens Assistant (Follow-up Q&A) */}
          <div className="bg-[#0b1430]/90 rounded-2xl border border-blue-900/50 p-5 sm:p-6 shadow-xl backdrop-blur-xl" id="chat-section">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight font-display">
                  Ask TrustLens
                </h3>
                <p className="text-xs text-slate-400">
                  Ask follow-up questions grounded directly in the analyzed message
                </p>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`quick-q-${idx}`}
                  disabled={isAsking}
                  onClick={() => handleAsk(q)}
                  className="text-xs font-semibold text-slate-300 bg-[#0e193b] hover:bg-[#152452] active:bg-[#1b2f69] border border-blue-900/40 hover:border-cyan-500/40 px-3 py-1.5 rounded-lg transition-colors text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Message Scroll Area */}
            {chatMessages.length > 0 && (
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto p-3.5 rounded-xl bg-[#060b1a] border border-blue-950">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
                          : 'bg-[#0b1430] text-slate-200 border border-blue-900/60 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span
                        className={`block text-[10px] mt-1 ${
                          msg.role === 'user' ? 'text-cyan-200 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#0b1430] p-3 rounded-xl border border-blue-900/60">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Evaluating evidence and safety guidance...</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(inputQuestion);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                id="chat-input-field"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={isAsking}
                placeholder="Ask e.g. 'What safe response should I send?'"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 bg-[#070e24] border border-blue-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:bg-[#09122e] transition-all min-h-[42px]"
              />
              <button
                type="submit"
                id="chat-submit-button"
                disabled={!inputQuestion.trim() || isAsking}
                className={`p-2.5 rounded-xl text-white transition-all shadow-md min-h-[42px] min-w-[42px] flex items-center justify-center ${
                  !inputQuestion.trim() || isAsking
                    ? 'bg-[#0f1b3d] text-slate-600 cursor-not-allowed border border-blue-950'
                    : 'bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 cursor-pointer active:scale-95 shadow-cyan-500/25'
                }`}
                title="Send question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Limitations Notice */}
      <div className="text-center text-[11px] text-slate-400 max-w-xl mx-auto py-2">
        {report.limitations}
      </div>
    </div>
  );
};
