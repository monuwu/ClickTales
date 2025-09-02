import { uploadImageToSupabase } from '../services/supabase';

// Helper to convert dataURL to Blob
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const match = arr[0].match(/:(.*?);/);
  const mime = match ? match[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Uploads a dataURL image to Supabase Storage
export async function uploadDataUrlToSupabase(dataUrl: string, fileName: string, bucket: string) {
  const blob = dataURLtoBlob(dataUrl);
  const { data, error } = await uploadImageToSupabase(blob, fileName, bucket);
  return { data, error };
}
