import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHashtagPosts } from "../../features/ads/adsSlice";
import { toFullUrl } from "../../utils/media";

export default function HashtagPostsScreen() {
  const { tag } = useParams();
  const dispatch = useDispatch();
  const posts = useSelector((s) => s.ads.hashtagPosts[tag] || []);

  console.log("[Hashtag] render", { tag, posts: posts.length });

  useEffect(() => {
    if (tag) dispatch(fetchHashtagPosts({ tag }));
  }, [dispatch, tag]);

  return (
    <div className="max-w-4xl mx-auto bg-black text-white min-h-screen">
      <header className="sticky top-0 z-30 bg-black px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <Link to={-1} className="text-2xl leading-none">
          ‹
        </Link>
        <h1 className="text-lg font-bold">#{tag}</h1>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No posts for #{tag} yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.map((p) => {
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
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                    no image
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}