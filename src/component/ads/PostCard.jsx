import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
  FaBookmark,
  FaEllipsisH,
  FaMapMarkerAlt,
  FaTrash,
  FaPen,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
  FaRedo,
} from "react-icons/fa";
import {
  toggleLike,
  toggleSave,
  trackShare,
  trackView,
  deletePost,
} from "../../features/ads/adsSlice";
import { toFullUrl, asId, avatarInitial } from "../../utils/media";

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

/* ═══════════════════════════════════════════════════════════════════
   FeedVideo — FIRST-CHUNK-ONLY loading

   NETWORK BEHAVIOR:
     • Far from viewport (>400px)  → preload="none"    → 0 bytes
     • Near viewport (400px)       → preload="metadata" → ~2 KB (header only)
     • No poster → one seek to 0.05s → ~50 KB (first frame chunk)
     • Visible ≥60% → play() → streams next chunks lazily
     • Scroll past → pause() → downloads stop

   FALLBACK WHEN FIRST CHUNK FAILS:
     • Poster stays visible forever (no black screen)
     • After 8s without metadata → mark "slowNet" and show retry button
     • After onError → mark "broken", show "Unavailable"
     • User can tap Retry → calls video.load() again
   ═══════════════════════════════════════════════════════════════════ */
function FeedVideo({ src, poster, onFirstPlay }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);

  const [mutedDisplay, setMutedDisplay] = useState(true);
  const [paused, setPaused] = useState(true);
  const [broken, setBroken] = useState(false);
  const [ratio, setRatio] = useState(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [slowNet, setSlowNet] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const mutedRef = useRef(true);
  const userPausedRef = useRef(false);
  const viewTrackedRef = useRef(false);
  const visibleRef = useRef(false);
  const playPromiseRef = useRef(null);
  const metadataTimerRef = useRef(null);

  /* Mount / src change */
  useEffect(() => {
    console.log("[FeedVideo] MOUNT", {
      src: src?.slice(0, 90) + (src?.length > 90 ? "…" : ""),
      hasPoster: !!poster,
    });
    setFirstFrameReady(false);
    setRatio(null);
    setBroken(false);
    setPaused(true);
    setNearViewport(false);
    setSlowNet(false);
    visibleRef.current = false;
    viewTrackedRef.current = false;
    if (metadataTimerRef.current) {
      clearTimeout(metadataTimerRef.current);
      metadataTimerRef.current = null;
    }
  }, [src, poster, retryKey]);

  /* Near → auto metadata fetch */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !nearViewport) {
          console.log(
            "[FeedVideo] NEAR → preload metadata (~2KB)",
            src?.slice(0, 60)
          );
          setNearViewport(true);
          io.disconnect();

          /* Watchdog: if metadata doesn't arrive in 8s, flag slowNet */
          metadataTimerRef.current = setTimeout(() => {
            const v = videoRef.current;
            if (!v) return;
            if (v.readyState < 1) {
              console.warn(
                "[FeedVideo] slowNet — no metadata after 8s",
                src?.slice(0, 60)
              );
              setSlowNet(true);
            }
          }, 8000);
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (metadataTimerRef.current) {
        clearTimeout(metadataTimerRef.current);
        metadataTimerRef.current = null;
      }
    };
  }, [nearViewport, src, retryKey]);

  /* Force load() when preload flips none → metadata */
  useEffect(() => {
    if (!nearViewport) return;
    const v = videoRef.current;
    if (!v) return;
    if (v.readyState === 0) {
      try {
        v.load();
      } catch (e) {}
    }
  }, [nearViewport, src, retryKey]);

  /* Visibility observer — play/pause at 60% */
  useEffect(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v || broken) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        if (visible === visibleRef.current) return;
        visibleRef.current = visible;
        console.log(
          "[FeedVideo] VISIBILITY",
          visible ? "≥60% (play)" : "<60% (pause)",
          src?.slice(0, 60)
        );
        if (visible) {
          if (!userPausedRef.current) safePlay();
        } else {
          safePause();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (v) v.pause();
      playPromiseRef.current = null;
    };
  }, [broken, src, retryKey]);

  const safePlay = async () => {
    const v = videoRef.current;
    if (!v || broken) return;
    if (!v.paused) return;
    if (playPromiseRef.current) return;

    const desiredMuted = mutedRef.current;
    v.muted = true;
    console.log(
      "[FeedVideo] play() — streaming chunks",
      src?.slice(0, 60)
    );
    try {
      playPromiseRef.current = v.play();
      await playPromiseRef.current;
      if (!desiredMuted) v.muted = false;
      setPaused(false);
      if (!viewTrackedRef.current) {
        viewTrackedRef.current = true;
        onFirstPlay?.();
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.warn("[FeedVideo] play FAILED:", err?.name);
      }
    } finally {
      playPromiseRef.current = null;
    }
  };

  const safePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) return;
    v.pause();
    setPaused(true);
    console.log(
      "[FeedVideo] pause — download stops",
      src?.slice(0, 60)
    );
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    if (metadataTimerRef.current) {
      clearTimeout(metadataTimerRef.current);
      metadataTimerRef.current = null;
    }
    setSlowNet(false);
    const r =
      v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : null;
    console.log("[FeedVideo] metadata ready (~2KB fetched)", {
      ratio: r,
      duration: v.duration,
    });
    if (r) setRatio(r);
    if (!poster) {
      try {
        if (v.currentTime === 0) {
          v.currentTime = 0.05;
          console.log(
            "[FeedVideo] seek 0.05s → first-frame chunk (~50KB)"
          );
        }
      } catch (e) {}
    }
  };

  const handleLoadedData = () => {
    console.log("[FeedVideo] first frame painted", src?.slice(0, 60));
    setFirstFrameReady(true);
  };

  const handleCanPlay = () => {
    console.log(
      "[FeedVideo] canplay — smooth start guaranteed",
      src?.slice(0, 60)
    );
  };

  const handleWaiting = () => {
    console.log("[FeedVideo] buffering…", src?.slice(0, 60));
  };

  const handleError = () => {
    const v = videoRef.current;
    console.warn("[FeedVideo] ERROR", {
      src: src?.slice(0, 90),
      code: v?.error?.code,
      message: v?.error?.message,
    });
    if (metadataTimerRef.current) {
      clearTimeout(metadataTimerRef.current);
      metadataTimerRef.current = null;
    }
    setBroken(true);
  };

  const handleRetry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[FeedVideo] retry", src?.slice(0, 60));
    setBroken(false);
    setSlowNet(false);
    setFirstFrameReady(false);
    setRatio(null);
    setNearViewport(false);
    visibleRef.current = false;
    viewTrackedRef.current = false;
    setRetryKey((k) => k + 1);
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPausedRef.current = false;
      safePlay();
    } else {
      userPausedRef.current = true;
      safePause();
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const next = !mutedRef.current;
    mutedRef.current = next;
    v.muted = next;
    setMutedDisplay(next);
  };

  /* ─── BROKEN: video URL genuinely fails ─── */
  if (broken) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 flex flex-col items-center justify-center text-gray-400 text-sm">
        {poster && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url("${poster}")` }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span>Video unavailable</span>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1"
          >
            <FaRedo size={10} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── SLOW NET: metadata timed out ─── */
  if (slowNet) {
    return (
      <div
        className="relative w-full bg-black overflow-hidden"
        style={{ aspectRatio: "9 / 16" }}
      >
        {poster && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url("${poster}")` }}
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm z-10 bg-black/40">
          <span className="mb-2">Slow connection</span>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold inline-flex items-center gap-1"
          >
            <FaRedo size={10} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const wrapperStyle = ratio
    ? { aspectRatio: String(ratio) }
    : { aspectRatio: "9 / 16" };

  return (
    <div
      ref={wrapRef}
      className="relative w-full bg-black overflow-hidden"
      style={wrapperStyle}
    >
      {/* Poster — visible until first frame paints */}
      {poster && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-300"
          style={{
            backgroundImage: `url("${poster}")`,
            opacity: firstFrameReady ? 0 : 1,
            zIndex: 0,
          }}
        />
      )}

      {/* ✅ First-chunk-only loading:
            preload="none"     → 0 bytes when far from viewport
            preload="metadata" → ~2 KB when within 400px
            play()             → starts streaming from byte 0 */}
      <video
        key={retryKey}
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted
        preload={nearViewport ? "metadata" : "none"}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: firstFrameReady ? 1 : 0, zIndex: 1 }}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onError={handleError}
      />

      {/* Tap layer */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none"
        style={{ zIndex: 2 }}
        aria-label={paused ? "Play" : "Pause"}
      >
        {paused && (
          <span className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center text-white text-2xl shadow-lg">
            <FaPlay className="ml-1" size={22} />
          </span>
        )}
      </button>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center"
        style={{ zIndex: 3 }}
        aria-label={mutedDisplay ? "Unmute" : "Mute"}
      >
        {mutedDisplay ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PostCard
   ═══════════════════════════════════════════════════════════════════ */
export default function PostCard({ post, compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const me = useSelector((s) => s.auth.user);
  const myId = asId(me?.id || me?._id);

  const vendorObj = typeof post?.vendorId === "object" ? post.vendorId : null;
  const userObj = typeof post?.userId === "object" ? post.userId : null;
  const owner = vendorObj || userObj || {};

  const ownerName =
    post?.vendorName ||
    owner.shopName ||
    post?.userName ||
    owner.name ||
    "Someone";

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

  const isOwner = !!myId && !!ownerId && myId === ownerId;

  /* ✅ Prefer raw MP4 over HLS — Chrome/Edge/Android can't decode .m3u8 */
  const mediaRaw =
    post?.mediaType === "video"
      ? post.video || post.hlsUrl || ""
      : post.image || post.thumbnail || "";
  const media = toFullUrl(mediaRaw);
  const poster = toFullUrl(post?.thumbnail);

  console.log("[PostCard] render", {
    id: post?._id,
    mediaType: post?.mediaType,
    hasVideo: !!post?.video,
    hasHls: !!post?.hlsUrl,
    src: media ? media.slice(0, 80) + "…" : "(none)",
    poster: poster ? poster.slice(0, 60) + "…" : "(none)",
  });

  const [avatarBroken, setAvatarBroken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

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

  const showAvatar = !!avatarUrl && !avatarBroken;

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
  const handleEdit = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(`/post/${post._id}?edit=1`);
  };
  const handleDelete = async (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (!window.confirm("Delete this post?\n\nThis cannot be undone.")) return;
    setDeleting(true);
    try {
      await dispatch(deletePost(post._id)).unwrap();
      if (window.location.pathname.startsWith("/post/")) {
        navigate("/feed", { replace: true });
      }
    } catch (err) {
      console.warn("[PostCard] delete failed:", err);
      alert(typeof err === "string" ? err : "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  const isVideo =
    post.mediaType === "video" && (post.video || post.hlsUrl) && media;

  let mediaEl;
  if (!media) {
    mediaEl = (
      <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
        No media
      </div>
    );
  } else if (isVideo) {
    mediaEl = (
      <FeedVideo
        src={media}
        poster={poster}
        onFirstPlay={() =>
          dispatch(trackView({ id: post._id, meta: { source: "feed" } }))
        }
      />
    );
  } else {
    mediaEl = (
      <img
        src={media}
        alt={post.title || ""}
        className="w-full aspect-square object-cover bg-black"
        loading="lazy"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  }

  return (
    <article
      className={`bg-black border-b border-gray-800 pb-3 ${
        deleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <header className="flex items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5">
        <Link
          to={ownerId ? `/profile/${ownerId}` : "/feed"}
          className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
        >
          {showAvatar ? (
            <img
              src={avatarUrl}
              alt={ownerName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-gray-800 flex-shrink-0"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-white text-sm sm:text-[15px] font-semibold truncate">
              {ownerName}
            </p>
            {post.location?.name && (
              <p className="text-xs sm:text-[13px] text-gray-400 flex items-center gap-1 truncate">
                <FaMapMarkerAlt size={10} /> {post.location.name}
              </p>
            )}
          </div>
        </Link>

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
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2"
                  >
                    <FaPen size={12} /> Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <FaTrash size={12} /> Delete post
                  </button>
                  <div className="border-t border-gray-800" />
                </>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleShare({ preventDefault: () => {} });
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2"
              >
                <FaRegPaperPlane size={12} /> Copy link
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSave({ preventDefault: () => {} });
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2"
              >
                {post.savedByMe ? (
                  <>
                    <FaBookmark size={12} /> Unsave
                  </>
                ) : (
                  <>
                    <FaRegBookmark size={12} /> Save
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {isVideo ? (
        <div className="relative">
          {mediaEl}
          <Link
            to={`/post/${post._id}`}
            className="absolute top-2 left-2 z-[3] text-[11px] px-2 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white"
          >
            View post
          </Link>
        </div>
      ) : (
        <Link to={`/post/${post._id}`}>{mediaEl}</Link>
      )}

      <div className="px-3 sm:px-4 md:px-5 pt-2 flex items-center gap-3 sm:gap-4 text-white text-lg sm:text-xl">
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

      <div className="px-3 sm:px-4 md:px-5 pt-1">
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