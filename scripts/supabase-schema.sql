
create extension if not exists vector;

create table if not exists documents (
  id bigserial primary key,
  content text not null,                  -- Nội dung đoạn chunk văn bản
  metadata jsonb default '{}'::jsonb,     -- Tên file, chunkIndex, createdAt, ...
  embedding vector(1536) not null         -- Vector 1536 chiều từ OpenAI text-embedding-3-small
);

create index if not exists documents_embedding_idx 
on documents 
using hnsw (embedding vector_cosine_ops);

create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 4,
  filter jsonb default '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
#variable_conflict use_column
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
