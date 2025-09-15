import { ApiProperty } from '@nestjs/swagger';

export class PresetDto {
  @ApiProperty({
    description: 'Preset identifier',
    example: 'nestjs-base',
  })
  id: string;

  @ApiProperty({
    description: 'Preset display name',
    example: 'NestJS Base',
  })
  name: string;

  @ApiProperty({
    description: 'Preset description',
    example: 'A basic NestJS application with authentication',
  })
  description: string;

  @ApiProperty({
    description: 'Available modules for this preset',
    type: 'array',
    items: { type: 'string' },
    example: ['google-oauth', 'google-calendar'],
  })
  availableModules: string[];
}

export class PresetsResponseDto {
  @ApiProperty({
    description: 'List of available presets',
    type: [PresetDto],
  })
  presets: PresetDto[];
}