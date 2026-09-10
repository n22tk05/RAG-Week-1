import React, { useState, useRef, useEffect } from "react";
import { CitationCard, type SourceCitation } from "./CitationCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  timeMs?: number;
}

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý RAG Engine. Hãy đặt câu hỏi về các tài liệu bạn đã nạp vào hệ thống.",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: q,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: json.data.answer,
          sources: json.data.sources,
          timeMs: json.data.timeMs,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Lỗi: ${json.error || "Không thể nhận phản hồi từ AI."}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Lỗi kết nối: ${err.message || "Không thể gọi API /api/chat."}`,
        },
      ]);
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
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-sm font-semibold text-slate-100">
            Hỏi Đáp Trực Quan (Contextual QA)
          </h1>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-medium">
            Gemini 3.6 Flash
          </span>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content:
                  "Xin chào! Tôi là trợ lý RAG Engine. Hãy đặt câu hỏi về các tài liệu bạn đã nạp vào hệ thống.",
              },
            ])
          }
          className="text-xs text-slate-400 hover:text-slate-200 transition"
          title="Xóa lịch sử chat"
        >
          🧹 Xóa chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80 shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap text-left">{msg.content}</div>

              {msg.timeMs && (
                <div className="text-[10px] text-slate-400 mt-2 text-right">
                  ⏱ {msg.timeMs}ms
                </div>
              )}
            </div>

            {/* Render Collapsible Citations if available */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2.5 w-full max-w-2xl space-y-1.5 pl-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <span>📖</span> Nguồn tài liệu tham chiếu ({msg.sources.length}):
                </div>
                <div className="grid gap-1.5">
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
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none text-sm text-slate-300 flex items-center space-x-2.5">
              <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></span>
              <span>Đang truy xuất Supabase & tổng hợp câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-6 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          Gợi ý:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-full whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 items-end max-w-4xl mx-auto"
        >
          <div className="flex-1 relative">
            <textarea
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi dựa trên tài liệu... (Nhấn Enter để gửi)"
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className={`px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center transition shrink-0 ${
              !inputQuestion.trim() || isLoading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
            }`}
          >
            {isLoading ? "..." : "Gửi ➤"}
          </button>
        </form>
      </div>
    </div>
  );
};
