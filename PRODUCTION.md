# Frontend Production Deployment Guide

Simple guide to deploy your React frontend application to a Linux VM.

## Prerequisites

- Linux VM with Docker and Docker Compose installed
- Git access to your repository
- Backend API running and accessible

## Quick Deployment

### 1. Clone and Setup

```bash
# Clone your repository
git clone <your-repo-url>
cd admin-panel

# Make scripts executable
chmod +x deploy.sh

# Setup environment (optional)
./deploy.sh
```

### 2. Configure Backend URL

Edit `.env.production` to point to your backend:

```bash
# Create environment file
cat > .env.production << EOF
NODE_ENV=production
VITE_API_URL=http://your-backend-ip:3003
EOF
```

## Manual Steps

If you prefer to do it manually:

### 1. Create Environment File

```bash
# Create .env.production with your backend URL
cat > .env.production << EOF
NODE_ENV=production
VITE_API_URL=http://your-backend-ip:3003
EOF
```

### 2. Deploy with Docker Compose

```bash
# Build and start
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check status
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# View logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

## Management Commands

```bash
# Stop application
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Restart application
docker compose -f docker-compose.prod.yml --env-file .env.production restart

# Update application
git pull
./deploy.sh

# View logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend
```

## Access Points

- **Frontend**: http://your-server-ip:3000
- **Health Check**: http://your-server-ip:3000/health

## Configuration

### Environment Variables

- `NODE_ENV`: Set to "production"
- `VITE_API_URL`: URL of your backend API

### Backend Integration

Make sure your backend is accessible from the frontend container. If running on the same server:

```bash
# Use internal Docker network
VITE_API_URL=http://backend-container-name:3000

# Or use server IP
VITE_API_URL=http://your-server-ip:3003
```

## Security Notes

- Use HTTPS in production
- Set up proper CORS on backend
- Configure Content Security Policy
- Use environment variables for sensitive data 