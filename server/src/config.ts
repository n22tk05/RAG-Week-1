import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from root .env or server/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabasePrivateKey: process.env.SUPABASE_PRIVATE_KEY || "",
};

export function validateConfig() {
  const missing: string[] = [];
  if (!config.geminiApiKey && !config.openaiApiKey) {
    missing.push("GEMINI_API_KEY (hoặc OPENAI_API_KEY)");
  }
  if (!config.supabaseUrl) missing.push("SUPABASE_URL");
  if (!config.supabasePrivateKey) missing.push("SUPABASE_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Thiếu các biến môi trường bắt buộc: ${missing.join(", ")}. Vui lòng kiểm tra file .env.`
    );
  }
}
