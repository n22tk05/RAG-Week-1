import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, ChatSession } from "../types/chat";

const SESSIONS_STORAGE_KEY = "rag_chat_sessions_v1";
const ACTIVE_SESSION_STORAGE_KEY = "rag_active_session_id_v1";

export const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Xin chào! Tôi là trợ lý RAG Engine. Hãy đặt câu hỏi về các tài liệu bạn đã nạp vào hệ thống.",
  createdAt: new Date().toISOString(),
};

function createNewSessionObject(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: "session_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7),
    title: "Cuộc trò chuyện mới",
    createdAt: now,
    updatedAt: now,
    messages: [{ ...DEFAULT_WELCOME_MESSAGE, id: "welcome_" + Date.now() }],
  };
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc sessions từ localStorage:", e);
    }
    const initial = createNewSessionObject();
    return [initial];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (savedId) {
        return savedId;
      }
    } catch (e) {
      console.error("Lỗi khi đọc active session ID:", e);
    }
    return "";
  });

  // Đảm bảo luôn có 1 active session hợp lệ
  useEffect(() => {
    if (!currentSessionId || !sessions.some((s) => s.id === currentSessionId)) {
      if (sessions.length > 0) {
        const firstId = sessions[0]!.id;
        setCurrentSessionId(firstId);
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, firstId);
      } else {
        const newSession = createNewSessionObject();
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newSession.id);
      }
    }
  }, [sessions, currentSessionId]);

  // Lưu sessions vào localStorage mỗi khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Lỗi khi lưu sessions vào localStorage:", e);
    }
  }, [sessions]);

  // Lưu activeSessionId vào localStorage
  useEffect(() => {
    if (currentSessionId) {
      try {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, currentSessionId);
      } catch (e) {
        console.error("Lỗi khi lưu activeSessionId:", e);
      }
    }
  }, [currentSessionId]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [DEFAULT_WELCOME_MESSAGE];

  // Thêm tin nhắn mới vào phiên hiện tại
  const addMessage = useCallback(
    (msg: ChatMessage) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;

          const updatedMessages = [...s.messages, msg];
          let updatedTitle = s.title;

          // Nếu là câu hỏi đầu tiên của user và session vẫn mang tên mặc định, tự động đặt title
          if (
            msg.role === "user" &&
            (s.title === "Cuộc trò chuyện mới" || s.title === "New Chat")
          ) {
            updatedTitle = msg.content.trim().slice(0, 38) + (msg.content.length > 38 ? "..." : "");
          }

          return {
            ...s,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
          };
        })
      );
    },
    [currentSessionId]
  );

  // Tạo phiên chat mới
  const createNewSession = useCallback(() => {
    const newSession = createNewSessionObject();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Chọn phiên chat
  const selectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
  }, []);

  // Đổi tên phiên chat
  const renameSession = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: trimmed, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  // Xóa một phiên chat
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fresh = createNewSessionObject();
          setCurrentSessionId(fresh.id);
          return [fresh];
        }
        if (id === currentSessionId) {
          setCurrentSessionId(filtered[0]!.id);
        }
        return filtered;
      });
    },
    [currentSessionId]
  );

  // Xóa toàn bộ lịch sử
  const clearAllSessions = useCallback(() => {
    const fresh = createNewSessionObject();
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
  }, []);

  return {
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
  };
}
