import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane,
  FaRegBookmark, FaBookmark, FaEllipsisH, FaMapMarkerAlt,
  FaTrash, FaPen, FaPlay, FaVolumeMute, FaVolumeUp, FaRedo,
} from "react-icons/fa";
import {
  toggleLike, toggleSave, trackShare, trackView, deletePost, fetchAdStatus,
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
   FeedVideo — lazy, poster-first playback
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

  useEffect(() => {
    setFirstFrameReady(false);
    setRatio(null);
    setBroken(false);
    setPaused(true);
    setNearViewport(false);
    setSlowNet(false);
    visibleRef.current = false;
    viewTrackedRef.current = false;
    if (metadataTimerRef.current) clearTimeout(metadataTimerRef.current);
  }, [src, poster, retryKey]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !nearViewport) {
        setNearViewport(true);
        io.disconnect();
        metadataTimerRef.current = setTimeout(() => {
          const v = videoRef.current;
          if (v && v.readyState < 1) setSlowNet(true);
        }, 8000);
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => {
      io.disconnect();
      if (metadataTimerRef.current) clearTimeout(metadataTimerRef.current);
    };
  }, [nearViewport, src, retryKey]);

  useEffect(() => {
    if (!nearViewport) return;
    const v = videoRef.current;
    if (v && v.readyState === 0) { try { v.load(); } catch {} }
  }, [nearViewport, src, retryKey]);

  useEffect(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v || broken) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      if (visible === visibleRef.current) return;
      visibleRef.current = visible;
      if (visible) { if (!userPausedRef.current) safePlay(); }
      else { safePause(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); if (v) v.pause(); playPromiseRef.current = null; };
  }, [broken, src, retryKey]);

  const safePlay = async () => {
    const v = videoRef.current;
    if (!v || broken || !v.paused || playPromiseRef.current) return;
    const desiredMuted = mutedRef.current;
    v.muted = true;
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
      if (err?.name !== "AbortError") console.warn("[FeedVideo] play failed:", err?.name);
    } finally { playPromiseRef.current = null; }
  };

  const safePause = () => {
    const v = videoRef.current;
    if (!v || v.paused) return;
    v.pause();
    setPaused(true);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    if (metadataTimerRef.current) clearTimeout(metadataTimerRef.current);
    setSlowNet(false);
    const r = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : null;
    if (r) setRatio(r);
    if (!poster) {
      try { if (v.currentTime === 0) v.currentTime = 0.05; } catch {}
    }
  };

  const handleRetry = (e) => {
    e.preventDefault(); e.stopPropagation();
    setBroken(false); setSlowNet(false); setFirstFrameReady(false);
    setRatio(null); setNearViewport(false);
    visibleRef.current = false; viewTrackedRef.current = false;
    setRetryKey((k) => k + 1);
  };

  if (broken) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 flex flex-col items-center justify-center text-gray-400 text-sm">
        {poster && <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url("${poster}")` }} />}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span>Video unavailable</span>
          <button onClick={handleRetry} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1">
            <FaRedo size={10} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (slowNet) {
    return (
      <div className="relative w-full bg-black overflow-hidden" style={{ aspectRatio: "9 / 16" }}>
        {poster && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${poster}")` }} />}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm z-10 bg-black/40">
          <span className="mb-2">Slow connection</span>
          <button onClick={handleRetry} className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold inline-flex items-center gap-1">
            <FaRedo size={10} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const wrapperStyle = ratio ? { aspectRatio: String(ratio) } : { aspectRatio: "9 / 16" };

  return (
    <div ref={wrapRef} className="relative w-full bg-black overflow-hidden" style={wrapperStyle}>
      {poster && (
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{ backgroundImage: `url("${poster}")`, opacity: firstFrameReady ? 0 : 1, zIndex: 0 }} />
      )}
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
        onLoadedData={() => setFirstFrameReady(true)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onError={() => setBroken(true)}
      />
      <button onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { userPausedRef.current = false; safePlay(); }
        else { userPausedRef.current = true; safePause(); }
      }} className="absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none" style={{ zIndex: 2 }}>
        {paused && (
          <span className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center text-white shadow-lg">
            <FaPlay className="ml-1" size={22} />
          </span>
        )}
      </button>
      <button onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        const v = videoRef.current;
        if (!v) return;
        const next = !mutedRef.current;
        mutedRef.current = next;
        v.muted = next;
        setMutedDisplay(next);
      }} className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center" style={{ zIndex: 3 }}>
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
    post?.vendorName || owner.shopName || post?.userName || owner.name || "Someone";

  const avatarSource =
    owner.profilePic || owner.avatar || post?.userAvatar || owner.logo || owner.shopImage || "";
  const avatarUrl = toFullUrl(avatarSource);
  const initial = avatarInitial(ownerName);

  const ownerId =
    asId(post?.ownerId) || asId(post?.vendorId) || asId(post?.userId) || "";
  const isOwner = !!myId && !!ownerId && myId === ownerId;

  const mediaRaw =
    post?.mediaType === "video"
      ? post.video || post.hlsUrl || ""
      : post.image || post.thumbnail || "";
  const media = toFullUrl(mediaRaw);
  const poster = toFullUrl(post?.thumbnail || post?.image || "");

  const [avatarBroken, setAvatarBroken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  /* ✅ Poll HLS status every 10s while processing */
  useEffect(() => {
    if (post?.hlsStatus !== "processing") return undefined;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const res = await dispatch(fetchAdStatus(post._id)).unwrap();
        if (res?.hlsStatus && res.hlsStatus !== "processing") return;
      } catch {}
      if (!stopped) setTimeout(tick, 10000);
    };
    const t = setTimeout(tick, 10000);
    return () => { stopped = true; clearTimeout(t); };
  }, [post?._id, post?.hlsStatus, dispatch]);

  useEffect(() => { setAvatarBroken(false); }, [avatarUrl]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
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

  const handleLike = (e) => { e.preventDefault(); dispatch(toggleLike(post._id)); };
  const handleSave = (e) => { e.preventDefault(); dispatch(toggleSave({ id: post._id })); };
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
      if (window.location.pathname.startsWith("/post/")) navigate("/feed", { replace: true });
    } catch (err) {
      alert(typeof err === "string" ? err : "Failed to delete post.");
    } finally { setDeleting(false); }
  };

  const isVideoPost = post.mediaType === "video";
  const isProcessing = isVideoPost && post.hlsStatus === "processing";
  const isFailed = isVideoPost && post.hlsStatus === "failed";
  const isReadyVideo = isVideoPost && !isProcessing && !isFailed && media;

  let mediaEl;
  if (isProcessing) {
    /* Poster + spinner overlay while ffmpeg runs on the worker */
    mediaEl = (
      <div className="relative w-full aspect-square bg-black">
        {poster && (
          <img src={poster} alt="" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs sm:text-sm gap-2 bg-black/30">
          <div className="w-9 h-9 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          <span className="font-medium">Processing video…</span>
          <span className="text-[10px] text-gray-300">HLS is being prepared (~1 min)</span>
        </div>
      </div>
    );
  } else if (isFailed) {
    mediaEl = (
      <div className="relative w-full aspect-square bg-black">
        {poster && <img src={poster} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs bg-black/50">
          Video processing failed
        </div>
      </div>
    );
  } else if (isReadyVideo) {
    mediaEl = (
      <FeedVideo
        src={media}
        poster={poster}
        onFirstPlay={() => dispatch(trackView({ id: post._id, meta: { source: "feed" } }))}
      />
    );
  } else if (media) {
    mediaEl = (
      <img
        src={media}
        alt={post.title || ""}
        className="w-full aspect-square object-cover bg-black"
        loading="lazy"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  } else {
    mediaEl = (
      <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
        No media
      </div>
    );
  }

  return (
    <article className={`bg-black border-b border-gray-800 pb-3 ${deleting ? "opacity-40 pointer-events-none" : ""}`}>
      <header className="flex items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5">
        <Link to={ownerId ? `/profile/${ownerId}` : "/feed"} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {showAvatar ? (
            <img src={avatarUrl} alt={ownerName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-gray-800 flex-shrink-0" onError={() => setAvatarBroken(true)} />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm sm:text-[15px] font-semibold truncate">{ownerName}</p>
            {post.location?.name && (
              <p className="text-xs sm:text-[13px] text-gray-400 flex items-center gap-1 truncate">
                <FaMapMarkerAlt size={10} /> {post.location.name}
              </p>
            )}
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((v) => !v)} className="text-gray-400 hover:text-white p-1" aria-label="Post options">
            <FaEllipsisH />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden">
              {isOwner && (
                <>
                  <button onClick={handleEdit} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2">
                    <FaPen size={12} /> Edit post
                  </button>
                  <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2">
                    <FaTrash size={12} /> Delete post
                  </button>
                  <div className="border-t border-gray-800" />
                </>
              )}
              <button onClick={() => { setMenuOpen(false); handleShare({ preventDefault: () => {} }); }}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2">
                <FaRegPaperPlane size={12} /> Copy link
              </button>
              <button onClick={() => { setMenuOpen(false); handleSave({ preventDefault: () => {} }); }}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 flex items-center gap-2">
                {post.savedByMe ? <><FaBookmark size={12} /> Unsave</> : <><FaRegBookmark size={12} /> Save</>}
              </button>
            </div>
          )}
        </div>
      </header>

      {isReadyVideo ? (
        <div className="relative">
          {mediaEl}
          <Link to={`/post/${post._id}`} className="absolute top-2 left-2 z-[3] text-[11px] px-2 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white">
            View post
          </Link>
        </div>
      ) : isProcessing || isFailed ? (
        <div className="relative">{mediaEl}</div>
      ) : (
        <Link to={`/post/${post._id}`}>{mediaEl}</Link>
      )}

      <div className="px-3 sm:px-4 md:px-5 pt-2 flex items-center gap-3 sm:gap-4 text-white text-lg sm:text-xl">
        <button onClick={handleLike} className="hover:opacity-80">
          {post.likedByMe ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
        </button>
        <Link to={`/post/${post._id}#comments`} className="hover:opacity-80"><FaRegComment /></Link>
        <button onClick={handleShare} className="hover:opacity-80"><FaRegPaperPlane /></button>
        <button onClick={handleSave} className="ml-auto hover:opacity-80">
          {post.savedByMe ? <FaBookmark className="text-green-500" /> : <FaRegBookmark />}
        </button>
      </div>

      <div className="px-3 sm:px-4 md:px-5 pt-1">
        <p className="text-white text-sm font-semibold">{fmt(post.likesCount)} likes</p>
        {post.title && (
          <p className="text-white text-sm mt-1">
            <span className="font-semibold">{ownerName}</span> {post.title}
          </p>
        )}
        {!compact && post.description && (
          <p className="text-gray-300 text-sm mt-1 line-clamp-2">{post.description}</p>
        )}
        {post.commentsCount > 0 && (
          <Link to={`/post/${post._id}#comments`} className="text-gray-400 text-xs mt-1 inline-block">
            View all {post.commentsCount} comments
          </Link>
        )}
        <p className="text-gray-500 text-[10px] uppercase mt-1">{timeAgo(post.createdAt)} ago</p>
      </div>
    </article>
  );
}