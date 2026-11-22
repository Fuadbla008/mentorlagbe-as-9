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
  try {
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
  } catch {
    // A transient API failure must not take down the whole page.
    return { items: [], total: 0, totalPages: 1, page: page || 1 };
  }
}

export async function getFeaturedTuitions(limit = 6) {
  try {
    const items = await getFeaturedTuitionsRequest(limit, LIVE);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function getTuitionById(id) {
  if (!id) return null;
  try {
    return await getTuitionByIdRequest(id, LIVE);
  } catch {
    return null;
  }
}

export async function getPlatformStats() {
  try {
    const stats = await getStats(LIVE);
    return {
      tutors: Number(stats.tutors) || 0,
      students: Number(stats.students) || 0,
      tuitions: Number(stats.tuitions) || 0,
      applications: Number(stats.applications) || 0,
      revenue: Number(stats.revenue) || 0,
    };
  } catch {
    return { tutors: 0, students: 0, tuitions: 0, applications: 0, revenue: 0 };
  }
}

export function formatFee(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-US")}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
