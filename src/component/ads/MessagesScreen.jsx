import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchConversations,
  selectConversations,
} from "../../features/social/messagesSlice";
import { toFullUrl, avatarInitial, asId } from "../../utils/media";

const timeAgo = (iso) => {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default function MessagesScreen() {
  const dispatch = useDispatch();
  const conversations = useSelector(selectConversations);

  console.log("[Messages] render", { conversations: conversations.length });

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto bg-black text-white min-h-screen">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800 flex items-center">
        <h1 className="text-lg font-bold flex-1">Messages</h1>
        <Link to="/discover" className="text-sm text-green-500">
          New chat
        </Link>
      </header>

      {conversations.length === 0 && (
        <p className="text-center text-gray-500 p-8">No conversations yet.</p>
      )}

      <ul>
        {conversations.map((c) => {
          const av = toFullUrl(c.participant?.avatar);
          const name = c.participant?.name || "Chat";
          const otherId = asId(c.participant?.userId);
          return (
            <li key={c._id}>
              <Link
                to={`/chat/${c._id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-900"
              >
                {av ? (
                  <img
                    src={av}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-800"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                    {avatarInitial(name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {c.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">
                    {timeAgo(c.lastMessageAt)}
                  </p>
                  {c.unreadCount > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-green-500 text-black font-bold">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}