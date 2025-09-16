# Dynamic Boilerplate Generator - Claude Development Guide

## Project Overview
This is a modular boilerplate generator system that creates ready-to-use repositories by combining base presets with selected feature modules. The system consists of:

- **Frontend**: React/TypeScript UI for module selection (port 5173)
- **Assembler Service**: NestJS backend API for project generation (port 3000)
- **Boiler Templates**: Modular template system with handlebars support

## Architecture

### Core Components
- **Frontend** (`/frontend/`): React + Vite + TypeScript + Tailwind CSS
- **Assembler Service** (`/assembler-service/`): NestJS + TypeORM + Handlebars
- **Templates** (`/assembler-service/boiler-templates/`): Modular template system

### Key Dependencies
- **Backend**: NestJS, TypeORM, Handlebars, Archiver, Simple-git
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS 4.1, Axios

## Development Commands

### Backend (assembler-service)
```bash
npm run start:dev     # Development server with hot reload
npm run build        # Build for production
npm run test         # Run unit tests
npm run lint         # Run ESLint
```

### Frontend
```bash
npm run dev          # Development server (Vite)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture Rules (from rules.json)

### Repository Pattern
- All repositories MUST extend `Repository<Entity>` with DataSource injection
- Location: `src/database/repositories/{entity-name}.repository.ts`
- Import using `@db/repositories` alias
- NO `TypeOrmModule.forFeature` at module level - use DataSource constructor pattern

### Database Architecture
- Entities: `src/database/entities/{entity-name}.entity.ts`
- Repositories: `src/database/repositories/{entity-name}.repository.ts`
- Path aliases: `@db/*` points to `src/database/*`

### DTO Organization
- Structure: `src/modules/{module}/dto/request/` and `src/modules/{module}/dto/response/`
- Base DTOs: `src/common/dto/` (PaginationDto, DateRangeDto, etc.)
- Controllers MUST use DTOs instead of `@ApiQuery` decorators

### Module Structure
- Repositories registered in providers but NOT exported
- Services exported for cross-module usage
- ConfigService injection REQUIRED (no direct `process.env`)
- OAuth modules inject into `auth.module.ts`, NOT `app.module.ts`

### API Response Standards
All API responses MUST follow standardized payload/meta structure:
```typescript
// Single item response
{ payload: T, meta?: { [key: string]: any } }

// Paginated response
{ payload: T[], meta: { page: number, limit: number, total: number } }
```

### Environment & Caching
- `.env.template` auto-generated from selected modules
- Caching options: `cache-redis` conflicts with `cache-memory`
- Environment variable naming conventions by category

### Code Generation Rules
- Templates in `boiler-templates/presets/{preset-name}/modules/{module-name}/`
- `meta.json` contains module configuration
- Handlebars templating with `{{projectName}}` and `{{author}}` variables
- Conflict management prevents incompatible module combinations

### Template System
- Template-based mail system with entities, repositories, and services
- Service layer patterns with constructor dependency injection
- Error handling conventions with proper HTTP status codes

### Injection Placeholders
- `// MODULE_IMPORTS_PLACEHOLDER` for import injection
- `// MODULE_REGISTER_PLACEHOLDER` for module registration

## Testing Strategy

### Backend Testing
```bash
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run test:e2e      # End-to-end tests
```

### Integration Testing
```bash
# Test project generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "preset": "nestjs-base",
    "modules": ["google-oauth"],
    "projectName": "test-project",
    "output": {"type": "zip"}
  }'
```

## Code Quality Standards

### Validation Checklist
- ✅ Repositories extend `Repository<Entity>` with DataSource
- ✅ Entities and repositories in correct directories
- ✅ Path aliases configured (`@db/*`)
- ✅ DTOs properly structured with validation decorators
- ✅ API responses follow payload/meta format
- ✅ Environment variables categorized
- ✅ Modules declare conflicts appropriately

### TypeScript Configuration
- Strict mode enabled
- Path mapping for clean imports
- Modern ES features supported

## API Endpoints

### Core Endpoints
- `GET /api/presets` - List available presets
- `POST /api/generate` - Generate project with modules
- Generated projects support ZIP download or GitHub push

## Module Development

### Creating New Modules
1. Create directory: `boiler-templates/presets/{preset}/modules/{module-name}/`
2. Add `meta.json` with configuration
3. Create `files/` directory mirroring target structure
4. Use Handlebars templates in files
5. Define dependencies, environment variables, and injection points

### Meta.json Structure
```json
{
  "name": "module-name",
  "description": "Module description",
  "category": "authentication|communication|storage",
  "required": false,
  "deps": { "package": "version" },
  "env": [{"key": "ENV_VAR", "required": true, "example": "value"}],
  "conflicts": ["conflicting-module"],
  "inject": {
    "src/app.module.ts": {
      "import": ["import statement"],
      "register": ["ModuleName"]
    }
  }
}
```

## Environment Setup

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
STORAGE_PATH=./tmp/output
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Deployment Notes

### Production Considerations
- Use proper database (PostgreSQL/MySQL instead of SQLite)
- Configure Redis for caching if needed
- Set up structured logging and monitoring
- Environment-specific configurations
- Docker deployment support available

## Common Patterns

### Repository Pattern Example
```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  }
}
```

### Service Pattern Example
```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }
}
```

### Response Format Example
```typescript
// Controller response
return {
  payload: users,
  meta: { page: 1, limit: 50, total: 100 }
};
```

This guide should be updated as the project evolves and new patterns/rules are established.