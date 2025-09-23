# Dynamic Boilerplate Generator

A modular project generator that creates ready-to-use repositories by combining a base preset with selected feature modules. The system provides deterministic assembly, GitHub integration, and support for customizable templates.

## 🚀 Features

- **Modular Architecture**: Mix and match feature modules with base presets
- **Ready-to-Run Projects**: Generated projects include dependencies, configuration, and documentation
- **Multiple Output Formats**: Download as ZIP or push directly to GitHub
- **Template System**: Handlebars templating for dynamic file generation
- **Conflict Detection**: Automatic detection and prevention of incompatible modules
- **Environment Management**: Automatic aggregation of required environment variables

## 📦 Project Structure

```
dynamic-boilerplate/
├── assembler-service/          # Backend API service (NestJS)
├── boiler-templates/           # Template repository
│   └── presets/
│       └── nestjs-base/        # NestJS preset with modules
├── frontend/                   # React module selector UI
└── examples/                   # Example generated projects
```

## 🛠 Tech Stack

### Backend (assembler-service)
- **NestJS** - Node.js framework
- **TypeScript** - Type safety and modern JavaScript
- **Handlebars** - Template engine for dynamic file generation
- **Archiver** - ZIP file creation
- **Simple-git** - Git operations for GitHub integration

### Frontend
- **React** - User interface library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API communication

### Base Preset (NestJS)
- **JWT Authentication** - Secure user authentication
- **TypeORM** - Database ORM with SQLite default
- **Winston Logging** - Structured logging with daily rotation
- **Passport Strategies** - Local and JWT authentication
- **Input Validation** - Request validation with class-validator

## 📋 Available Modules

### Google OAuth (`google-oauth`)
- Google OAuth2 authentication strategy
- User account linking and creation
- Secure token handling

### Google Calendar (`google-calendar`)
- Full Calendar API integration
- Event CRUD operations
- Calendar management
- Webhook support for real-time updates

### Enhanced Logging (`enhanced-logging`)
- Elasticsearch integration for log aggregation
- Prometheus metrics collection
- Performance monitoring
- Custom metrics endpoint

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd dynamic-boilerplate

# Setup backend
cd assembler-service
cp .env.example .env
npm install

# Setup frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Start Development Servers

**Backend** (Terminal 1):
```bash
cd assembler-service
npm run start:dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

### 3. Generate Your First Project
1. Open http://localhost:5173
2. Select the "nestjs-base" preset
3. Choose your desired modules
4. Configure project name and author
5. Click "Generate Project"
6. Download the generated ZIP file

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
STORAGE_PATH=./tmp/output

# Optional: GitHub Integration
GITHUB_TOKEN=your_github_token
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Testing

### Backend Tests
```bash
cd assembler-service
npm test                    # Run unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                   # Run tests
```

### Integration Testing
```bash
# Generate a test project
cd assembler-service
npm run build
node dist/main.js

# Test generation via API
curl -X POST http://localhost:3000/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "nestjs-base",
    "modules": ["google-oauth"],
    "projectName": "test-project",
    "output": {"type": "zip"}
  }'
```

## 📚 API Documentation

### Get Available Presets
```http
GET /api/presets
```

### Generate Project
```http
POST /api/generate
Content-Type: application/json

{
  "preset": "nestjs-base",
  "modules": ["google-oauth", "google-calendar"],
  "projectName": "my-awesome-app",
  "author": "Your Name",
  "output": {
    "type": "zip"
  }
}
```

## 🔌 Adding Custom Modules

### 1. Create Module Structure
```
boiler-templates/presets/nestjs-base/modules/my-module/
├── files/                  # Files to copy
│   └── src/
│       └── my-feature/
├── meta.json              # Module metadata
└── README.module.md       # Optional documentation
```

### 2. Define Module Metadata
```json
{
  "name": "my-module",
  "description": "Custom feature module",
  "deps": {
    "some-package": "^1.0.0"
  },
  "env": ["MY_API_KEY"],
  "inject": {
    "src/app.module.ts": {
      "import": ["import { MyModule } from './my-feature/my.module';"],
      "register": ["MyModule"]
    }
  }
}
```

### 3. Template Files
Use Handlebars syntax in your files:
```typescript
// files/src/my-feature/my.service.ts
export class MyService {
  constructor() {
    console.log('{{projectName}} - MyService initialized');
  }
}
```

## 🚀 Deployment

### Docker Deployment
```bash
# Backend
cd assembler-service
docker build -t assembler-service .
docker run -p 3000:3000 assembler-service

# Frontend
cd frontend
npm run build
# Serve dist/ with your preferred static server
```

### Production Environment
- Use a proper database (PostgreSQL, MySQL)
- Configure Redis for caching
- Set up proper logging and monitoring
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

- Create an issue for bug reports or feature requests
- Check existing issues before creating new ones
- Provide detailed information and steps to reproduce

## 🗺 Roadmap

- [ ] **GitHub App Integration** - Direct repository creation and push
- [ ] **Multi-language Support** - React, Vue, Python, Go presets
- [ ] **Advanced Templating** - LLM-powered code generation
- [ ] **Module Marketplace** - Community-contributed modules
- [ ] **CI/CD Templates** - Automatic workflow generation
- [ ] **Docker Integration** - Container-ready projects
- [ ] **Real-time Collaboration** - Multi-user project building

---

Built with ❤️ using NestJS and React


1. Implement a google login for project. 
2. As soon as page is opened if google login is not done show popup for google login. Add simple user entities for it. 
3. One call back is verifeid redirect back to frontend with logged in google



1. Remove all database realated modules from `base` folder in `nestjs-base` project. 
2. Strcuture database module present in `nestjs-base/modules`. After generation database should be present in modules above database having entities, repositories, seed and all. 
3. Use config service to get variables
4. If database url is present then use that else other variables make template accoridgly
