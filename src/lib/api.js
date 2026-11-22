// Bridge to the deployed Express API. All frontend reads/writes go through here.
// Never put backend secrets (ImgBB / Stripe keys) in this file.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const UPLOAD_URL = (process.env.NEXT_PUBLIC_UPLOAD_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "ml_token";

// Exported so payment return URLs can be built without duplicating the env name.
export const API_BASE_URL = API_URL;

export const isApiConfigured = () => Boolean(API_URL);

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  if (!API_URL) throw new Error("API is not configured (NEXT_PUBLIC_API_URL is unset).");

  const token = getToken();
  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = { ...(options.headers || {}) };

  // FormData must be left untouched so the browser sets the multipart boundary.
  if (!isFormData && !headers["Content-Type"] && !headers["content-type"] && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

const json = (method, path, payload) =>
  apiFetch(path, { method, body: JSON.stringify(payload || {}) });

const query = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
};

/* -------------------------------------------------------------------------- */
/* Public                                                                     */
/* -------------------------------------------------------------------------- */

export const getHealth = (options) => apiFetch("/health", options);
export const getConfig = (options) => apiFetch("/config", options);
export const getStats = (options) => apiFetch("/stats", options);

export const searchTuitionsRequest = (params, options) =>
  apiFetch(`/tuitions${query(params)}`, options);

export const getFeaturedTuitionsRequest = (limit = 6, options) =>
  apiFetch(`/tuitions/featured${query({ limit })}`, options);

export const getTuitionByIdRequest = (id, options) =>
  apiFetch(`/tuitions/${encodeURIComponent(id)}`, options);

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const signInRequest = (payload) => json("POST", "/auth/signin", payload);
export const signUpRequest = (payload) => json("POST", "/auth/signup", payload);
export const signOutRequest = () => json("POST", "/auth/signout", {});
export const getMe = () => apiFetch("/auth/me");

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export const getProfile = () => apiFetch("/profile");
// Only name/phone/bio/image are accepted by the backend.
export const updateProfileRequest = (payload) => json("PUT", "/profile", payload);

/* -------------------------------------------------------------------------- */
/* Student                                                                    */
/* -------------------------------------------------------------------------- */

export const getMyApplications = () => apiFetch("/applications/mine");
export const createApplication = (payload) => json("POST", "/applications", payload);
export const cancelApplicationRequest = (id) =>
  apiFetch(`/applications/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getMyBookmarks = () => apiFetch("/bookmarks/mine");
export const toggleBookmarkRequest = (tuitionId) =>
  json("POST", "/bookmarks", { tuitionId });

/* -------------------------------------------------------------------------- */
/* Tutor                                                                      */
/* -------------------------------------------------------------------------- */

export const getMyTuitions = () => apiFetch("/tuitions/mine");
export const createTuitionRequest = (payload) => json("POST", "/tuitions", payload);
export const updateTuitionRequest = (id, payload) =>
  json("PUT", `/tuitions/${encodeURIComponent(id)}`, payload);
export const deleteTuitionRequest = (id) =>
  apiFetch(`/tuitions/${encodeURIComponent(id)}`, { method: "DELETE" });
export const toggleTuitionStatusRequest = (id) =>
  apiFetch(`/tuitions/${encodeURIComponent(id)}/status`, { method: "PATCH" });
export const getIncomingApplications = () => apiFetch("/applications/incoming");
export const updateApplicationStatusRequest = (id, status) =>
  json("PATCH", `/applications/${encodeURIComponent(id)}/status`, { status });

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export const getAdminUsers = () => apiFetch("/admin/users");
export const updateUserRoleRequest = (id, role) =>
  json("PATCH", `/admin/users/${encodeURIComponent(id)}/role`, { role });
export const getAdminTuitions = (status = "") => apiFetch(`/admin/tuitions${query({ status })}`);
export const moderateTuitionRequest = (id, approvalStatus) =>
  json("PATCH", `/admin/tuitions/${encodeURIComponent(id)}/approval`, { approvalStatus });
export const getAdminPayments = () => apiFetch("/admin/payments");
export const getAdminStats = () => apiFetch("/admin/stats");

/* -------------------------------------------------------------------------- */
/* Payment / media                                                            */
/* -------------------------------------------------------------------------- */

export async function createCheckoutSession(payload) {
  return json("POST", "/payments/checkout", payload);
}

export async function uploadImage(file) {
  if (!file) throw new Error("Please choose an image first.");
  const form = new FormData();
  form.append("image", file);

  if (UPLOAD_URL) {
    const token = getToken();
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Image upload failed");
    const url = body.url || body.image?.url;
    if (!url) throw new Error("Image upload did not return a URL.");
    return url;
  }

  // Optional dev-only fallback. NEXT_PUBLIC_IMGBB_KEY is empty in production.
  const key = process.env.NEXT_PUBLIC_IMGBB_KEY;
  if (!key) throw new Error("Image upload is not configured (NEXT_PUBLIC_UPLOAD_URL is unset).");
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: form,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) throw new Error(body.error?.message || "Image upload failed");
  return body.data.url;
}
