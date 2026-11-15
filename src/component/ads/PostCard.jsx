import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
  FaBookmark,
  FaEllipsisH,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { toggleLike, toggleSave, trackShare } from "../../features/ads/adsSlice";
import { toFullUrl, asId, avatarInitial, logImg } from "../../utils/media";

const timeAgo = (iso) => {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const fmt = (n) => {
  if (n == null) return "0";
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
};

export default function PostCard({ post, compact = false }) {
  const dispatch = useDispatch();

  const vendorObj = typeof post?.vendorId === "object" ? post.vendorId : null;
  const userObj = typeof post?.userId === "object" ? post.userId : null;
  const owner = vendorObj || userObj || {};

  const ownerName =
    post?.vendorName ||
    owner.shopName ||
    post?.userName ||
    owner.name ||
    "Someone";

  /* ✅ Priority order matches what ProfileScreen uses:
       1) owner.profilePic — live from populated User/Vendor
       2) owner.avatar     — live from populated User/Vendor
       3) post.userAvatar  — stale snapshot on Ad (fallback only)
       4) owner.logo       — live Vendor field
       5) owner.shopImage  — live Vendor field
     This guarantees PostCard shows the SAME image as ProfileScreen. */
  const avatarSource =
    owner.profilePic ||
    owner.avatar ||
    post?.userAvatar ||
    owner.logo ||
    owner.shopImage ||
    "";

  const avatarUrl = toFullUrl(avatarSource);
  const initial = avatarInitial(ownerName);

  const ownerId =
    asId(post?.ownerId) || asId(post?.vendorId) || asId(post?.userId) || "";

  const mediaRaw =
    post?.mediaType === "video"
      ? post.hlsUrl || post.video
      : post.image || post.thumbnail;
  const media = toFullUrl(mediaRaw);
  const poster = toFullUrl(post?.thumbnail);

  /* Same broken-URL detection as ProfileScreen */
  const [avatarBroken, setAvatarBroken] = useState(false);
  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  const showAvatar = !!avatarUrl && !avatarBroken;

  console.log("[PostCard] avatar:", {
    postId: post?._id,
    ownerId,
    ownerName,
    fromProfilePic: owner.profilePic ? "✓" : "—",
    fromOwnerAvatar: owner.avatar ? "✓" : "—",
    fromPostUserAvatar: post?.userAvatar ? "✓" : "—",
    chosenSource: avatarSource ? avatarSource.slice(0, 60) + "…" : "(none)",
    avatarUrl,
    showAvatar,
  });

  if (!post) return null;

  const handleLike = (e) => {
    e.preventDefault();
    dispatch(toggleLike(post._id));
  };
  const handleSave = (e) => {
    e.preventDefault();
    dispatch(toggleSave({ id: post._id }));
  };
  const handleShare = (e) => {
    e.preventDefault();
    dispatch(trackShare({ id: post._id, shareType: "copy" }));
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) navigator.share({ url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
  };

  let mediaEl;
  if (!media) {
    mediaEl = (
      <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
        No media
      </div>
    );
  } else if (post.mediaType === "video" && post.video) {
    mediaEl = (
      <video
        src={toFullUrl(post.video)}
        poster={poster || undefined}
        controls
        playsInline
        className="w-full aspect-square object-cover bg-black"
        onError={(e) =>
          console.warn("[img:error] video", toFullUrl(post.video))
        }
      />
    );
  } else {
    logImg("PostCard", media);
    mediaEl = (
      <img
        src={media}
        alt={post.title || ""}
        className="w-full aspect-square object-cover bg-black"
        loading="lazy"
        onError={(e) => {
          console.warn("[img:error] PostCard", media);
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <article className="bg-black border-b border-gray-800 pb-3">
      <header className="flex items-center px-3 py-2">
        <Link
          to={ownerId ? `/profile/${ownerId}` : "/feed"}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          {showAvatar ? (
            <img
              src={avatarUrl}
              alt={ownerName}
              className="w-9 h-9 rounded-full object-cover bg-gray-800 flex-shrink-0"
              onError={(e) => {
                console.warn(
                  "[img:error] PostCard avatar",
                  avatarUrl,
                  "(source:",
                  avatarSource.slice(0, 60) + ")"
                );
                setAvatarBroken(true);
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white font-bold flex-shrink-0">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {ownerName}
            </p>
            {post.location?.name && (
              <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                <FaMapMarkerAlt size={10} /> {post.location.name}
              </p>
            )}
          </div>
        </Link>
        <button className="text-gray-400 hover:text-white">
          <FaEllipsisH />
        </button>
      </header>

      <Link to={`/post/${post._id}`}>{mediaEl}</Link>

      <div className="px-3 pt-2 flex items-center gap-4 text-white text-xl">
        <button onClick={handleLike} className="hover:opacity-80">
          {post.likedByMe ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart />
          )}
        </button>
        <Link to={`/post/${post._id}#comments`} className="hover:opacity-80">
          <FaRegComment />
        </Link>
        <button onClick={handleShare} className="hover:opacity-80">
          <FaRegPaperPlane />
        </button>
        <button onClick={handleSave} className="ml-auto hover:opacity-80">
          {post.savedByMe ? (
            <FaBookmark className="text-green-500" />
          ) : (
            <FaRegBookmark />
          )}
        </button>
      </div>

      <div className="px-3 pt-1">
        <p className="text-white text-sm font-semibold">
          {fmt(post.likesCount)} likes
        </p>
        {post.title && (
          <p className="text-white text-sm mt-1">
            <span className="font-semibold">{ownerName}</span> {post.title}
          </p>
        )}
        {!compact && post.description && (
          <p className="text-gray-300 text-sm mt-1 line-clamp-2">
            {post.description}
          </p>
        )}
        {post.commentsCount > 0 && (
          <Link
            to={`/post/${post._id}#comments`}
            className="text-gray-400 text-xs mt-1 inline-block"
          >
            View all {post.commentsCount} comments
          </Link>
        )}
        <p className="text-gray-500 text-[10px] uppercase mt-1">
          {timeAgo(post.createdAt)} ago
        </p>
      </div>
    </article>
  );
}