import React, { useState, useEffect, useRef } from "react";
import { ArrowUpFromLine, Plus, RefreshCw } from "lucide-react";
interface IngestionStats {
  totalChunks: number;
  uniqueSources: string[];
}

interface DocumentPanelProps {
  onDocumentIndexed?: () => void;
  onClose?: () => void;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
  onDocumentIndexed,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [stats, setStats] = useState<IngestionStats>({
    totalChunks: 0,
    uniqueSources: [],
  });
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
    if (
      !confirm(`Bạn có chắc muốn xóa tất cả các vector của file "${source}"?`)
    ) {
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>Quản Lý Tài Liệu</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchDocuments}
            disabled={isLoadingDocs}
            className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 transition flex items-center gap-1 font-medium"
            title="Làm mới danh sách"
          >
            {isLoadingDocs ? "..." : <RefreshCw size={12} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Đóng bảng tài liệu"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Upload Box */}
      <form
        onSubmit={handleUpload}
        className="mb-4 bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 shadow-sm"
      >
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Tải lên tài liệu (.txt, .md, .pdf)
        </label>

        <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition bg-white relative group">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <span className="flex items-center justify-center mb-1 group-hover:scale-120 transition-transform">
            <Plus />
          </span>
          <p className="text-xs text-slate-700 font-semibold truncate px-2">
            {selectedFile ? selectedFile.name : "Kéo thả hoặc nhấp để chọn tệp"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Hỗ trợ .txt, .md, .pdf (tối đa 4.5MB)
          </p>
        </div>

        {uploadStatus && (
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
              uploadStatus.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                : "bg-rose-50 border border-rose-200 text-rose-800 font-medium"
            }`}
          >
            <span>{uploadStatus.type === "success" ? "✓" : "⚠"}</span>
            <div className="flex-1">{uploadStatus.message}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className={`w-full mt-3 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
            !selectedFile || isUploading
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25"
          }`}
        >
          {isUploading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang chia chunk & tạo vector...
            </>
          ) : (
            <>Tải dữ liệu<ArrowUpFromLine size={16}/></>
          )}
        </button>
      </form>

      {/* Database Statistics */}
      <div className="mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-sky-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-blue-900/70 font-semibold uppercase tracking-wider">
              Tệp nguồn đã lưu
            </div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">
              {stats.uniqueSources.length}
            </div>
          </div>
        </div>
      </div>

      {/* Indexed Files List */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Danh sách tệp</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
            {stats.uniqueSources.length}
          </span>
        </h3>

        {stats.uniqueSources.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
            Chưa có tài liệu nào. Hãy tải lên file đầu tiên!
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto pr-1">
            {stats.uniqueSources.map((source) => (
              <div
                key={source}
                className="p-2.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs hover:border-blue-300 hover:bg-blue-50/30 transition group shadow-sm"
              >
                <div className="flex items-center space-x-2 truncate min-w-0">
                  <span className="text-blue-500 text-sm">📄</span>
                  <span
                    className="font-semibold text-slate-700 truncate group-hover:text-blue-700 transition"
                    title={source}
                  >
                    {source}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSource(source)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition ml-2 rounded hover:bg-rose-50 shrink-0"
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
