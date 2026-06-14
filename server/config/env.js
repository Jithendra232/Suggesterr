import dotenv from "dotenv";

dotenv.config();

export function validateEnv() {
  const required = ["MONGODB_URI", "CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY", "GEMINI_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}
