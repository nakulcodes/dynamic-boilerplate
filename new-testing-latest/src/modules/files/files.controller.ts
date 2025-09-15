import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService, FileUploadOptions, FileUploadResult, FileMetadata } from './files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Optional folder path',
        },
        filename: {
          type: 'string',
          description: 'Optional custom filename',
        },
        makePublic: {
          type: 'boolean',
          description: 'Make file publicly accessible',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        key: 'uploads/123e4567-e89b-12d3-a456-426614174000.jpg',
        url: 'https://presigned-url.com',
        publicUrl: 'https://bucket.s3.region.amazonaws.com/key',
        bucket: 'my-bucket',
        contentType: 'image/jpeg',
        size: 1024000,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or upload failed',
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|csv)$/i
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('filename') filename?: string,
    @Query('makePublic') makePublic?: string,
  ): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const options: FileUploadOptions = {
      folder,
      filename,
      contentType: file.mimetype,
      makePublic: makePublic === 'true',
    };

    return this.filesService.uploadFile(file.buffer, file.originalname, options);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Generate presigned URL for direct upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'File key/path in S3',
          example: 'uploads/document.pdf',
        },
        contentType: {
          type: 'string',
          description: 'MIME type of the file',
          example: 'application/pdf',
        },
        expiresIn: {
          type: 'number',
          description: 'URL expiration time in seconds',
          example: 3600,
        },
      },
      required: ['key', 'contentType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned upload URL generated',
    schema: {
      example: {
        uploadUrl: 'https://presigned-upload-url.com',
        key: 'uploads/document.pdf',
        expiresIn: 3600,
      },
    },
  })
  async getUploadUrl(
    @Query('key') key: string,
    @Query('contentType') contentType: string,
    @Query('expiresIn') expiresIn?: number,
  ): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
    if (!key || !contentType) {
      throw new BadRequestException('Key and contentType are required');
    }

    const uploadUrl = await this.filesService.getUploadUrl(
      key,
      contentType,
      expiresIn || 3600,
    );

    return {
      uploadUrl,
      key,
      expiresIn: expiresIn || 3600,
    };
  }

  @Get(':key/url')
  @ApiOperation({ summary: 'Get presigned download URL for file' })
  @ApiResponse({
    status: 200,
    description: 'Presigned download URL generated',
    schema: {
      example: {
        url: 'https://presigned-download-url.com',
        key: 'uploads/document.pdf',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getFileUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: number,
  ): Promise<{ url: string; key: string; expiresIn: number }> {
    const url = await this.filesService.getSignedUrl(key, expiresIn || 3600);

    return {
      url,
      key,
      expiresIn: expiresIn || 3600,
    };
  }

  @Get(':key/metadata')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({
    status: 200,
    description: 'File metadata retrieved',
    schema: {
      example: {
        key: 'uploads/document.pdf',
        bucket: 'my-bucket',
        contentType: 'application/pdf',
        size: 1024000,
        lastModified: '2025-09-15T10:30:00.000Z',
        etag: '"abc123def456"',
        url: 'https://presigned-url.com',
        publicUrl: 'https://bucket.s3.region.amazonaws.com/key',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getFileMetadata(@Param('key') key: string): Promise<FileMetadata> {
    return this.filesService.getFileMetadata(key);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete file from S3' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      example: {
        message: 'File deleted successfully',
        key: 'uploads/document.pdf',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async deleteFile(
    @Param('key') key: string,
  ): Promise<{ message: string; key: string }> {
    await this.filesService.deleteFile(key);

    return {
      message: 'File deleted successfully',
      key,
    };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate file before upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          example: 'document.pdf',
        },
        size: {
          type: 'number',
          example: 1024000,
        },
        allowedTypes: {
          type: 'array',
          items: { type: 'string' },
          example: ['.pdf', '.doc', '.docx'],
        },
        maxSize: {
          type: 'number',
          example: 10485760,
          description: 'Maximum file size in bytes',
        },
      },
      required: ['filename', 'size'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File validation result',
    schema: {
      example: {
        valid: true,
        errors: [],
        contentType: 'application/pdf',
      },
    },
  })
  async validateFile(
    @Query('filename') filename: string,
    @Query('size') size: number,
    @Query('allowedTypes') allowedTypes?: string,
    @Query('maxSize') maxSize?: number,
  ): Promise<{ valid: boolean; errors: string[]; contentType: string }> {
    if (!filename || !size) {
      throw new BadRequestException('Filename and size are required');
    }

    const errors: string[] = [];
    const parsedAllowedTypes = allowedTypes ? allowedTypes.split(',') : undefined;
    const parsedMaxSize = maxSize || 10 * 1024 * 1024; // 10MB default

    // Validate file size
    if (!this.filesService.validateFileSize(size, parsedMaxSize)) {
      errors.push(`File size ${Math.round(size / 1024 / 1024)}MB exceeds maximum ${Math.round(parsedMaxSize / 1024 / 1024)}MB`);
    }

    // Validate file type
    if (parsedAllowedTypes && !this.filesService.validateFileType(filename, parsedAllowedTypes)) {
      errors.push(`File type not allowed. Allowed types: ${parsedAllowedTypes.join(', ')}`);
    }

    const contentType = this.filesService['getContentType'](filename);

    return {
      valid: errors.length === 0,
      errors,
      contentType,
    };
  }
}