# Minimal RAG Engine (TypeScript / LangChain / Gemini / Supabase)

## 1. Mục tiêu (Objective)
* Xây dựng một ứng dụng Proof of Concept (PoC) về quy trình Retrieval-Augmented Generation (RAG) end-to-end: **Upload tài liệu (.txt, .md, .pdf) → Chunking (RecursiveCharacterTextSplitter) → Embedding (1536d) → Lưu Vector DB (Supabase pgvector) → Hỏi đáp ngữ cảnh (Anti-Hallucination) kèm trích dẫn nguồn (Source Citations)**.
* Cung cấp một bộ khung mã nguồn sạch sẽ, phân tầng rõ ràng bằng TypeScript cho cả Backend (Node.js/Express) và Frontend (React/Tailwind CSS).

## 2. Tech Stack
* **Ngôn ngữ:** TypeScript (Strict Type Checking)
* **LLM Orchestration:** LangChain.js (`@langchain/core`, `@langchain/google-genai`, `@langchain/textsplitters`)
* **Backend:** Node.js, Express, Multer, Cors, tsx
* **Frontend:** React 19, Vite, Tailwind CSS
* **LLM & Embeddings:** Google Gemini (`gemini-embedding-001` - 1536 chiều qua Matryoshka, `gemini-3.6-flash` với `temperature: 0`)
* **Vector Store:** Supabase Vector DB (PostgreSQL với extension `pgvector` và hàm RPC `match_documents`)

## 3. Cấu trúc Dự án
```
Week1/
├── client/                     --> Ứng dụng React.js (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CitationCard.tsx   --> Thẻ hiển thị trích dẫn nguồn đóng/mở
│   │   │   ├── DocumentPanel.tsx  --> Giao diện tải lên & quản lý tài liệu
│   │   │   └── ChatPanel.tsx      --> Khung chat trực quan với trợ lý RAG
│   │   ├── App.tsx                --> Giao diện 2 cột responsive
│   │   └── main.tsx
│   └── vite.config.ts
├── server/                     --> Ứng dụng Node.js (Express + LangChain)
│   ├── src/
│   │   ├── config.ts              --> Quản lý biến môi trường
│   │   ├── main.ts                --> Express server entry point (Port 5000)
│   │   ├── routes/
│   │   │   ├── ingest.route.ts    --> POST /api/ingest (Multer upload)
│   │   │   ├── chat.route.ts      --> POST /api/chat
│   │   │   └── documents.route.ts --> GET & DELETE /api/documents
│   │   ├── lib/rag/
│   │   │   ├── loader.ts          --> Trích xuất text từ .txt, .md, .pdf
│   │   │   ├── splitter.ts        --> Cắt đoạn RecursiveCharacterTextSplitter
│   │   │   ├── vector-store.ts    --> GeminiEmbeddings (1536d) + SupabaseVectorStore
│   │   │   ├── retriever.ts       --> Vector Similarity Search
│   │   │   ├── prompt.ts          --> Grounding Prompt & Anti-Hallucination
│   │   │   └── chain.ts           --> QA Chain gọi Gemini sinh câu trả lời
│   │   └── scripts/
│   │       ├── test-ingest.ts     --> Script test pipeline nạp tài liệu
│   │       └── test-qa.ts         --> Script test hỏi đáp in-domain & out-of-domain
├── samples/                    --> Dữ liệu mẫu kiểm thử (.txt, .md, .pdf)
├── scripts/
│   └── supabase-schema.sql     --> SQL script khởi tạo bảng documents & hàm match_documents
├── Dockerfile                  --> Multi-stage Docker build cho deployment
├── .dockerignore
├── .env.example                --> Mẫu biến môi trường
└── package.json                --> Script chạy tổng quát ở root
```

## 4. Hướng dẫn cài đặt & Chạy ứng dụng (Local Setup)

### Bước 1: Cấu hình biến môi trường
Sao chép `.env.example` thành `.env` tại thư mục gốc:
```env
GEMINI_API_KEY=AIzaSy...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PRIVATE_KEY=sb_secret_...
PORT=5000
```

### Bước 2: Cài đặt Dependencies
```bash
# Cài đặt server
cd server && npm install --legacy-peer-deps

# Cài đặt client
cd ../client && npm install
```

### Bước 3: Kiểm thử độc lập qua CLI
```bash
# Kiểm thử nạp tài liệu vào Supabase
npm --prefix server run test:ingest

# Kiểm thử hỏi đáp RAG (in-domain & out-of-domain)
npm --prefix server run test:qa
```

### Bước 4: Khởi chạy ứng dụng
Mở 2 cửa sổ terminal:
```bash
# Terminal 1: Chạy Server (Port 5000)
npm run dev:server

# Terminal 2: Chạy Client (Port 5173)
npm run dev:client
```
Truy cập giao diện tại: **http://localhost:5173**

---

## 5. Danh sách REST API Endpoints
* `POST /api/ingest`: Tải lên file multipart (`.txt`, `.md`, `.pdf`).
* `POST /api/chat`: Gửi câu hỏi `{ question: string, topK?: number }`. Trả về câu trả lời và mảng `sources`.
* `GET /api/documents`: Lấy thống kê tổng số chunks và danh sách tài liệu.
* `DELETE /api/documents/:source`: Xóa các vector của file tương ứng.
* `GET /api/health`: Kiểm tra trạng thái máy chủ.

---

## 6. Tiêu chuẩn hoàn thành (DoD - Definition of Done)
- [x] **Upload & Ingestion:** Người dùng upload được file văn bản (`.txt`, `.md`, `.pdf`). Hệ thống đọc nội dung bằng `pdf-parse`, chia nhỏ thành các chunks theo cấu hình (`chunkSize: 1000`, `chunkOverlap: 200`).
- [x] **Embedding & Vector Storage:** Chunks được chuyển đổi thành vector embedding 1536 chiều và lưu thành công vào Supabase Vector DB (`documents` table).
- [x] **Contextual Retrieval:** Khi gửi câu hỏi, hệ thống truy vấn được top-k chunks có độ tương đồng cao nhất từ Vector DB qua `similaritySearchWithScore`.
- [x] **Answer Generation with Source Citation:** LLM sinh câu trả lời chính xác dựa trên ngữ cảnh đã truy xuất và hiển thị rõ ràng thông tin nguồn (tên file, đoạn văn/trang tham chiếu, điểm tương đồng). Có cơ chế từ chối khi câu hỏi ngoài tài liệu (Anti-Hallucination).
- [x] **Chạy độc lập (Local Setup):** Có file cấu hình biến môi trường (`.env.example`), scripts CLI kiểm thử nhanh và tài liệu hướng dẫn chạy code local từ đầu đến cuối thành công.
- [x] **Deploy:** Cung cấp `Dockerfile` multi-stage build sẵn sàng deploy lên Render / Railway / Docker host với cấu hình biến môi trường đầy đủ.