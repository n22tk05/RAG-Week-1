import { Router, type Request, type Response } from "express";
import {
  getIndexedDocuments,
  getIngestionStats,
  deleteDocumentsBySource,
} from "../lib/rag/vector-store.js";

export const documentsRouter = Router();

/**
 * GET /api/documents
 * Lấy danh sách tài liệu và thống kê số chunks đã index
 */
documentsRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [stats, documents] = await Promise.all([
      getIngestionStats(),
      getIndexedDocuments(50),
    ]);

    res.status(200).json({
      success: true,
      stats,
      documents,
    });
  } catch (err: any) {
    console.error("[Documents Route Error]:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Đã xảy ra lỗi khi lấy danh sách tài liệu.",
    });
  }
});

/**
 * DELETE /api/documents/:source
 * Xóa tài liệu theo tên file
 */
documentsRouter.delete("/:source", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSource = req.params.source;
    const source = typeof rawSource === "string" ? rawSource : undefined;
    if (!source) {
      res.status(400).json({
        success: false,
        error: "Vui lòng chỉ định tên file cần xóa.",
      });
      return;
    }

    const result = await deleteDocumentsBySource(source);
    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Đã xóa thành công ${result.deletedCount} đoạn văn bản của file "${source}".`,
    });
  } catch (err: any) {
    console.error("[Delete Documents Error]:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Đã xảy ra lỗi khi xóa tài liệu.",
    });
  }
});
