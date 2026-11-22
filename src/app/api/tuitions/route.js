import { NextResponse } from "next/server";
import { searchTuitions } from "@/lib/data";

// Server-side search/filter endpoint. Point NEXT_PUBLIC_API_URL at the Express
// backend in production; this route keeps the demo self-contained.
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const result = await searchTuitions({
    q: params.get("q") || "",
    subject: params.get("subject") || "",
    classLevel: params.get("classLevel") || "",
    mode: params.get("mode") || "",
    page: Number(params.get("page") || 1),
    limit: Number(params.get("limit") || 9),
    sort: params.get("sort") || "newest",
  });
  return NextResponse.json(result);
}
