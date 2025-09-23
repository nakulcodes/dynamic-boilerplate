import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OutputType {
  ZIP = 'zip',
  GITHUB = 'github',
}

export class GitHubOutputDto {
  @ApiProperty({
    description: 'User ID who owns the GitHub token',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'GitHub repository name (defaults to project name)',
    example: 'my-awesome-project',
  })
  @IsOptional()
  @IsString()
  repositoryName?: string;

  @ApiPropertyOptional({
    description: 'Repository description',
    example: 'Generated NestJS project with modules',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the repository should be private',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  private?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to create a new repository (false means push to existing)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  createRepository?: boolean;

  @ApiPropertyOptional({
    description: 'Commit message for the initial commit',
    example: 'Initial commit: Generated NestJS project',
  })
  @IsOptional()
  @IsString()
  commitMessage?: string;

  @ApiPropertyOptional({
    description: 'Branch name to push to',
    example: 'main',
  })
  @IsOptional()
  @IsString()
  branch?: string;
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

  @ApiPropertyOptional({
    description: 'User ID who is generating the project',
    example: 123,
  })
  @IsOptional()
  userId?: number;

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