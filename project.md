# Dynamic Boilerplate Generator

## Overview
A modular project generator that creates ready-to-use repositories by combining a base preset with selected feature modules. The system provides deterministic assembly, GitHub integration, and support for customizable templates.

## Architecture Components

### Frontend (UI)
- Preset selector interface
- Module checkbox selection
- Project configuration inputs (name, visibility, GitHub options)
- Live preview of file tree and package.json
- Download/GitHub push options

### Backend API (Assembler Service)
- HTTP REST API for generation requests
- Module validation and conflict resolution
- Deterministic project assembly
- ZIP creation and GitHub repository creation

### Template Repository Structure
```
boiler-templates/
├── presets/
│   ├── nestjs-base/
│   │   ├── base/              # Base project scaffold
│   │   └── modules/           # Feature modules
│   │       ├── signup/
│   │       ├── signin/
│   │       ├── gmail/
│   │       └── google-calendar/
│   └── nextjs-frontend/       # Future preset
└── scaffolding-scripts/
```

### Worker/Queue System
- Optional async processing with BullMQ/RabbitMQ
- Background generation for large projects
- Task status tracking and monitoring

## Module System

### Module Structure
```
modules/<module-name>/
├── files/                     # Files to copy into generated project
├── meta.json                  # Module metadata and configuration
└── README.module.md           # Optional module documentation
```

### Module Metadata Schema
```json
{
  "name": "gmail",
  "description": "Gmail integration (OAuth2 + Gmail API)",
  "deps": { "googleapis": "^110.0.0" },
  "devDeps": { "@types/googleapis": "^110.0.0" },
  "env": ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"],
  "filesPath": "files",
  "conflicts": [],
  "inject": {
    "src/app.module.ts": {
      "import": ["import { GmailModule } from './integrations/providers/gmail/gmail.module';"],
      "register": ["GmailModule"]
    }
  },
  "postInstall": ["scripts/module-setup.js"]
}
```

## Assembly Process

### Core Algorithm
1. **Validation**: Verify preset exists, validate modules, check conflicts
2. **Base Setup**: Copy preset base files, apply templating ({{projectName}}, {{author}})
3. **Module Integration**:
   - Copy module files with merge strategy
   - Merge dependencies into package.json
   - Aggregate environment variables
   - Apply code injections at placeholder markers
4. **Finalization**: Generate project metadata, run post-install scripts
5. **Output**: Create ZIP or push to GitHub repository

### Injection System
Uses placeholder markers in base files for deterministic code injection:
```typescript
// MODULE_IMPORTS_PLACEHOLDER
// MODULE_REGISTER_PLACEHOLDER
```

Modules specify injection points in meta.json to add imports and register components.

## API Contract

### Generation Endpoint
**POST /api/generate**
```json
{
  "preset": "nestjs-base",
  "modules": ["signup", "signin", "gmail"],
  "projectName": "acme-backend",
  "output": {
    "type": "zip|github",
    "github": {
      "owner": "my-org",
      "repoName": "acme-backend",
      "authMethod": "oauth|github_app"
    }
  }
}
```

**Response:**
```json
{
  "status": "success|queued|error",
  "outputUrl": "https://.../project.zip",
  "repoUrl": "https://github.com/org/repo",
  "envRequired": ["DATABASE_URL", "JWT_SECRET"]
}
```

## GitHub Integration

### Authentication Methods
- **GitHub OAuth**: User token-based (simple setup)
- **GitHub App**: Recommended for organizations (short-lived tokens)
- **Deploy Keys**: For pre-existing repositories

### Security Best Practices
- No long-lived token storage
- Ephemeral installation tokens
- Least-privilege scopes
- Encrypted credential handling

## Development Milestones

### Milestone 0: MVP (2-4 weeks)
- ✅ Core assembler implementation
- ✅ Basic NestJS preset with signup/signin/gmail modules
- ✅ Synchronous ZIP generation
- ✅ Simple frontend interface
- ✅ Unit and integration tests

### Milestone 1: GitHub Integration (4-8 weeks)
- 🔄 GitHub OAuth and App authentication
- 🔄 Async worker queue implementation
- 🔄 Repository creation and push functionality
- 🔄 UI preview with file tree

### Milestone 2: Advanced Features (8-16 weeks)
- 📋 AST-based injection using ts-morph
- 📋 Private module marketplace
- 📋 CI/CD template generation
- 📋 Optional LLM-based conflict resolution

## Key Features

### Current Capabilities
- Modular project generation
- Deterministic file merging
- Package.json dependency consolidation
- Environment variable aggregation
- Template variable substitution
- Code injection at markers

### Planned Enhancements
- AST-based TypeScript injection
- Module conflict resolution UI
- Custom template creation
- LLM-powered documentation generation
- Multi-framework support (React, Vue, etc.)

## Testing Strategy

### Test Coverage
- **Unit Tests**: Schema validation, merge logic, injection system
- **Integration Tests**: Full generation workflow, dependency installation
- **Smoke Tests**: Generated project startup and health checks
- **E2E Tests**: Complete user flow from UI to GitHub

### CI/CD Pipeline
- Automated testing on every commit
- Generated project validation
- Performance benchmarking
- Security scanning

## Usage Examples

### Basic ZIP Generation
Select NestJS preset → Choose modules (signup, signin, gmail) → Configure project → Download ZIP

### GitHub Repository Creation
Select preset → Choose modules → Configure GitHub options → Authenticate → Generate repository

### Module Development
Create files/ directory → Define meta.json → Test injection points → Submit to marketplace

This project provides a scalable foundation for creating customized project boilerplates with modular architecture and automated deployment capabilities.