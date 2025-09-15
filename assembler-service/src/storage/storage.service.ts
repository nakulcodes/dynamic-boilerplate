import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as archiver from 'archiver';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly outputPath: string;

  constructor(private configService: ConfigService) {
    this.outputPath = this.configService.get<string>('STORAGE_PATH', './tmp/output');
  }

  async createZip(sourceDir: string, zipName: string): Promise<string> {
    await fs.ensureDir(this.outputPath);

    const zipPath = path.join(this.outputPath, zipName);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`ZIP created: ${zipPath} (${archive.pointer()} bytes)`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        this.logger.error('Archive error:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async getZipUrl(zipPath: string): Promise<string> {
    // In a real application, you'd upload to S3/CloudFlare/etc and return public URL
    // For now, return a local file URL
    return `file://${zipPath}`;
  }

  async cleanup(): Promise<void> {
    // Cleanup old files (older than 1 hour)
    try {
      const files = await fs.readdir(this.outputPath);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.outputPath, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > 3600000) { // 1 hour
          await fs.remove(filePath);
          this.logger.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.warn('Cleanup failed:', error);
    }
  }
}