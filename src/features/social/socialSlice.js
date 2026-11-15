import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/ads";
const H = (getState) => {
  const t = getState().auth?.token;
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const err = (e, f) => e?.response?.data?.message || e?.message || f;

/* FOLLOW */
export const toggleFollow = createAsyncThunk(
  "social/toggleFollow",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API}/follow/${userId}`,
        {},
        { headers: H(getState) }
      );
      return { userId, following: data.data.following };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to follow"));
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  "social/fetchFollowers",
  async ({ userId, page = 1, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/followers/${userId}`, {
        params: { page, limit },
        headers: H(getState),
      });
      return { userId, list: data.data, pagination: data.pagination };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load followers"));
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "social/fetchFollowing",
  async ({ userId, page = 1, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/following/${userId}`, {
        params: { page, limit },
        headers: H(getState),
      });
      return { userId, list: data.data, pagination: data.pagination };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load following"));
    }
  }
);

export const checkFollowing = createAsyncThunk(
  "social/checkFollowing",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/following/check/${userId}`, {
        headers: H(getState),
      });
      return { userId, following: data.data.following };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to check"));
    }
  }
);

export const fetchSuggestedUsers = createAsyncThunk(
  "social/fetchSuggestedUsers",
  async ({ limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/suggested-users`, {
        params: { limit },
        headers: H(getState),
      });
      return data.data;
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load suggestions"));
    }
  }
);

/* PROFILE */
export const fetchProfile = createAsyncThunk(
  "social/fetchProfile",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/profile/${userId}`, {
        headers: H(getState),
      });
      return data.data;
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load profile"));
    }
  }
);

export const updateProfileStats = createAsyncThunk(
  "social/updateProfileStats",
  async (updates, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API}/profile/stats`, updates, {
        headers: H(getState),
      });
      return data.data;
    } catch (e) {
      return rejectWithValue(err(e, "Failed to update profile"));
    }
  }
);

/* NOTIFICATIONS */
export const fetchNotifications = createAsyncThunk(
  "social/fetchNotifications",
  async ({ page = 1, limit = 50 } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/notifications`, {
        params: { page, limit },
        headers: H(getState),
      });
      console.log("[social/fetchNotifications] ok", {
        items: (data.data || []).length,
        unread: data.unreadCount,
        page,
      });
      return { items: data.data, unread: data.unreadCount, page };
    } catch (e) {
      const msg = err(e, "Failed to load notifications");
      console.error("[social/fetchNotifications] failed:", {
        status: e?.response?.status,
        body: e?.response?.data,
        message: msg,
      });
      return rejectWithValue(msg);
    }
  }
);

export const markNotificationsRead = createAsyncThunk(
  "social/markNotificationsRead",
  async (notificationIds, { getState, rejectWithValue }) => {
    try {
      const body =
        Array.isArray(notificationIds) && notificationIds.length > 0
          ? { notificationIds }
          : {};
      await axios.put(`${API}/notifications/read`, body, {
        headers: H(getState),
      });
      console.log("[social/markNotificationsRead] ok", {
        requested: notificationIds || "all",
      });
      return Array.isArray(notificationIds) && notificationIds.length > 0
        ? notificationIds
        : "all";
    } catch (e) {
      const msg = err(e, "Failed to mark read");
      console.error("[social/markNotificationsRead] failed:", msg);
      return rejectWithValue(msg);
    }
  }
);

/* ACTIVITY */
export const fetchActivity = createAsyncThunk(
  "social/fetchActivity",
  async ({ page = 1, limit = 50, type } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/activity`, {
        params: { page, limit, type },
        headers: H(getState),
      });
      return data.data;
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load activity"));
    }
  }
);

const initial = {
  profiles: {},
  followStatus: {},
  followers: {},
  following: {},
  suggested: [],
  notifications: [],
  unreadNotifications: 0,
  notificationsError: null,          // ✅ surface fetch failures
  notificationsLoading: false,       // ✅ loading state
  activity: [],
  loading: {},
  error: null,
};

const socialSlice = createSlice({
  name: "social",
  initialState: initial,
  reducers: {
    clearSocialError: (s) => {
      s.error = null;
    },
    clearNotificationsError: (s) => {
      s.notificationsError = null;
    },
    pushRealtimeNotification: (s, a) => {
      const n = a.payload;
      if (!n) return;
      const exists = s.notifications.find(
        (x) => String(x._id) === String(n._id)
      );
      if (exists) return;
      s.notifications = [n, ...s.notifications];
      s.unreadNotifications = (s.unreadNotifications || 0) + 1;
    },
  },
  extraReducers: (b) => {
    b.addCase(toggleFollow.fulfilled, (s, a) => {
      s.followStatus[a.payload.userId] = a.payload.following;
      if (s.profiles[a.payload.userId]) {
        s.profiles[a.payload.userId].isFollowing = a.payload.following;
      }
    })
      .addCase(fetchFollowers.fulfilled, (s, a) => {
        s.followers[a.payload.userId] = a.payload.list;
      })
      .addCase(fetchFollowing.fulfilled, (s, a) => {
        s.following[a.payload.userId] = a.payload.list;
      })
      .addCase(checkFollowing.fulfilled, (s, a) => {
        s.followStatus[a.payload.userId] = a.payload.following;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (s, a) => {
        s.suggested = a.payload || [];
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.profiles[a.meta.arg] = a.payload;
        s.followStatus[a.meta.arg] = a.payload.isFollowing;
      })
      .addCase(updateProfileStats.fulfilled, (s, a) => {
        const id =
          a.payload.identityId || a.payload.userId || a.payload.vendorId;
        if (id && s.profiles[id]) {
          s.profiles[id] = { ...s.profiles[id], ...a.payload };
        }
      })

      /* ─── Notifications: pending ─── */
      .addCase(fetchNotifications.pending, (s) => {
        s.notificationsLoading = true;
        s.notificationsError = null;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.notificationsLoading = false;
        s.notifications =
          a.payload.page === 1
            ? a.payload.items
            : [...s.notifications, ...a.payload.items];
        s.unreadNotifications = a.payload.unread || 0;
        s.notificationsError = null;
      })
      .addCase(fetchNotifications.rejected, (s, a) => {
        s.notificationsLoading = false;
        s.notificationsError = a.payload || "Failed to load notifications";
      })

      /* ─── Notifications: mark read ─── */
      .addCase(markNotificationsRead.pending, (s) => {
        s.notificationsError = null;
      })
      .addCase(markNotificationsRead.fulfilled, (s, a) => {
        if (a.payload === "all") {
          s.notifications = s.notifications.map((n) => ({
            ...n,
            isRead: true,
          }));
          s.unreadNotifications = 0;
        } else {
          s.notifications = s.notifications.map((n) =>
            a.payload.includes(n._id) ? { ...n, isRead: true } : n
          );
          s.unreadNotifications = Math.max(
            0,
            s.unreadNotifications - (a.payload?.length || 0)
          );
        }
      })
      .addCase(markNotificationsRead.rejected, (s, a) => {
        s.notificationsError = a.payload || "Failed to mark as read";
      })

      .addCase(fetchActivity.fulfilled, (s, a) => {
        s.activity = a.payload || [];
      });
  },
});

export const {
  clearSocialError,
  clearNotificationsError,
  pushRealtimeNotification,
} = socialSlice.actions;

export const selectProfile = (id) => (s) => s.social.profiles[id];
export const selectIsFollowing = (id) => (s) =>
  !!s.social.followStatus[id];
export const selectSuggested = (s) => s.social.suggested;
export const selectNotifications = (s) => s.social.notifications;
export const selectUnreadCount = (s) => s.social.unreadNotifications;
export const selectNotificationsLoading = (s) =>
  !!s.social.notificationsLoading;
export const selectNotificationsError = (s) => s.social.notificationsError;
export const selectActivity = (s) => s.social.activity;

export default socialSlice.reducer;