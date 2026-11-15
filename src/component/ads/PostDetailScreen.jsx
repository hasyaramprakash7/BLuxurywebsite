import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHeart,
  FaRegHeart,
  FaTrash,
  FaPaperPlane,
  FaEllipsisH,
  FaPen,
} from "react-icons/fa";

import {
  fetchPost,
  selectPost,
  fetchComments,
  selectComments,
  trackView,
  addComment,
  deleteComment,
  likeComment,
  deletePost,
} from "../../features/ads/adsSlice";
import { toFullUrl, asId, avatarInitial } from "../../utils/media";
import PostCard from "./PostCard";

/* Fallback gradient for the initial-only case */
const AVATAR_PALETTE = [
  "from-green-700 to-green-400",
  "from-emerald-700 to-emerald-400",
  "from-teal-700 to-teal-400",
  "from-amber-600 to-amber-400",
  "from-orange-600 to-orange-400",
  "from-rose-600 to-rose-400",
];
const hashString = (s) => {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export default function PostDetailScreen() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const post = useSelector(selectPost(id));
  const comments = useSelector(selectComments(id));
  const me = useSelector((s) => s.auth.user);
  const myId = asId(me?.id || me?._id);

  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  /* ✅ Track which comment avatars failed to load (per-comment) */
  const [brokenCommentAvatars, setBrokenCommentAvatars] = useState(
    () => new Set()
  );

  useEffect(() => {
    dispatch(fetchPost(id));
    dispatch(fetchComments({ id }));
    dispatch(trackView({ id, meta: { source: "explore" } }));
  }, [dispatch, id]);

  /* Redirect ?edit=1 → create/edit screen */
  useEffect(() => {
    if (searchParams.get("edit") === "1" && post) {
      navigate(`/create?edit=${id}`, { replace: true });
    }
  }, [searchParams, post, id, navigate]);

  /* Close the options menu when clicking outside */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [menuOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await dispatch(addComment({ id, text: text.trim() }));
    if (res.meta.requestStatus === "fulfilled") setText("");
  };

  const handleDeletePost = async () => {
    setMenuOpen(false);
    const confirmed = window.confirm(
      "Delete this post?\n\nThis cannot be undone."
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await dispatch(deletePost(id)).unwrap();
      navigate("/feed", { replace: true });
    } catch (err) {
      console.warn("[PostDetail] delete failed:", err);
      alert(typeof err === "string" ? err : "Failed to delete post.");
      setDeleting(false);
    }
  };

  /* ✅ Mark a comment avatar as broken so it falls back to initials */
  const markCommentBroken = (commentId) => {
    setBrokenCommentAvatars((prev) => {
      const next = new Set(prev);
      next.add(String(commentId));
      return next;
    });
  };

  if (!post) {
    return <div className="text-white text-center p-8">Loading…</div>;
  }

  const isOwner =
    myId &&
    (myId === asId(post.userId) ||
      myId === asId(post.vendorId) ||
      myId === asId(post.ownerId));

  return (
    <div
      className={`w-full bg-black text-white min-h-screen pb-24 ${
        deleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <header className="sticky top-0 z-30 bg-black px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-b border-gray-800 flex items-center gap-3">
        <Link to={-1} className="text-2xl">
          ‹
        </Link>
        <h1 className="text-base sm:text-lg font-bold flex-1">Post</h1>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-gray-400 hover:text-white p-1"
              aria-label="Post options"
            >
              <FaEllipsisH />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/create?edit=${id}`);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2"
                >
                  <FaPen size={12} /> Edit post
                </button>
                <button
                  onClick={handleDeletePost}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                >
                  <FaTrash size={12} /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto">
        <PostCard post={post} compact />

        <section
          id="comments"
          className="px-3 sm:px-4 md:px-6 py-3 border-t border-gray-800"
        >
          <h2 className="text-sm text-gray-400 mb-3">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h2>

          <div className="space-y-4">
            {comments.map((c) => {
              const commenterId = asId(c.userId);
              const canDelete = myId && (myId === commenterId || isOwner);
              const initial = avatarInitial(c.userName || "User");
              const gradient =
                AVATAR_PALETTE[hashString(commenterId) % AVATAR_PALETTE.length];

              /* ✅ Try the comment's avatar URL first */
              const rawCommentAvatar = c.userAvatar || "";
              const commentAvatarUrl = toFullUrl(rawCommentAvatar);
              const commentAvatarBroken = brokenCommentAvatars.has(
                String(c._id)
              );
              const showCommentAvatar =
                !!commentAvatarUrl && !commentAvatarBroken;

              return (
                <div key={c._id} className="flex items-start gap-2 sm:gap-3">
                  {/* ✅ Image if available, initial circle if broken/empty */}
                  {showCommentAvatar ? (
                    <img
                      src={commentAvatarUrl}
                      alt={c.userName || "User"}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-gray-800 flex-shrink-0"
                      onError={(e) => {
                        console.warn(
                          "[PostDetail] comment avatar 404:",
                          commentAvatarUrl,
                          "for comment",
                          c._id
                        );
                        markCommentBroken(c._id);
                      }}
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0`}
                    >
                      {initial}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm break-words">
                      <span className="font-semibold mr-1">
                        {c.userName || "Someone"}
                      </span>
                      {c.text}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <button
                        onClick={() =>
                          dispatch(likeComment({ id, commentId: c._id }))
                        }
                        className="flex items-center gap-1 hover:text-red-400"
                      >
                        {c.likedByMe ? (
                          <FaHeart className="text-red-500" size={11} />
                        ) : (
                          <FaRegHeart size={11} />
                        )}
                        <span>{c.likesCount || 0}</span>
                      </button>
                      {canDelete && (
                        <button
                          onClick={() =>
                            dispatch(deleteComment({ id, commentId: c._id }))
                          }
                          className="flex items-center gap-1 text-red-500 hover:text-red-400"
                        >
                          <FaTrash size={10} /> delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {comments.length === 0 && (
              <p className="text-sm text-gray-500">
                No comments yet — be the first.
              </p>
            )}
          </div>
        </section>
      </div>

      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 w-full bg-black border-t border-gray-800 p-2 sm:p-3 flex gap-2 items-center"
      >
        <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex gap-2 items-center">
          {myId ? (
            <>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 p-2 text-sm bg-gray-900 rounded-lg border border-gray-700 text-white outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="px-3 py-2 bg-gradient-to-r from-green-800 to-green-500 rounded-lg font-semibold disabled:opacity-50 text-white"
                aria-label="Send"
              >
                <FaPaperPlane />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              state={{ from: { pathname: `/post/${id}` } }}
              className="flex-1 text-center py-2 text-sm text-green-500 font-semibold"
            >
              Sign in to comment
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}