import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaCamera } from "react-icons/fa";
import { createPost } from "../../features/ads/adsSlice";

export default function CreatePostScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => !!s.ads.loading.createPost);
  const error = useSelector((s) => s.ads.error);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", tags: "",
    postKind: "post", link: "",
    placeName: "", latitude: "", longitude: "",
  });

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const vid = f.type.startsWith("video/");
    setIsVideo(vid);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("media", file);
    fd.append("mediaType", isVideo ? "video" : "image");
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("postKind", form.postKind);
    fd.append("link", form.link);
    fd.append("isActive", "true");
    fd.append("isProductAd", "false");
    fd.append(
      "tags",
      JSON.stringify(form.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
    );
    fd.append("location", JSON.stringify({
      name: form.placeName,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
    }));

    const res = await dispatch(createPost(fd));
    if (res.meta.requestStatus === "fulfilled") {
      navigate(`/post/${res.payload._id}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-black min-h-screen text-white p-4">
      <h1 className="text-xl font-bold mb-4">New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block w-full aspect-square rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
          {preview ? (
            isVideo ? (
              <video src={preview} className="w-full h-full object-cover" controls />
            ) : (
              <img src={preview} className="w-full h-full object-cover" alt="" />
            )
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <FaCamera size={36} />
              <span className="mt-2 text-sm">Tap to choose media</span>
            </div>
          )}
          <input type="file" accept="image/*,video/*" onChange={onFile} hidden />
        </label>

        <select
          className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          value={form.postKind}
          onChange={(e) => setForm({ ...form, postKind: e.target.value })}
        >
          <option value="post">Post</option>
          <option value="reel">Reel</option>
          <option value="story">Story</option>
          <option value="igtv">IGTV</option>
        </select>

        <input placeholder="Title" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <textarea placeholder="Description (#hashtags work)" rows={3}
          className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <input placeholder="Category"
          className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

        <input placeholder="Tags (comma separated)"
          className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />

        <input placeholder="Link (optional)"
          className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />

        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Place name"
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
            value={form.placeName} onChange={(e) => setForm({ ...form, placeName: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Lat" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
              value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <input placeholder="Lng" className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
              value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading || !file}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-green-800 to-green-500 disabled:opacity-50 flex items-center justify-center">
          {loading ? <><FaSpinner className="animate-spin mr-2" /> Uploading…</> : "Publish"}
        </button>
      </form>
    </div>
  );
}