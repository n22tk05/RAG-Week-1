import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage, type BaseMessage } from "@langchain/core/messages";
import { config, validateConfig } from "../../config.js";
import { searchSimilarDocuments } from "./retriever.js";
import { SYSTEM_PROMPT, formatContext } from "./prompt.js";

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SourceCitation {
  source: string;
  content: string;
  chunkIndex?: number | undefined;
  score?: number | undefined;
}

export interface QAResponse {
  question: string;
  answer: string;
  sources: SourceCitation[];
  timeMs: number;
}

export const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: config.geminiApiKey || "placeholder-key",
});

export async function askQuestion(
  question: string,
  topK = 4,
  history: HistoryTurn[] = []
): Promise<QAResponse> {
  validateConfig();
  const startTime = Date.now();
  const trimmed = question.trim();

  if (!trimmed) {
    throw new Error("Câu hỏi không được để trống.");
  }

  // 1. Truy xuất các tài liệu liên quan
  const retrieved = await searchSimilarDocuments(trimmed, topK);

  // Nếu không có chunk nào trong DB
  if (retrieved.length === 0) {
    return {
      question: trimmed,
      answer: "Xin lỗi, tôi không tìm thấy thông tin này trong các tài liệu đã được cung cấp.",
      sources: [],
      timeMs: Date.now() - startTime,
    };
  }

  // 2. Định dạng Context & Lịch sử hội thoại
  const docs = retrieved.map((r) => r.document);
  const contextString = formatContext(docs);

  const systemMessage = new SystemMessage(
    `${SYSTEM_PROMPT}\n\nNGỮ CẢNH TÀI LIỆU:\n${contextString}`
  );

  // Lấy tối đa 6 lượt tin nhắn gần nhất để giữ ngữ cảnh liền mạch
  const recentHistory = (history || []).slice(-6);
  const historyMessages: BaseMessage[] = recentHistory.map((item) =>
    item.role === "user"
      ? new HumanMessage(item.content)
      : new AIMessage(item.content)
  );

  const humanMessage = new HumanMessage(trimmed);

  // 3. Gọi LLM sinh phản hồi với đầy đủ ngữ cảnh hội thoại
  const response = await chatModel.invoke([
    systemMessage,
    ...historyMessages,
    humanMessage,
  ]);
  const rawContent = response.content;
  const answer = typeof rawContent === "string" 
    ? rawContent 
    : Array.isArray(rawContent) 
      ? rawContent.map((c) => (typeof c === "string" ? c : JSON.stringify(c))).join("") 
      : JSON.stringify(rawContent);

  // 4. Trích xuất danh sách nguồn
  const sources: SourceCitation[] = retrieved.map((item) => ({
    source: String(item.document.metadata?.source || "Không rõ"),
    content: item.document.pageContent,
    chunkIndex:
      typeof item.document.metadata?.chunkIndex === "number"
        ? item.document.metadata.chunkIndex
        : undefined,
    score: Number(item.score.toFixed(4)),
  }));

  return {
    question: trimmed,
    answer: answer.trim(),
    sources,
    timeMs: Date.now() - startTime,
  };
}
