// src/utils/directUpload.js
// Uploads a file DIRECTLY to Cloudflare R2 via presigned URL.
// Server never sees the video bytes — solves the 512 MB RAM crash.

// ✅ Vite bakes this into the bundle at build time.
// On localhost it's undefined → falls back to '' → Vite proxy handles it.
// On Render it's https://feed-vqqt.onrender.com → hits the real backend.
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function uploadFileDirectly(file, token, options = {}) {
  if (!file) throw new Error('No file provided');
  if (!token) throw new Error('Auth token required');

  const contentType = file.type || 'application/octet-stream';
  const fileSize = file.size;

  console.log('[directUpload] presign →', `${API_BASE}/api/upload/presign`);

  // 1. Ask backend for a presigned URL — use absolute URL
  const presignRes = await fetch(`${API_BASE}/api/upload/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contentType, fileSize }),
  });

  let presign;
  try {
    presign = await presignRes.json();
  } catch {
    throw new Error(
      `Server returned non-JSON for presign (status ${presignRes.status})`
    );
  }

  if (!presignRes.ok || !presign.success) {
    throw new Error(presign.message || `Failed to get upload URL (${presignRes.status})`);
  }

  const { uploadUrl, key, publicUrl } = presign;

  console.log('[directUpload] uploading to R2 →', uploadUrl.slice(0, 100) + '…');

  // 2. PUT the file directly to R2 (bypasses your server)
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);

    if (typeof options.onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          options.onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('[directUpload] R2 upload OK', { key, status: xhr.status });
        resolve();
      } else {
        reject(new Error(`R2 upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () =>
      reject(new Error('Network error during R2 upload (likely CORS)'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    xhr.send(file);
  });

  return { publicUrl, key };
}