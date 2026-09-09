import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";

export const DEFAULT_CHUNK_SIZE = 1000;
export const DEFAULT_CHUNK_OVERLAP = 200;

export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: DEFAULT_CHUNK_SIZE,
  chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  separators: ["\n\n", "\n", " ", ""],
});

export interface ChunkMetadata {
  source: string;
  chunkIndex: number;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Chia nhỏ raw text thành danh sách Document chunks của LangChain kèm metadata
 * @param text Nội dung văn bản thô
 * @param source Tên tệp tin gốc
 * @param additionalMetadata Metadata bổ sung nếu có
 * @returns Danh sách các Document objects với metadata chi tiết
 */
export async function splitTextToChunks(
  text: string,
  source: string,
  additionalMetadata: Record<string, unknown> = {}
): Promise<Document<ChunkMetadata>[]> {
  const rawChunks = await textSplitter.splitText(text);
  const createdAt = new Date().toISOString();

  return rawChunks.map((content, index) => ({
    pageContent: content,
    metadata: {
      source,
      chunkIndex: index,
      createdAt,
      ...additionalMetadata,
    },
  }));
}