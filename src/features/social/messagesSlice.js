import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/ads";
const H = (getState) => {
  const t = getState().auth?.token;
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const err = (e, f) => e?.response?.data?.message || e?.message || f;

export const fetchConversations = createAsyncThunk(
  "msg/fetchConversations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/messages/conversations`, {
        headers: H(getState),
      });
      return data.data;
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load chats"));
    }
  }
);

export const getOrCreateConversation = createAsyncThunk(
  "msg/getOrCreateConversation",
  async ({ targetUserId, targetUserType }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API}/messages/conversation`,
        { targetUserId, targetUserType },
        { headers: H(getState) }
      );
      return data.data;
    } catch (e) {
      return rejectWithValue(err(e, "Failed to open chat"));
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "msg/fetchMessages",
  async ({ conversationId, page = 1, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/messages/${conversationId}`, {
        params: { page, limit },
        headers: H(getState),
      });
      return {
        conversationId: String(conversationId),
        messages: data.data,
        page,
      };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to load messages"));
    }
  }
);

export const sendMessage = createAsyncThunk(
  "msg/sendMessage",
  async (
    { conversationId, receiverId, receiverType, text, media, mediaType, sharedAdId, file },
    { getState, rejectWithValue }
  ) => {
    try {
      let body = {
        conversationId,
        receiverId,
        receiverType,
        text,
        media,
        mediaType,
        sharedAdId,
      };
      let headers = H(getState);
      if (file) {
        const fd = new FormData();
        Object.entries(body).forEach(([k, v]) => {
          if (v != null) fd.append(k, v);
        });
        fd.append("media", file);
        body = fd;
        headers = { ...headers, "Content-Type": "multipart/form-data" };
      }
      const { data } = await axios.post(`${API}/messages/send`, body, {
        headers,
      });
      return {
        conversationId: String(data.data.conversationId || conversationId),
        message: data.data,
      };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to send"));
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "msg/deleteMessage",
  async ({ messageId, conversationId }, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${API}/messages/${messageId}`, {
        headers: H(getState),
      });
      return { messageId, conversationId: String(conversationId) };
    } catch (e) {
      return rejectWithValue(err(e, "Failed to delete"));
    }
  }
);

const initial = {
  conversations: [],
  messages: {},
  loading: {},
  error: null,
};

const msgSlice = createSlice({
  name: "msg",
  initialState: initial,
  reducers: {
    clearMsgError: (s) => {
      s.error = null;
    },
    receiveSocketMessage: (s, a) => {
      const payload = a.payload || {};
      const cid = String(payload.conversationId || "");
      const message = payload.message;
      if (!cid || !message) return;

      if (!s.messages[cid]) s.messages[cid] = [];
      const exists = s.messages[cid].find(
        (m) => String(m._id) === String(message._id)
      );
      if (!exists) s.messages[cid].push(message);

      const preview = message.text || (message.media ? "📷 Media" : "");
      const alreadyInList = s.conversations.some((c) => String(c._id) === cid);

      if (alreadyInList) {
        s.conversations = s.conversations.map((c) =>
          String(c._id) === cid
            ? {
                ...c,
                lastMessage: {
                  text: preview,
                  senderId: message.senderId,
                  createdAt: message.createdAt,
                  mediaType: message.mediaType,
                },
                lastMessageAt: message.createdAt,
                unreadCount: (c.unreadCount || 0) + 1,
              }
            : c
        );
      } else {
        s.conversations = [
          {
            _id: cid,
            participant: {
              userId: message.senderId,
              userType: message.senderType,
              name: message.senderName || "Chat",
              phone: "",
            },
            lastMessage: {
              text: preview,
              senderId: message.senderId,
              createdAt: message.createdAt,
              mediaType: message.mediaType,
            },
            lastMessageAt: message.createdAt,
            unreadCount: 1,
          },
          ...s.conversations,
        ];
      }
    },
    clearUnread: (s, a) => {
      const cid = String(a.payload);
      s.conversations = s.conversations.map((c) =>
        String(c._id) === cid ? { ...c, unreadCount: 0 } : c
      );
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchConversations.fulfilled, (s, a) => {
      s.conversations = a.payload || [];
    })
      .addCase(getOrCreateConversation.fulfilled, (s, a) => {
        const exists = s.conversations.find(
          (c) => String(c._id) === String(a.payload._id)
        );
        if (!exists) s.conversations = [a.payload, ...s.conversations];
      })
      .addCase(fetchMessages.fulfilled, (s, a) => {
        s.messages[String(a.payload.conversationId)] = a.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        const { conversationId, message } = a.payload;
        const cid = String(conversationId);
        if (!s.messages[cid]) s.messages[cid] = [];
        const exists = s.messages[cid].find(
          (m) => String(m._id) === String(message._id)
        );
        if (!exists) s.messages[cid].push(message);

        s.conversations = s.conversations.map((c) =>
          String(c._id) === cid
            ? {
                ...c,
                lastMessage: {
                  text: message.text || (message.media ? "📷 Media" : ""),
                  createdAt: message.createdAt,
                  mediaType: message.mediaType,
                  senderId: message.senderId,
                },
                lastMessageAt: message.createdAt,
              }
            : c
        );
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.error = a.payload;
      })
      .addCase(deleteMessage.fulfilled, (s, a) => {
        const { messageId, conversationId } = a.payload;
        const cid = String(conversationId);
        if (s.messages[cid]) {
          s.messages[cid] = s.messages[cid].map((m) =>
            String(m._id) === String(messageId)
              ? {
                  ...m,
                  isDeleted: true,
                  text: "This message was deleted",
                  media: "",
                }
              : m
          );
        }
      });
  },
});

export const { clearMsgError, receiveSocketMessage, clearUnread } =
  msgSlice.actions;

export const selectConversations = (s) => s.msg.conversations;
export const selectMessages = (id) => (s) => s.msg.messages[String(id)] || [];

/* ✅ Sum of unread messages across every conversation — used by the
   FeedScreen chat badge so it animates in real time as socket
   `newMessage` events arrive. */
export const selectTotalUnreadMessages = (s) =>
  (s.msg.conversations || []).reduce(
    (sum, c) => sum + (Number(c.unreadCount) || 0),
    0
  );

export default msgSlice.reducer;