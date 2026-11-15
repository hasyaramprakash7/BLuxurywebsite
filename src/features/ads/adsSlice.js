import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/ads";
const H = (getState) => {
  const t = getState().auth?.token;
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const err = (e, f) => e?.response?.data?.message || e?.message || f;

const logFormData = (formData) => {
  const entries = [];
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File || pair[1] instanceof Blob) {
      entries.push({ key: pair[0], value: `File(${pair[1].name || "blob"}, ${pair[1].size} bytes, ${pair[1].type})` });
    } else {
      entries.push({ key: pair[0], value: pair[1] });
    }
  }
  return entries;
};

/* ---------------- FEED / LIST ---------------- */
export const fetchFeed = createAsyncThunk("ads/fetchFeed",
  async ({ page = 1, limit = 20, type } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/feed`, { params: { page, limit, type }, headers: H(getState) });
      return { ...data, page, type: type || "post" };
    } catch (e) { return rejectWithValue(err(e, "Failed to load feed")); }
  });

export const fetchExplore = createAsyncThunk("ads/fetchExplore",
  async ({ page = 1, limit = 30 } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/explore`, { params: { page, limit }, headers: H(getState) });
      return { ...data, page };
    } catch (e) { return rejectWithValue(err(e, "Failed to load explore")); }
  });

export const fetchPost = createAsyncThunk("ads/fetchPost",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/${id}`, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load post")); }
  });

/* ✅ HLS status poller */
export const fetchAdStatus = createAsyncThunk("ads/fetchAdStatus",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/${id}/status`, { headers: H(getState) });
      return { id, ...data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to load status")); }
  });

export const fetchMyPosts = createAsyncThunk("ads/fetchMyPosts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/my-posts`, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load your posts")); }
  });

export const fetchUserPosts = createAsyncThunk("ads/fetchUserPosts",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/user/${userId}`, { headers: H(getState) });
      return { userId, posts: data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to load user posts")); }
  });

export const fetchArchived = createAsyncThunk("ads/fetchArchived",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/my-archive`, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load archive")); }
  });

export const createPost = createAsyncThunk("ads/createPost",
  async (formData, { getState, rejectWithValue }) => {
    try {
      console.log("🚀 [ads/createPost] START");
      console.log("📦 FormData:", logFormData(formData));
      const { data } = await axios.post(`${API}/`, formData, { headers: { ...H(getState) } });
      console.log("✅ [ads/createPost] SUCCESS:", data?.data?._id);
      return data.data;
    } catch (e) {
      console.error("❌ [ads/createPost] FAILED", { status: e?.response?.status, data: e?.response?.data });
      return rejectWithValue(err(e, "Failed to create post"));
    }
  });

export const updatePost = createAsyncThunk("ads/updatePost",
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      console.log(`🚀 [ads/updatePost] START (${id})`);
      console.log("📦 FormData:", logFormData(formData));
      const { data } = await axios.put(`${API}/${id}`, formData, { headers: { ...H(getState) } });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to update post")); }
  });

export const deletePost = createAsyncThunk("ads/deletePost",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.delete(`${API}/${id}`, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed to delete post")); }
  });

export const toggleAdStatus = createAsyncThunk("ads/toggleAdStatus",
  async ({ id, isActive }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${API}/${id}/toggle`, { isActive }, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to toggle")); }
  });

export const toggleLike = createAsyncThunk("ads/toggleLike",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/like`, {}, { headers: H(getState) });
      return { id, ...data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to like")); }
  });

export const toggleSave = createAsyncThunk("ads/toggleSave",
  async ({ id, collectionId }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/save`, { collectionId }, { headers: H(getState) });
      return { id, ...data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to save")); }
  });

export const trackView = createAsyncThunk("ads/trackView",
  async ({ id, meta }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/view`, meta || {}, { headers: H(getState) });
      return { id, ...data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to track view")); }
  });

export const trackShare = createAsyncThunk("ads/trackShare",
  async ({ id, shareType }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/share`, { shareType }, { headers: H(getState) });
      return { id, ...data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to track share")); }
  });

export const archivePost = createAsyncThunk("ads/archivePost",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.post(`${API}/${id}/archive`, {}, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed to archive")); }
  });

export const unarchivePost = createAsyncThunk("ads/unarchivePost",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.post(`${API}/${id}/unarchive`, {}, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed to unarchive")); }
  });

export const togglePin = createAsyncThunk("ads/togglePin",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/pin`, {}, { headers: H(getState) });
      return { id, isPinned: data.data.isPinned };
    } catch (e) { return rejectWithValue(err(e, "Failed to pin")); }
  });

export const fetchComments = createAsyncThunk("ads/fetchComments",
  async ({ id, limit = 50, before } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/${id}/comments`, { params: { limit, before }, headers: H(getState) });
      return { id, comments: data.data, count: data.count };
    } catch (e) { return rejectWithValue(err(e, "Failed to load comments")); }
  });

export const addComment = createAsyncThunk("ads/addComment",
  async ({ id, text, parentId }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/comments`, { text, parentId }, { headers: H(getState) });
      return { id, comment: data.data, commentsCount: data.commentsCount };
    } catch (e) { return rejectWithValue(err(e, "Failed to add comment")); }
  });

export const deleteComment = createAsyncThunk("ads/deleteComment",
  async ({ id, commentId }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`${API}/${id}/comments/${commentId}`, { headers: H(getState) });
      return { id, commentId, commentsCount: data.commentsCount };
    } catch (e) { return rejectWithValue(err(e, "Failed to delete comment")); }
  });

export const likeComment = createAsyncThunk("ads/likeComment",
  async ({ id, commentId }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/${id}/comments/${commentId}/like`, {}, { headers: H(getState) });
      return { id, commentId, ...data.data };
    } catch (e) { return rejectWithValue(err(e, "Failed to like comment")); }
  });

export const fetchSavedCollections = createAsyncThunk("ads/fetchSavedCollections",
  async (_, { getState, rejectWithValue }) => {
    try { const { data } = await axios.get(`${API}/saved/collections`, { headers: H(getState) }); return data.data; }
    catch (e) { return rejectWithValue(err(e, "Failed to load collections")); }
  });

export const createSavedCollection = createAsyncThunk("ads/createSavedCollection",
  async ({ name, isPrivate }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/saved/collections`, { name, isPrivate }, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to create collection")); }
  });

export const deleteSavedCollection = createAsyncThunk("ads/deleteSavedCollection",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.delete(`${API}/saved/collections/${id}`, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed to delete collection")); }
  });

export const searchAll = createAsyncThunk("ads/searchAll",
  async ({ q, type = "all", limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/search`, { params: { q, type, limit }, headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Search failed")); }
  });

export const searchIdentities = createAsyncThunk("ads/searchIdentities",
  async ({ q, limit = 30 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/identities/search`, { params: { q, limit }, headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Search failed")); }
  });

export const searchHashtags = createAsyncThunk("ads/searchHashtags",
  async ({ q, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/hashtags/search`, { params: { q, limit }, headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Search failed")); }
  });

export const fetchTrendingHashtags = createAsyncThunk("ads/fetchTrendingHashtags",
  async ({ limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/hashtags/trending`, { params: { limit }, headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load trending")); }
  });

export const fetchHashtagPosts = createAsyncThunk("ads/fetchHashtagPosts",
  async ({ tag, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/hashtags/${tag}/posts`, { params: { page, limit }, headers: H(getState) });
      return { tag, posts: data.data, pagination: data.pagination };
    } catch (e) { return rejectWithValue(err(e, "Failed to load posts")); }
  });

export const fetchMapPins = createAsyncThunk("ads/fetchMapPins",
  async ({ ne_lat, ne_lng, sw_lat, sw_lng, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/map/bounds`, { params: { ne_lat, ne_lng, sw_lat, sw_lng, limit }, headers: H(getState) });
      return data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load map")); }
  });

export const fetchPostAnalytics = createAsyncThunk("ads/fetchPostAnalytics",
  async ({ id, period = "30d" }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/analytics/${id}`, { params: { period }, headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load analytics")); }
  });

export const fetchUserAnalytics = createAsyncThunk("ads/fetchUserAnalytics",
  async ({ period = "30d" } = {}, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/analytics/user`, { params: { period }, headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to load analytics")); }
  });

export const fetchDashboard = createAsyncThunk("ads/fetchDashboard",
  async (_, { getState, rejectWithValue }) => {
    try { const { data } = await axios.get(`${API}/dashboard`, { headers: H(getState) }); return data.data; }
    catch (e) { return rejectWithValue(err(e, "Failed to load dashboard")); }
  });

const initialState = {
  feed: { items: [], page: 0, hasMore: true, error: null },
  explore: { items: [], page: 0, hasMore: true },
  myPosts: [],
  archived: [],
  userPosts: {},
  postsById: {},
  commentsByPost: {},
  savedCollections: [],
  search: { users: [], vendors: [], posts: [], hashtags: [] },
  identitySearch: [],
  hashtagSearch: [],
  trendingHashtags: [],
  hashtagPosts: {},
  mapPins: { pins: [], viewer: null },
  analytics: { post: null, user: null },
  dashboard: null,
  loading: {},
  error: null,
};

/* Helper: patch a post anywhere it appears */
const patchPostEverywhere = (s, id, patch) => {
  if (!id) return;
  if (s.postsById[id]) s.postsById[id] = { ...s.postsById[id], ...patch };
  s.feed.items = s.feed.items.map((p) => (p._id === id ? { ...p, ...patch } : p));
  s.explore.items = s.explore.items.map((p) => (p._id === id ? { ...p, ...patch } : p));
  s.myPosts = s.myPosts.map((p) => (p._id === id ? { ...p, ...patch } : p));
  Object.keys(s.userPosts).forEach((uid) => {
    s.userPosts[uid] = s.userPosts[uid].map((p) => (p._id === id ? { ...p, ...patch } : p));
  });
};

const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    clearAdsError: (s) => { s.error = null; },
    resetExplore: (s) => { s.explore = { items: [], page: 0, hasMore: true }; },
    resetSearch: (s) => {
      s.search = { users: [], vendors: [], posts: [], hashtags: [] };
      s.identitySearch = [];
      s.hashtagSearch = [];
    },
    resetFeed: (s) => { s.feed = { items: [], page: 0, hasMore: true, error: null }; },
    patchPostInLists: (s, a) => {
      const { id, patch } = a.payload;
      patchPostEverywhere(s, id, patch);
    },

    /* ✅ Socket → when worker finishes ffmpeg */
    realtimePostReady: (s, a) => {
      const { adId, hlsUrl, videoUrl, posterUrl, thumbSmallUrl } = a.payload || {};
      if (!adId) return;
      const existing = s.postsById[adId] || {};
      const patch = { hlsStatus: "ready" };
      if (hlsUrl) patch.hlsUrl = hlsUrl;
      if (videoUrl) patch.video = videoUrl;
      if (posterUrl && !existing.image) {
        patch.image = posterUrl;
        patch.thumbnail = posterUrl;
      }
      if (thumbSmallUrl && !existing.thumbnailSmall) {
        patch.thumbnailSmall = thumbSmallUrl;
      }
      patchPostEverywhere(s, adId, patch);
      console.log("🟢 [ads] postReady:", adId);
    },

    /* ✅ Socket → when worker fails */
    realtimePostFailed: (s, a) => {
      const { adId } = a.payload || {};
      if (!adId) return;
      patchPostEverywhere(s, adId, { hlsStatus: "failed" });
      console.warn("🔴 [ads] postFailed:", adId);
    },
  },
  extraReducers: (b) => {
    const L = (s, k, v) => { s.loading[k] = v; };

    b.addCase(fetchFeed.pending, (s, a) => {
      L(s, "feed", true);
      if ((a.meta.arg?.page || 1) === 1) s.feed.error = null;
    })
      .addCase(fetchFeed.fulfilled, (s, a) => {
        L(s, "feed", false);
        const { data, pagination, page } = a.payload;
        if (page === 1) s.feed.items = data;
        else s.feed.items = [...s.feed.items, ...data];
        s.feed.page = page;
        s.feed.hasMore = !!pagination?.hasMore;
        s.feed.error = null;
        data.forEach((p) => { s.postsById[p._id] = p; });
      })
      .addCase(fetchFeed.rejected, (s, a) => {
        L(s, "feed", false);
        s.feed.hasMore = false;
        s.feed.error = a.payload || "Failed to load feed";
        s.error = a.payload;
      })

      .addCase(fetchExplore.pending, (s) => L(s, "explore", true))
      .addCase(fetchExplore.fulfilled, (s, a) => {
        L(s, "explore", false);
        const { data, pagination, page } = a.payload;
        if (page === 1) s.explore.items = data;
        else s.explore.items = [...s.explore.items, ...data];
        s.explore.page = page;
        s.explore.hasMore = !!pagination?.hasMore;
        data.forEach((p) => { s.postsById[p._id] = p; });
      })
      .addCase(fetchExplore.rejected, (s, a) => {
        L(s, "explore", false);
        s.error = a.payload;
      })

      .addCase(fetchPost.fulfilled, (s, a) => {
        L(s, "post", false);
        s.postsById[a.payload._id] = a.payload;
      })

      /* ✅ HLS status poll → merge */
      .addCase(fetchAdStatus.fulfilled, (s, a) => {
        const { id, hlsStatus, hlsUrl, video, image, thumbnail, thumbnailSmall } = a.payload || {};
        const patch = {};
        if (hlsStatus) patch.hlsStatus = hlsStatus;
        if (hlsUrl) patch.hlsUrl = hlsUrl;
        if (video) patch.video = video;
        if (image) patch.image = image;
        if (thumbnail) patch.thumbnail = thumbnail;
        if (thumbnailSmall) patch.thumbnailSmall = thumbnailSmall;
        patchPostEverywhere(s, id, patch);
      })

      .addCase(fetchMyPosts.fulfilled, (s, a) => {
        L(s, "myPosts", false);
        s.myPosts = a.payload || [];
        (a.payload || []).forEach((p) => { s.postsById[p._id] = p; });
      })
      .addCase(fetchUserPosts.fulfilled, (s, a) => {
        L(s, "userPosts", false);
        s.userPosts[a.payload.userId] = a.payload.posts;
      })
      .addCase(fetchArchived.fulfilled, (s, a) => {
        L(s, "archive", false);
        s.archived = a.payload || [];
      })

      .addCase(createPost.pending, (s) => L(s, "createPost", true))
      .addCase(createPost.fulfilled, (s, a) => {
        L(s, "createPost", false);
        s.postsById[a.payload._id] = a.payload;
        s.myPosts = [a.payload, ...s.myPosts];
        s.feed = { ...s.feed, items: [a.payload, ...s.feed.items] };
      })
      .addCase(createPost.rejected, (s, a) => {
        L(s, "createPost", false);
        s.error = a.payload;
      })

      .addCase(updatePost.fulfilled, (s, a) => {
        L(s, "updatePost", false);
        s.postsById[a.payload._id] = a.payload;
        s.myPosts = s.myPosts.map((p) => (p._id === a.payload._id ? a.payload : p));
        s.feed.items = s.feed.items.map((p) => (p._id === a.payload._id ? a.payload : p));
        s.explore.items = s.explore.items.map((p) => (p._id === a.payload._id ? a.payload : p));
      })

      .addCase(deletePost.fulfilled, (s, a) => {
        s.myPosts = s.myPosts.filter((p) => p._id !== a.payload);
        delete s.postsById[a.payload];
        s.feed.items = s.feed.items.filter((p) => p._id !== a.payload);
        s.explore.items = s.explore.items.filter((p) => p._id !== a.payload);
      })

      .addCase(toggleAdStatus.fulfilled, (s, a) => {
        if (s.postsById[a.payload._id]) s.postsById[a.payload._id] = a.payload;
        s.myPosts = s.myPosts.map((p) => (p._id === a.payload._id ? a.payload : p));
      })

      .addCase(toggleLike.fulfilled, (s, a) => {
        const { id, liked, likesCount } = a.payload;
        patchPostEverywhere(s, id, { likedByMe: liked, likesCount });
      })
      .addCase(toggleSave.fulfilled, (s, a) => {
        const { id, saved, savesCount } = a.payload;
        patchPostEverywhere(s, id, { savedByMe: saved, savesCount });
      })
      .addCase(trackView.fulfilled, (s, a) => {
        const { id, viewsCount } = a.payload;
        if (viewsCount != null) patchPostEverywhere(s, id, { viewsCount });
      })
      .addCase(trackShare.fulfilled, (s, a) => {
        const { id, sharesCount } = a.payload;
        if (sharesCount != null) patchPostEverywhere(s, id, { sharesCount });
      })

      .addCase(archivePost.fulfilled, (s, a) => {
        s.myPosts = s.myPosts.filter((p) => p._id !== a.payload);
      })
      .addCase(unarchivePost.fulfilled, (s, a) => {
        s.archived = s.archived.filter((p) => p._id !== a.payload);
      })
      .addCase(togglePin.fulfilled, (s, a) => {
        const { id, isPinned } = a.payload;
        patchPostEverywhere(s, id, { isPinned });
      })

      .addCase(fetchComments.fulfilled, (s, a) => {
        s.commentsByPost[a.payload.id] = a.payload.comments;
      })
      .addCase(addComment.fulfilled, (s, a) => {
        const { id, comment, commentsCount } = a.payload;
        s.commentsByPost[id] = [comment, ...(s.commentsByPost[id] || [])];
        patchPostEverywhere(s, id, { commentsCount });
      })
      .addCase(deleteComment.fulfilled, (s, a) => {
        const { id, commentId, commentsCount } = a.payload;
        s.commentsByPost[id] = (s.commentsByPost[id] || []).filter((c) => c._id !== commentId);
        patchPostEverywhere(s, id, { commentsCount });
      })
      .addCase(likeComment.fulfilled, (s, a) => {
        const { id, commentId, liked, likesCount } = a.payload;
        s.commentsByPost[id] = (s.commentsByPost[id] || []).map((c) =>
          c._id === commentId ? { ...c, likedByMe: liked, likesCount } : c
        );
      })

      .addCase(fetchSavedCollections.fulfilled, (s, a) => { s.savedCollections = a.payload || []; })
      .addCase(createSavedCollection.fulfilled, (s, a) => { s.savedCollections = [a.payload, ...s.savedCollections]; })
      .addCase(deleteSavedCollection.fulfilled, (s, a) => {
        s.savedCollections = s.savedCollections.filter((c) => c._id !== a.payload);
      })

      .addCase(searchAll.fulfilled, (s, a) => {
        s.search = {
          users: a.payload.users || [],
          vendors: a.payload.vendors || [],
          posts: a.payload.posts || [],
          hashtags: a.payload.hashtags || [],
        };
      })
      .addCase(searchIdentities.fulfilled, (s, a) => { s.identitySearch = a.payload || []; })
      .addCase(searchHashtags.fulfilled, (s, a) => { s.hashtagSearch = a.payload || []; })
      .addCase(fetchTrendingHashtags.fulfilled, (s, a) => { s.trendingHashtags = a.payload || []; })
      .addCase(fetchHashtagPosts.fulfilled, (s, a) => { s.hashtagPosts[a.payload.tag] = a.payload.posts; })

      .addCase(fetchMapPins.pending, (s) => L(s, "map", true))
      .addCase(fetchMapPins.fulfilled, (s, a) => {
        L(s, "map", false);
        s.mapPins = { pins: a.payload.data || [], viewer: a.payload.viewer };
      })
      .addCase(fetchMapPins.rejected, (s) => L(s, "map", false))

      .addCase(fetchPostAnalytics.fulfilled, (s, a) => { s.analytics.post = a.payload; })
      .addCase(fetchUserAnalytics.fulfilled, (s, a) => { s.analytics.user = a.payload; })
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.dashboard = a.payload; });
  },
});

export const {
  clearAdsError,
  resetExplore,
  resetSearch,
  resetFeed,
  patchPostInLists,
  realtimePostReady,
  realtimePostFailed,
} = adsSlice.actions;

const EMPTY_COMMENTS = Object.freeze([]);
const EMPTY_POSTS = Object.freeze([]);

export const selectFeed = (s) => s.ads.feed;
export const selectExplore = (s) => s.ads.explore;
export const selectPost = (id) => (s) => s.ads.postsById[id];
export const selectComments = (id) => (s) => s.ads.commentsByPost[id] || EMPTY_COMMENTS;
export const selectMyPosts = (s) => s.ads.myPosts || EMPTY_POSTS;
export const selectUserPosts = (userId) => (s) => s.ads.userPosts[userId] || EMPTY_POSTS;
export const selectAdsLoading = (k) => (s) => !!s.ads.loading[k];
export const selectAdsError = (s) => s.ads.error;

export default adsSlice.reducer;