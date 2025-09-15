# {{projectName}}

Generated NestJS application with authentication, logging, and database integration.

## Features

- ✅ JWT Authentication
- ✅ User Management
- ✅ Winston Logging with Daily Rotation
- ✅ TypeORM Database Integration
- ✅ Input Validation
- ✅ CORS Configuration
- ✅ Environment Configuration

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /api/health` - Check application health

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Database connection | `database.sqlite` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `24h` |
| `LOG_LEVEL` | Logging level | `info` |

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── common/         # Shared utilities
│   └── logging/    # Winston logging
├── config/         # Configuration
├── app.module.ts   # Root module
└── main.ts         # Application entry
```

## Development

```bash
# Development
npm run start:dev

# Build
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## Author

{{author}}