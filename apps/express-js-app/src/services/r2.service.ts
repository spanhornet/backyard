// AWS SDK
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';

// Crypto
import crypto from 'crypto';

// Types
export interface R2Configuration {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string; // Public R2.dev URL (e.g., https://pub-xxx.r2.dev)
}

export interface UploadResponse {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
}

export interface UploadRequest {
  folder?: string;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

// File extensions
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'pdf', 'doc', 'docx'
];

// MIME types
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

export class R2Service {
  private s3Client: S3Client;
  private bucketName: string;
  private accountId: string;
  private publicUrl: string;

  constructor(config: R2Configuration) {
    this.accountId = config.accountId;
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  private generateKey(originalName: string, folder?: string): string {
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const key = `${sanitizedName}_${timestamp}_${randomId}.${extension}`;
    return folder ? `${folder}/${key}` : key;
  }

  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    return MIME_TYPES[ext] || 'application/octet-stream';
  }

  private buildUrl(key: string): string {
    // Use public R2.dev URL instead of internal storage URL
    return `${this.publicUrl}/${key}`;
  }

  private validateFileType(filename: string): void {
    const extension = filename.toLowerCase().split('.').pop();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }
  }

  async uploadFile(
    file: Buffer | Uint8Array | string,
    originalName: string,
    options: UploadRequest = {}
  ): Promise<UploadResponse> {
    const key = options.filename || this.generateKey(originalName, options.folder);
    const contentType = options.contentType || this.getContentType(originalName);

    try {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: options.metadata || {},
      }));

      return {
        key,
        url: this.buildUrl(key),
        bucket: this.bucketName,
        size: Buffer.isBuffer(file) ? file.length : file.length,
        contentType,
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFileUrl(key: string): string {
    return this.buildUrl(key);
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }

  async validateConnection(): Promise<void> {
    try {
      // List objects in bucket
      await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      }));
      console.log('✅ Cloudflare R2 connection validated successfully');
    } catch (error) {
      throw new Error(`Failed to connect to Cloudflare R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton pattern
let instance: R2Service | null = null;

export function initializeR2Service(config: R2Configuration): R2Service {
  instance = new R2Service(config);
  return instance;
}

export function getR2Service(): R2Service {
  if (!instance) throw new Error('Cloudflare R2 not initialized');
  return instance;
}