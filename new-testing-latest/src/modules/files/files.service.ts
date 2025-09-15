import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface FileUploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  makePublic?: boolean;
  expiresIn?: number; // For presigned URLs
}

export interface FileUploadResult {
  key: string;
  url: string;
  publicUrl?: string;
  bucket: string;
  contentType: string;
  size: number;
}

export interface FileMetadata {
  key: string;
  bucket: string;
  contentType: string;
  size: number;
  lastModified: Date;
  etag: string;
  url: string;
  publicUrl?: string;
}

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET is required for S3 file service');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Upload file buffer to S3
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    options: FileUploadOptions = {}
  ): Promise<FileUploadResult> {
    const {
      folder = 'uploads',
      filename,
      contentType,
      makePublic = false,
    } = options;

    // Generate unique filename if not provided
    const fileExtension = path.extname(originalName);
    const finalFilename = filename || `${uuidv4()}${fileExtension}`;
    const key = folder ? `${folder}/${finalFilename}` : finalFilename;

    // Detect content type if not provided
    const finalContentType = contentType || this.getContentType(originalName);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: finalContentType,
        ACL: makePublic ? 'public-read' : 'private',
        Metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = await this.getSignedUrl(key, 3600); // 1 hour expiry
      const publicUrl = makePublic ? this.getPublicUrl(key) : undefined;

      return {
        key,
        url,
        publicUrl,
        bucket: this.bucketName,
        contentType: finalContentType,
        size: buffer.length,
      };
    } catch (error) {
      console.error('Failed to upload file to S3:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Get presigned URL for file download
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new BadRequestException('Failed to generate file URL');
    }
  }

  /**
   * Get presigned URL for file upload
   */
  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Failed to generate upload URL:', error);
      throw new BadRequestException('Failed to generate upload URL');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const url = await this.getSignedUrl(key, 3600);
      const publicUrl = response.ACL === 'public-read' ? this.getPublicUrl(key) : undefined;

      return {
        key,
        bucket: this.bucketName,
        contentType: response.ContentType || 'application/octet-stream',
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        etag: response.ETag || '',
        url,
        publicUrl,
      };
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new BadRequestException('File not found');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Get public URL for file (if bucket/object is public)
   */
  private getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Detect content type based on file extension
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();

    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
    return size <= maxSize;
  }

  /**
   * Validate file type
   */
  validateFileType(filename: string, allowedTypes: string[]): boolean {
    const ext = path.extname(filename).toLowerCase();
    return allowedTypes.includes(ext);
  }
}