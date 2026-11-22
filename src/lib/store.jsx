"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  cancelApplicationRequest,
  createApplication,
  createCheckoutSession,
  createTuitionRequest,
  deleteTuitionRequest,
  getAdminPayments,
  getAdminTuitions,
  getAdminUsers,
  getFeaturedTuitionsRequest,
  getIncomingApplications,
  getMe,
  getMyApplications,
  getMyBookmarks,
  getMyTuitions,
  getToken,
  moderateTuitionRequest,
  setToken,
  signInRequest,
  signOutRequest,
  signUpRequest,
  toggleBookmarkRequest,
  toggleTuitionStatusRequest,
  updateApplicationStatusRequest,
  updateProfileRequest,
  updateTuitionRequest,
  updateUserRoleRequest,
} from "./api";

const AppContext = createContext(null);
const ok = (message) => ({ ok: true, message });
const fail = (message) => ({ ok: false, message });
const errorMessage = (error, fallback) => error?.message || fallback;

const EMPTY_DATA = { users: [], tuitions: [], applications: [], payments: [], bookmarks: [] };
const asArray = (value) => (Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : []);
const asIds = (value) => asArray(value).map((item) => String(typeof item === "object" ? item?._id : item));

// Keep only the fields the backend accepts.
const TUITION_FIELDS = [
  "title",
  "subject",
  "classLevel",
  "mode",
  "location",
  "monthlyFee",
  "daysPerWeek",
  "bannerImage",
  "description",
];
const PROFILE_FIELDS = ["name", "phone", "bio", "image"];

const pick = (source, fields) => {
  const result = {};
  fields.forEach((key) => {
    if (source?.[key] !== undefined && source?.[key] !== null) result[key] = source[key];
  });
  return result;
};

export function AppProvider({ children }) {
  const [data, setData] = useState(EMPTY_DATA);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [ready, setReady] = useState(false);

  const saveToken = useCallback((value) => {
    setToken(value);
    setTokenState(value || null);
  }, []);

  // Loads the collections needed by the resolved user's role.
  const loadCollections = useCallback(async (nextUser) => {
    const role = nextUser?.role;
    const tasks = [getFeaturedTuitionsRequest(12)];
    if (role === "student") tasks.push(getMyApplications(), getMyBookmarks());
    if (role === "tutor") tasks.push(getMyTuitions(), getIncomingApplications());
    if (role === "admin") tasks.push(getAdminUsers(), getAdminTuitions(), getAdminPayments());

    const results = await Promise.allSettled(tasks);
    const at = (index, fallback = []) =>
      results[index]?.status === "fulfilled" ? results[index].value : fallback;
    const featured = asArray(at(0));

    if (role === "student") {
      const applications = asArray(at(1));
      const bookmarks = asArray(at(2));
      return {
        data: { ...EMPTY_DATA, tuitions: featured, applications, bookmarks },
        bookmarkIds: asIds(bookmarks),
      };
    }
    if (role === "tutor") {
      const mine = asArray(at(1));
      const applications = asArray(at(2));
      return {
        data: {
          ...EMPTY_DATA,
          tuitions: mine.length ? mine : featured,
          applications,
        },
        bookmarkIds: [],
      };
    }
    if (role === "admin") {
      return {
        data: {
          ...EMPTY_DATA,
          users: asArray(at(1)),
          tuitions: asArray(at(2)),
          payments: asArray(at(3)),
        },
        bookmarkIds: [],
      };
    }
    return { data: { ...EMPTY_DATA, tuitions: featured }, bookmarkIds: [] };
  }, []);

  const refresh = useCallback(
    async (nextUser) => {
      try {
        const next = await loadCollections(nextUser);
        setData(next.data);
        setBookmarkIds(next.bookmarkIds);
      } catch {
        // Keep the current data if a refresh fails; actions still report success.
      }
    },
    [loadCollections],
  );

  // Restore the session on every mount (including hard reloads of private routes).
  useEffect(() => {
    let active = true;
    const boot = async () => {
      setReady(false);
      try {
        const savedToken = getToken();
        saveToken(savedToken);
        let resolvedUser = null;
        if (savedToken) {
          try {
            const body = await getMe();
            resolvedUser = body?.user || null;
          } catch {
            saveToken(null);
          }
        }
        if (!active) return;
        setUser(resolvedUser);
        await refresh(resolvedUser);
      } catch {
        // An offline API should not block the UI from becoming ready.
      } finally {
        if (active) setReady(true);
      }
    };
    queueMicrotask(() => {
      void boot();
    });
    return () => {
      active = false;
    };
  }, [refresh, saveToken]);

  const signIn = useCallback(
    async ({ email, password }) => {
      try {
        const body = await signInRequest({ email, password });
        saveToken(body.token);
        setUser(body.user || null);
        await refresh(body.user);
        return { ...ok(body.message || "Signed in successfully."), user: body.user };
      } catch (error) {
        return fail(errorMessage(error, "Unable to sign in. Please try again."));
      }
    },
    [refresh, saveToken],
  );

  const signUp = useCallback(
    async ({ name, email, password, role }) => {
      try {
        const body = await signUpRequest({ name, email, password, role });
        saveToken(body.token);
        setUser(body.user || null);
        await refresh(body.user);
        return { ...ok(body.message || "Your account is ready!"), user: body.user };
      } catch (error) {
        return fail(errorMessage(error, "Unable to create your account. Please try again."));
      }
    },
    [refresh, saveToken],
  );

  // Kept for backwards compatibility; the live login form hides demo shortcuts.
  const demoLogin = useCallback(
    async (role) => {
      const credentials = {
        student: { email: "ayesha@example.com", password: "demo1234" },
        tutor: { email: "sadia@mentorlagbe.com", password: "demo1234" },
        admin: { email: "admin@mentorlagbe.com", password: "admin123" },
      }[role];
      if (!credentials) return fail("Unknown demo role.");
      return signIn(credentials);
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    try {
      await signOutRequest();
    } catch {
      // Clearing the local session must happen even if the API call fails.
    }
    saveToken(null);
    setUser(null);
    setData(EMPTY_DATA);
    setBookmarkIds([]);
    return ok("You have been signed out.");
  }, [saveToken]);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return fail("Please sign in first.");
      try {
        const body = await updateProfileRequest(pick(patch, PROFILE_FIELDS));
        const nextUser = body.user || { ...user, ...pick(patch, PROFILE_FIELDS) };
        setUser(nextUser);
        return ok(body.message || "Profile updated successfully.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to update your profile."));
      }
    },
    [user],
  );

  const applyToTuition = useCallback(
    async (payload) => {
      if (!user) return fail("Please sign in as a student to apply.");
      if (user.role !== "student") return fail("Only students can apply for tuitions.");
      const details = payload?.application || {};
      const tuitionId = payload?._id || payload?.tuitionId;
      if (!tuitionId) return fail("This tuition is no longer available.");
      try {
        const body = await createApplication({
          tuitionId,
          studentPhone: details.studentPhone ?? payload?.studentPhone,
          preferredSchedule: details.preferredSchedule ?? payload?.preferredSchedule,
          studentNote: details.studentNote ?? payload?.studentNote,
        });
        await refresh(user);
        return ok(body.message || "Application submitted! The tutor will review it shortly.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to submit your application."));
      }
    },
    [refresh, user],
  );

  const cancelApplication = useCallback(
    async (id) => {
      try {
        const body = await cancelApplicationRequest(id);
        await refresh(user);
        return ok(body.message || "Application cancelled.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to cancel this application."));
      }
    },
    [refresh, user],
  );

  const createTuition = useCallback(
    async (payload) => {
      if (user?.role !== "tutor") return fail("Only tutors can post a tuition.");
      try {
        const body = await createTuitionRequest(pick(payload, TUITION_FIELDS));
        await refresh(user);
        return ok(body.message || "Tuition submitted for admin approval.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to publish this tuition."));
      }
    },
    [refresh, user],
  );

  const updateTuition = useCallback(
    async (id, patch) => {
      try {
        const body = await updateTuitionRequest(id, pick(patch, TUITION_FIELDS));
        await refresh(user);
        return ok(body.message || "Tuition updated.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to update this tuition."));
      }
    },
    [refresh, user],
  );

  const deleteTuition = useCallback(
    async (id) => {
      try {
        const body = await deleteTuitionRequest(id);
        await refresh(user);
        return ok(body.message || "Tuition deleted.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to delete this tuition."));
      }
    },
    [refresh, user],
  );

  const toggleTuitionStatus = useCallback(
    async (id) => {
      try {
        const body = await toggleTuitionStatusRequest(id);
        await refresh(user);
        return ok(body.message || "Tuition status updated.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to change this tuition's status."));
      }
    },
    [refresh, user],
  );

  const updateApplicationStatus = useCallback(
    async (id, status) => {
      try {
        const body = await updateApplicationStatusRequest(id, status);
        await refresh(user);
        return ok(body.message || `Application ${status}.`);
      } catch (error) {
        return fail(errorMessage(error, "Unable to update this application."));
      }
    },
    [refresh, user],
  );

  const updateUserRole = useCallback(
    async (id, role) => {
      try {
        const body = await updateUserRoleRequest(id, role);
        await refresh(user);
        return ok(body.message || "User role updated.");
      } catch (error) {
        return fail(errorMessage(error, "Unable to change this user's role."));
      }
    },
    [refresh, user],
  );

  const moderateTuition = useCallback(
    async (id, approvalStatus) => {
      try {
        const body = await moderateTuitionRequest(id, approvalStatus);
        await refresh(user);
        return ok(body.message || `Tuition ${approvalStatus}.`);
      } catch (error) {
        return fail(errorMessage(error, "Unable to moderate this tuition."));
      }
    },
    [refresh, user],
  );

  const upgradePlan = useCallback(
    async (planName) => {
      if (!user) return fail("Please sign in before upgrading.");
      try {
        const session = await createCheckoutSession({ role: user.role });
        if (session?.url && typeof window !== "undefined") window.location.assign(session.url);
        return ok(session?.message || "Redirecting to checkout...");
      } catch (error) {
        return fail(errorMessage(error, "Checkout is unavailable right now. Please try again later."));
      }
    },
    [user],
  );

  const toggleBookmark = useCallback(
    async (tuitionId) => {
      if (!user) return fail("Please sign in to save tuitions.");
      if (user.role !== "student") return fail("Only students can save tuitions.");
      try {
        const body = await toggleBookmarkRequest(tuitionId);
        setBookmarkIds(asIds(body.bookmarks));
        await refresh(user);
        return ok(body.message || (body.saved ? "Saved to your bookmarks." : "Removed from saved tuitions."));
      } catch (error) {
        return fail(errorMessage(error, "Unable to update your bookmarks."));
      }
    },
    [refresh, user],
  );

  const value = useMemo(
    () => ({
      ready,
      user,
      token,
      ...data,
      bookmarkIds,
      signIn,
      signUp,
      demoLogin,
      signOut,
      updateProfile,
      applyToTuition,
      cancelApplication,
      createTuition,
      updateTuition,
      deleteTuition,
      toggleTuitionStatus,
      updateApplicationStatus,
      updateUserRole,
      moderateTuition,
      upgradePlan,
      toggleBookmark,
      isBookmarked: (id) => bookmarkIds.includes(String(id)),
    }),
    [
      ready,
      user,
      token,
      data,
      bookmarkIds,
      signIn,
      signUp,
      demoLogin,
      signOut,
      updateProfile,
      applyToTuition,
      cancelApplication,
      createTuition,
      updateTuition,
      deleteTuition,
      toggleTuitionStatus,
      updateApplicationStatus,
      updateUserRole,
      moderateTuition,
      upgradePlan,
      toggleBookmark,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
