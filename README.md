# Minimal RAG Engine (TypeScript / LangChain)

## 1. Mục tiêu (Objective)
* Xây dựng một ứng dụng Proof of Concept (PoC) về quy trình Retrieval-Augmented Generation (RAG) end-to-end: **Upload tài liệu → Chunking → Embedding → Lưu Vector DB → Hỏi đáp theo ngữ cảnh kèm trích dẫn nguồn**.
* Cung cấp một bộ khung mã nguồn tối giản bằng TypeScript giúp lập trình viên tự triển khai, kiểm thử luồng RAG độc lập mà không đặt nặng vấn đề UI hay hạ tầng phức tạp.

## 2. Đối tượng sử dụng
* **Lập trình viên nội bộ / Học viên:** Sử dụng để thực hành, tự code phiên bản riêng và nắm vững luồng xử lý RAG.
* **Người kiểm thử / Reviewer:** Đánh giá độ chính xác của ngữ cảnh (context) và nguồn trích dẫn được trả về sau khi tải tài liệu lên.

## 3. Tech Stack đề xuất
* **Ngôn ngữ:** TypeScript (đồng nhất Frontend & Backend)
* **LLM Orchestration:** LangChain.js / LangGraph.js
* **Backend:** Node.js (Express / Fastify hoặc Next.js API Routes)
* **Frontend:** React.js (tối giản, ưu tiên tính năng hơn thẩm mỹ)
* **Vector Store & Embeddings:** In-Memory Vector Store (MemoryVectorStore) / Chroma / Pinecone / PGVector kết hợp OpenAI Text Embeddings (hoặc tương đương)

## 4. Ngoài phạm vi (Out of Scope)
* **Production Readiness:** Không xử lý caching phân tán, monitoring, tracing nâng cao hay CI/CD tự động.
* **Giao diện nâng cao:** Không đầu tư thiết kế UI/UX đẹp, không cần responsive đa thiết bị hay animation.
* **Bảo mật & Phân quyền:** Không xác thực người dùng (AuthN/AuthZ), không mã hóa tài liệu lưu trữ, không quản lý session người dùng riêng biệt.
* **Xử lý định dạng phức tạp:** Không hỗ trợ OCR tài liệu scan, parse bảng biểu phức tạp hay trích xuất hình ảnh/video.

## 5. Tiêu chuẩn hoàn thành (DoD - Definition of Done)
- [ ] **Upload & Ingestion:** Người dùng upload được file văn bản (tối thiểu định dạng `.txt` hoặc `.pdf`). Hệ thống đọc nội dung, chia nhỏ thành các chunks theo cấu hình (chunk size, overlap).
- [ ] **Embedding & Vector Storage:** Chunks được chuyển đổi thành vector embedding và lưu thành công vào Vector DB.
- [ ] **Contextual Retrieval:** Khi gửi câu hỏi, hệ thống truy vấn được top-k chunks có độ tương đồng cao nhất từ Vector DB.
- [ ] **Answer Generation with Source Citation:** LLM sinh câu trả lời chính xác dựa trên ngữ cảnh đã truy xuất và hiển thị rõ ràng thông tin nguồn (tên file, đoạn văn/trang tham chiếu).
- [ ] **Chạy độc lập (Local Setup):** Có file cấu hình biến môi trường (`.env.example`) và tài liệu hướng dẫn chạy code local từ đầu đến cuối thành công.