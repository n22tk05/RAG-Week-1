import { Router, type Request, type Response } from "express";
import { askQuestion } from "../lib/rag/chain.js";

export const chatRouter = Router();

/**
 * POST /api/chat
 * Nhận câu hỏi, truy xuất ngữ cảnh và gọi LLM trả về câu trả lời + trích dẫn
 */
chatRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, topK } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      res.status(400).json({
        success: false,
        error: "Trường 'question' là bắt buộc và không được rỗng.",
      });
      return;
    }

    const k = typeof topK === "number" && topK > 0 ? Math.min(topK, 10) : 4;
    const result = await askQuestion(question, k);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[Chat Route Error]:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Đã xảy ra lỗi khi xử lý câu hỏi.",
    });
  }
});
