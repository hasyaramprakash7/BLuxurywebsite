import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { fetchMapPins } from "../../features/ads/adsSlice";
import { toFullUrl } from "../../utils/media";

export default function MapScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pins, viewer } = useSelector((s) => s.ads.mapPins);
  const loading = useSelector((s) => !!s.ads.loading.map);
  const [open, setOpen] = useState(null);

  console.log("[Map] render", { pins: pins.length, loading, viewer });

  useEffect(() => {
    dispatch(
      fetchMapPins({
        ne_lat: 20.0,
        ne_lng: 88.0,
        sw_lat: 8.0,
        sw_lng: 68.0,
        limit: 50,
      })
    );
  }, [dispatch]);

  return (
    <div className="relative w-full h-screen bg-gray-950 text-white overflow-hidden">
      <header className="absolute top-0 inset-x-0 z-20 bg-black/70 backdrop-blur px-4 py-3 flex items-center">
        <h1 className="text-lg font-bold flex-1">Map</h1>
        <span className="text-xs text-gray-400">{pins.length} pins</span>
      </header>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <FaSpinner className="animate-spin text-3xl text-green-500" />
        </div>
      )}

      <div className="absolute inset-0 p-4 pt-16 grid grid-cols-4 auto-rows-[120px] gap-2 overflow-auto">
        {pins.map((pin) => {
          const thumb = toFullUrl(pin.thumb);
          return (
            <button
              key={pin._id}
              onClick={() => setOpen(pin)}
              className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700"
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  {pin.mediaType === "video" ? "video" : "no image"}
                </div>
              )}
              {pin.clusterCount > 1 && (
                <span className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px]">
                  ×{pin.clusterCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 flex items-end"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white text-black w-full rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const thumb = toFullUrl(open.thumb);
              return thumb ? (
                <img
                  src={thumb}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg mb-3"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null;
            })()}
            <p className="text-sm text-gray-500">
              {open.placeName ||
                `${Number(open.lat).toFixed(3)}, ${Number(open.lng).toFixed(3)}`}
            </p>
            <p className="font-bold text-lg">{open.owner?.name}</p>
            {open.title && <p className="text-sm">{open.title}</p>}
            <div className="flex gap-2 mt-3">
              <button
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-500 text-white font-semibold"
                onClick={() => navigate(`/post/${open._id}`)}
              >
                Open
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-gray-100 font-semibold"
                onClick={() => setOpen(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}