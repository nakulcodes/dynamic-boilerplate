# Railway Deployment Guide

This guide walks you through deploying the Dynamic Boilerplate Generator to Railway.

## Prerequisites

1. [Railway CLI](https://docs.railway.app/develop/cli) installed
2. Railway account created
3. GitHub repository connected to Railway
4. Node.js 20+ (specified in .nvmrc and nixpacks.toml)

## Project Structure

- **Frontend**: React + Vite application (`/frontend`)
- **Backend**: NestJS API service (`/assembler-service`)

## Deployment Steps

### 1. Backend (Assembler Service)

#### Railway Configuration
- `railway.json` configured for optimal deployment
- `Dockerfile` for containerized deployment
- SQLite database with persistent storage

#### Environment Variables Required:
```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/assembler.db
DB_SYNCHRONIZE=false
DB_LOGGING=false
FRONTEND_URL=https://your-frontend-domain.railway.app
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=https://your-backend-domain.railway.app/api/auth/github/callback
```

#### Deploy Command:
```bash
cd assembler-service
railway login
railway link
railway up
```

### 2. Frontend

#### Railway Configuration
- `railway.json` configured for Docker deployment (due to Node.js version requirements)
- `Dockerfile` with Node.js 20 for Vite compatibility
- Uses `serve` for static file serving
- Resolves crypto.hash build errors with correct Node.js version

#### Environment Variables Required:
```env
VITE_API_URL=https://your-backend-domain.railway.app
```

#### Deploy Command:
```bash
cd frontend
railway login
railway link
railway up
```

## Railway Environment Setup

### Backend Service
1. Create new Railway project for backend
2. Connect GitHub repository
3. Set root directory to `/assembler-service`
4. Add environment variables listed above
5. Deploy automatically triggers on git push

### Frontend Service
1. Create new Railway project for frontend
2. Connect same GitHub repository
3. Set root directory to `/frontend`
4. Add environment variables listed above
5. Deploy automatically triggers on git push

## Database Configuration

The backend uses SQLite with file persistence:
- Database file: `/app/data/assembler.db`
- Railway provides persistent storage
- Automatic backup and recovery

## GitHub OAuth Setup

For production deployment:
1. Create GitHub OAuth App
2. Set Authorization callback URL to: `https://your-backend-domain.railway.app/api/auth/github/callback`
3. Add Client ID and Secret to Railway environment variables

## Health Checks

Both services include health check endpoints:
- Backend: `GET /api/health`
- Frontend: Nginx serves static files with proper headers

## Monitoring

Railway provides built-in monitoring:
- Application logs
- Resource usage
- Deployment history
- Custom metrics

## Scaling

Both services are configured for Railway's auto-scaling:
- Backend: Scales based on CPU/memory usage
- Frontend: CDN-based distribution
- Database: Persistent storage maintained across deployments

## Security

Production security measures included:
- Environment variable encryption
- HTTPS by default
- CORS configuration
- Security headers
- GitHub OAuth integration

## Troubleshooting

Common issues and solutions:

1. **Build failures**: Check Node.js version compatibility
2. **Database connection**: Verify DATABASE_PATH environment variable
3. **CORS errors**: Update FRONTEND_URL in backend environment
4. **GitHub OAuth**: Verify callback URL matches Railway domain

## Cost Optimization

Railway pricing considerations:
- Backend: Scales to zero when not in use
- Frontend: Static hosting with CDN
- Database: Persistent storage included
- Estimated cost: $5-20/month depending on usage