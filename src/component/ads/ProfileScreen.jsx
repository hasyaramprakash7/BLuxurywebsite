import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaCog,
  FaUserPlus,
  FaUserCheck,
  FaSignOutAlt,
  FaPen,
  FaSpinner,
  FaCommentDots,
} from "react-icons/fa";

import {
  fetchProfile,
  toggleFollow,
  updateProfileStats,
  selectProfile,
  selectIsFollowing,
} from "../../features/social/socialSlice";
import {
  fetchUserPosts,
  fetchMyPosts,
  selectMyPosts,
} from "../../features/ads/adsSlice";
import {
  fetchHighlights,
  selectHighlights,
} from "../../features/social/storiesSlice";
import { getOrCreateConversation } from "../../features/social/messagesSlice";
import {
  logoutUser,
  updateUserProfile,
  fetchUserProfile,
} from "../../features/user/authSlice";
import { toFullUrl, asId, avatarInitial } from "../../utils/media";
import { pickImage, resolvePreview } from "../../utils/pickFile";

const isValidObjectId = (s) => /^[a-f0-9]{24}$/i.test(String(s || ""));

/* ─────────────────────────────────────────────────────────────
   GridTile — robust poster resolution
   - Tries thumbnailSmall → thumbnail → image in order.
   - Advances on onError until one loads.
   - Falls back to paused <video> seeked to 0.05s if all images fail.
   - Logs every URL to the console for debugging.
   ───────────────────────────────────────────────────────────── */
function GridTile({ post }) {
  /* Build deduped candidate list (priority: thumbnailSmall → thumbnail → image) */
  const candidates = useMemo(() => {
    const raw = [post?.thumbnailSmall, post?.thumbnail, post?.image].filter(
      Boolean
    );
    const urls = raw.map(toFullUrl).filter(Boolean);
    return [...new Set(urls)]; // dedupe (thumbnail & image are often the same URL)
  }, [post?.thumbnailSmall, post?.thumbnail, post?.image]);

  const [candidateIdx, setCandidateIdx] = useState(0);
  const posterRaw = candidates[candidateIdx] || "";

  const videoRaw = useMemo(
    () =>
      post?.mediaType === "video"
        ? toFullUrl(post.video || post.hlsUrl || "")
        : "",
    [post?.mediaType, post?.video, post?.hlsUrl]
  );

  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const showPoster = !!posterRaw;
  const canShowVideo = !showPoster && !!videoRaw && !videoError;

  /* 🔍 Debug log — check browser console after reload */
  useEffect(() => {
    console.log("[GridTile]", {
      id: post?._id,
      mediaType: post?.mediaType,
      hlsStatus: post?.hlsStatus,
      thumbnailSmall: post?.thumbnailSmall,
      thumbnail: post?.thumbnail,
      image: post?.image,
      video: post?.video,
      hlsUrl: post?.hlsUrl,
      candidates,
      usingIdx: candidateIdx,
      usingUrl: posterRaw,
    });
  }, [post?._id, post?.mediaType, candidates, candidateIdx, posterRaw]);

  /* Force paused video to paint its first frame */
  useEffect(() => {
    if (!canShowVideo) return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    const seek = () => {
      try {
        if (v.currentTime === 0) v.currentTime = 0.05;
      } catch (e) {}
    };
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });
    return () => v.removeEventListener("loadedmetadata", seek);
  }, [canShowVideo, videoRaw]);

  const handleImageError = () => {
    console.warn(`[GridTile] image failed (idx ${candidateIdx}):`, posterRaw);
    if (candidateIdx + 1 < candidates.length) {
      setCandidateIdx(candidateIdx + 1); // try next candidate
    } else {
      setCandidateIdx(candidates.length); // exhaust → posterRaw becomes ""
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-900">
      {showPoster && (
        <img
          src={posterRaw}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
      )}

      {canShowVideo && (
        <video
          ref={videoRef}
          src={videoRaw}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      )}

      {!showPoster && !canShowVideo && (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
          no image
        </div>
      )}

      {post?.mediaType === "video" && (
        <span className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded pointer-events-none">
          ▶
        </span>
      )}
    </div>
  );
}

function EditProfileModal({ profile, me, onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(profile?.name || me?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [phone, setPhone] = useState(profile?.phone || me?.phone || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handlePickAvatar = async () => {
    try {
      const f = await pickImage();
      if (!f) return;
      setAvatarFile(f);
      setAvatarPreview(resolvePreview(f));
    } catch (e) {
      console.warn("[EditProfile] pick failed:", e);
    }
  };

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      const uid = asId(me?.id || me?._id);
      const hasUserChanges =
        name.trim() !== (profile?.name || me?.name || "").trim() ||
        phone.trim() !== (profile?.phone || me?.phone || "").trim() ||
        !!avatarFile;

      if (hasUserChanges) {
        const fd = new FormData();
        if (name.trim()) fd.append("name", name.trim());
        if (phone.trim()) fd.append("phone", phone.trim());
        if (avatarFile) fd.append("profilePic", avatarFile);
        await dispatch(updateUserProfile(fd)).unwrap();
      }

      const statsPatch = { bio: bio.trim(), website: website.trim() };
      if (username.trim()) statsPatch.username = username.trim().toLowerCase();
      await dispatch(updateProfileStats(statsPatch)).unwrap();

      await Promise.all([
        dispatch(fetchUserProfile()),
        uid ? dispatch(fetchProfile(uid)) : Promise.resolve(),
      ]);
      onClose();
    } catch (e) {
      setErr(typeof e === "string" ? e : e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 text-black shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center mb-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover bg-gray-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white text-3xl font-bold">
              {avatarInitial(name)}
            </div>
          )}
          <button
            onClick={handlePickAvatar}
            className="mt-2 text-sm font-semibold text-green-700 hover:underline"
          >
            Change photo
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, ""))
              }
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {err && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {err}
          </p>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-gray-100 font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-500 text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileScreen() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const me = useSelector((s) => s.auth.user);
  const myPosts = useSelector(selectMyPosts);

  const myId = asId(me?.id || me?._id);
  const userId = asId(params?.userId);
  const validUserId = isValidObjectId(userId) ? userId : "";
  const isMe = !!myId && validUserId === myId;

  const profile = useSelector(selectProfile(validUserId || "none"));
  const isFollowing = useSelector(selectIsFollowing(validUserId || "none"));
  const userPosts = useSelector((s) => s.ads.userPosts[validUserId] || []);
  const highlights = useSelector(selectHighlights(validUserId || "none"));

  const [tab, setTab] = useState("grid");
  const [editOpen, setEditOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  useEffect(() => {
    if (!validUserId) return;
    dispatch(fetchProfile(validUserId));
    dispatch(fetchHighlights(validUserId));
    if (isMe) dispatch(fetchMyPosts());
    else dispatch(fetchUserPosts(validUserId));
  }, [dispatch, validUserId, isMe]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (e) {}
    navigate("/login", { replace: true });
  };

  const handleMessage = async () => {
    if (!myId) {
      navigate("/login", {
        state: { from: { pathname: `/profile/${validUserId}` } },
      });
      return;
    }
    if (!validUserId || validUserId === myId) return;
    setOpeningChat(true);
    try {
      const targetUserType = profile?.user?.type || "User";
      const res = await dispatch(
        getOrCreateConversation({
          targetUserId: validUserId,
          targetUserType,
        })
      ).unwrap();
      if (res?._id) navigate(`/chat/${res._id}`);
    } catch (e) {
      console.warn("[ProfileScreen] open chat failed:", e);
    } finally {
      setOpeningChat(false);
    }
  };

  if (!validUserId) {
    return (
      <div className="w-full bg-black text-white min-h-screen p-8 text-center">
        <p className="text-gray-400 mb-4">Profile not found.</p>
        <Link to="/feed" className="text-green-500 underline">
          Back to feed
        </Link>
      </div>
    );
  }

  if (!profile)
    return <div className="text-white text-center p-8">Loading…</div>;

  const posts = isMe ? myPosts : userPosts;
  const avatarUrl = toFullUrl(profile.avatar);
  const showAvatar = avatarUrl && !avatarBroken;
  const initial = avatarInitial(profile.shopName || profile.name);

  return (
    <div className="w-full bg-black min-h-screen text-white pb-20">
      <header className="sticky top-0 z-30 bg-black px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-b border-gray-800 flex items-center gap-2 sm:gap-3">
        <h1 className="text-base sm:text-lg font-bold flex-1 truncate">
          {profile.name}
        </h1>
        {isMe && (
          <>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1 text-xs sm:text-sm text-green-500 hover:text-green-400 font-semibold"
            >
              <FaPen size={11} /> Edit
            </button>
            <Link to="/settings" className="text-gray-300 hover:text-white">
              <FaCog className="text-lg sm:text-xl" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs sm:text-sm text-red-400 hover:text-red-300"
            >
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}
      </header>

      <section className="flex items-center gap-4 sm:gap-5 p-3 sm:p-4 md:p-5">
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={profile.name}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover bg-gray-800 flex-shrink-0"
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold flex-shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex gap-4 sm:gap-6 text-center">
            <div>
              <div className="font-bold text-sm sm:text-base">
                {profile.postsCount || 0}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">posts</div>
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                {profile.followersCount || 0}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">
                followers
              </div>
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                {profile.followingCount || 0}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">
                following
              </div>
            </div>
          </div>

          {!isMe && (
            <div className="mt-2 sm:mt-3 flex gap-2">
              <button
                onClick={() => dispatch(toggleFollow(validUserId))}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm ${
                  isFollowing
                    ? "bg-gray-800 text-white"
                    : "bg-gradient-to-r from-green-800 to-green-500 text-white"
                }`}
              >
                {isFollowing ? (
                  <>
                    <FaUserCheck className="inline mr-1" /> Following
                  </>
                ) : (
                  <>
                    <FaUserPlus className="inline mr-1" /> Follow
                  </>
                )}
              </button>
              <button
                onClick={handleMessage}
                disabled={openingChat}
                className="flex-1 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 inline-flex items-center justify-center gap-1"
              >
                {openingChat ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} /> Opening…
                  </>
                ) : (
                  <>
                    <FaCommentDots size={12} /> Message
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="px-3 sm:px-4 md:px-5 pb-3 text-xs sm:text-sm">
        <p className="font-semibold">{profile.shopName || profile.name}</p>
        {profile.username && (
          <p className="text-gray-400 text-[11px] sm:text-xs">
            @{profile.username}
          </p>
        )}
        {profile.bio && <p className="text-gray-300 mt-1">{profile.bio}</p>}
        {profile.website && (
          <a
            className="text-green-500 text-[11px] sm:text-xs"
            href={
              profile.website.startsWith("http")
                ? profile.website
                : `https://${profile.website}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {profile.website}
          </a>
        )}
      </section>

      {isMe && avatarBroken && (
        <div className="mx-3 sm:mx-4 mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-xs text-yellow-300">
          Your profile photo is unavailable. Tap <b>Edit</b> above to upload a
          new one.
        </div>
      )}

      {highlights?.length > 0 && (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-4 md:px-5 pb-3 border-b border-gray-800">
          {highlights.map((h) => {
            const cover = toFullUrl(h.coverImage);
            return (
              <div
                key={h._id}
                className="flex flex-col items-center flex-shrink-0"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-green-500 p-0.5 overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                      {avatarInitial(h.name)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] mt-1 truncate max-w-[60px] sm:max-w-[64px]">
                  {h.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setTab("grid")}
          className={`flex-1 py-2 text-xs font-semibold ${
            tab === "grid"
              ? "text-white border-b-2 border-white"
              : "text-gray-500"
          }`}
        >
          POSTS
        </button>
        <button
          onClick={() => setTab("reels")}
          className={`flex-1 py-2 text-xs font-semibold ${
            tab === "reels"
              ? "text-white border-b-2 border-white"
              : "text-gray-500"
          }`}
        >
          REELS
        </button>
      </div>

      {/* ✅ Grid now uses GridTile — thumbnails show correctly with fallbacks */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
        {posts.map((p) => (
          <Link
            key={p._id}
            to={`/post/${p._id}`}
            className="aspect-square bg-gray-900 overflow-hidden relative"
          >
            <GridTile post={p} />
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-10 text-sm">No posts yet.</p>
      )}

      {editOpen && (
        <EditProfileModal
          profile={profile}
          me={me}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}