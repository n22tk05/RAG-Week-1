import { PDFParse } from "pdf-parse";

export async function loadDocument(buffer: Buffer, filename: string): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error(`Tệp tin "${filename}" bị rỗng (0 bytes).`);
  }

  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext || !["txt", "md", "pdf"].includes(ext)) {
    throw new Error(
      `Định dạng tệp không được hỗ trợ: .${ext || "không xác định"}. Hệ thống hiện chỉ hỗ trợ .txt, .md và .pdf`
    );
  }

  let rawText = "";

  if (ext === "txt" || ext === "md") {
    rawText = buffer.toString("utf-8");
  } else if (ext === "pdf") {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      rawText = result.text || "";
    } catch (err: any) {
      throw new Error(`Lỗi khi trích xuất text từ file PDF "${filename}": ${err?.message || err}`);
    }
  }

  const trimmedText = rawText.trim();
  if (!trimmedText) {
    throw new Error(
      `Không thể trích xuất văn bản từ tệp "${filename}". Tệp có thể rỗng hoặc là file scan dạng ảnh không có text layer.`
    );
  }

  return trimmedText;
}
