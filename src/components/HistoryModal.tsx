import React, { useState } from 'react';
import { X, History, Trash2, Search, ArrowRight, ShieldAlert, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { AnalysisReport, RiskLevel } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisReport[];
  onSelectReport: (report: AnalysisReport) => void;
  onClearHistory: () => void;
  onDeleteReport: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onClearHistory,
  onDeleteReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.rawText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inferredCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || item.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <ShieldAlert className="w-3 h-3" />
            HIGH RISK
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <AlertCircle className="w-3 h-3" />
            MODERATE
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <CheckCircle className="w-3 h-3" />
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#091129] rounded-2xl border border-blue-900/60 shadow-2xl shadow-black/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-blue-950 bg-[#070d20] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Analysis History
              </h3>
              <p className="text-xs text-slate-400">
                Saved locally on this device ({history.length} records)
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-history-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-blue-950 bg-[#060b1b] flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, text, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 bg-[#09122e] border border-blue-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'high', 'moderate', 'low'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors min-h-[36px] cursor-pointer ${
                    filterRisk === r
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-[#0b1535] text-slate-300 border border-blue-900/50 hover:bg-[#111e48]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1 font-semibold ml-auto px-2 py-1.5 rounded-lg hover:bg-rose-950/40 transition-colors min-h-[36px] cursor-pointer"
                title="Clear all saved history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2.5 bg-[#070e24]">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No matching analyses found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {history.length === 0
                  ? 'Your analyzed messages are securely saved locally here for quick revisit.'
                  : 'Try changing your search keywords or risk filter.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-blue-900/50 bg-[#0a1433] hover:border-cyan-500/50 hover:bg-[#0e1c44] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectReport(item);
                    onClose();
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {getRiskBadge(item.risk_level)}
                    <span className="text-[11px] font-bold text-cyan-300">
                      {item.inferredCategory}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
                    {item.rawText}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-950">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectReport(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-950 hover:bg-cyan-500 hover:text-slate-950 border border-blue-800/60 px-3 py-2 rounded-xl transition-all min-h-[38px] cursor-pointer"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteReport(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                    title="Delete this record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#060b1a] border-t border-blue-950 text-center text-[11px] text-slate-400">
          All history remains securely on your browser device.
        </div>
      </div>
    </div>
  );
};
