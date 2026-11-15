import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaRedo } from "react-icons/fa";

import {
  fetchNotifications,
  markNotificationsRead,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  clearNotificationsError,
} from "../../features/social/socialSlice";
import { toFullUrl, avatarInitial, asId } from "../../utils/media";

const iconFor = (type) =>
  ({
    like: "❤️",
    comment: "💬",
    follow: "👤",
    follow_request: "👥",
    mention: "@",
    tag: "🏷",
    message: "✉️",
    story_view: "👁",
    story_reaction: "💫",
    share: "🔁",
    repost: "🔁",
    view: "👁",
    lead: "💼",
    call: "📞",
    whatsapp: "🟢",
  }[type] || "🔔");

const targetLink = (n) => {
  const adId = asId(n.adId);
  if (adId) return `/post/${adId}`;
  const storyId = asId(n.storyId);
  if (storyId) return `/post/${storyId}`;
  const convId = asId(n.conversationId);
  if (convId) return `/chat/${convId}`;
  return "/feed";
};

const describe = (n) => {
  switch (n.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "follow":
      return "started following you";
    case "follow_request":
      return "requested to follow you";
    case "message":
      return "sent you a message";
    case "share":
      return "shared your post";
    case "repost":
      return "reposted your post";
    case "story_reaction":
      return `reacted ${n.text || "❤️"} to your story`;
    case "story_view":
      return "viewed your story";
    case "mention":
      return "mentioned you";
    case "tag":
      return "tagged you";
    case "view":
      return "viewed your profile";
    case "lead":
      return "is interested in your post";
    case "call":
      return "called you";
    case "whatsapp":
      return "messaged you on WhatsApp";
    default:
      return n.type || "did something";
  }
};

const safeDate = (iso) => {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
};

export default function NotificationsScreen() {
  const dispatch = useDispatch();
  const items = useSelector(selectNotifications);
  const unread = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const me = useSelector((s) => s.auth.user);
  const meId = asId(me?.id || me?._id);

  console.log("[Notif] render", {
    items: items.length,
    unread,
    loading,
    error,
    meId,
  });

  useEffect(() => {
    if (!meId) {
      console.warn("[Notif] no auth — skipping fetch");
      return;
    }
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch, meId]);

  const handleRetry = () => {
    dispatch(clearNotificationsError());
    dispatch(fetchNotifications({ page: 1 }));
  };

  const handleMarkAllRead = async () => {
    const res = await dispatch(markNotificationsRead());
    if (res.meta.requestStatus === "rejected") {
      console.warn("[Notif] mark all read failed:", res.payload);
    }
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await dispatch(markNotificationsRead([n._id]));
    }
  };

  if (!meId) {
    return (
      <div className="max-w-2xl mx-auto bg-black text-white min-h-screen p-8 text-center">
        <p className="text-gray-400 mb-4">Sign in to see your notifications.</p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-500 text-white font-semibold"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-black text-white min-h-screen">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800 flex items-center">
        <h1 className="text-lg font-bold flex-1">
          Notifications
          {unread > 0 && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </h1>
        {unread > 0 && !loading && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-green-500 hover:text-green-400"
          >
            Mark all read
          </button>
        )}
      </header>

      {error && (
        <div className="m-4 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-center">
          <p className="text-red-400 font-semibold mb-1">
            Couldn't load notifications
          </p>
          <p className="text-red-300 text-xs break-words mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-500 text-white font-semibold inline-flex items-center gap-2"
          >
            <FaRedo /> Retry
          </button>
        </div>
      )}

      {loading && items.length === 0 && !error && (
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 bg-gray-800 rounded" />
                <div className="h-3 w-1/3 bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center p-10">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-300 font-semibold mb-1">
            No notifications yet
          </p>
          <p className="text-gray-500 text-sm">
            When someone likes, comments, or follows you, it'll show up here.
          </p>
        </div>
      )}

      <ul>
        {items.map((n) => {
          const av = toFullUrl(n.actorAvatar);
          return (
            <li key={n._id}>
              <Link
                to={targetLink(n)}
                onClick={() => handleItemClick(n)}
                className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-900 ${
                  n.isRead ? "" : "bg-gray-900/60"
                }`}
              >
                {av ? (
                  <img
                    src={av}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover bg-gray-800"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                    {n.actorName ? avatarInitial(n.actorName) : iconFor(n.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {n.actorName || "Someone"}
                    </span>{" "}
                    <span className="text-gray-300">{describe(n)}</span>
                  </p>
                  {n.type === "comment" && n.text && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      "{n.text}"
                    </p>
                  )}
                  <p className="text-[10px] text-gray-600 mt-1">
                    {safeDate(n.createdAt)}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}