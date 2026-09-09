import { loadDocument } from "./loader.js";
import { splitTextToChunks } from "./splitter.js";
import { vectorStore } from "./vector-store.js";

export interface IngestOptions {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestResult {
  success: boolean;
  filename: string;
  chunksCount: number;
  timeMs: number;
  previewChunks?: { index: number; contentSnippet: string }[];
}


export async function ingestDocument(options: IngestOptions): Promise<IngestResult> {
  const startTime = Date.now();
  const { buffer, filename, metadata = {} } = options;

  console.log(`[Ingest] Bắt đầu xử lý tệp: "${filename}" (${buffer.length} bytes)...`);

  // 1. Loader: Trích xuất text
  const rawText = await loadDocument(buffer, filename);
  console.log(`[Ingest] Trích xuất thành công: ${rawText.length} ký tự thô.`);

  // 2. Splitter: Chia nhỏ văn bản
  const chunks = await splitTextToChunks(rawText, filename, metadata);
  console.log(`[Ingest] Chia nhỏ thành ${chunks.length} chunks.`);

  if (chunks.length === 0) {
    throw new Error(`Không tạo được đoạn chunk nào từ tệp "${filename}".`);
  }

  // 3. Embed & Lưu vào Supabase Vector DB
  console.log(`[Ingest] Đang tạo embeddings và lưu vào Supabase bảng "documents"...`);
  await vectorStore.addDocuments(chunks);

  const durationMs = Date.now() - startTime;
  console.log(`[Ingest] Hoàn tất nạp tệp "${filename}" trong ${durationMs}ms.`);

  return {
    success: true,
    filename,
    chunksCount: chunks.length,
    timeMs: durationMs,
    previewChunks: chunks.slice(0, 3).map((c, i) => ({
      index: i,
      contentSnippet: c.pageContent.slice(0, 100) + (c.pageContent.length > 100 ? "..." : ""),
    })),
  };
}
