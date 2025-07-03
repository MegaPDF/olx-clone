import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../env';
import type { UploadedFile } from '../types';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION
});

interface UploadOptions {
  folder?: string;
  contentType?: string;
  acl?: 'private' | 'public-read';
  metadata?: Record<string, string>;
}

class S3Service {
  private bucketName = env.AWS_S3_BUCKET_NAME;
  private cloudFrontUrl = env.AWS_CLOUDFRONT_URL;

  /**
   * Upload a single file to S3
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    options: UploadOptions = {}
  ): Promise<UploadedFile> {
    const {
      folder = 'uploads',
      contentType = 'application/octet-stream',
      acl = 'public-read',
      metadata = {}
    } = options;

    const key = `${folder}/${uuidv4()}-${this.sanitizeFileName(originalName)}`;

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: acl,
      Metadata: {
        ...metadata,
        'uploaded-at': new Date().toISOString()
      }
    };

    try {
      const result = await s3.upload(uploadParams).promise();
      
      const url = this.cloudFrontUrl 
        ? `${this.cloudFrontUrl}/${key}`
        : result.Location;

      return {
        url,
        key,
        size: buffer.length,
        type: contentType,
        name: originalName
      };
    } catch (error) {
      throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadFiles(
    files: Array<{ buffer: Buffer; name: string; type: string }>,
    options: UploadOptions = {}
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file.buffer, file.name, {
        ...options,
        contentType: file.type
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Upload image with optimization
   */
  async uploadImage(
    buffer: Buffer,
    originalName: string,
    options: UploadOptions = {}
  ): Promise<UploadedFile> {
    return this.uploadFile(buffer, originalName, {
      ...options,
      folder: options.folder || 'images',
      contentType: options.contentType || 'image/jpeg'
    });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key
    };

    try {
      await s3.deleteObject(deleteParams).promise();
    } catch (error) {
      throw new Error(`S3 delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const deleteParams: AWS.S3.DeleteObjectsRequest = {
      Bucket: this.bucketName,
      Delete: {
        Objects: keys.map(key => ({ Key: key }))
      }
    };

    try {
      await s3.deleteObjects(deleteParams).promise();
    } catch (error) {
      throw new Error(`S3 batch delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate presigned URL for direct upload
   */
  async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn
    };

    return s3.getSignedUrlPromise('putObject', params);
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    return s3.headObject({
      Bucket: this.bucketName,
      Key: key
    }).promise();
  }

  /**
   * Sanitize file name for S3
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * Extract key from S3 URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } catch {
      return null;
    }
  }
}

export const s3Service = new S3Service();