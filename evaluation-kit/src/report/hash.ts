import crypto from 'crypto';
import fs from 'fs';

/**
 * Computes the SHA-256 hash of a string payload.
 */
export function computeHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Computes the SHA-256 hash of a local file.
 * Returns null if the file does not exist.
 */
export function computeFileHash(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}
