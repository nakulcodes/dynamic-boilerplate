import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import globby = require('globby');
import * as Handlebars from 'handlebars';
import { StorageService } from '../storage/storage.service';
import { GitHubService } from '../github/github.service';
import { GenerateProjectDto } from '../common/dto/generate-project.dto';
import { ModuleMeta, GenerationResult } from '../common/interfaces/module-meta.interface';
import { GeneratedProjectRepository } from '../database/repositories/generated-project.repository';

@Injectable()
export class AssemblerService {
  private readonly logger = new Logger(AssemblerService.name);
  private readonly templatesPath: string;

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
    private githubService: GitHubService,
    private generatedProjectRepository: GeneratedProjectRepository,
  ) {
    this.templatesPath = path.resolve(__dirname, '../../boiler-templates');
  }

  async generateProject(generateDto: GenerateProjectDto): Promise<GenerationResult> {
    let projectRecord = null;

    try {
      this.logger.log(`Starting project generation: ${generateDto.projectName}`);

      // Create project history record if userId is provided
      if (generateDto.userId) {
        projectRecord = await this.generatedProjectRepository.createProject({
          projectName: generateDto.projectName,
          preset: generateDto.preset,
          modules: generateDto.modules,
          author: generateDto.author || 'Unknown',
          userId: generateDto.userId,
          status: 'generating'
        });
        this.logger.log(`Created project history record with ID: ${projectRecord.id}`);
      }

      // Validate preset exists
      const presetPath = path.join(this.templatesPath, 'presets', generateDto.preset);
      if (!await fs.pathExists(presetPath)) {
        throw new BadRequestException(`Preset '${generateDto.preset}' not found`);
      }

      // Validate modules and check conflicts
      await this.validateModules(generateDto.preset, generateDto.modules);

      // Create working directory
      const workDir = path.join(os.tmpdir(), `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      await fs.ensureDir(workDir);

      try {
        // Generate project
        const result = await this.assembleProject({
          presetPath,
          modules: generateDto.modules,
          workDir,
          context: {
            projectName: generateDto.projectName,
            author: generateDto.author || 'Generated User',
          },
        });

        // Create output based on type
        if (generateDto.output.type === 'zip') {
          const zipFileName = `${generateDto.projectName}.zip`;
          await this.storageService.createZip(workDir, zipFileName);

          // Create download URL
          const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:5002');
          const downloadUrl = `${baseUrl}/api/download/${zipFileName}`;

          // Update project history record with success
          if (projectRecord) {
            await this.generatedProjectRepository.updateProject(projectRecord.id, {
              status: 'completed',
              downloadUrl: downloadUrl,
              fileName: zipFileName
            });
            this.logger.log(`Updated project history record ${projectRecord.id} with download info`);
          }

          return {
            status: 'success',
            outputUrl: downloadUrl,
            downloadUrl: downloadUrl,
            fileName: zipFileName,
            envRequired: result.envRequired,
          };
        }

        if (generateDto.output.type === 'github') {
          const githubOutput = generateDto.output as any;

          if (!githubOutput.userId) {
            throw new BadRequestException('GitHub output requires userId');
          }

          // Create repository if specified
          if (githubOutput.createRepository) {
            await this.githubService.createRepository(githubOutput.userId, {
              name: githubOutput.repositoryName || generateDto.projectName,
              description: githubOutput.description || `Generated ${generateDto.preset} project`,
              private: githubOutput.private || false,
              autoInit: false, // We'll push our own content
            });
          }

          // Push project to GitHub
          const pushResult = await this.githubService.pushProjectToRepository({
            userId: githubOutput.userId,
            repositoryName: githubOutput.repositoryName || generateDto.projectName,
            projectPath: workDir,
            commitMessage: githubOutput.commitMessage || `Initial commit: Generated ${generateDto.preset} project`,
            branch: githubOutput.branch || 'main',
          });

          // Update project history record with success
          if (projectRecord) {
            await this.generatedProjectRepository.updateProject(projectRecord.id, {
              status: 'completed',
              downloadUrl: pushResult.repositoryUrl,
              fileName: `${generateDto.projectName} (GitHub)`
            });
            this.logger.log(`Updated project history record ${projectRecord.id} with GitHub info`);
          }

          return {
            status: 'success',
            outputUrl: pushResult.repositoryUrl,
            envRequired: result.envRequired,
          };
        }

        throw new BadRequestException('Invalid output type specified');

      } finally {
        // Cleanup working directory
        await fs.remove(workDir).catch(err =>
          this.logger.warn(`Failed to cleanup ${workDir}:`, err)
        );
      }

    } catch (error) {
      this.logger.error('Project generation failed:', error);

      // Update project history record with failure
      if (projectRecord) {
        await this.generatedProjectRepository.updateProject(projectRecord.id, {
          status: 'failed'
        }).catch(updateError => {
          this.logger.error(`Failed to update project history record ${projectRecord.id}:`, updateError);
        });
      }

      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  private async validateModules(preset: string, modules: string[]): Promise<void> {
    const modulesPath = path.join(this.templatesPath, 'presets', preset, 'modules');

    // Check all modules exist
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      if (!await fs.pathExists(modulePath)) {
        throw new BadRequestException(`Module '${moduleName}' not found in preset '${preset}'`);
      }
    }

    // Load all module metadata and check conflicts
    const modulesMeta: ModuleMeta[] = [];
    for (const moduleName of modules) {
      const metaPath = path.join(modulesPath, moduleName, 'meta.json');
      if (await fs.pathExists(metaPath)) {
        const meta = await fs.readJson(metaPath);
        modulesMeta.push(meta);
      }
    }

    // Check for conflicts
    for (const meta of modulesMeta) {
      if (meta.conflicts) {
        const conflictingModules = meta.conflicts.filter(conflict => modules.includes(conflict));
        if (conflictingModules.length > 0) {
          throw new BadRequestException(
            `Module '${meta.name}' conflicts with: ${conflictingModules.join(', ')}`
          );
        }
      }
    }
  }

  private async assembleProject(options: {
    presetPath: string;
    modules: string[];
    workDir: string;
    context: Record<string, any>;
  }): Promise<{ envRequired: string[] }> {
    const { presetPath, modules, workDir, context } = options;

    // Copy base preset files
    const basePath = path.join(presetPath, 'base');
    await this.copyAndRender(basePath, workDir, context);

    // Load base package.json
    const packagePath = path.join(workDir, 'package.json');
    let packageJson = await fs.readJson(packagePath).catch(() => ({}));

    const envVars: (string | { key: string; required: boolean; example?: string })[] = [];
    const modulesPath = path.join(presetPath, 'modules');

    // Process each module
    for (const moduleName of modules) {
      const moduleDir = path.join(modulesPath, moduleName);
      const metaPath = path.join(moduleDir, 'meta.json');

      if (await fs.pathExists(metaPath)) {
        const meta: ModuleMeta = await fs.readJson(metaPath);

        // Copy module files
        const filesDir = path.join(moduleDir, meta.filesPath || 'files');
        if (await fs.pathExists(filesDir)) {
          await this.copyAndRender(filesDir, workDir, context);
        }

        // Merge dependencies
        if (meta.deps) {
          packageJson.dependencies = { ...packageJson.dependencies, ...meta.deps };
        }
        if (meta.devDeps) {
          packageJson.devDependencies = { ...packageJson.devDependencies, ...meta.devDeps };
        }

        // Collect environment variables (supporting both string and object formats)
        if (meta.env) {
          meta.env.forEach(envVar => {
            // Avoid duplicates by checking if the key already exists
            const key = typeof envVar === 'string' ? envVar : envVar.key;
            const exists = envVars.some(existing => {
              const existingKey = typeof existing === 'string' ? existing : existing.key;
              return existingKey === key;
            });
            if (!exists) {
              envVars.push(envVar);
            }
          });
        }

        // Apply injections
        if (meta.inject) {
          await this.applyInjections(workDir, meta.inject);
        }
      }
    }

    // Write updated package.json
    await fs.writeJson(packagePath, packageJson, { spaces: 2 });

    // Generate .env.template file
    await this.generateEnvTemplate(workDir, envVars);

    // Create array of env keys for the project metadata
    const envRequired = envVars.map(envVar =>
      typeof envVar === 'string' ? envVar : envVar.key
    );

    // Write project metadata
    const projectMeta = {
      generatedAt: new Date().toISOString(),
      preset: path.basename(presetPath),
      modules,
      envRequired,
    };
    await fs.writeJson(path.join(workDir, 'meta.json'), projectMeta, { spaces: 2 });

    return { envRequired };
  }

  private async copyAndRender(srcDir: string, destDir: string, context: Record<string, any>): Promise<void> {
    const files = await globby(['**/*', '**/.*'], {
      cwd: srcDir,
      dot: true,
      onlyFiles: true,
      gitignore: true,
    });

    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);

      await fs.ensureDir(path.dirname(destFile));

      // Check if file is binary
      const stats = await fs.stat(srcFile);
      if (stats.size > 1024 * 1024) { // Skip files larger than 1MB
        await fs.copy(srcFile, destFile);
        continue;
      }

      try {
        const content = await fs.readFile(srcFile, 'utf8');
        const rendered = Handlebars.compile(content)(context);
        await fs.writeFile(destFile, rendered, 'utf8');
      } catch (error) {
        // If it fails to read as text, copy as binary
        await fs.copy(srcFile, destFile);
      }
    }
  }

  private async applyInjections(workDir: string, injections: Record<string, any>): Promise<void> {
    for (const [targetFile, injection] of Object.entries(injections)) {
      const filePath = path.join(workDir, targetFile);

      // Handle 'ensure' directive - create file if it doesn't exist
      if (injection.ensure && !await fs.pathExists(filePath)) {
        await fs.ensureFile(filePath);
        if (injection.content) {
          await fs.writeFile(filePath, injection.content, 'utf8');
          continue;
        }
      }

      if (await fs.pathExists(filePath)) {
        let content = await fs.readFile(filePath, 'utf8');

        // Apply import injections (both 'import' and 'imports' keys supported)
        const imports = injection.import || injection.imports;
        if (imports && Array.isArray(imports)) {
          const importLines = imports.join('\n');
          // Support both NestJS and React style placeholders
          if (content.includes('// MODULE_IMPORTS_PLACEHOLDER')) {
            content = content.replace(
              '// MODULE_IMPORTS_PLACEHOLDER',
              `${importLines}\n// MODULE_IMPORTS_PLACEHOLDER`
            );
          } else if (content.includes('// IMPORTS_PLACEHOLDER')) {
            content = content.replace(
              '// IMPORTS_PLACEHOLDER',
              `${importLines}\n// IMPORTS_PLACEHOLDER`
            );
          } else {
            // If no placeholder, add imports after the last import statement
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
              const endOfLine = content.indexOf('\n', lastImportIndex);
              content = content.slice(0, endOfLine + 1) + importLines + '\n' + content.slice(endOfLine + 1);
            }
          }
        }

        // Apply register injections (NestJS modules)
        if (injection.register && Array.isArray(injection.register)) {
          const registerLines = injection.register.map(reg => `    ${reg},`).join('\n');
          content = content.replace(
            '    // MODULE_REGISTER_PLACEHOLDER',
            `${registerLines}\n    // MODULE_REGISTER_PLACEHOLDER`
          );
        }

        // Apply routes injections (React Router)
        if (injection.routes && Array.isArray(injection.routes)) {
          const routeLines = injection.routes.join('\n');
          if (content.includes('{/* ROUTES_PLACEHOLDER */}')) {
            content = content.replace(
              '{/* ROUTES_PLACEHOLDER */}',
              `${routeLines}\n          {/* ROUTES_PLACEHOLDER */}`
            );
          } else if (content.includes('// ROUTES_PLACEHOLDER')) {
            content = content.replace(
              '// ROUTES_PLACEHOLDER',
              `${routeLines}\n// ROUTES_PLACEHOLDER`
            );
          }
        }

        // Apply component injections (React components)
        if (injection.components && Array.isArray(injection.components)) {
          const componentLines = injection.components.join('\n');
          if (content.includes('{/* COMPONENTS_PLACEHOLDER */}')) {
            content = content.replace(
              '{/* COMPONENTS_PLACEHOLDER */}',
              `${componentLines}\n      {/* COMPONENTS_PLACEHOLDER */}`
            );
          }
        }

        // Apply wrapper injections (React Context Providers)
        if (injection.wrap && injection.wrap.component && injection.wrap.target) {
          const { component, target } = injection.wrap;
          // Wrap the target component with the provider
          const targetPattern = new RegExp(`<${target}([^>]*?)(\\/?)>`, 'g');
          const targetClosingPattern = new RegExp(`<\\/${target}>`, 'g');

          if (content.includes(`<${target}`)) {
            // Find and wrap the component
            content = content.replace(targetPattern, (match, attrs, selfClosing) => {
              if (selfClosing) {
                return `<${component}>\n        <${target}${attrs} />\n      </${component}>`;
              }
              return `<${component}>\n        <${target}${attrs}>`;
            });
            content = content.replace(targetClosingPattern, `</${target}>\n      </${component}>`);
          }
        }

        await fs.writeFile(filePath, content, 'utf8');
      }
    }
  }

  private async generateEnvTemplate(workDir: string, envVars: (string | { key: string; required: boolean; example?: string })[]): Promise<void> {
    if (envVars.length === 0) return;

    const envTemplateContent = [
      '# Environment Configuration Template',
      '# Copy this file to .env and fill in the values',
      '',
      '# Application Configuration',
      'NODE_ENV=development',
      'PORT=3000',
      '',
    ];

    // Helper function to get the key from either string or object format
    const getEnvKey = (envVar: string | { key: string; required: boolean; example?: string }): string => {
      return typeof envVar === 'string' ? envVar : envVar.key;
    };

    // Helper function to get the example value if available
    const getEnvExample = (envVar: string | { key: string; required: boolean; example?: string }): string | undefined => {
      return typeof envVar === 'object' ? envVar.example : undefined;
    };

    // Group environment variables by category
    const dbVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('DB_') || key.includes('DATABASE_');
    });
    const authVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('JWT_') || key.includes('AUTH_') || key.includes('RBAC_');
    });
    const mailVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('MAIL_') || key.includes('SMTP_') || key.includes('RESEND_');
    });
    const oauthVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('GOOGLE_') || key.includes('GITHUB_') || key.includes('MICROSOFT_');
    });
    const awsVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('AWS_');
    });
    const twilioVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('TWILIO_');
    });
    const stripeVars = envVars.filter(v => {
      const key = getEnvKey(v);
      return key.includes('STRIPE_');
    });
    const otherVars = envVars.filter(v =>
      !dbVars.includes(v) && !authVars.includes(v) && !mailVars.includes(v) &&
      !oauthVars.includes(v) && !awsVars.includes(v) && !twilioVars.includes(v) &&
      !stripeVars.includes(v)
    );

    // Add database configuration
    if (dbVars.length > 0) {
      envTemplateContent.push('# Database Configuration');
      dbVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);
        envTemplateContent.push(`${key}=${example || ''}`);
      });
      envTemplateContent.push('');
    }

    // Add authentication configuration
    if (authVars.length > 0) {
      envTemplateContent.push('# Authentication Configuration');
      authVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);

        if (key.includes('JWT_SECRET')) {
          envTemplateContent.push(`${key}=${example || 'your-jwt-secret-key-here'}`);
        } else if (key.includes('JWT_EXPIRES_IN')) {
          envTemplateContent.push(`${key}=${example || '1h'}`);
        } else {
          envTemplateContent.push(`${key}=${example || ''}`);
        }
      });
      envTemplateContent.push('');
    }

    // Add OAuth configuration
    if (oauthVars.length > 0) {
      envTemplateContent.push('# OAuth Configuration');
      const googleVars = oauthVars.filter(v => getEnvKey(v).includes('GOOGLE_'));
      const githubVars = oauthVars.filter(v => getEnvKey(v).includes('GITHUB_'));
      const microsoftVars = oauthVars.filter(v => getEnvKey(v).includes('MICROSOFT_'));

      if (googleVars.length > 0) {
        envTemplateContent.push('# Google OAuth');
        googleVars.forEach(envVar => {
          const key = getEnvKey(envVar);
          const example = getEnvExample(envVar);
          envTemplateContent.push(`${key}=${example || ''}`);
        });
      }

      if (githubVars.length > 0) {
        envTemplateContent.push('# GitHub OAuth');
        githubVars.forEach(envVar => {
          const key = getEnvKey(envVar);
          const example = getEnvExample(envVar);
          envTemplateContent.push(`${key}=${example || ''}`);
        });
      }

      if (microsoftVars.length > 0) {
        envTemplateContent.push('# Microsoft OAuth');
        microsoftVars.forEach(envVar => {
          const key = getEnvKey(envVar);
          const example = getEnvExample(envVar);
          envTemplateContent.push(`${key}=${example || ''}`);
        });
      }
      envTemplateContent.push('');
    }

    // Add mail configuration
    if (mailVars.length > 0) {
      envTemplateContent.push('# Mail Configuration');
      mailVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);

        if (key.includes('SMTP_PORT')) {
          envTemplateContent.push(`${key}=${example || '587'}`);
        } else if (key.includes('SMTP_SECURE')) {
          envTemplateContent.push(`${key}=${example || 'false'}`);
        } else {
          envTemplateContent.push(`${key}=${example || ''}`);
        }
      });
      envTemplateContent.push('');
    }

    // Add AWS configuration
    if (awsVars.length > 0) {
      envTemplateContent.push('# AWS Configuration');
      awsVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);

        if (key.includes('AWS_REGION')) {
          envTemplateContent.push(`${key}=${example || 'us-east-1'}`);
        } else {
          envTemplateContent.push(`${key}=${example || ''}`);
        }
      });
      envTemplateContent.push('');
    }

    // Add Twilio configuration
    if (twilioVars.length > 0) {
      envTemplateContent.push('# Twilio Configuration');
      twilioVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);
        envTemplateContent.push(`${key}=${example || ''}`);
      });
      envTemplateContent.push('');
    }

    // Add Stripe configuration
    if (stripeVars.length > 0) {
      envTemplateContent.push('# Stripe Configuration');
      stripeVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);
        envTemplateContent.push(`${key}=${example || ''}`);
      });
      envTemplateContent.push('');
    }

    // Add other configuration
    if (otherVars.length > 0) {
      envTemplateContent.push('# Other Configuration');
      otherVars.forEach(envVar => {
        const key = getEnvKey(envVar);
        const example = getEnvExample(envVar);
        envTemplateContent.push(`${key}=${example || ''}`);
      });
      envTemplateContent.push('');
    }

    // Write .env.template file
    const envTemplatePath = path.join(workDir, '.env.template');
    await fs.writeFile(envTemplatePath, envTemplateContent.join('\n'), 'utf8');

    this.logger.log(`Generated .env.template with ${envVars.length} environment variables`);
  }

  async getPresets(): Promise<any[]> {
    const presetsPath = path.join(this.templatesPath, 'presets');
    const presetDirs = await fs.readdir(presetsPath);

    const presets = [];
    for (const presetDir of presetDirs) {
      const presetPath = path.join(presetsPath, presetDir);
      const stat = await fs.stat(presetPath);

      if (stat.isDirectory()) {
        const modulesPath = path.join(presetPath, 'modules');
        const modules = [];

        if (await fs.pathExists(modulesPath)) {
          const moduleDirs = await fs.readdir(modulesPath);

          for (const moduleDir of moduleDirs) {
            const modulePath = path.join(modulesPath, moduleDir);
            const metaPath = path.join(modulePath, 'meta.json');

            if (await fs.pathExists(metaPath)) {
              const meta = await fs.readJson(metaPath);
              modules.push({
                name: meta.name,
                description: meta.description,
                category: meta.category || 'other',
                conflicts: meta.conflicts || [],
                fileStructure: meta.fileStructure || [],
              });
            }
          }
        }

        presets.push({
          name: presetDir,
          description: `${presetDir} preset`,
          modules,
        });
      }
    }

    return presets;
  }
}