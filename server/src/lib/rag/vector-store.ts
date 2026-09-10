import { createClient } from "@supabase/supabase-js";
import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { config, validateConfig } from "../../config.js";

validateConfig();

export class GeminiEmbeddings extends Embeddings {
  private modelClient: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;
  public dimensions: number;

  constructor(fields: { apiKey: string; modelName?: string; dimensions?: number } & EmbeddingsParams) {
    super(fields);
    const genAI = new GoogleGenerativeAI(fields.apiKey);
    this.dimensions = fields.dimensions ?? 768;
    this.modelClient = genAI.getGenerativeModel({
      model: fields.modelName || "gemini-embedding-001",
    });
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(
      documents.map(async (doc) => {
        const res = await this.modelClient.embedContent({
          content: { role: "user", parts: [{ text: doc }] },
          outputDimensionality: this.dimensions,
        } as any);
        const vals = res.embedding?.values;
        if (!vals || vals.length === 0) {
          throw new Error("Không nhận được vector embedding hợp lệ từ Gemini API.");
        }
        return vals;
      })
    );
  }

  async embedQuery(document: string): Promise<number[]> {
    const res = await this.modelClient.embedContent({
      content: { role: "user", parts: [{ text: document }] },
      outputDimensionality: this.dimensions,
    } as any);
    const vals = res.embedding?.values;
    if (!vals || vals.length === 0) {
      throw new Error("Không nhận được vector embedding hợp lệ từ Gemini API.");
    }
    return vals;
  }
}

// Khởi tạo embeddings với Gemini 
export const embeddings = new GeminiEmbeddings({
  apiKey: config.geminiApiKey,
  modelName: "gemini-embedding-001",
  dimensions: 768,
});

export const supabaseClient = createClient(
  config.supabaseUrl,
  config.supabasePrivateKey
);

export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabaseClient,
  tableName: "documents",
  queryName: "match_documents",
});


export async function getIndexedDocuments(limit = 100) {
  const { data, error } = await supabaseClient
    .from("documents")
    .select("id, content, metadata")
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Lỗi khi truy vấn danh sách documents: ${error.message}`);
  }

  return data;
}

export async function getIngestionStats() {
  const { data, error, count } = await supabaseClient
    .from("documents")
    .select("id, metadata", { count: "exact" });

  if (error) {
    throw new Error(`Lỗi khi lấy thống kê documents: ${error.message}`);
  }

  const sources = new Set<string>();
  if (data) {
    for (const item of data) {
      if (item.metadata && typeof item.metadata === "object" && "source" in item.metadata) {
        sources.add(String((item.metadata as { source: unknown }).source));
      }
    }
  }

  return {
    totalChunks: count ?? data?.length ?? 0,
    uniqueSources: Array.from(sources),
  };
}


export async function deleteDocumentsBySource(source: string) {
  const { data, error } = await supabaseClient
    .from("documents")
    .delete()
    .filter("metadata->>source", "eq", source)
    .select("id");

  if (error) {
    throw new Error(`Lỗi khi xóa documents của source "${source}": ${error.message}`);
  }

  return {
    deletedCount: data?.length ?? 0,
  };
}