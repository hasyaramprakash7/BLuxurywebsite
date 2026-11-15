import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaSpinner, FaTimes, FaVideo, FaImage, FaCheck, FaCloudUploadAlt, FaMapMarkerAlt,
} from "react-icons/fa";
import {
  createPost, updatePost, fetchPost, selectPost, clearAdsError,
} from "../../features/ads/adsSlice";
import { toFullUrl } from "../../utils/media";

const LOG = "[CreatePostScreen]";
const MAX_VIDEO_MB = 100;
const MAX_IMAGE_MB = 15;

const fmtBytes = (n) => {
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

function extractFrameAt(videoEl, timeSec) {
  return new Promise((resolve) => {
    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 720;
        canvas.height = videoEl.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(null);
          resolve({ blob, url: URL.createObjectURL(blob), time: timeSec });
        }, "image/jpeg", 0.85);
      } catch { resolve(null); }
    };
    videoEl.addEventListener("seeked", onSeeked, { once: true });
    try { videoEl.currentTime = Math.max(0.1, Math.min(timeSec, videoEl.duration - 0.1)); }
    catch { resolve(null); }
  });
}

async function extractVideoFrames(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto"; video.muted = true; video.playsInline = true;
    const url = URL.createObjectURL(file); video.src = url;
    video.onloadedmetadata = async () => {
      try {
        const dur = video.duration || 1;
        const f1 = await extractFrameAt(video, Math.max(0.1, dur * 0.1));
        const f2 = await extractFrameAt(video, Math.max(0.2, dur * 0.5));
        URL.revokeObjectURL(url);
        const frames = [f1, f2].filter(Boolean);
        if (!frames.length) return reject(new Error("Could not extract frames"));
        resolve(frames);
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video")); };
  });
}

function makeSmallThumb(blob, size = 120) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale; const h = img.height * scale;
        const x = (size - w) / 2; const y = (size - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        canvas.toBlob((smallBlob) => {
          URL.revokeObjectURL(url);
          if (!smallBlob) return reject(new Error("Failed to make thumb"));
          resolve(smallBlob);
        }, "image/jpeg", 0.7);
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function ThumbnailPicker({ frames, selectedUrl, onSelect, customUrl, onCustomPick, onClearCustom }) {
  const customInput = useRef(null);
  return (
    <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-xs font-semibold uppercase tracking-wide">Pick a thumbnail</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {frames.map((frame, idx) => {
          const isSelected = selectedUrl === frame.url;
          return (
            <button key={idx} type="button" onClick={() => onSelect(frame.url)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-black border-2 transition ${isSelected ? "border-green-500 ring-2 ring-green-500/30" : "border-gray-700 hover:border-gray-500"}`}>
              <img src={frame.url} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
              {isSelected && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"><FaCheck size={10} /></span>}
              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded">{frame.time.toFixed(1)}s</span>
            </button>
          );
        })}
        <button type="button" onClick={() => customInput.current?.click()}
          className={`relative aspect-square rounded-lg overflow-hidden bg-black border-2 transition ${customUrl ? "border-green-500 ring-2 ring-green-500/30" : "border-dashed border-gray-600 hover:border-gray-400"}`}>
          {customUrl ? (
            <><img src={customUrl} alt="Custom" className="w-full h-full object-cover" /><span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"><FaCheck size={10} /></span></>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-1"><FaCloudUploadAlt size={18} /><span className="text-[9px]">Upload</span></div>
          )}
        </button>
      </div>
      <input ref={customInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onCustomPick(f); }} />
      {customUrl && <button type="button" onClick={onClearCustom} className="mt-2 text-[11px] text-red-400 hover:text-red-300">Remove custom thumbnail</button>}
    </div>
  );
}

export default function CreatePostScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const existing = useSelector(selectPost(editId));
  const loading = useSelector((s) => !!s.ads.loading.createPost || !!s.ads.loading.updatePost);
  const error = useSelector((s) => s.ads.error);

  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [mediaPreview, setMediaPreview] = useState("");

  const [frames, setFrames] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [selectedFrameUrl, setSelectedFrameUrl] = useState("");
  const [customPosterFile, setCustomPosterFile] = useState(null);
  const [customPosterUrl, setCustomPosterUrl] = useState("");
  const [smallThumbBlob, setSmallThumbBlob] = useState(null);

  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "", tags: "", postKind: "post", link: "", placeName: "", latitude: "", longitude: "" });

  useEffect(() => {
    console.log(LOG, "MOUNTING - Clearing old errors");
    dispatch(clearAdsError());
  }, [dispatch]);

  useEffect(() => { if (!isEdit || !editId) return; dispatch(fetchPost(editId)); }, [dispatch, editId, isEdit]);

  useEffect(() => {
    if (!isEdit || !existing) return;
    setForm({
      title: existing.title || "",
      description: existing.description || "",
      category: existing.category || "",
      tags: (existing.tags || []).join(", "),
      postKind: existing.postKind || "post",
      link: existing.link || "",
      placeName: existing.location?.name || "",
      latitude: existing.location?.latitude?.toString() || "",
      longitude: existing.location?.longitude?.toString() || "",
    });
    const existingMedia = existing.image || existing.thumbnail || "";
    if (existingMedia) {
      setMediaPreview(toFullUrl(existingMedia));
      setMediaType(existing.mediaType === "video" ? "video" : "image");
    }
  }, [isEdit, existing]);

  const handleMediaPick = useCallback(async (pickedFile) => {
    console.log(LOG, "MEDIA PICKED", { name: pickedFile.name, size: pickedFile.size, type: pickedFile.type });
    setLocalError("");
    const isVid = pickedFile.type.startsWith("video/");
    const maxMb = isVid ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (pickedFile.size > maxMb * 1024 * 1024) return setLocalError(`File too large. Max ${maxMb} MB.`);

    frames.forEach((f) => URL.revokeObjectURL(f.url));
    if (mediaPreview.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);

    setFrames([]); setSelectedFrameUrl(""); setSmallThumbBlob(null);
    setFile(pickedFile); setMediaType(isVid ? "video" : "image");
    setMediaPreview(URL.createObjectURL(pickedFile));

    if (!isVid) {
      try { setSmallThumbBlob(await makeSmallThumb(pickedFile, 120)); } catch {}
      return;
    }

    setExtracting(true);
    try {
      const extracted = await extractVideoFrames(pickedFile);
      setFrames(extracted);
      if (extracted[0]) {
        setSelectedFrameUrl(extracted[0].url);
        setSmallThumbBlob(await makeSmallThumb(extracted[0].blob, 120));
      }
    } catch { setLocalError("Could not extract frames. You can upload a custom thumbnail below."); }
    finally { setExtracting(false); }
  }, [frames, mediaPreview]);

  const handleSelectFrame = async (url) => {
    setSelectedFrameUrl(url); setCustomPosterUrl(""); setCustomPosterFile(null);
    const f = frames.find((x) => x.url === url);
    if (f) { try { setSmallThumbBlob(await makeSmallThumb(f.blob, 120)); } catch { setSmallThumbBlob(null); } }
  };

  const handleCustomPosterPick = async (f) => {
    if (customPosterUrl.startsWith("blob:")) URL.revokeObjectURL(customPosterUrl);
    setCustomPosterFile(f); setCustomPosterUrl(URL.createObjectURL(f)); setSelectedFrameUrl("");
    try { setSmallThumbBlob(await makeSmallThumb(f, 120)); } catch { setSmallThumbBlob(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLocalError("");
    if (!isEdit && !file) return setLocalError("Please select an image or video.");
    setBusy(true);

    try {
      console.log(LOG, "🚀 SUBMITTING POST");
      const fd = new FormData();

      if (file) {
        fd.append("media", file);
        fd.append("mediaType", mediaType);
      }

      if (mediaType === "video") {
        if (customPosterFile) {
          fd.append("poster", customPosterFile);
        } else {
          const chosen = frames.find((f) => f.url === selectedFrameUrl);
          if (chosen) fd.append("poster", new File([chosen.blob], "poster.jpg", { type: "image/jpeg" }));
        }
        if (smallThumbBlob) {
          fd.append("thumbSmall", new File([smallThumbBlob], "thumb-small.jpg", { type: "image/jpeg" }));
        }
      }

      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("postKind", form.postKind);
      fd.append("link", form.link);
      fd.append("isActive", "true");
      fd.append("isProductAd", "false");
      fd.append("tags", JSON.stringify(form.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)));
      fd.append("location", JSON.stringify({
        name: form.placeName,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      }));

      if (isEdit) {
        const res = await dispatch(updatePost({ id: editId, formData: fd })).unwrap();
        navigate(`/post/${res._id}`, { replace: true });
      } else {
        const res = await dispatch(createPost(fd)).unwrap();
        navigate(`/post/${res._id}`, { replace: true });
      }
    } catch (err) {
      console.error(LOG, "❌ SUBMIT ERROR:", err);
      setLocalError(typeof err === "string" ? err : "Failed to save post.");
    } finally { setBusy(false); }
  };

  const isVideo = mediaType === "video";
  const hasThumb = customPosterUrl || selectedFrameUrl;

  return (
    <div className="w-full bg-black text-white min-h-screen p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-lg sm:text-xl font-bold mb-4">{isEdit ? "Edit Post" : "New Post"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Media</label>
            {!mediaPreview ? (
              <label className="block w-full aspect-square rounded-2xl bg-gray-900 border-2 border-dashed border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition">
                <div className="flex gap-3 mb-2"><FaImage size={26} className="text-gray-500" /><FaVideo size={26} className="text-gray-500" /></div>
                <span className="text-sm text-gray-400">Tap to choose</span>
                <span className="text-[11px] text-gray-600 mt-1">Image up to {MAX_IMAGE_MB} MB · Video up to {MAX_VIDEO_MB} MB</span>
                <input type="file" accept="image/*,video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaPick(f); }} hidden />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800">
                {isVideo ? <video src={mediaPreview} controls playsInline className="w-full max-h-[60vh] object-contain bg-black" /> : <img src={mediaPreview} alt="preview" className="w-full max-h-[60vh] object-contain bg-black" />}
                {file && <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full">{isVideo ? "Video" : "Image"} · {fmtBytes(file.size)}</div>}
                <button type="button" onClick={() => { if (mediaPreview.startsWith("blob:")) URL.revokeObjectURL(mediaPreview); setFile(null); setMediaPreview(""); frames.forEach((f) => URL.revokeObjectURL(f.url)); setFrames([]); setSelectedFrameUrl(""); setCustomPosterFile(null); setCustomPosterUrl(""); setSmallThumbBlob(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center" aria-label="Remove media"><FaTimes /></button>
              </div>
            )}
          </div>

          {isVideo && file && (
            <div>
              {extracting && <div className="flex items-center gap-2 text-xs text-gray-400 mb-2"><FaSpinner className="animate-spin" size={12} />Extracting frames from video…</div>}
              {!extracting && (frames.length > 0 || customPosterUrl) && <ThumbnailPicker frames={frames} selectedUrl={selectedFrameUrl} onSelect={handleSelectFrame} customUrl={customPosterUrl} onCustomPick={handleCustomPosterPick} onClearCustom={() => { setCustomPosterFile(null); setCustomPosterUrl(""); if (frames[0]) setSelectedFrameUrl(frames[0].url); }} />}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Post type</label>
            <select value={form.postKind} onChange={(e) => setForm({ ...form, postKind: e.target.value })} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-sm">
              <option value="post">Post</option><option value="reel">Reel</option><option value="story">Story</option><option value="igtv">IGTV</option>
            </select>
          </div>
          <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Give it a title" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-sm" /></div>
          <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's this about? Use #hashtags" rows={3} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-sm resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Fashion" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-sm" /></div>
            <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Tags</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-sm" /></div>
          </div>
          <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Link (optional)</label><input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-sm" /></div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2 flex items-center gap-1"><FaMapMarkerAlt size={10} /> Location (optional)</p>
            <input value={form.placeName} onChange={(e) => setForm({ ...form, placeName: e.target.value })} placeholder="Place name" className="w-full p-2 mb-2 bg-black rounded-lg border border-gray-700 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Lat" className="w-full p-2 bg-black rounded-lg border border-gray-700 text-sm" />
              <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Lng" className="w-full p-2 bg-black rounded-lg border border-gray-700 text-sm" />
            </div>
          </div>
          {(localError || error) && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40">
              <p className="text-red-400 text-sm">{localError || String(error)}</p>
            </div>
          )}
          <button type="submit" disabled={busy || loading || (!isEdit && !file) || (isVideo && !hasThumb && frames.length > 0)} className="w-full py-3.5 rounded-lg font-semibold bg-gradient-to-r from-green-800 to-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {busy || loading ? <><FaSpinner className="animate-spin" />{isEdit ? "Saving…" : "Publishing…"}</> : isEdit ? "Save Changes" : "Publish Post"}
          </button>
          {isVideo && !isEdit && (
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              Video will publish immediately. HLS streaming is prepared in the background (~1 min) — viewers will see your poster while it processes.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}