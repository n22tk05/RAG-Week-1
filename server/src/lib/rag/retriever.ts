import { vectorStore } from "./vector-store.js";
import type { Document } from "@langchain/core/documents";

export interface RetrievedDocument {
  document: Document;
  score: number;
}

export async function searchSimilarDocuments(
  query: string,
  k = 4
): Promise<RetrievedDocument[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  // similaritySearchWithScore gọi hàm match_documents trên Supabase
  const results = await vectorStore.similaritySearchWithScore(trimmedQuery, k);

  return results.map(([doc, score]) => ({
    document: doc,
    score,
  }));
}
