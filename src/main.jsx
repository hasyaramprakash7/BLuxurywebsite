import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/* ─────────────────────────────────────────────────────────────
   Kill any stale service worker from a previous CRA-PWA build.
   This runs BEFORE React mounts so no requests get intercepted
   with the old, broken SW during the session.
   ───────────────────────────────────────────────────────────── */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    console.log("[sw] unregistering stale service workers:", regs.length);
    regs.forEach((reg) => {
      reg.unregister().then((ok) => console.log("[sw] unregistered:", ok));
    });
  }).catch((e) => console.warn("[sw] unregister failed:", e));

  // Also clear all caches the old SW might have written
  if (window.caches?.keys) {
    caches.keys().then((keys) => {
      console.log("[sw] clearing caches:", keys);
      keys.forEach((k) => caches.delete(k));
    });
  }
}

createRoot(document.getElementById("root")).render(<App />);