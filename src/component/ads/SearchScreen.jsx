import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

import {
  searchAll,
  searchIdentities,
  searchHashtags,
  fetchTrendingHashtags,
  resetSearch,
} from "../../features/ads/adsSlice";
import { toFullUrl, avatarInitial, asId } from "../../utils/media";

const useDebounce = (v, ms = 350) => {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
};

export default function SearchScreen() {
  const dispatch = useDispatch();
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const [tab, setTab] = useState("all");

  const s = useSelector((s) => s.ads.search);
  const hashtags = useSelector((s) => s.ads.trendingHashtags);
  const identities = useSelector((s) => s.ads.identitySearch);

  console.log("[Search] render", {
    q: dq,
    tab,
    users: s.users.length,
    vendors: s.vendors.length,
    posts: s.posts.length,
    hashtags: s.hashtags.length,
    trending: hashtags.length,
    identities: identities.length,
  });

  useEffect(() => {
    dispatch(fetchTrendingHashtags({ limit: 12 }));
  }, [dispatch]);

  useEffect(() => {
    if (!dq.trim()) {
      dispatch(resetSearch());
      return;
    }
    if (tab === "all") dispatch(searchAll({ q: dq }));
    else if (tab === "people") dispatch(searchIdentities({ q: dq }));
    else if (tab === "hashtags") dispatch(searchHashtags({ q: dq }));
  }, [dispatch, dq, tab]);

  return (
    <div className="max-w-2xl mx-auto bg-black text-white min-h-screen">
      <header className="sticky top-0 z-30 bg-black px-3 py-2 border-b border-gray-800 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-900 rounded-full px-3 py-2">
          <FaSearch className="text-gray-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, people, hashtags…"
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
        <Link to={-1} className="text-sm text-green-500">
          Cancel
        </Link>
      </header>

      <div className="flex border-b border-gray-800">
        {["all", "people", "hashtags"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold uppercase ${
              tab === t
                ? "text-white border-b-2 border-white"
                : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {!dq.trim() && (
        <section className="p-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">
            Trending hashtags
          </h2>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <Link
                key={h.tag}
                to={`/hashtag/${h.tag}`}
                className="px-3 py-1 rounded-full bg-gray-800 text-sm"
              >
                #{h.tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {tab === "people" && (
        <ul>
          {identities.map((u) => {
            const av = toFullUrl(u.avatar);
            return (
              <li key={u._id}>
                <Link
                  to={`/profile/${asId(u._id)}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-800"
                >
                  {av ? (
                    <img
                      src={av}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover bg-gray-800"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                      {avatarInitial(u.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-gray-400">
                      @{(u.username || u.type || "").toLowerCase()}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "hashtags" && (
        <ul>
          {s.hashtags.map((h) => (
            <li key={h.tag}>
              <Link
                to={`/hashtag/${h.tag}`}
                className="block px-4 py-3 border-b border-gray-800"
              >
                <p className="font-semibold">#{h.tag}</p>
                <p className="text-xs text-gray-400">{h.postsCount} posts</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {tab === "all" && (
        <>
          {s.users.length + s.vendors.length > 0 && (
            <section className="px-4 py-3">
              <h2 className="text-xs uppercase text-gray-500 mb-2">People</h2>
              <ul>
                {[...s.users, ...s.vendors].map((u) => {
                  const av = toFullUrl(u.avatar);
                  return (
                    <li key={u._id}>
                      <Link
                        to={`/profile/${asId(u._id)}`}
                        className="flex items-center gap-3 py-2"
                      >
                        {av ? (
                          <img
                            src={av}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover bg-gray-800"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                            {avatarInitial(u.name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold">{u.name}</p>
                          <p className="text-xs text-gray-500">
                            @{(u.username || u.type || "").toLowerCase()}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {s.posts.length > 0 && (
            <section className="p-1">
              <h2 className="text-xs uppercase text-gray-500 px-3 mb-1">
                Posts
              </h2>
              <div className="grid grid-cols-3 gap-1">
                {s.posts.map((p) => {
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
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
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
            </section>
          )}

          {s.hashtags.length > 0 && (
            <section className="px-4 py-3">
              <h2 className="text-xs uppercase text-gray-500 mb-2">
                Hashtags
              </h2>
              <div className="flex flex-wrap gap-2">
                {s.hashtags.map((h) => (
                  <Link
                    key={h.tag}
                    to={`/hashtag/${h.tag}`}
                    className="px-3 py-1 rounded-full bg-gray-800 text-sm"
                  >
                    #{h.tag}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}