import { put } from '@vercel/blob';

export async function uploadToBlob(file, filename) {
  try {
    // Convert file buffer to Blob
    const blob = new Blob([file], { type: file.type });

    // Upload to Vercel Blob
    const { url } = await put(filename, blob, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw new Error('Failed to upload file');
  }
} 