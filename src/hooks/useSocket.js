import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../services/socket";
import { receiveSocketMessage } from "../features/social/messagesSlice";
import {
  pushRealtimeNotification,
  fetchNotifications,
} from "../features/social/socialSlice";
import { patchPostInLists } from "../features/ads/adsSlice";

export function useSocket() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const userId = user?.id || user?._id;
  const socketRef = useRef(null);
  const notifRefreshRef = useRef(0);

  useEffect(() => {
    if (!userId) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
      return undefined;
    }

    console.log("[socket:hook] connecting as", userId);
    const socket = connectSocket(userId);
    socketRef.current = socket;

    const refreshNotifications = (reason) => {
      const now = Date.now();
      if (now - notifRefreshRef.current < 3000) return;
      notifRefreshRef.current = now;
      console.log("[socket:hook] refresh notif (", reason, ")");
      dispatch(fetchNotifications({ page: 1 }));
    };

    const handleConnect = () => {
      console.log("[socket:hook] connected:", socket.id);
      socket.emit("joinUserRoom", String(userId));
      socket.emit("setOnline", String(userId));
    };
    const handleDisconnect = (reason) =>
      console.log("[socket:hook] disconnected:", reason);

    /* ✅ A new message arrives:
       - push it into the conversation + count (messagesSlice)
       - refresh the notification bell too (backend also creates a
         `message` notification) */
    const handleNewMessage = (p) => {
      console.log("[socket:hook] newMessage", p?.conversationId);
      dispatch(receiveSocketMessage(p));
      refreshNotifications("newMessage");
    };

    const handleNewNotification = (n) => {
      console.log("[socket:hook] newNotification", n);
      dispatch(pushRealtimeNotification(n));
    };
    const handlePostLiked = (p) => {
      dispatch(
        patchPostInLists({
          id: String(p.postId),
          patch: { likedByMe: p.liked, likesCount: p.likesCount },
        })
      );
      refreshNotifications("postLiked");
    };
    const handlePostSaved = (p) => {
      dispatch(
        patchPostInLists({
          id: String(p.postId),
          patch: { savedByMe: p.saved, savesCount: p.savesCount },
        })
      );
    };
    const handleNewComment = () => refreshNotifications("newComment");
    const handleNewFollower = () => refreshNotifications("newFollower");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("newMessage", handleNewMessage);
    socket.on("newNotification", handleNewNotification);
    socket.on("postLiked", handlePostLiked);
    socket.on("postSaved", handlePostSaved);
    socket.on("newComment", handleNewComment);
    socket.on("newFollower", handleNewFollower);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newMessage", handleNewMessage);
      socket.off("newNotification", handleNewNotification);
      socket.off("postLiked", handlePostLiked);
      socket.off("postSaved", handlePostSaved);
      socket.off("newComment", handleNewComment);
      socket.off("newFollower", handleNewFollower);
    };
  }, [userId, dispatch]);

  return socketRef.current;
}