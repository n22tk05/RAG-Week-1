import { NotepadText } from "lucide-react";
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

  return (
    <div className="border border-blue-100 bg-white rounded-xl overflow-hidden transition hover:border-blue-300 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs text-slate-700 hover:bg-blue-50/50 transition"
      >
        <div className="flex items-center space-x-2.5 truncate min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] shrink-0">
            {index + 1}
          </span>
          <span className="font-semibold text-slate-800 truncate">{citation.source}</span>
          {citation.chunkIndex !== undefined && (
            <span className="text-slate-400 text-[11px] shrink-0">(Đoạn #{citation.chunkIndex})</span>
          )}
        </div>

      </button>

      {isOpen && (
        <div className="p-3.5 pt-2 text-xs bg-slate-50/80 border-t border-slate-100 text-slate-600 whitespace-pre-wrap leading-relaxed">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider font-bold text-blue-700 flex items-center gap-1">
            <span><NotepadText size={12}/></span> Trích đoạn từ tài liệu:
          </div>
          <blockquote className="pl-3 border-l-2 border-blue-500 italic text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-inner">
            "{citation.content}"
          </blockquote>
        </div>
      )}
    </div>
  );
};
