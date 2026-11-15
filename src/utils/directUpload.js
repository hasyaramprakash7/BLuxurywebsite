// src/utils/directUpload.js
// Uploads a file DIRECTLY to Cloudflare R2 via presigned URL.
// Server never sees the video bytes — solves the 512 MB RAM crash.

export async function uploadFileDirectly(file, token, options = {}) {
  if (!file) throw new Error('No file provided');
  if (!token) throw new Error('Auth token required');

  const contentType = file.type || 'application/octet-stream';
  const fileSize = file.size;

  // 1. Ask backend for a presigned URL
  const presignRes = await fetch('/api/upload/presign', {
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
    throw new Error('Server returned invalid response for presign');
  }

  if (!presignRes.ok || !presign.success) {
    throw new Error(presign.message || 'Failed to get upload URL');
  }

  const { uploadUrl, key, publicUrl } = presign;

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
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    xhr.send(file);
  });

  return { publicUrl, key };
}