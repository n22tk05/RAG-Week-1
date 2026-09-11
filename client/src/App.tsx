import React, { useState } from "react";
import { DocumentPanel } from "./components/DocumentPanel";
import { ChatPanel } from "./components/ChatPanel";
import { Book, BookOpen } from "lucide-react";

export const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDocOpen, setIsDocOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="h-14 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Nút bật/tắt Document Panel trên Header */}
          <button
            onClick={() => setIsDocOpen((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 shadow-2xs ${
              isDocOpen
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title={isDocOpen ? "Thu gọn Quản lý tài liệu" : "Mở Quản lý tài liệu"}
          >
            <span className="hidden sm:inline font-semibold">
              {isDocOpen ? <BookOpen size={16}/> : <Book size={16}/>}
            </span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/25 shrink-0">
            R
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Minimal RAG Engine
              <span className="text-[10px] uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-semibold tracking-wide hidden sm:inline-block">
                PoC
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-normal hidden md:block">
              TypeScript • LangChain • Gemini 3.6 • Supabase pgvector
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">Supabase Vector DB</span>
            <span className="sm:hidden">Vector DB</span>
          </div>
          <a
            href="https://github.com/n22tk05/RAG-Week-1"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 hover:text-blue-600 font-medium transition flex items-center gap-1 bg-blue-200 px-2.5 py-1 rounded-full border border-blue-500/80 font-medium"
          >
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main 2-Column Responsive Body */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {/* Left Column: Document Ingestion & Management */}
        <section
          className={`h-1/3 md:h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            isDocOpen
              ? "w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200/90"
              : "w-0 h-0 md:h-full border-none pointer-events-none opacity-0"
          }`}
        >
          {isDocOpen && (
            <div className="w-full md:w-80 lg:w-96 h-full">
              <DocumentPanel
                onDocumentIndexed={() => setRefreshKey((k) => k + 1)}
                onClose={() => setIsDocOpen(false)}
              />
            </div>
          )}
        </section>

      
        {/* Right Column: Q&A Chat Interface */}
        <section key={refreshKey} className="flex-1 h-2/3 md:h-full min-w-0">
          <ChatPanel />
        </section>
      </main>
    </div>
  );
};

export default App;
