import {
  getFeaturedTuitionsRequest,
  getStats,
  getTuitionByIdRequest,
  searchTuitionsRequest,
} from "./api";

// Server-side reads for the public site. Every call is uncached so the live API
// is always consulted (important with Cache Components enabled).

const LIVE = { cache: "no-store" };

export async function searchTuitions({
  q = "",
  subject = "",
  classLevel = "",
  mode = "",
  page = 1,
  limit = 9,
  sort = "newest",
} = {}) {
  const body = await searchTuitionsRequest(
    { q, subject, classLevel, mode, page, limit, sort },
    LIVE,
  );
  return {
    items: Array.isArray(body.items) ? body.items : [],
    total: Number(body.total) || 0,
    totalPages: Number(body.totalPages) || 1,
    page: Number(body.page) || 1,
  };
}

export async function getFeaturedTuitions(limit = 6) {
  const items = await getFeaturedTuitionsRequest(limit, LIVE);
  return Array.isArray(items) ? items : [];
}

export async function getTuitionById(id) {
  if (!id) return null;
  try {
    return await getTuitionByIdRequest(id, LIVE);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
}

export async function getPlatformStats() {
  const stats = await getStats(LIVE);
  return {
    tutors: Number(stats.tutors) || 0,
    students: Number(stats.students) || 0,
    tuitions: Number(stats.tuitions) || 0,
    applications: Number(stats.applications) || 0,
    revenue: Number(stats.revenue) || 0,
  };
}

export function formatFee(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-US")}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
