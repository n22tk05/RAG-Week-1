import { askQuestion } from "../lib/rag/chain.js";

async function runQATest() {
  console.log("=================================================");
  console.log("🚀 Bắt đầu kiểm thử RAG QA Chain (Phase 3)");
  console.log("=================================================\n");

  // Kịch bản 1: Câu hỏi in-domain (có trong tài liệu rag-intro-test.txt đã nạp)
  const question1 = "Kiến trúc RAG là gì và quy trình nạp tài liệu gồm những bước nào?";
  console.log(`[Test 1] Đang hỏi: "${question1}"...`);
  const response1 = await askQuestion(question1);

  console.log("\n--- Kết quả Test 1 (In-Domain) ---");
  console.log(`⏱ Thời gian xử lý: ${response1.timeMs}ms`);
  console.log(`🤖 Câu trả lời:\n${response1.answer}\n`);
  console.log(`📚 Số nguồn trích dẫn: ${response1.sources.length}`);
  response1.sources.forEach((s, i) => {
    console.log(`  [Nguồn ${i + 1}] File: ${s.source} (Độ tương đồng: ${s.score})`);
    console.log(`  Nội dung trích: "${s.content.slice(0, 100)}..."\n`);
  });

  // Kịch bản 2: Câu hỏi out-of-domain (hoàn toàn không có trong tài liệu)
  const question2 = "Thủ đô của nước Pháp là gì và dân số hiện tại là bao nhiêu?";
  console.log(`[Test 2] Đang hỏi (ngoài tài liệu): "${question2}"...`);
  const response2 = await askQuestion(question2);

  console.log("\n--- Kết quả Test 2 (Out-of-Domain) ---");
  console.log(`⏱ Thời gian xử lý: ${response2.timeMs}ms`);
  console.log(`🤖 Câu trả lời:\n${response2.answer}\n`);
  console.log(`📚 Số nguồn trích dẫn: ${response2.sources.length}`);

  console.log("\n=================================================");
  console.log("🎉 Kiểm thử Phase 3 hoàn tất!");
  console.log("=================================================");
}

runQATest().catch((err) => {
  console.error("❌ Kiểm thử Phase 3 thất bại:", err);
  process.exit(1);
});
