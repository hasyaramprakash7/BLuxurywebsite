import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

import {
  fetchMyStories,
  viewStory,
  reactToStory,
  selectActiveStories,
  selectMyStories,
} from "../../features/social/storiesSlice";
import { toFullUrl, avatarInitial, asId, isFileUrl } from "../../utils/media";

export function StoriesBar() {
  const dispatch = useDispatch();
  const groups = useSelector(selectActiveStories);
  const mine = useSelector(selectMyStories);
  const [open, setOpen] = useState(null);

  console.log("[Stories] bar", { groups: groups.length, mine: mine.length });

  useEffect(() => {
    if (!mine.length) dispatch(fetchMyStories());
  }, [dispatch, mine.length]);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto px-3 py-3 border-b border-gray-800">
        <Link
          to="/create?story=1"
          className="flex flex-col items-center min-w-[64px]"
        >
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center bg-gray-800">
            <FaPlus className="text-white" />
          </div>
          <span className="text-[10px] text-white mt-1">Your story</span>
        </Link>

        {groups.map((g) => {
          const av = toFullUrl(g.userAvatar);
          return (
            <button
              key={asId(g.userId)}
              onClick={() => setOpen(g)}
              className="flex flex-col items-center min-w-[64px]"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  g.hasUnseen
                    ? "bg-gradient-to-tr from-yellow-400 to-green-500"
                    : "bg-gray-700"
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                  {av ? (
                    <img
                      src={av}
                      alt={g.userName}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {avatarInitial(g.userName)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-white mt-1 truncate max-w-[64px]">
                {g.userName}
              </span>
            </button>
          );
        })}
      </div>

      {open && <StoryViewer group={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function StoryViewer({ group, onClose }) {
  const dispatch = useDispatch();
  const [idx, setIdx] = useState(0);
  const story = group.stories[idx];

  useEffect(() => {
    if (story) dispatch(viewStory(story._id));
  }, [dispatch, story]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (idx < group.stories.length - 1) setIdx(idx + 1);
      else onClose();
    }, 6000);
    return () => clearTimeout(t);
  }, [idx, group.stories.length, onClose]);

  if (!story) return null;

  const storyMedia = toFullUrl(story.media);
  const avatarUrl = toFullUrl(group.userAvatar);
  const canRender = storyMedia && !isFileUrl(storyMedia);

  const onTap = (e) => {
    const x = e.nativeEvent.offsetX;
    const w = e.currentTarget.clientWidth;
    if (x < w / 3) setIdx(Math.max(0, idx - 1));
    else setIdx(Math.min(group.stories.length - 1, idx + 1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 inset-x-0 p-3 z-10 flex gap-1">
        {group.stories.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-0.5 ${
              i <= idx ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
            {avatarInitial(group.userName)}
          </div>
        )}
        <span className="text-white text-sm font-semibold">
          {group.userName}
        </span>
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white text-3xl"
      >
        ×
      </button>

      <div
        onClick={onTap}
        className="w-full h-full flex items-center justify-center"
      >
        {story.mediaType === "video" && canRender ? (
          <video
            src={storyMedia}
            autoPlay
            playsInline
            className="max-h-full max-w-full"
          />
        ) : canRender ? (
          <img
            src={storyMedia}
            alt=""
            className="max-h-full max-w-full object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="text-gray-500 text-sm">No media</div>
        )}
      </div>

      {story.caption && (
        <div className="absolute bottom-16 inset-x-0 text-center text-white p-3">
          {story.caption}
        </div>
      )}
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3 text-2xl">
        {["❤️", "🔥", "😂", "😮"].map((e) => (
          <button
            key={e}
            onClick={() => dispatch(reactToStory({ id: story._id, emoji: e }))}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StoriesBar;