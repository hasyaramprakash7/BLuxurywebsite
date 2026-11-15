import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaMapMarkedAlt,
  FaBell,
  FaCommentDots,
  FaRedo,
} from "react-icons/fa";

import PostCard from "./PostCard";
import StoriesBar from "./StoryViewer";

import {
  fetchFeed,
  selectFeed,
  selectAdsLoading,
  resetFeed,
} from "../../features/ads/adsSlice";
import { fetchActiveStories } from "../../features/social/storiesSlice";
import {
  fetchNotifications,
  selectUnreadCount,
} from "../../features/social/socialSlice";
import {
  fetchConversations,
  selectTotalUnreadMessages,
} from "../../features/social/messagesSlice";
import { fetchUserProfile } from "../../features/user/authSlice";
import { toFullUrl, asId, avatarInitial } from "../../utils/media";

export default function FeedScreen() {
  const dispatch = useDispatch();
  const feed = useSelector(selectFeed);
  const loading = useSelector(selectAdsLoading("feed"));
  const unreadNotifs = useSelector(selectUnreadCount);
  const unreadMsgs = useSelector(selectTotalUnreadMessages);
  const me = useSelector((s) => s.auth.user);
  const sentinel = useRef(null);
  const inFlight = useRef(false);

  const meId = asId(me?.id || me?._id);
  const myName =
    (me?.name && String(me.name).trim()) ||
    (me?.shopName && String(me.shopName).trim()) ||
    (me?.username && String(me.username).trim()) ||
    "User";
  const myInitial = avatarInitial(myName);

  const [freshAvatar, setFreshAvatar] = useState("");
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    if (!meId) return undefined;
    let cancelled = false;
    dispatch(fetchUserProfile());
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`/api/ads/profile/${meId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const fresh =
          data?.data?.avatar ||
          data?.data?.user?.avatar ||
          data?.data?.user?.profilePic ||
          "";
        if (!cancelled && fresh) setFreshAvatar(fresh);
      } catch (e) {
        if (!cancelled)
          console.warn("[Feed] avatar fetch failed:", e?.response?.status);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, meId]);

  const rawAvatar =
    freshAvatar || me?.profilePic || me?.avatar || me?.profileImage || "";
  const avatarUrl = toFullUrl(rawAvatar);

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  const showAvatarImg = !!avatarUrl && !avatarBroken;

  const loadFirstPage = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    dispatch(fetchFeed({ page: 1 })).finally(() => {
      inFlight.current = false;
    });
  }, [dispatch]);

  useEffect(() => {
    loadFirstPage();
    dispatch(fetchActiveStories());
    if (meId) {
      dispatch(fetchNotifications({ page: 1 }));
      dispatch(fetchConversations());
    }
  }, [dispatch, loadFirstPage, meId]);

  useEffect(() => {
    if (!sentinel.current || feed.error || feed.items.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          feed.hasMore &&
          !loading &&
          !inFlight.current
        ) {
          inFlight.current = true;
          dispatch(fetchFeed({ page: feed.page + 1 })).finally(() => {
            inFlight.current = false;
          });
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [dispatch, feed.page, feed.hasMore, feed.items.length, feed.error, loading]);

  const handleRetry = () => {
    dispatch(resetFeed());
    loadFirstPage();
  };

  return (
    <div className="w-full bg-black min-h-screen pb-24">
      {/* Header — full width */}
      <header className="sticky top-0 z-30 bg-black border-b border-gray-800 flex items-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 gap-3 sm:gap-4">
        <Link
          to="/feed"
          className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent"
        >
          BLuxury
        </Link>

        <div className="ml-auto flex items-center gap-3 sm:gap-4 md:gap-5 text-white text-lg sm:text-xl">
          <Link to="/discover" aria-label="Search">
            <FaSearch />
          </Link>
          <Link to="/map" aria-label="Map">
            <FaMapMarkedAlt />
          </Link>
          <Link to="/messages" className="relative" aria-label="Messages">
            <FaCommentDots />
            {unreadMsgs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadMsgs > 99 ? "99+" : unreadMsgs}
              </span>
            )}
          </Link>
          <Link to="/notifications" className="relative" aria-label="Notifications">
            <FaBell />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifs > 99 ? "99+" : unreadNotifs}
              </span>
            )}
          </Link>
          {me && meId ? (
            <Link to={`/profile/${meId}`} aria-label="Profile" className="flex-shrink-0">
              {showAvatarImg ? (
                <img
                  key={avatarUrl}
                  src={avatarUrl}
                  alt={myName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-gray-800 border border-green-500"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-green-700 to-green-400 text-white font-bold flex items-center justify-center text-sm border border-green-500">
                  {myInitial}
                </div>
              )}
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-green-500">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <StoriesBar />

      {feed.error && feed.items.length === 0 && (
        <div className="text-center p-5 sm:p-6 m-3 sm:m-4 rounded-xl bg-red-500/10 border border-red-500/40">
          <p className="text-red-400 font-semibold mb-1 text-sm sm:text-base">
            Couldn't load your feed
          </p>
          <p className="text-red-300 text-xs break-words mb-4">{feed.error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-500 text-white font-semibold inline-flex items-center gap-2 text-sm"
          >
            <FaRedo /> Retry
          </button>
        </div>
      )}

      {!feed.error && feed.items.length === 0 && !loading && (
        <div className="text-center text-gray-400 p-8 text-sm sm:text-base">
          No posts yet.{" "}
          {me ? (
            <Link className="text-green-500 underline" to="/create">
              Create one
            </Link>
          ) : (
            <Link className="text-green-500 underline" to="/login">
              Sign in to post
            </Link>
          )}
          .
        </div>
      )}

      {/* PostCard list — cards stay readable width on desktop but container is full width */}
      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto">
        {feed.items.map((p) => (
          <PostCard key={p._id} post={p} />
        ))}
      </div>

      <div ref={sentinel} />

      {loading && (
        <div className="text-center text-gray-400 py-4 text-sm">Loading…</div>
      )}

      {!feed.error && !feed.hasMore && feed.items.length > 0 && (
        <div className="text-center text-gray-500 py-6 text-sm">
          You're all caught up.
        </div>
      )}

      <Link
        to={me ? "/create" : "/login"}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-green-800 to-green-500 text-white flex items-center justify-center shadow-lg text-xl sm:text-2xl"
        aria-label="Create post"
      >
        <FaPlus />
      </Link>
    </div>
  );
}