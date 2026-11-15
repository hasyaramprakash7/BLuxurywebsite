import React from "react";

/* Initials-only avatar. Ignores all image URLs.
   Palette index is derived from `id` so each user gets a stable color. */

const PALETTE = [
  "from-green-700 to-green-400",
  "from-emerald-700 to-emerald-400",
  "from-teal-700 to-teal-400",
  "from-amber-600 to-amber-400",
  "from-orange-600 to-orange-400",
  "from-rose-600 to-rose-400",
  "from-purple-700 to-purple-400",
  "from-indigo-700 to-indigo-400",
  "from-cyan-700 to-cyan-400",
  "from-pink-700 to-pink-400",
];

const hashString = (s) => {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const initialOf = (name) => {
  const s = String(name || "").trim();
  if (!s) return "?";
  return s[0].toUpperCase();
};

export default function Avatar({
  name = "",
  id = "",
  size = 32,
  border = false,
  className = "",
}) {
  const initial = initialOf(name);
  const idx = hashString(id || name) % PALETTE.length;
  const gradient = PALETTE[idx];

  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.42)),
      }}
      className={`rounded-full bg-gradient-to-br ${gradient} text-white font-bold flex items-center justify-center flex-shrink-0 select-none ${
        border ? "border border-green-500" : ""
      } ${className}`}
      aria-label={name || "User"}
    >
      {initial}
    </div>
  );
}