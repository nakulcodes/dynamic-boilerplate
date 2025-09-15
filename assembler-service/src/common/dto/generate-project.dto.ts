import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OutputType {
  ZIP = 'zip',
  GITHUB = 'github',
}

export class GitHubOutputDto {
  @ApiProperty({
    description: 'GitHub repository owner/organization name',
    example: 'myusername',
  })
  @IsString()
  owner: string;

  @ApiProperty({
    description: 'GitHub repository name',
    example: 'my-awesome-project',
  })
  @IsString()
  repoName: string;

  @ApiProperty({
    description: 'Authentication method for GitHub',
    enum: ['oauth', 'github_app'],
    example: 'oauth',
  })
  @IsEnum(['oauth', 'github_app'])
  authMethod: 'oauth' | 'github_app';
}

export class OutputDto {
  @ApiProperty({
    description: 'Output type for the generated project',
    enum: OutputType,
    example: OutputType.ZIP,
  })
  @IsEnum(OutputType)
  type: OutputType;

  @ApiPropertyOptional({
    description: 'GitHub-specific output configuration (required if type is github)',
    type: GitHubOutputDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GitHubOutputDto)
  github?: GitHubOutputDto;
}

export class OptionsDto {
  @ApiPropertyOptional({
    description: 'Whether to run npm install after generation',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  runInstall?: boolean;

  @ApiPropertyOptional({
    description: 'Preferred Node.js version',
    example: '18',
  })
  @IsOptional()
  @IsString()
  nodeVersion?: string;
}

export class GenerateProjectDto {
  @ApiProperty({
    description: 'Preset template to use',
    example: 'nestjs-base',
  })
  @IsString()
  preset: string;

  @ApiProperty({
    description: 'Additional modules to include',
    type: [String],
    example: ['google-oauth', 'google-calendar'],
  })
  @IsArray()
  @IsString({ each: true })
  modules: string[];

  @ApiProperty({
    description: 'Name of the generated project',
    example: 'my-awesome-project',
  })
  @IsString()
  projectName: string;

  @ApiPropertyOptional({
    description: 'Author name for the project',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    description: 'Output configuration',
    type: OutputDto,
  })
  @ValidateNested()
  @Type(() => OutputDto)
  output: OutputDto;

  @ApiPropertyOptional({
    description: 'Additional generation options',
    type: OptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsDto)
  options?: OptionsDto;
}