import React, { useState, useRef, useEffect } from "react";
import { CitationCard } from "./CitationCard";
import { useChatHistory } from "../hooks/useChatHistory";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
import type { ChatMessage } from "../types/chat";
import {
  ArrowRight,
  BookOpenText,
  Check,
  Copy,
  RotateCcwClock,
  SquarePen,
  Timer,
} from "lucide-react";

export const ChatPanel: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    currentSession,
    messages,
    addMessage,
    createNewSession,
    selectSession,
    renameSession,
    deleteSession,
    clearAllSessions,
  } = useChatHistory();

  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (content: string, id: string) => {
    const cleanContent = content.replace(/\s*\[Nguồn:.*?\]/g, '').trim();
    navigator.clipboard.writeText(cleanContent);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;
    const currentDate = new Date();
    const userMsgId = currentDate.getTime().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: q,
      createdAt: new Date().toISOString(),
    };

    addMessage(newUserMessage);
    setInputQuestion("");
    setIsLoading(true);

    // Chuẩn bị lịch sử trò chuyện gần nhất (bỏ qua welcome message)
    const historyPayload = messages
      .filter((m) => !m.id.startsWith("welcome"))
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          history: historyPayload,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const aiMessage: ChatMessage = {
          id: (new Date().getTime() + 1).toString(),
          role: "assistant",
          content: json.data.answer,
          sources: json.data.sources,
          timeMs: json.data.timeMs,
          createdAt: new Date().toISOString(),
        };
        addMessage(aiMessage);
      } else {
        const errorMsg: ChatMessage = {
          id: (new Date().getTime() + 1).toString(),
          role: "assistant",
          content: `Lỗi: ${json.error || "Không thể nhận phản hồi từ AI."}`,
          createdAt: new Date().toISOString(),
        };
        addMessage(errorMsg);
      }
    } catch (err: any) {
      addMessage({
        id: (new Date().getTime() + 1).toString(),
        role: "assistant",
        content: `Lỗi kết nối: ${err.message || "Không thể gọi API /api/chat."}`,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sampleQuestions = [
    "Kiến trúc RAG là gì?",
    "Quy trình nạp tài liệu gồm những bước nào?",
    "Thủ đô của nước Pháp là gì?",
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/70 overflow-hidden relative">
      {/* Chat History Drawer Slide-over */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
      />

      {/* Chat Header */}
      <div className="px-5 py-3 border-b border-slate-200/90 bg-white/95 backdrop-blur flex items-center justify-between shrink-0 z-10 shadow-xs">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
            title="Mở lịch sử chat"
          >
            <span>
              <RotateCcwClock size={16} />
            </span>
            <span className="hidden sm:inline">Lịch sử</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 border border-blue-200 rounded-full font-bold">
              {sessions.length}
            </span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <h1 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {currentSession?.title || "Hỏi Đáp Trực Quan"}
              </h1>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => createNewSession()}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center space-x-1 shadow-sm shadow-blue-600/20 transition"
            title="Tạo cuộc trò chuyện mới"
          >
            <span>
              <SquarePen size={16} />
            </span>
            <span className="hidden sm:inline">Đoạn chat mới</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col group ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/15"
                  : "bg-white text-slate-800 rounded-bl-none border border-slate-200/90 shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap text-left">{msg.content}</div>

              {/* Message metadata & actions */}
              <div
                className={`flex items-center justify-between gap-3 mt-2 pt-1 border-t text-[10px] ${
                  msg.role === "user"
                    ? "border-blue-500/40 text-blue-100"
                    : "border-slate-100 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className={`transition flex items-center gap-1 ${
                      msg.role === "user"
                        ? "hover:text-white text-blue-100"
                        : "hover:text-blue-600 text-slate-400"
                    }`}
                    title="Sao chép câu trả lời"
                  >
                    <span>
                      {copiedMessageId === msg.id ? (
                        <span className="flex items-center gap-2">
                          <Check size={14} /> Sao chép
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Copy size={14} /> Sao chép
                        </span>
                      )}
                    </span>
                  </button>
                </div>
                {msg.timeMs && <span className="flex items-center gap-1"><Timer size={14}/> {Math.floor(msg.timeMs / 1000)}s</span>}
              </div>
            </div>

            {/* Render Collapsible Citations if available */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2.5 w-full max-w-2xl space-y-1.5 pl-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <span><BookOpenText size={14}/></span> Nguồn tài liệu tham chiếu (
                  {msg.sources.length}):
                </div>
                <div className="grid gap-1.5">
                  {console.log(msg)}
                  {msg.sources.map((cit, idx) => (
                    <CitationCard key={idx} citation={cit} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-slate-200/90 px-4 py-3 rounded-2xl rounded-bl-none text-sm text-slate-600 flex items-center space-x-2.5 shadow-sm">
              <span className="inline-block w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></span>
              <span>Đang truy xuất & tổng hợp câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-4 sm:px-6 py-2.5 bg-white/90 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0 shadow-2xs">
        <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">
          Gợi ý:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-xs px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full whitespace-nowrap transition font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <div className="p-4 bg-white border-t border-slate-200/90 shrink-0 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 items-center w-full"
        >
          {/* Xóa class items-center thừa ở div này */}
          <div className="flex-1 relative">
            <textarea
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi dựa trên tài liệu... (Nhấn Enter để gửi)"
              /* Thêm h-11 để fix chiều cao cố định */
              className="w-full h-11 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition shadow-inner leading-normal"
            />
          </div>
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            /* Thêm h-11 vào button để cao bằng hệt textarea */
            className={`h-11 px-6 mb-1.5 rounded-xl text-sm font-semibold flex items-center justify-center transition  ${
              !inputQuestion.trim() || isLoading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25"
            }`}
          >
            {isLoading ? (
              "..."
            ) : (
              <span className="flex items-center gap-2">
                Gửi <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
