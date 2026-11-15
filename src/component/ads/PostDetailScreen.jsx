import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHeart,
  FaRegHeart,
  FaTrash,
  FaPaperPlane,
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
} from "../../features/ads/adsSlice";
import { toFullUrl, asId, avatarInitial } from "../../utils/media";
import PostCard from "./PostCard";

export default function PostDetailScreen() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const post = useSelector(selectPost(id));
  const comments = useSelector(selectComments(id));
  const me = useSelector((s) => s.auth.user);
  const myId = asId(me?.id || me?._id);

  const [text, setText] = useState("");

  console.log("[PostDetail] render", {
    id,
    hasPost: !!post,
    comments: comments.length,
    myId,
  });

  useEffect(() => {
    dispatch(fetchPost(id));
    dispatch(fetchComments({ id }));
    dispatch(trackView({ id, meta: { source: "explore" } }));
  }, [dispatch, id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await dispatch(addComment({ id, text: text.trim() }));
    if (res.meta.requestStatus === "fulfilled") setText("");
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
    <div className="max-w-2xl mx-auto bg-black text-white min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <Link to={-1} className="text-2xl">
          ‹
        </Link>
        <h1 className="text-lg font-bold">Post</h1>
      </header>

      <PostCard post={post} compact />

      <section id="comments" className="px-3 py-3 border-t border-gray-800">
        <h2 className="text-sm text-gray-400 mb-3">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h2>

        <div className="space-y-4">
          {comments.map((c) => {
            const av = toFullUrl(c.userAvatar);
            const commenterId = asId(c.userId);
            const canDelete = myId && (myId === commenterId || isOwner);

            return (
              <div key={c._id} className="flex items-start gap-2">
                {av ? (
                  <img
                    src={av}
                    alt={c.userName || "user"}
                    className="w-8 h-8 rounded-full object-cover bg-gray-800 flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatarInitial(c.userName)}
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

      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-black border-t border-gray-800 p-2 flex gap-2 items-center"
      >
        {myId ? (
          <>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 p-2 bg-gray-900 rounded-lg border border-gray-700 text-white outline-none focus:ring-2 focus:ring-green-500"
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
      </form>
    </div>
  );
}