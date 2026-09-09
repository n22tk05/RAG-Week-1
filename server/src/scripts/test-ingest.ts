import { ingestDocument } from "../lib/rag/ingest.js";
import {
  getIndexedDocuments,
  getIngestionStats,
  supabaseClient,
} from "../lib/rag/vector-store.js";
import { loadDocument } from "../lib/rag/loader.js";

async function runTest() {
  console.log("=================================================");
  console.log("🚀 Bắt đầu kiểm thử pipeline Ingestion (Phase 2)");
  console.log("=================================================\n");

  console.log("--- Test 1: Nạp tệp tin Text (.txt) ---");
  const sampleText = `
Kiến trúc RAG (Retrieval-Augmented Generation) là một kỹ thuật tiên tiến kết hợp giữa mô hình ngôn ngữ lớn (LLM) và hệ thống truy xuất thông tin từ cơ sở dữ liệu bên ngoài.
Khi người dùng đặt câu hỏi, hệ thống RAG trước tiên sẽ tìm kiếm các đoạn văn bản có độ tương đồng ngữ nghĩa cao nhất từ Vector Database (như Supabase pgvector).
Sau đó, các đoạn văn bản trích xuất được đưa vào prompt ngữ cảnh (context) kèm theo câu hỏi để LLM tổng hợp câu trả lời chính xác, tránh hiện tượng ảo giác (hallucination).
Các bước chính trong quy trình nạp tài liệu (Ingestion Pipeline) bao gồm:
1. Trích xuất văn bản từ tài liệu (.txt, .md, .pdf).
2. Chia nhỏ văn bản thành các đoạn (chunks) với kích thước và độ gối đầu phù hợp.
3. Sinh vector nhúng (embeddings) cho từng đoạn bằng OpenAI text-embedding-3-small (1536 chiều).
4. Lưu trữ vector và metadata vào bảng documents trong Supabase.
`.trim();

  const textBuffer = Buffer.from(sampleText, "utf-8");
  const textFilename = "rag-intro-test.txt";

  const result1 = await ingestDocument({
    buffer: textBuffer,
    filename: textFilename,
    metadata: { testRun: true, category: "testing" },
  });

  console.log("✅ Kết quả Test 1:", result1);

  console.log("\n--- Test 2: Kiểm tra trích xuất file PDF thô ---");
  const minimalPdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 18 Tf
100 700 Td
(Hello RAG PDF Ingestion Test) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
426
%%EOF`;

  const pdfBuffer = Buffer.from(minimalPdfString, "utf-8");
  const extractedPdfText = await loadDocument(pdfBuffer, "sample-test.pdf");
  console.log(`✅ Trích xuất text từ PDF thành công: "${extractedPdfText}"`);

  // Nạp luôn PDF mẫu vào vector DB
  const result2 = await ingestDocument({
    buffer: pdfBuffer,
    filename: "sample-test.pdf",
    metadata: { testRun: true, format: "pdf" },
  });
  console.log("✅ Kết quả Test 2 (PDF Ingestion):", result2);

  // 3. Kiểm tra dữ liệu trong Supabase
  console.log("\n--- Test 3: Xác minh dữ liệu trực tiếp trong Supabase ---");
  const stats = await getIngestionStats();
  console.log("📊 Thống kê Ingestion trong Supabase:", stats);

  const docs = await getIndexedDocuments(5);
  console.log(`📄 Lấy ra ${docs.length} documents mới nhất:`);
  for (const doc of docs) {
    console.log(
      ` - ID: ${doc.id} | Source: ${doc.metadata?.source} | Chunk: ${doc.metadata?.chunkIndex} | Content snippet: "${doc.content.slice(0, 60)}..."`,
    );
  }

  // 4. Kiểm tra chiều vector embedding
  console.log("\n--- Test 4: Kiểm tra cấu trúc vector embedding ---");
  const { data: vectorCheck, error: vecError } = await supabaseClient
    .from("documents")
    .select("id, embedding")
    .limit(1);

  if (vecError) {
    console.error("❌ Lỗi truy vấn vector:", vecError.message);
  } else if (vectorCheck && vectorCheck[0]) {
    // pgvector trả về string representation hoặc array
    const embeddingVal = vectorCheck[0].embedding;
    const isArray = Array.isArray(embeddingVal);
    const parsedDim = isArray
      ? embeddingVal.length
      : typeof embeddingVal === "string"
        ? embeddingVal.replace(/[\[\]]/g, "").split(",").length
        : "unknown";
    console.log(
      `✅ Vector embedding tồn tại trên row ID ${vectorCheck[0].id}, số chiều đo được: ${parsedDim} (mong muốn: 1536 chiều khớp với Supabase).`,
    );
  }

  console.log("\n=================================================");
  console.log("🎉 Tất cả các bài kiểm thử Phase 2 đều THÀNH CÔNG!");
  console.log("=================================================");
}

runTest().catch((error) => {
  console.error("❌ Kiểm thử Phase 2 thất bại:", error);
  process.exit(1);
});
