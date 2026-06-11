export const PLATFORM_API_URL = (
  import.meta.env.NEXT_PUBLIC_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");
