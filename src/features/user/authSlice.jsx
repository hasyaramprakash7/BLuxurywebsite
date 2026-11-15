import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * Backend base. If your API lives on another origin, either:
 *   axios.defaults.baseURL = "http://localhost:5000";
 * or add a Vite proxy for "/api".
 */
const API = "/api/auth";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const saveSession = (user, token) => {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ ...user, token }));
  } catch (e) {
    console.warn("Could not persist session", e);
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (e) {}
};

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!raw || !token) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || parsed.token !== token) return null;
    return parsed;
  } catch (e) {
    return null;
  }
};

export const getStoredToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (e) {
    return null;
  }
};

/**
 * Push token: whatever your FCM/Notifee setup writes into localStorage
 * ("pushToken") or onto window.__FCM_TOKEN__.
 * Save your FCM token there and it will be attached to login/register calls.
 */
export const getDevicePushToken = () => {
  try {
    return (
      localStorage.getItem("pushToken") ||
      (typeof window !== "undefined" && window.__FCM_TOKEN__) ||
      undefined
    );
  } catch (e) {
    return undefined;
  }
};

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const errMsg = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

/* ------------------------------------------------------------------ */
/* Thunks                                                              */
/* ------------------------------------------------------------------ */

/* POST /login  ->  { success, user, token } */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/login`, {
        identifier,
        password,
        pushToken: getDevicePushToken(),
      });

      if (!data?.success || !data?.token) {
        return rejectWithValue(data?.message || "Login failed");
      }

      const token = data.token;
      let user = { ...data.user, token };

      // Refresh profile so we always have the latest fields
      try {
        const prof = await axios.get(`${API}/profile`, authHeaders(token));
        if (prof.data?.success && prof.data.user) {
          user = { ...prof.data.user, token };
        }
      } catch (e) {
        /* non-fatal – fall back to login response */
      }

      saveSession(user, token);
      return user;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Login failed. Please check your credentials."));
    }
  }
);

/* POST /register */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/register`, {
        ...payload,
        pushToken: getDevicePushToken(),
      });

      if (!data?.success || !data?.token) {
        return rejectWithValue(data?.message || "Registration failed");
      }

      const token = data.token;
      const user = { ...data.user, token };
      saveSession(user, token);
      return { user, message: data.message };
    } catch (err) {
      return rejectWithValue(errMsg(err, "Registration failed. Please try again."));
    }
  }
);

/* POST /send-otp */
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ phone }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/send-otp`, { phone });
      if (!data?.success) return rejectWithValue(data?.message || "Could not send OTP");
      return data;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Could not send OTP. Please try again."));
    }
  }
);

/* POST /login-with-otp */
export const loginWithOtp = createAsyncThunk(
  "auth/loginWithOtp",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/login-with-otp`, {
        phone,
        otp,
        pushToken: getDevicePushToken(),
      });

      if (!data?.success || !data?.token) {
        return rejectWithValue(data?.message || "OTP login failed");
      }

      const token = data.token;
      const user = { ...data.user, token };
      saveSession(user, token);
      return user;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Invalid or expired OTP"));
    }
  }
);

/* POST /register-with-otp */
export const registerWithOtp = createAsyncThunk(
  "auth/registerWithOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/register-with-otp`, {
        ...payload,
        pushToken: getDevicePushToken(),
      });

      if (!data?.success || !data?.token) {
        return rejectWithValue(data?.message || "Registration failed");
      }

      const token = data.token;
      const user = { ...data.user, token };
      saveSession(user, token);
      return { user, message: data.message };
    } catch (err) {
      return rejectWithValue(errMsg(err, "Registration failed. Please try again."));
    }
  }
);

/* GET /profile */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();
    if (!token) return rejectWithValue("No token found, please log in.");

    try {
      const { data } = await axios.get(`${API}/profile`, authHeaders(token));
      if (!data?.success || !data?.user) return rejectWithValue("Session expired");

      const user = { ...data.user, token };
      saveSession(user, token);
      return user;
    } catch (err) {
      clearSession();
      return rejectWithValue(errMsg(err, "Session expired. Please log in again."));
    }
  }
);

/* PUT /update  (JSON or FormData with profilePic) */
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.token || getState().auth.user?.token || getStoredToken();
    if (!token) return rejectWithValue("Authentication token not found.");

    try {
      const isForm = typeof FormData !== "undefined" && payload instanceof FormData;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (!isForm) config.headers["Content-Type"] = "application/json";

      const { data } = await axios.put(`${API}/update`, payload, config);

      if (!data?.success || !data?.user) {
        return rejectWithValue(data?.message || "Update failed");
      }

      const user = { ...data.user, token };
      saveSession(user, token);
      return user;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Update failed."));
    }
  }
);

/* PUT /update-password */
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async ({ oldPassword, newPassword }, { getState, rejectWithValue }) => {
    const token = getState().auth.token || getStoredToken();
    if (!token) return rejectWithValue("Authentication token not found.");

    try {
      const { data } = await axios.put(
        `${API}/update-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!data?.success) return rejectWithValue(data?.message || "Failed to update password");
      return data.message;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to update password"));
    }
  }
);

/* POST /remove-push-token  + local logout */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, getState }) => {
    const token = getState().auth.token || getStoredToken();
    try {
      if (token) {
        await axios.post(`${API}/remove-push-token`, {}, authHeaders(token));
      }
    } catch (e) {
      /* ignore – logout locally anyway */
    } finally {
      clearSession();
      dispatch(authSlice.actions.logout());
    }
    return true;
  }
);

/* ------------------------------------------------------------------ */
/* Slice                                                               */
/* ------------------------------------------------------------------ */

const storedUser = readStoredUser();

const initialState = {
  user: storedUser,
  token: storedUser?.token || getStoredToken() || null,
  loading: false,        // login / profile fetch
  updating: false,       // profile update / password change
  actionLoading: false,  // register
  otpLoading: false,     // send-otp / otp login
  otpSent: false,
  initialized: false,    // session check finished (used by guards)
  error: null,
  notice: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload?.token) state.token = action.payload.token;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setPushToken: (state, action) => {
      if (state.user) state.user.pushToken = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearNotice: (state) => {
      state.notice = null;
    },
    resetOtp: (state) => {
      state.otpSent = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.notice = null;
      state.loading = false;
      state.updating = false;
      state.actionLoading = false;
      state.otpLoading = false;
      state.otpSent = false;
      state.initialized = true;
      clearSession();
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------------- loginUser ---------------- */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------------- registerUser ---------------- */
      .addCase(registerUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.user.token;
        state.notice = action.payload.message || "Registered successfully";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---------------- sendOtp ---------------- */
      .addCase(sendOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.notice = "OTP sent successfully";
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpSent = false;
        state.error = action.payload;
      })

      /* ---------------- loginWithOtp ---------------- */
      .addCase(loginWithOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload;
      })

      /* ---------------- registerWithOtp ---------------- */
      .addCase(registerWithOtp.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(registerWithOtp.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.user.token;
        state.notice = action.payload.message || "Registered successfully";
      })
      .addCase(registerWithOtp.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      /* ---------------- fetchUserProfile ---------------- */
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.initialized = true;
        state.error = null; // don't flash "session expired" on cold start
      })

      /* ---------------- updateUserProfile ---------------- */
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.notice = "Profile updated";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /* ---------------- updatePassword ---------------- */
      .addCase(updatePassword.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.updating = false;
        state.notice = action.payload;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /* ---------------- logoutUser ---------------- */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.initialized = true;
      });
  },
});

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export const selectAuthUser = (s) => s.auth.user;
export const selectAuthToken = (s) => s.auth.token;
export const selectAuthLoading = (s) => s.auth.loading;
export const selectAuthError = (s) => s.auth.error;
export const selectOtpLoading = (s) => s.auth.otpLoading;
export const selectIsAuthenticated = (s) => !!s.auth.user;

export const {
  setUser,
  setToken,
  setPushToken,
  clearError,
  clearNotice,
  resetOtp,
  logout,
} = authSlice.actions;

export default authSlice.reducer;