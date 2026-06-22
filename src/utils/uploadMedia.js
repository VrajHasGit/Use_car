/**
 * Media upload utility — uploads files to Cloudflare R2 via our Worker.
 * 
 * Usage:
 *   import { uploadFile, deleteFile } from '../utils/uploadMedia';
 *   const result = await uploadFile(file, 'valuation');
 *   // result = { success, key, url, name, size, type }
 */

const WORKER_URL = import.meta.env.VITE_CF_WORKER_URL || '';
const UPLOAD_KEY = import.meta.env.VITE_CF_UPLOAD_KEY || '';

/**
 * Upload a single file to Cloudflare R2
 * @param {File} file - The file to upload
 * @param {string} folder - Folder/prefix in R2 (e.g. 'valuation')
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{success, key, url, name, size, type}>}
 */
export async function uploadFile(file, folder = 'valuation', onProgress) {
  if (!WORKER_URL) {
    throw new Error('Cloudflare Worker URL not configured. Set VITE_CF_WORKER_URL in your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  // Use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${WORKER_URL}/upload`);
      xhr.setRequestHeader('X-Upload-Key', UPLOAD_KEY);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch {
          reject(new Error('Upload failed: invalid response'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.send(formData);
    });
  }

  // Simple fetch for no-progress uploads
  const res = await fetch(`${WORKER_URL}/upload`, {
    method: 'POST',
    headers: { 'X-Upload-Key': UPLOAD_KEY },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

/**
 * Upload multiple files with progress tracking
 * @param {File[]} files - Array of files
 * @param {string} folder - Folder/prefix
 * @param {function} onFileProgress - (index, percent) callback
 * @returns {Promise<Array<{success, key, url, name, size, type}>>}
 */
export async function uploadFiles(files, folder = 'valuation', onFileProgress) {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], folder, (pct) => {
      if (onFileProgress) onFileProgress(i, pct);
    });
    results.push(result);
  }
  return results;
}

/**
 * Delete a file from Cloudflare R2
 * @param {string} keyOrUrl - The R2 key or full URL of the file
 */
export async function deleteFile(keyOrUrl) {
  if (!WORKER_URL) throw new Error('Cloudflare Worker URL not configured.');

  // Extract key from URL if full URL provided
  let key = keyOrUrl;
  if (keyOrUrl.includes('/file/')) {
    key = keyOrUrl.split('/file/').pop();
  }

  const res = await fetch(`${WORKER_URL}/file/${key}`, {
    method: 'DELETE',
    headers: { 'X-Upload-Key': UPLOAD_KEY },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}

/**
 * Check if a file is an image
 */
export function isImage(file) {
  if (typeof file === 'string') {
    return /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|svg)$/i.test(file);
  }
  return file?.type?.startsWith('image/');
}

/**
 * Check if a file is a video
 */
export function isVideo(file) {
  if (typeof file === 'string') {
    return /\.(mp4|mov|avi|webm|mkv|3gp)$/i.test(file);
  }
  return file?.type?.startsWith('video/');
}
