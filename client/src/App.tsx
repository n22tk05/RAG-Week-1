import React, { useState } from "react";
import { DocumentPanel } from "./components/DocumentPanel";
import { ChatPanel } from "./components/ChatPanel";

export const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            R
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Minimal RAG Engine
              <span className="text-[10px] uppercase px-1.5 py-0.5 bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50 font-semibold">
                PoC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              TypeScript • LangChain • Gemini 3.6 • Supabase pgvector
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">Supabase Vector DB</span>
          </div>
          <a
            href="https://github.com/n22tk05/RAG-Week-1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 transition text-slate-400"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      {/* Main 2-Column Responsive Body */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Column: Document Ingestion & Management */}
        <section className="w-full md:w-80 lg:w-96 shrink-0 h-1/3 md:h-full">
          <DocumentPanel onDocumentIndexed={() => setRefreshKey((k) => k + 1)} />
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
