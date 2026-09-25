import React from 'react';
import { X, ShieldCheck, Scale, Eye, Layers } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#091129] rounded-2xl border border-blue-900/60 shadow-2xl shadow-black/80 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-950 bg-[#070d20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                TrustLens AI Methodology & Framework
              </h3>
              <p className="text-xs text-slate-400">
                Observable risk signals, evaluation dimensions & responsible AI guidelines
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-methodology-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed bg-[#070e24]">
          {/* Core Philosophy */}
          <div className="bg-linear-to-r from-[#0c1a40] to-[#091433] rounded-2xl p-4 sm:p-5 border border-cyan-800/40">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Core Product Philosophy</span>
            </div>
            <p className="italic text-slate-200 font-medium leading-relaxed">
              "Don't simply tell the user whether something is safe or unsafe. Help the user understand why it may be risky, extract observable evidence, and guide them on what they must verify independently before taking action."
            </p>
          </div>

          {/* 6 Dimensions Analyzed */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2 font-display">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>The 6 Risk Dimensions Analyzed in Context</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433]">
                <span className="font-bold text-white block mb-1">1. Urgency & Time Pressure</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Detects countdowns, threats of immediate account termination, and forfeiture deadlines designed to bypass rational scrutiny.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433]">
                <span className="font-bold text-white block mb-1">2. Financial Demands & Transfers</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Identifies registration fees, advance courier charges, UPI handles, gift cards, or cryptocurrency payment requests.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433]">
                <span className="font-bold text-white block mb-1">3. Sensitive Authentication Credentials</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Flags requests for one-time passwords (OTPs), net banking passwords, CVVs, or government IDs (PAN/SSN).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433]">
                <span className="font-bold text-white block mb-1">4. Impersonation & Authority Claims</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Reviews claims of representing banks, recruiters, government agencies, delivery providers, or distressed relatives.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433]">
                <span className="font-bold text-white block mb-1">5. Unrealistic Claims & Guarantees</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Surfaces promised daily income for effortless tasks, 400%+ investment returns, or unexpected lottery winnings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433]">
                <span className="font-bold text-white block mb-1">6. Link & Contact Telemetry</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Flags mismatched domains, lookalike URLs, suspicious TLDs, and advises independent navigation instead of direct clicks.
                </p>
              </div>
            </div>
          </div>

          {/* Hybrid Architecture */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2 font-display">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Hybrid Architecture (Rule-based Signals + Contextual LLM)</span>
            </h4>
            <div className="bg-[#0a1433] p-4 rounded-2xl border border-blue-900/50 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">1</span>
                <span><strong>Input Processing:</strong> Cleans and normalizes incoming message strings without saving personally identifiable credentials.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">2</span>
                <span><strong>Deterministic Rule Signal Detection:</strong> Regex extraction for URLs, phones, currency figures, and urgency indicators.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">3</span>
                <span><strong>Gemini 3.8 Flash Contextual Reasoning:</strong> Evaluates subtle nuances, deception tactics, and intent across categories.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">4</span>
                <span><strong>Structured Schema Output:</strong> Generates concrete evidence quotes, severity ratings, and an actionable verification checklist.</span>
              </div>
            </div>
          </div>

          {/* Responsible AI Principles */}
          <div className="border-t border-blue-950 pt-4">
            <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2 font-display">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Responsible AI Guarantees</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Zero Web Crawling of Suspicious Links:</strong> TrustLens never visits arbitrary links submitted in messages, preventing payload execution or IP tracking.</li>
              <li><strong>No Hallucinated Evidence:</strong> Every indicator must reference verifiable quotes from the submitted communication.</li>
              <li><strong>No False Certainty:</strong> Avoids claims of 100% accuracy or definitive fraud declarations, focusing on building user verification habits.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#070d20] border-t border-blue-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl transition-all min-h-[44px] cursor-pointer shadow-md shadow-cyan-500/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
