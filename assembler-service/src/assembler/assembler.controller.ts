import { Controller, Post, Get, Body, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AssemblerService } from './assembler.service';
import { GenerateProjectDto } from '../common/dto/generate-project.dto';
import { PresetsResponseDto } from '../common/dto/preset.dto';
import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@decorators/api-response.decorator';

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
}