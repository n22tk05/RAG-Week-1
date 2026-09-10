import React, { useState, useEffect, useRef } from "react";

interface IngestionStats {
  totalChunks: number;
  uniqueSources: string[];
}

interface DocumentPanelProps {
  onDocumentIndexed?: () => void;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({ onDocumentIndexed }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [stats, setStats] = useState<IngestionStats>({ totalChunks: 0, uniqueSources: [] });
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách tài liệu:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["txt", "md", "pdf"].includes(ext)) {
        setUploadStatus({
          type: "error",
          message: "Chỉ hỗ trợ file định dạng .txt, .md hoặc .pdf",
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setUploadStatus({
          type: "success",
          message: `Nạp thành công "${result.filename}": đã tạo ${result.chunksCount} chunks (${result.timeMs}ms).`,
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await fetchDocuments();
        if (onDocumentIndexed) onDocumentIndexed();
      } else {
        setUploadStatus({
          type: "error",
          message: result.error || "Không thể nạp tài liệu.",
        });
      }
    } catch (err: any) {
      setUploadStatus({
        type: "error",
        message: err.message || "Lỗi kết nối khi tải lên.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSource = async (source: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tất cả các vector của file "${source}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(source)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await fetchDocuments();
      } else {
        alert(data.error || "Lỗi khi xóa tài liệu.");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 border-r border-slate-700/80 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-md border border-indigo-500/30">
            📁
          </span>
          Quản Lý Tài Liệu
        </h2>
        <button
          onClick={fetchDocuments}
          disabled={isLoadingDocs}
          className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition flex items-center gap-1"
          title="Làm mới danh sách"
        >
          {isLoadingDocs ? "..." : "🔄"} Làm mới
        </button>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="mb-5 bg-slate-800 border border-slate-700 rounded-xl p-3.5 shadow-sm">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Tải lên tài liệu (.txt, .md, .pdf)
        </label>

        <div className="border-2 border-dashed border-slate-600 hover:border-indigo-500/80 rounded-lg p-4 text-center cursor-pointer transition bg-slate-900/40 relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-2xl mb-1">📄</div>
          <p className="text-xs text-slate-300 font-medium truncate">
            {selectedFile ? selectedFile.name : "Kéo thả hoặc nhấp để chọn tệp"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ .txt, .md, .pdf (tối đa 15MB)</p>
        </div>

        {uploadStatus && (
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
              uploadStatus.type === "success"
                ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                : "bg-rose-950/60 border border-rose-800 text-rose-300"
            }`}
          >
            <span>{uploadStatus.type === "success" ? "✓" : "⚠"}</span>
            <div className="flex-1">{uploadStatus.message}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition ${
            !selectedFile || isUploading
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
          }`}
        >
          {isUploading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Đang chia chunk & tạo vector...
            </>
          ) : (
            <>Tải lên </>
          )}
        </button>
      </form>

      {/* Database Statistics */}
      <div className="gap-2 mb-4">
        <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
          <div className="text-[11px] text-slate-400 font-medium">Tệp nguồn</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{stats.uniqueSources.length}</div>
        </div>
      </div>

      {/* Indexed Files List */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Tài liệu đã nạp ({stats.uniqueSources.length})
        </h3>

        {stats.uniqueSources.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-900/30 rounded-lg border border-slate-800">
            Chưa có tài liệu nào trong Vector DB. Hãy tải lên file đầu tiên!
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto pr-1">
            {stats.uniqueSources.map((source) => (
              <div
                key={source}
                className="p-2.5 bg-slate-900/50 border border-slate-700/60 rounded-lg flex items-center justify-between text-xs hover:border-slate-600 transition"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-sm">📌</span>
                  <span className="font-medium text-slate-200 truncate">{source}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSource(source)}
                  className="text-slate-400 hover:text-rose-400 p-1 transition ml-2"
                  title="Xóa tài liệu này"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
