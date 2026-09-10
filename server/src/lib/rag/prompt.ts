import type { Document } from "@langchain/core/documents";

export const SYSTEM_PROMPT = `Bạn là một trợ lý AI thông minh, chuyên nghiệp và trung thực.
Nhiệm vụ của bạn là trả lời câu hỏi của người dùng CHỈ DỰA TRÊN NGỮ CẢNH (CONTEXT) được cung cấp dưới đây.

QUY TẮC BẮT BUỘC (ANTI-HALLUCINATION):
1. CHỈ sử dụng thông tin có trong phần "NGỮ CẢNH TÀI LIỆU" để trả lời.
2. Nếu câu hỏi KHÔNG CÓ thông tin trong ngữ cảnh, hoặc thông tin không đủ để đưa ra câu trả lời chắc chắn, bạn BẮT BUỘC phải trả lời chính xác câu sau và không thêm thắt:
   "Xin lỗi, tôi không tìm thấy thông tin này trong các tài liệu đã được cung cấp."
3. Tuyệt đối KHÔNG tự suy diễn, KHÔNG bổ sung kiến thức bên ngoài ngữ cảnh.
4. Trình bày câu trả lời rõ ràng, mạch lạc và súc tích bằng tiếng Việt.
5. Khi trích dẫn thông tin, hãy tham chiếu rõ ràng nguồn tài liệu (ví dụ: "[Nguồn: ten-file.txt, đoạn 1]").`;

export function formatContext(docs: Document[]): string {
  if (!docs || docs.length === 0) {
    return "Không có tài liệu ngữ cảnh nào phù hợp.";
  }

  return docs
    .map((doc, index) => {
      const source = doc.metadata?.source || "Không rõ";
      const chunkIndex =
        doc.metadata?.chunkIndex !== undefined ? doc.metadata.chunkIndex : index;
      return `--- [Đoạn trích ${index + 1}] (Nguồn: ${source}, Thứ tự chunk: ${chunkIndex}) ---\n${doc.pageContent.trim()}`;
    })
    .join("\n\n");
}
