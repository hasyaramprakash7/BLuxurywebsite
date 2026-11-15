import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchExplore,
  selectExplore,
  selectAdsLoading,
  fetchTrendingHashtags,
} from "../../features/ads/adsSlice";
import { toFullUrl } from "../../utils/media";

export default function ExploreScreen() {
  const dispatch = useDispatch();
  const explore = useSelector(selectExplore);
  const loading = useSelector(selectAdsLoading("explore"));
  const hashtags = useSelector((s) => s.ads.trendingHashtags);

  console.log("[Explore] render", {
    items: explore.items.length,
    loading,
    hashtags: hashtags.length,
  });

  useEffect(() => {
    dispatch(fetchExplore({ page: 1 }));
    dispatch(fetchTrendingHashtags({ limit: 12 }));
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Explore</h1>
      </header>

      {hashtags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-3 py-3 border-b border-gray-800">
          {hashtags.map((h) => (
            <Link
              key={h.tag}
              to={`/hashtag/${h.tag}`}
              className="px-3 py-1 rounded-full bg-gray-800 text-sm whitespace-nowrap"
            >
              #{h.tag}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 p-1">
        {explore.items.map((p) => {
          const src = toFullUrl(p.thumbnail || p.image || "");
          return (
            <Link
              key={p._id}
              to={`/post/${p._id}`}
              className="aspect-square bg-gray-900 overflow-hidden"
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
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  no image
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {loading && (
        <div className="text-center text-gray-400 py-6">Loading…</div>
      )}
    </div>
  );
}