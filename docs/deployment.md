# Deployment

## Platform: Vercel
- **Production URL:** [https://rag-week-1.vercel.app](https://rag-week-1.vercel.app)
- **Deployment Strategy:** Fullstack Monorepo (Vite React Client + Express Serverless Function)

## Architecture Overview
- **Frontend:** React + Vite (được Vercel build qua `npm --prefix client run build` và phân phối trên Vercel Edge CDN).
- **Backend:** Express API chạy dưới dạng Vercel Serverless Function qua `api/index.ts`.
- **Database:** Supabase PostgreSQL với extension `pgvector` (bảng `documents`, hàm `match_documents`).
- **AI Models:** Google Gemini (`gemini-embedding-001` cho vector embeddings, `gemini-3.6-flash` cho QA generation).

## Deploy Command
```bash
# Triển khai trực tiếp lên Production qua Vercel CLI
npx vercel --prod
```
*Hoặc đẩy commit lên nhánh `main` trên GitHub để Vercel tự động build & deploy qua Git Integration.*

## Environment Variables
Cần cấu hình trong **Vercel Dashboard -> Settings -> Environment Variables**:

| Variable Name | Environment | Description |
|---|---|---|
| `GEMINI_API_KEY` | Production, Preview | Khóa API từ Google AI Studio |
| `SUPABASE_URL` | Production, Preview | URL dự án Supabase (`https://xxxx.supabase.co`) |
| `SUPABASE_PRIVATE_KEY` | Production, Preview | Supabase service role key hoặc anon key có quyền đọc/ghi bảng documents |
| `NODE_ENV` | Production, Preview | `production` |

## Endpoints Verified
- `GET /api/health`: Trả về trạng thái serverless function (`status: ok`).
- `GET /api/documents`: Lấy danh sách tài liệu và thống kê chunks từ Supabase pgvector.
- `POST /api/chat`: Nhận câu hỏi, tìm kiếm tương đồng vector và trả về câu trả lời kèm trích dẫn nguồn từ Gemini.
- `POST /api/ingest`: Tải lên tài liệu `.txt`, `.md`, `.pdf` (tối đa 4.5 MB trên Vercel).

## Rollback
Trong trường hợp cần quay về phiên bản deployment trước đó:
```bash
npx vercel rollback [deployment-url-or-id]
```
Hoặc truy cập **Vercel Dashboard -> Deployments** và chọn deployment trước đó, nhấn **Promote to Production**.
