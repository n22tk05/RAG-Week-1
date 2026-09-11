# Minimal RAG Engine (TypeScript / LangChain / Gemini / Supabase)

> 🚀 **Live Demo:** [https://rag-week-1.vercel.app](https://rag-week-1.vercel.app)
> 
> 🌐 **Production URL:** [https://rag-week-1.vercel.app](https://rag-week-1.vercel.app)  
> Ứng dụng Minimal RAG Engine đã được triển khai hoàn chỉnh trên **Vercel** (Fullstack Monorepo gồm React Vite Client + Express Serverless API kết nối Supabase pgvector & Gemini AI). Chi tiết xem tại [docs/deployment.md](docs/deployment.md).

---

## 1. Mục tiêu (Objective)
* Xây dựng một ứng dụng Proof of Concept (PoC) về quy trình Retrieval-Augmented Generation (RAG) end-to-end: **Upload tài liệu (.txt, .md, .pdf) → Chunking (RecursiveCharacterTextSplitter) → Embedding (768d Matryoshka) → Lưu Vector DB (Supabase pgvector) → Hỏi đáp ngữ cảnh (Anti-Hallucination) kèm trích dẫn nguồn (Source Citations)**.
* Hỗ trợ **bộ nhớ hội thoại đa lượt (Multi-turn conversational memory)** và **Lưu trữ lịch sử chat nhiều phiên (Multi-session Chat History)** bền vững qua `localStorage`.
* Giao diện người dùng hiện đại, tinh gọn với phong cách **Xanh Dương - Trắng (Clean Blue & White)**, hỗ trợ đóng/mở panel linh hoạt, sao chép câu trả lời và xuất cuộc trò chuyện ra Markdown.
* Cung cấp một bộ khung mã nguồn sạch sẽ, phân tầng rõ ràng bằng TypeScript cho cả Backend (Node.js/Express) và Frontend (React/Tailwind CSS).

---

## 2. Tính năng nổi bật (Key Features)

### 🚀 Core RAG Pipeline
* **Đa định dạng tài liệu:** Hỗ trợ nạp các file `.txt`, `.md`, và `.pdf` (tối đa 4.5MB).
* **Chunking thông minh:** Sử dụng `RecursiveCharacterTextSplitter` với dấu câu tự nhiên (`\n\n`, `\n`, `.`, `?`, `!`, ` `) giúp bảo toàn trọn vẹn ngữ nghĩa từng câu.
* **Vector Embeddings:** Sử dụng `text-embedding-004` (Google Gemini) cấu hình kích thước 768 chiều qua kỹ thuật Matryoshka Embeddings.
* **Vector Database:** Supabase PostgreSQL tích hợp extension `pgvector` với hàm RPC `match_documents` thực hiện cosine similarity search siêu tốc.
* **Anti-Hallucination Prompting:** Prompt bảo vệ nghiêm ngặt — AI chỉ trả lời dựa trên trích đoạn được cung cấp, tự động từ chối nếu thông tin nằm ngoài tài liệu.
* **Source Citations:** Mỗi câu trả lời hiển thị danh sách thẻ nguồn tham chiếu kèm tên file, số thứ tự đoạn trích và độ tương đồng (% khớp).

### 💬 Trải nghiệm người dùng & Lịch sử trò chuyện (UX/UI)
* **Chủ đề Xanh - Trắng hiện đại:** Thiết kế giao diện sáng sủa, thanh lịch, dễ đọc với hệ màu Blue & White (`#2563eb`, `#f8fafc`).
* **Quản lý phiên chat (Multi-Session):** Tạo cuộc trò chuyện mới (`+ Chat mới`), đổi tên phiên chat, xóa từng phiên hoặc xóa toàn bộ lịch sử.
* **Bảng lịch sử trượt (Slide-over Drawer):** Dễ dàng duyệt lại các phiên hội thoại trước đó kèm thông tin thời gian tương đối ("Vừa xong", "15 phút trước",...).
* **Lưu trữ tự động (Persistent):** Toàn bộ tin nhắn và các phiên được lưu trữ an toàn trong `localStorage`, không lo mất dữ liệu khi refresh trang.
* **Bộ nhớ ngữ cảnh AI (Multi-turn Memory):** Tự động gửi kèm các lượt hội thoại gần nhất lên server để Gemini hiểu các câu hỏi tiếp nối (follow-up questions).
* **Tiện ích sao chép & Xuất dữ liệu:** 
  - Nút **📋 Sao chép** nhanh nội dung phản hồi của AI vào clipboard.
  - Nút **📥 Xuất MD** tải toàn bộ cuộc trò chuyện kèm nguồn tham chiếu thành file `.md` về máy tính.
* **Đóng/Mở linh hoạt Document Panel:** Hỗ trợ thu gọn thanh quản lý tài liệu để mở rộng tối đa không gian trò chuyện khi cần.

---

## 3. Tech Stack
* **Ngôn ngữ:** TypeScript (Strict Type Checking)
* **LLM Orchestration:** LangChain.js (`@langchain/core`, `@langchain/google-genai`, `@langchain/textsplitters`)
* **Backend:** Node.js, Express, Multer, Cors, tsx
* **Frontend:** React 19, Vite, Tailwind CSS
* **LLM & Embeddings:** Google Gemini (`text-embedding-004` - 768 chiều Matryoshka, `gemini-3.6-flash` với `temperature: 0`)
* **Vector Store:** Supabase Vector DB (PostgreSQL với extension `pgvector` và hàm RPC `match_documents`)

---

## 4. Cấu trúc Dự án
```
Week1/
├── client/                          --> Ứng dụng React.js (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CitationCard.tsx        --> Thẻ hiển thị trích dẫn nguồn đóng/mở
│   │   │   ├── DocumentPanel.tsx       --> Giao diện tải lên & quản lý tài liệu (có toggle đóng/mở)
│   │   │   ├── ChatPanel.tsx           --> Khung chat trực quan với trợ lý RAG
│   │   │   └── ChatHistoryDrawer.tsx   --> Bảng trượt xem & quản lý lịch sử chat
│   │   ├── hooks/
│   │   │   └── useChatHistory.ts       --> Custom hook quản lý phiên & lưu localStorage
│   │   ├── types/
│   │   │   └── chat.ts                 --> Định nghĩa kiểu dữ liệu ChatMessage, ChatSession
│   │   ├── App.tsx                     --> Bố cục 2 cột responsive (hỗ trợ toggle sidebar)
│   │   └── main.tsx
│   └── vite.config.ts
├── server/                          --> Ứng dụng Node.js (Express + LangChain)
│   ├── src/
│   │   ├── config.ts                   --> Quản lý biến môi trường
│   │   ├── main.ts                     --> Express server entry point (Port 5000)
│   │   ├── routes/
│   │   │   ├── ingest.route.ts         --> POST /api/ingest (Multer upload)
│   │   │   ├── chat.route.ts           --> POST /api/chat (hỗ trợ history multi-turn)
│   │   │   └── documents.route.ts      --> GET & DELETE /api/documents
│   │   ├── lib/rag/
│   │   │   ├── loader.ts               --> Trích xuất text từ .txt, .md, .pdf
│   │   │   ├── splitter.ts             --> Cắt đoạn RecursiveCharacterTextSplitter
│   │   │   ├── vector-store.ts         --> GeminiEmbeddings (768d) + SupabaseVectorStore
│   │   │   ├── retriever.ts            --> Vector Similarity Search
│   │   │   ├── prompt.ts               --> Grounding Prompt & Anti-Hallucination
│   │   │   └── chain.ts                --> QA Chain gọi Gemini sinh câu trả lời với history
│   │   └── scripts/
│   │       ├── test-ingest.ts          --> Script test pipeline nạp tài liệu
│   │       └── test-qa.ts              --> Script test hỏi đáp in-domain & out-of-domain
├── samples/                         --> Dữ liệu mẫu kiểm thử (.txt, .md, .pdf)
├── scripts/
│   └── supabase-schema.sql          --> SQL script khởi tạo bảng documents & hàm match_documents
├── docs/
│   └── deployment.md                --> Hướng dẫn chi tiết triển khai lên Vercel
├── api/
│   └── index.ts                     --> Vercel Serverless Function entry point
├── vercel.json                      --> Cấu hình định tuyến và build Vercel
├── .env.example                     --> Mẫu biến môi trường
└── package.json                     --> Monorepo build & run scripts
```

---

## 5. Hướng dẫn cài đặt & Chạy ứng dụng (Local Setup)

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
# Cài đặt toàn bộ dependencies ở root
npm install

# Hoặc cài đặt từng phần:
cd server && npm install --legacy-peer-deps
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

## 6. Danh sách REST API Endpoints
* `POST /api/ingest`: Tải lên file multipart (`.txt`, `.md`, `.pdf`).
* `POST /api/chat`: Gửi câu hỏi `{ question: string, topK?: number, history?: HistoryTurn[] }`. Trả về câu trả lời và mảng `sources`.
* `GET /api/documents`: Lấy thống kê tổng số chunks và danh sách tài liệu.
* `DELETE /api/documents/:source`: Xóa các vector của file tương ứng trong Supabase.
* `GET /api/health`: Kiểm tra trạng thái máy chủ.

---

## 7. Tiêu chuẩn hoàn thành (DoD - Definition of Done)
- [x] **Upload & Ingestion:** Người dùng upload được file văn bản (`.txt`, `.md`, `.pdf`). Hệ thống đọc nội dung bằng `pdf-parse`, chia nhỏ thành các chunks theo cấu hình (`chunkSize: 1000`, `chunkOverlap: 200`).
- [x] **Embedding & Vector Storage:** Chunks được chuyển đổi thành vector embedding 768 chiều qua Matryoshka Embeddings và lưu thành công vào Supabase Vector DB (`documents` table).
- [x] **Contextual Retrieval:** Khi gửi câu hỏi, hệ thống truy vấn được top-k chunks có độ tương đồng cao nhất từ Vector DB qua `similaritySearchWithScore`.
- [x] **Answer Generation with Source Citation:** LLM sinh câu trả lời chính xác dựa trên ngữ cảnh đã truy xuất và hiển thị rõ ràng thông tin nguồn (tên file, đoạn văn tham chiếu, điểm tương đồng). Có cơ chế từ chối khi câu hỏi ngoài tài liệu (Anti-Hallucination).
- [x] **Chat History & Conversational Memory:** Lưu lịch sử đa phiên vào LocalStorage, hỗ trợ đa lượt hội thoại tiếp nối.
- [x] **Modern UI/UX:** Giao diện Xanh - Trắng hiện đại, hỗ trợ ẩn/hiện bảng tài liệu, sao chép câu trả lời, xuất Markdown.
- [x] **Deploy:** Đã deploy thành công lên Vercel: [https://rag-week-1.vercel.app](https://rag-week-1.vercel.app)