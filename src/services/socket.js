import { io } from "socket.io-client";

const ENV_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_SOCKET_URL) ||
  "";

console.log("[socket:service] env URL:", ENV_URL || "(none)");
console.log(
  "[socket:service] final URL:",
  ENV_URL || "(same origin via proxy)",
  "| origin:",
  typeof window !== "undefined" ? window.location.origin : "n/a"
);

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  socket = io(ENV_URL, {
    transports: ["polling", "websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    /* ✅ Removed withCredentials — you use Bearer tokens, not cookies.
       This means the browser no longer sends credentials:'include',
       which is what made it reject any Access-Control-Allow-Origin
       value it didn't like. Now the server's reflected origin works. */
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
    console.warn("[socket:service] connect_error:", e?.message, e?.description || "")
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