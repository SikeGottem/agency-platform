import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(file: File): Promise<File> {
  if (file.size <= 1024 * 1024) {
    return file;
  }
  return imageCompression(file, COMPRESSION_OPTIONS);
}

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB pre-compression limit
export const MAX_IMAGES = 10;
