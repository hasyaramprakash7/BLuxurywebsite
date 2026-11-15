import { io } from "socket.io-client";

const ENV_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_SOCKET_URL) ||
  "";

const isStale =
  /:5000(\b|\/|$)/.test(ENV_URL) || /localhost:5000/.test(ENV_URL);

if (ENV_URL) {
  console.log("[socket:service] VITE_SOCKET_URL =", ENV_URL);
}
if (isStale) {
  console.warn(
    "[socket:service] IGNORING VITE_SOCKET_URL (" + ENV_URL + "). Remove it from .env."
  );
}

const URL = isStale || !ENV_URL ? "" : ENV_URL;

console.log(
  "[socket:service] final URL:",
  URL || "(same origin via proxy)",
  "| origin:",
  typeof window !== "undefined" ? window.location.origin : "n/a"
);

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  socket = io(URL, {
    transports: ["polling", "websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    withCredentials: true,
  });

  socket.on("connect", () =>
    console.log(
      "[socket:service] connected:",
      socket.id,
      "transport:",
      socket.io.engine.transport.name
    )
  );
  socket.on("connect_error", (e) =>
    console.warn("[socket:service] connect_error:", e?.message)
  );
  socket.on("disconnect", (reason) =>
    console.log("[socket:service] disconnect:", reason)
  );

  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  if (userId) {
    const uid = String(userId);
    s.emit("joinUserRoom", uid);
    s.emit("setOnline", uid);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export const joinConversation = (conversationId) => {
  if (socket?.connected && conversationId) {
    socket.emit("joinConversation", String(conversationId));
  }
};

export const leaveConversation = (conversationId) => {
  if (socket?.connected && conversationId) {
    socket.emit("leaveConversation", String(conversationId));
  }
};

export const emitTyping = (data) => {
  if (socket?.connected) socket.emit("typing", data);
};

export const emitStopTyping = (data) => {
  if (socket?.connected) socket.emit("stopTyping", data);
};

export const emitMessageRead = (data) => {
  if (socket?.connected) socket.emit("messageRead", data);
};