import React, { useState } from "react";
import type { ChatSession } from "../types/chat";
import { MessageSquare, Pencil, Plus, RotateCcwClock, Trash } from "lucide-react";

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onClearAll,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  if (!isOpen) return null;

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return "Hôm qua";
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-sm font-semibold">
              <RotateCcwClock />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Lịch Sử Trò Chuyện</h2>
              <span className="text-[11px] text-slate-500 font-normal">
                {sessions.length} phiên đã lưu
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Đóng lịch sử"
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm shadow-blue-600/20 transition"
          >
            <span><Plus size={18}/></span>
            <span>Tạo cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chưa có phiên trò chuyện nào được lưu.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectSession(session.id);
                      onClose();
                    }
                  }}
                  className={`group relative p-3 rounded-xl cursor-pointer transition border ${
                    isActive
                      ? "bg-blue-50/80 border-blue-300 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <span className="text-sm ">
                        {isActive && <MessageSquare className="text-blue-700" size={14}/>}
                      </span>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(session.id, e)}
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              autoFocus
                              className="w-full px-2.5 py-1 bg-white border border-blue-500 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                            >
                              Hủy
                            </button>
                          </form>
                        ) : (
                          <>
                            <h3
                              className={`text-xs font-semibold truncate ${
                                isActive ? "text-blue-700" : "text-slate-800"
                              }`}
                              title={session.title}
                            >
                              {session.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>{session.messages.length} tin nhắn</span>
                              <span>•</span>
                              <span>{formatTime(session.updatedAt)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Rename / Delete) */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={(e) => handleStartRename(session, e)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Đổi tên"
                        >
                          <Pencil size={16}/>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Bạn có chắc muốn xóa cuộc trò chuyện "${session.title}"?`)) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition"
                          title="Xóa cuộc trò chuyện"
                        >
                          <Trash size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0 text-xs">
          <button
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện? Hành động này không thể hoàn tác.")) {
                onClearAll();
                onClose();
              }
            }}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 transition px-2 py-1 rounded hover:bg-rose-100/50"
          >
            <span><Trash size={16}/></span>
            <span>Xóa toàn bộ lịch sử</span>
          </button>
          <span className="text-[10px] text-slate-400">Lưu tự động trên trình duyệt</span>
        </div>
      </div>
    </div>
  );
};
