import React, { useState } from "react";

export interface SourceCitation {
  source: string;
  content: string;
  chunkIndex?: number;
  score?: number;
}

interface CitationCardProps {
  citation: SourceCitation;
  index: number;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Tính phần trăm tương đồng nếu có score
  const scorePercent =
    citation.score !== undefined
      ? Math.round(citation.score * 100)
      : null;

  return (
    <div className="border border-slate-700/80 bg-slate-800/60 rounded-lg overflow-hidden transition hover:border-indigo-500/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left flex items-center justify-between text-xs text-slate-300 hover:bg-slate-700/40 transition"
      >
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 font-semibold text-[10px]">
            {index + 1}
          </span>
          <span className="font-medium text-slate-200 truncate">{citation.source}</span>
          {citation.chunkIndex !== undefined && (
            <span className="text-slate-400 text-[11px]">(Đoạn #{citation.chunkIndex})</span>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {scorePercent !== null && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                scorePercent >= 75
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {scorePercent}% khớp
            </span>
          )}
          <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-2 text-xs bg-slate-900/70 border-t border-slate-700/60 text-slate-300 whitespace-pre-wrap leading-relaxed">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
            Nội dung trích dẫn từ tài liệu:
          </div>
          <blockquote className="pl-2.5 border-l-2 border-indigo-500/60 italic text-slate-200 bg-slate-800/30 p-1.5 rounded">
            "{citation.content}"
          </blockquote>
        </div>
      )}
    </div>
  );
};
