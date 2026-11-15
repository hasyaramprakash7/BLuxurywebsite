import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaCog,
  FaUserPlus,
  FaUserCheck,
  FaSignOutAlt,
  FaPen,
  FaSpinner,
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
import {
  logoutUser,
  updateUserProfile,
  fetchUserProfile,
} from "../../features/user/authSlice";
import { toFullUrl, asId, avatarInitial } from "../../utils/media";
import { pickImage, resolvePreview } from "../../utils/pickFile";

const isValidObjectId = (s) => /^[a-f0-9]{24}$/i.test(String(s || ""));

function EditProfileModal({ profile, me, onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(profile?.name || me?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [phone, setPhone] = useState(profile?.phone || me?.phone || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    toFullUrl(profile?.avatar || me?.profilePic || "")
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handlePickAvatar = async () => {
    try {
      const f = await pickImage();
      if (!f) return;
      console.log("[EditProfile] avatar file:", f.name, f.size);
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
        console.log("[EditProfile] PUT /auth/update", {
          name: fd.get("name"),
          phone: fd.get("phone"),
          avatar: !!avatarFile,
        });
        await dispatch(updateUserProfile(fd)).unwrap();
      }

      const statsPatch = { bio: bio.trim(), website: website.trim() };
      if (username.trim()) statsPatch.username = username.trim().toLowerCase();
      console.log("[EditProfile] PUT /ads/profile/stats", statsPatch);
      await dispatch(updateProfileStats(statsPatch)).unwrap();

      await Promise.all([
        dispatch(fetchUserProfile()),
        uid ? dispatch(fetchProfile(uid)) : Promise.resolve(),
      ]);

      onClose();
    } catch (e) {
      console.error("[EditProfile] save failed:", e);
      setErr(
        typeof e === "string"
          ? e
          : e?.message || "Failed to save profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-6 text-black shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
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
              onError={(e) => (e.currentTarget.style.display = "none")}
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
  const rawUserId = params?.userId;
  const userId = asId(rawUserId);
  const validUserId = isValidObjectId(userId) ? userId : "";
  const isMe = !!myId && validUserId === myId;

  const profile = useSelector(selectProfile(validUserId || "none"));
  const isFollowing = useSelector(selectIsFollowing(validUserId || "none"));
  const userPosts = useSelector((s) => s.ads.userPosts[validUserId] || []);
  const highlights = useSelector(selectHighlights(validUserId || "none"));

  const [tab, setTab] = useState("grid");
  const [editOpen, setEditOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  console.log("[ProfileScreen]", {
    rawUserId,
    validUserId,
    myId,
    isMe,
    hasProfile: !!profile,
    posts: isMe ? myPosts.length : userPosts.length,
  });

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

  if (!validUserId) {
    return (
      <div className="max-w-2xl mx-auto bg-black text-white min-h-screen p-8 text-center">
        <p className="text-gray-400 mb-4">Profile not found.</p>
        <Link to="/feed" className="text-green-500 underline">
          Back to feed
        </Link>
      </div>
    );
  }

  if (!profile) return <div className="text-white text-center p-8">Loading…</div>;

  const posts = isMe ? myPosts : userPosts;
  const avatarUrl = toFullUrl(profile.avatar);
  const showAvatar = avatarUrl && !avatarBroken;
  const initial = avatarInitial(profile.shopName || profile.name);

  return (
    <div className="max-w-2xl mx-auto bg-black min-h-screen text-white pb-20">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <h1 className="text-lg font-bold flex-1 truncate">{profile.name}</h1>
        {isMe && (
          <>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1 text-sm text-green-500 hover:text-green-400 font-semibold"
            >
              <FaPen size={11} /> Edit
            </button>
            <Link to="/settings" className="text-gray-300 hover:text-white">
              <FaCog className="text-xl" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
            >
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}
      </header>

      <section className="flex items-center gap-5 p-4">
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover bg-gray-800"
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center text-white text-3xl font-bold">
            {initial}
          </div>
        )}
        <div className="flex-1">
          <div className="flex gap-6 text-center">
            <div>
              <div className="font-bold">{profile.postsCount || 0}</div>
              <div className="text-xs text-gray-400">posts</div>
            </div>
            <div>
              <div className="font-bold">{profile.followersCount || 0}</div>
              <div className="text-xs text-gray-400">followers</div>
            </div>
            <div>
              <div className="font-bold">{profile.followingCount || 0}</div>
              <div className="text-xs text-gray-400">following</div>
            </div>
          </div>
          {!isMe && (
            <button
              onClick={() => dispatch(toggleFollow(validUserId))}
              className={`mt-3 w-full py-2 rounded-lg font-semibold ${
                isFollowing
                  ? "bg-gray-800"
                  : "bg-gradient-to-r from-green-800 to-green-500"
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
          )}
        </div>
      </section>

      <section className="px-4 pb-3 text-sm">
        <p className="font-semibold">{profile.shopName || profile.name}</p>
        {profile.username && (
          <p className="text-gray-400 text-xs">@{profile.username}</p>
        )}
        {profile.bio && <p className="text-gray-300 mt-1">{profile.bio}</p>}
        {profile.website && (
          <a
            className="text-green-500 text-xs"
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
        <div className="mx-4 mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-xs text-yellow-300">
          Your profile photo is unavailable. Tap <b>Edit</b> above to upload a
          new one.
        </div>
      )}

      {highlights?.length > 0 && (
        <div className="flex gap-3 overflow-x-auto px-4 pb-3 border-b border-gray-800">
          {highlights.map((h) => {
            const cover = toFullUrl(h.coverImage);
            return (
              <div key={h._id} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-green-500 p-0.5 overflow-hidden">
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
                <span className="text-[10px] mt-1">{h.name}</span>
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

      <div className="grid grid-cols-3 gap-1 p-1">
        {posts.map((p) => {
          const src = toFullUrl(
            p.thumbnailSmall ||
              p.thumbnail ||
              p.image ||
              (p.mediaType === "video" ? p.video : "") ||
              ""
          );
          return (
            <Link
              key={p._id}
              to={`/post/${p._id}`}
              className="aspect-square bg-gray-900 overflow-hidden relative"
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                  {p.mediaType === "video" ? "video" : "no image"}
                </div>
              )}
              {p.mediaType === "video" && (
                <span className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
                  ▶
                </span>
              )}
            </Link>
          );
        })}
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