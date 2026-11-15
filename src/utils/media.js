const LOG = "[media]";

const R2_BASE = (() => {
  try {
    if (import.meta?.env?.VITE_R2_PUBLIC_URL) {
      const v = import.meta.env.VITE_R2_PUBLIC_URL.replace(/\/$/, "");
      console.log(LOG, "R2 base:", v);
      return v;
    }
  } catch (e) {}
  try {
    if (process.env?.REACT_APP_R2_PUBLIC_URL) {
      const v = process.env.REACT_APP_R2_PUBLIC_URL.replace(/\/$/, "");
      console.log(LOG, "R2 base:", v);
      return v;
    }
  } catch (e) {}
  console.warn(
    LOG,
    "No R2 base (VITE_R2_PUBLIC_URL). Absolute https:// URLs work; bare keys will 404."
  );
  return "";
})();

export const toFullUrl = (u) => {
  if (!u || typeof u !== "string") return "";
  const s = u.trim();
  if (!s) return "";
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  if (s.startsWith("file://")) return s;
  if (!R2_BASE) return s;
  const out = `${R2_BASE}/${s.replace(/^\//, "")}`;
  console.log(LOG, "prefixed:", s, "→", out);
  return out;
};

export const isFileUrl = (u) =>
  typeof u === "string" && u.startsWith("file://");

export const asId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v._id) return String(v._id);
    if (typeof v.toString === "function") {
      const s = String(v);
      return s === "[object Object]" ? "" : s;
    }
  }
  return String(v);
};

export const avatarInitial = (name) =>
  String(name || "?").trim()[0]?.toUpperCase() || "?";

export const logImg = (tag, url) => {
  console.log(`[img:${tag}]`, url || "(none)");
};