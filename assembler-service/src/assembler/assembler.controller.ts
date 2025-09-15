import { Controller, Post, Get, Body, HttpCode, HttpStatus, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AssemblerService } from './assembler.service';
import { GenerateProjectDto } from '../common/dto/generate-project.dto';
import { PresetsResponseDto } from '../common/dto/preset.dto';
import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('assembler')
@Controller()
export class AssemblerController {
  constructor(private readonly assemblerService: AssemblerService) {}

  @Get('presets')
  @ApiOperation({
    summary: 'Get available presets',
    description: 'Retrieve all available project presets with their configurations',
  })
  @ApiSuccessResponse('Successfully retrieved presets', PresetsResponseDto)
  @ApiInternalServerErrorResponse('Failed to retrieve presets')
  async getPresets() {
    return this.assemblerService.getPresets();
  }

  @Get('modules/:preset')
  @ApiOperation({
    summary: 'Get modules for a preset',
    description: 'Retrieve available modules for a specific preset',
  })
  @ApiParam({
    name: 'preset',
    description: 'Preset identifier',
    example: 'nestjs-base',
  })
  @ApiSuccessResponse('Successfully retrieved modules')
  @ApiBadRequestResponse('Invalid preset')
  async getModules(@Param('preset') preset: string) {
    // This will be implemented when we add preset-specific module queries
    return { preset, modules: [] };
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate project',
    description: 'Generate a new project based on selected preset and modules',
  })
  @ApiSuccessResponse('Project generated successfully')
  @ApiBadRequestResponse('Invalid generation parameters')
  @ApiInternalServerErrorResponse('Failed to generate project')
  async generateProject(@Body() generateProjectDto: GenerateProjectDto) {
    return this.assemblerService.generateProject(generateProjectDto);
  }

  @Get('download/:filename')
  @ApiOperation({
    summary: 'Download generated project',
    description: 'Download a generated project ZIP file',
  })
  @ApiParam({
    name: 'filename',
    description: 'ZIP file name to download',
    example: 'my-project.zip',
  })
  async downloadProject(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Construct the full file path
      const outputDir = path.resolve(process.cwd(), 'tmp', 'output');
      const filePath = path.join(outputDir, filename);

      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        throw new NotFoundException('File not found');
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Send the file
      res.sendFile(filePath);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('File not found or cannot be accessed');
    }
  }
}

