const isNative = () =>
  typeof window !== "undefined" &&
  !!window.Capacitor?.isNativePlatform?.();

const blobToFile = (blob, name) => {
  try {
    return new File([blob], name, { type: blob.type || "image/jpeg" });
  } catch (e) {
    blob.name = name;
    blob.lastModified = Date.now();
    return blob;
  }
};

export async function pickImage({ quality = 80 } = {}) {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import(
        "@capacitor/camera"
      );
      const photo = await Camera.getPhoto({
        quality,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });
      console.log("[pickImage] camera returned:", {
        format: photo.format,
        webPath: photo.webPath?.slice(0, 60) + "…",
      });
      if (!photo.webPath) throw new Error("Camera returned no webPath");
      const res = await fetch(photo.webPath);
      const blob = await res.blob();
      const ext = (photo.format || "jpg").toLowerCase();
      const file = blobToFile(blob, `photo-${Date.now()}.${ext}`);
      console.log("[pickImage] → File", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      return file;
    } catch (e) {
      console.warn("[pickImage] Capacitor Camera failed:", e);
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const f = e.target.files?.[0] || null;
      console.log("[pickImage] web input:", f && { name: f.name, size: f.size });
      resolve(f);
    };
    window.addEventListener(
      "focus",
      () => setTimeout(() => resolve(input.files?.[0] || null), 500),
      { once: true }
    );
    input.click();
  });
}

export function resolvePreview(source) {
  if (!source) return "";
  if (typeof source !== "string") {
    try {
      return URL.createObjectURL(source);
    } catch {
      return "";
    }
  }
  if (/^(https?:|data:|blob:)/i.test(source)) return source;
  if (source.startsWith("file://")) {
    if (window.Capacitor?.convertFileSrc) {
      return window.Capacitor.convertFileSrc(source);
    }
    return source;
  }
  return source;
}