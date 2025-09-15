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
import {
  UploadFileDto,
  UploadUrlDto,
  DownloadUrlDto,
  ValidateFileDto,
  FileUploadResponseDto,
  UploadUrlResponseDto,
  DownloadUrlResponseDto,
  FileMetadataResponseDto,
  FileValidationResponseDto,
  FileDeleteResponseDto,
} from './dto';

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
    type: FileUploadResponseDto,
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
    @Query() uploadDto: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const options: FileUploadOptions = {
      folder: uploadDto.folder,
      filename: uploadDto.filename,
      contentType: file.mimetype,
      makePublic: uploadDto.makePublic || false,
    };

    const result = await this.filesService.uploadFile(file.buffer, file.originalname, options);

    return {
      key: result.key,
      url: result.url,
      publicUrl: result.publicUrl,
      bucket: result.bucket,
      contentType: result.contentType,
      size: result.size,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
      etag: result.etag,
      metadata: {
        folder: uploadDto.folder,
        makePublic: uploadDto.makePublic,
      },
    };
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
    type: UploadUrlResponseDto,
  })
  async getUploadUrl(
    @Query() uploadUrlDto: UploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    if (!uploadUrlDto.key || !uploadUrlDto.contentType) {
      throw new BadRequestException('Key and contentType are required');
    }

    const expiresIn = uploadUrlDto.expiresIn || 3600;
    const uploadUrl = await this.filesService.getUploadUrl(
      uploadUrlDto.key,
      uploadUrlDto.contentType,
      expiresIn,
    );

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return {
      uploadUrl,
      key: uploadUrlDto.key,
      expiresIn,
      expiresAt,
      instructions: 'Use PUT method to upload file directly to this URL',
      maxFileSize: 10 * 1024 * 1024, // 10MB
    };
  }

  @Get(':key/url')
  @ApiOperation({ summary: 'Get presigned download URL for file' })
  @ApiResponse({
    status: 200,
    description: 'Presigned download URL generated',
    type: DownloadUrlResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getFileUrl(
    @Param('key') key: string,
    @Query() downloadUrlDto: DownloadUrlDto,
  ): Promise<DownloadUrlResponseDto> {
    const expiresIn = downloadUrlDto.expiresIn || 3600;
    const url = await this.filesService.getSignedUrl(key, expiresIn);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const filename = key.split('/').pop() || 'download';

    return {
      url,
      key,
      expiresIn,
      expiresAt,
      exists: true, // The service would throw an error if file doesn't exist
      filename,
    };
  }

  @Get(':key/metadata')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({
    status: 200,
    description: 'File metadata retrieved',
    type: FileMetadataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getFileMetadata(@Param('key') key: string): Promise<FileMetadataResponseDto> {
    const metadata = await this.filesService.getFileMetadata(key);

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      key: metadata.key,
      bucket: metadata.bucket,
      contentType: metadata.contentType,
      size: metadata.size,
      lastModified: metadata.lastModified,
      etag: metadata.etag,
      url: metadata.url,
      publicUrl: metadata.publicUrl,
      storageClass: metadata.storageClass,
      encryption: metadata.encryption,
      metadata: metadata.metadata,
      exists: true,
      formattedSize: formatBytes(metadata.size),
    };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete file from S3' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    type: FileDeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async deleteFile(
    @Param('key') key: string,
  ): Promise<FileDeleteResponseDto> {
    await this.filesService.deleteFile(key);

    return {
      message: 'File deleted successfully',
      key,
      success: true,
      deletedAt: new Date().toISOString(),
      metadata: {
        permanent: true,
      },
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
    type: FileValidationResponseDto,
  })
  async validateFile(
    @Query() validateDto: ValidateFileDto,
  ): Promise<FileValidationResponseDto> {
    if (!validateDto.filename || !validateDto.size) {
      throw new BadRequestException('Filename and size are required');
    }

    const errors: string[] = [];
    const maxSize = validateDto.maxSize || 10 * 1024 * 1024; // 10MB default

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Validate file size
    const sizeValid = this.filesService.validateFileSize(validateDto.size, maxSize);
    if (!sizeValid) {
      errors.push(`File size ${formatBytes(validateDto.size)} exceeds maximum ${formatBytes(maxSize)}`);
    }

    // Validate file type
    const typeValid = validateDto.allowedTypes ?
      this.filesService.validateFileType(validateDto.filename, validateDto.allowedTypes) : true;
    if (!typeValid) {
      errors.push(`File type not allowed. Allowed types: ${validateDto.allowedTypes?.join(', ')}`);
    }

    const contentType = this.filesService['getContentType'](validateDto.filename);
    const fileExtension = '.' + validateDto.filename.split('.').pop()?.toLowerCase();

    return {
      valid: errors.length === 0,
      errors,
      contentType,
      fileExtension,
      sizeValidation: {
        size: validateDto.size,
        formattedSize: formatBytes(validateDto.size),
        maxAllowed: maxSize,
        formattedMaxAllowed: formatBytes(maxSize),
        valid: sizeValid,
      },
      typeValidation: {
        detectedType: contentType,
        allowedTypes: validateDto.allowedTypes,
        valid: typeValid,
      },
      suggestedFilename: validateDto.filename,
      metadata: {
        validationId: `val_${Date.now()}`,
      },
    };
  }
}