import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";

import {
  fetchMessages,
  sendMessage,
  fetchConversations,
  selectMessages,
  clearUnread,
} from "../../features/social/messagesSlice";
import {
  getSocket,
  joinConversation,
  leaveConversation,
  emitTyping,
  emitStopTyping,
} from "../../services/socket";
import { toFullUrl, asId, avatarInitial, isFileUrl } from "../../utils/media";
import { pickImage, resolvePreview } from "../../utils/pickFile";

export default function ChatScreen() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const cid = String(conversationId);

  const messages = useSelector(selectMessages(cid));
  const me = useSelector((s) => s.auth.user);
  const conversations = useSelector((s) => s.msg.conversations);
  const conv = conversations.find((c) => String(c._id) === cid);

  const myId = asId(me?.id || me?._id);

  const other = useMemo(() => {
    if (conv?.participant) return conv.participant;
    const firstOther = messages.find((m) => asId(m.senderId) !== myId);
    if (!firstOther) return null;
    return {
      userId: asId(firstOther.senderId),
      name: firstOther.senderName || "Chat",
      avatar: firstOther.senderAvatar || "",
    };
  }, [conv, messages, myId]);

  const otherAvatar = toFullUrl(other?.avatar);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  console.log("[Chat] render", {
    cid,
    messages: messages.length,
    myId,
    with: other?.name,
    otherAvatar,
  });

  useEffect(() => {
    dispatch(fetchMessages({ conversationId: cid }));
    dispatch(clearUnread(cid));
    if (conversations.length === 0) dispatch(fetchConversations());
  }, [dispatch, cid]);

  useEffect(() => {
    joinConversation(cid);
    const socket = getSocket();
    const onTyping = (data) => {
      if (String(data?.conversationId) !== cid) return;
      if (String(data?.userId) === myId) return;
      setOtherTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setOtherTyping(false), 2500);
    };
    const onStop = (data) => {
      if (String(data?.conversationId) !== cid) return;
      setOtherTyping(false);
    };
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStop);
    return () => {
      leaveConversation(cid);
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStop);
      clearTimeout(typingTimer.current);
    };
  }, [cid, myId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handlePickFile = async () => {
    try {
      const f = await pickImage();
      if (!f) return;
      console.log("[Chat] file picked:", f.name, f.size, f.type);
      setFile(f);
      setPreview(resolvePreview(f));
    } catch (e) {
      console.warn("[Chat] pick failed:", e);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    if (other?.userId) {
      emitStopTyping({
        conversationId: cid,
        userId: myId,
        receiverId: asId(other.userId),
      });
    }
    const res = await dispatch(
      sendMessage({ conversationId: cid, text: text.trim(), file })
    );
    console.log("[Chat] send:", res.meta.requestStatus, res.payload);
    if (res.meta.requestStatus === "fulfilled") {
      setText("");
      clearFile();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-black text-white min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <Link to="/messages" className="text-2xl">
          ‹
        </Link>
        {otherAvatar ? (
          <img
            src={otherAvatar}
            alt={other?.name}
            className="w-8 h-8 rounded-full object-cover bg-gray-800"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white text-sm font-bold">
            {avatarInitial(other?.name)}
          </div>
        )}
        <span className="font-semibold flex-1">{other?.name || "Chat"}</span>
        {otherTyping && <span className="text-xs text-green-500">typing…</span>}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const mine = asId(m.senderId) === myId;
          const avatarForMsg = toFullUrl(m.senderAvatar);
          const rawMedia = m.media || "";
          const canShow = rawMedia && !isFileUrl(rawMedia);
          const mediaUrl = canShow ? toFullUrl(rawMedia) : "";

          return (
            <div
              key={m._id}
              className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine &&
                (avatarForMsg ? (
                  <img
                    src={avatarForMsg}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 bg-gray-800"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatarInitial(m.senderName || other?.name)}
                  </div>
                ))}

              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                  mine ? "bg-green-600" : "bg-gray-800"
                }`}
              >
                {m.isDeleted ? (
                  <p className="italic text-gray-300 text-sm">{m.text}</p>
                ) : (
                  <>
                    {mediaUrl && m.mediaType === "image" && (
                      <img
                        src={mediaUrl}
                        alt=""
                        className="rounded-lg mb-1 max-h-64"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    {mediaUrl && m.mediaType === "video" && (
                      <video
                        src={mediaUrl}
                        controls
                        className="rounded-lg mb-1 max-h-64"
                      />
                    )}
                    {rawMedia && !canShow && (
                      <p className="text-xs italic text-gray-300">
                        📎 Attachment unavailable
                      </p>
                    )}
                    {m.text && (
                      <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {file && preview && (
        <div className="p-2 border-t border-gray-800 flex items-center gap-2 bg-gray-900">
          <img src={preview} alt="" className="w-12 h-12 rounded object-cover" />
          <span className="text-xs text-gray-300 flex-1 truncate">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </span>
          <button
            onClick={clearFile}
            className="text-red-400 text-sm font-semibold"
          >
            Remove
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handlePickFile}
          className="p-2 text-xl text-gray-400 hover:text-white"
          aria-label="Attach image"
        >
          <FaPaperclip />
        </button>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (other?.userId) {
              emitTyping({
                conversationId: cid,
                userId: myId,
                userName: me?.name,
                receiverId: asId(other.userId),
              });
            }
          }}
          placeholder="Message…"
          className="flex-1 p-2 bg-gray-900 rounded-full border border-gray-700 outline-none"
        />
        <button
          type="submit"
          className="p-2 text-green-500 text-xl disabled:opacity-50"
          disabled={!text.trim() && !file}
          aria-label="Send"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}