import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

export function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR || './uploads';
  return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

export function ensureUploadDir(): string {
  const absPath = getUploadDir();
  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath, { recursive: true });
  }
  return absPath;
}

export interface UploadResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export async function processUpload(formData: FormData): Promise<UploadResult> {
  const file = formData.get('payment_screenshot') as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB` };
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.' };
  }

  const originalExt = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.includes(originalExt)) {
    return { success: false, error: 'Invalid file extension.' };
  }

  const safeFilename = `${uuidv4()}${originalExt}`;
  const uploadDir = ensureUploadDir();
  const filePath = path.join(uploadDir, safeFilename);

  const buffer = Buffer.from(await file.arrayBuffer());

  // Basic magic byte validation
  if (!isValidImageBuffer(buffer, originalExt)) {
    return { success: false, error: 'File content does not match image format.' };
  }

  fs.writeFileSync(filePath, buffer);
  return { success: true, filename: safeFilename };
}

function isValidImageBuffer(buf: Buffer, ext: string): boolean {
  if (ext === '.jpg' || ext === '.jpeg') {
    return buf[0] === 0xff && buf[1] === 0xd8;
  }
  if (ext === '.png') {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  if (ext === '.webp') {
    return buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  }
  return true; // fallback
}

export function getUploadedFilePath(filename: string): string {
  return path.join(ensureUploadDir(), filename);
}

