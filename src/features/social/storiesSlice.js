import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/ads";
const H = (getState) => {
  const t = getState().auth?.token;
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const err = (e, f) => e?.response?.data?.message || e?.message || f;

export const fetchActiveStories = createAsyncThunk("stories/fetchActiveStories",
  async (_, { getState, rejectWithValue }) => {
    try { const { data } = await axios.get(`${API}/stories/active`, { headers: H(getState) }); return data.data; }
    catch (e) { return rejectWithValue(err(e, "Failed to load stories")); }
  });
export const fetchMyStories = createAsyncThunk("stories/fetchMyStories",
  async (_, { getState, rejectWithValue }) => {
    try { const { data } = await axios.get(`${API}/stories/my`, { headers: H(getState) }); return data.data; }
    catch (e) { return rejectWithValue(err(e, "Failed to load your stories")); }
  });
export const fetchStoriesByUser = createAsyncThunk("stories/fetchStoriesByUser",
  async (userId, { getState, rejectWithValue }) => {
    try { const { data } = await axios.get(`${API}/stories/user/${userId}`, { headers: H(getState) }); return data.data; }
    catch (e) { return rejectWithValue(err(e, "Failed to load stories")); }
  });
export const createStory = createAsyncThunk("stories/createStory",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/stories`, formData,
        { headers: { ...H(getState), "Content-Type": "multipart/form-data" } });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to upload story")); }
  });
export const viewStory = createAsyncThunk("stories/viewStory",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.post(`${API}/stories/${id}/view`, {}, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed")); }
  });
export const reactToStory = createAsyncThunk("stories/reactToStory",
  async ({ id, emoji }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/stories/${id}/react`, { emoji }, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed")); }
  });
export const deleteStory = createAsyncThunk("stories/deleteStory",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.delete(`${API}/stories/${id}`, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed")); }
  });
export const fetchHighlights = createAsyncThunk("stories/fetchHighlights",
  async (userId, { getState, rejectWithValue }) => {
    try { const { data } = await axios.get(`${API}/highlights/${userId}`, { headers: H(getState) }); return data.data; }
    catch (e) { return rejectWithValue(err(e, "Failed")); }
  });
export const createHighlight = createAsyncThunk("stories/createHighlight",
  async ({ name, coverImage, storyIds }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/highlights`, { name, coverImage, storyIds }, { headers: H(getState) });
      return data.data;
    } catch (e) { return rejectWithValue(err(e, "Failed to create highlight")); }
  });
export const deleteHighlight = createAsyncThunk("stories/deleteHighlight",
  async (id, { getState, rejectWithValue }) => {
    try { await axios.delete(`${API}/highlights/${id}`, { headers: H(getState) }); return id; }
    catch (e) { return rejectWithValue(err(e, "Failed to delete highlight")); }
  });

const initial = {
  active: [], my: [], byUser: {}, highlights: {},
  error: null, loading: false,
};

const storiesSlice = createSlice({
  name: "stories",
  initialState: initial,
  reducers: {
    clearStoriesError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchActiveStories.fulfilled, (s, a) => { s.active = a.payload; })
      .addCase(fetchMyStories.fulfilled, (s, a) => { s.my = a.payload; })
      .addCase(fetchStoriesByUser.fulfilled, (s, a) => { s.byUser[a.meta.arg] = a.payload; })
      .addCase(createStory.fulfilled, (s, a) => { s.my = [a.payload, ...s.my]; })
      .addCase(reactToStory.fulfilled, (s, a) => {
        s.active = s.active.map((g) => ({
          ...g,
          stories: g.stories.map((st) => st._id === a.payload._id ? a.payload : st),
        }));
      })
      .addCase(deleteStory.fulfilled, (s, a) => { s.my = s.my.filter((st) => st._id !== a.payload); })
      .addCase(fetchHighlights.fulfilled, (s, a) => { s.highlights[a.meta.arg] = a.payload; })
      .addCase(createHighlight.fulfilled, (s, a) => {
        const uid = a.payload.userId;
        s.highlights[uid] = [a.payload, ...(s.highlights[uid] || [])];
      })
      .addCase(deleteHighlight.fulfilled, (s) => {
        Object.keys(s.highlights).forEach((k) => {
          s.highlights[k] = s.highlights[k].filter((h) => h._id !== a0(a));
        });
      });
  },
});

// helper reference kept to keep ESLint quiet about unused `a`
function a0(a) { return a.payload; }

export const { clearStoriesError } = storiesSlice.actions;
export const selectActiveStories = (s) => s.stories.active;
export const selectMyStories = (s) => s.stories.my;
export const selectStoriesByUser = (id) => (s) => s.stories.byUser[id] || [];
export const selectHighlights = (id) => (s) => s.stories.highlights[id] || [];

export default storiesSlice.reducer;