import { Router, type Request, type Response } from "express";
import multer from "multer";
import { ingestDocument } from "../lib/rag/ingest.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4.5 * 1024 * 1024, // 4.5 MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (ext && ["txt", "md", "pdf"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ tải lên các tệp .txt, .md hoặc .pdf"));
    }
  },
});

export const ingestRouter = Router();

/**
 * POST /api/ingest
 * Upload và xử lý nạp tài liệu vào Supabase pgvector
 */
ingestRouter.post("/", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "Vui lòng chọn một tệp tin (.txt, .md, .pdf) để tải lên.",
      });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;

    const result = await ingestDocument({
      buffer,
      filename: originalname,
      mimeType: mimetype,
      metadata: {
        uploadSource: "web-ui",
      },
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error("[Ingest Route Error]:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Đã xảy ra lỗi trong quá trình nạp tài liệu.",
    });
  }
});
