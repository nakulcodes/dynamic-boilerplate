import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AssemblerService } from '../src/assembler/assembler.service';
import { StorageService } from '../src/storage/storage.service';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('AssemblerService', () => {
  let service: AssemblerService;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssemblerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'STORAGE_PATH') return './test/tmp';
              return undefined;
            }),
          },
        },
        {
          provide: StorageService,
          useValue: {
            createZip: jest.fn().mockResolvedValue('./test.zip'),
          },
        },
      ],
    }).compile();

    service = module.get<AssemblerService>(AssemblerService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresets', () => {
    it('should return list of available presets', async () => {
      // Mock the templates directory
      const mockPresets = await service.getPresets();
      expect(Array.isArray(mockPresets)).toBe(true);
    });
  });

  describe('generateProject', () => {
    it('should validate project name is required', async () => {
      const request = {
        preset: 'nestjs-base',
        modules: [],
        projectName: '',
        output: { type: 'zip' as const },
      };

      const result = await service.generateProject(request);
      expect(result.status).toBe('error');
    });

    it('should validate preset exists', async () => {
      const request = {
        preset: 'non-existent-preset',
        modules: [],
        projectName: 'test-project',
        output: { type: 'zip' as const },
      };

      const result = await service.generateProject(request);
      expect(result.status).toBe('error');
      expect(result.error).toContain('not found');
    });
  });
});