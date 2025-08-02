# Admin Panel - Full Stack Production Deployment

Complete production deployment setup for the admin panel with React frontend and Node.js backend.

## 🏗️ Architecture

- **Frontend**: React + Vite + Refine (Port 3000)
- **Backend**: Node.js + Express + Prisma + PostgreSQL (Port 3003)
- **Database**: External PostgreSQL (recommended) or Docker PostgreSQL

## 🚀 Quick Start

### Prerequisites

- Linux VM with Docker and Docker Compose installed
- Git access to your repository

### One-Command Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd your-project

# Make scripts executable
chmod +x deploy-full-stack.sh
chmod +x admin-panel-backend/deploy.sh
chmod +x admin-panel-backend/setup-env.sh
chmod +x admin-panel/deploy.sh

# Deploy everything
./deploy-full-stack.sh
```

## 📁 Project Structure

```
your-project/
├── admin-panel-backend/          # Backend API
│   ├── docker-compose.prod.yml   # Backend Docker Compose
│   ├── Dockerfile.prod           # Backend Dockerfile
│   ├── deploy.sh                 # Backend deployment script
│   ├── setup-env.sh              # Backend environment setup
│   └── .env.production           # Backend environment variables
├── admin-panel/                  # Frontend React App
│   ├── docker-compose.prod.yml   # Frontend Docker Compose
│   ├── Dockerfile.prod           # Frontend Dockerfile
│   ├── nginx.conf                # Nginx configuration
│   ├── deploy.sh                 # Frontend deployment script
│   └── .env.production           # Frontend environment variables
└── deploy-full-stack.sh          # Combined deployment script
```

## 🔧 Individual Deployments

### Backend Only

```bash
cd admin-panel-backend
./setup-env.sh    # Generate environment file
./deploy.sh       # Deploy backend
```

### Frontend Only

```bash
cd admin-panel
# Edit .env.production with your backend URL
./deploy.sh       # Deploy frontend
```

## 🌐 Access Points

After deployment:

- **Frontend**: http://your-server-ip:3000
- **Backend API**: http://your-server-ip:3003
- **Backend Health**: http://your-server-ip:3003/health
- **Frontend Health**: http://your-server-ip:3000/health

## ⚙️ Configuration

### Backend Environment (.env.production)

```bash
# Database connection
DATABASE_URL="postgresql://username:password@your-database-host:5432/admin_panel"

# JWT configuration
JWT_SECRET=your-super-secure-jwt-secret
```

### Frontend Environment (.env.production)

```bash
# Backend API URL
VITE_API_URL=http://your-backend-ip:3003
```

## 🛠️ Management Commands

### View Logs

```bash
# Backend logs
docker compose -f admin-panel-backend/docker-compose.prod.yml logs -f

# Frontend logs
docker compose -f admin-panel/docker-compose.prod.yml logs -f
```

### Restart Services

```bash
# Restart backend
docker compose -f admin-panel-backend/docker-compose.prod.yml restart

# Restart frontend
docker compose -f admin-panel/docker-compose.prod.yml restart
```

### Update Application

```bash
# Update everything
git pull
./deploy-full-stack.sh

# Or update individually
cd admin-panel-backend && ./deploy.sh
cd ../admin-panel && ./deploy.sh
```

## 🔒 Security Considerations

1. **Environment Files**: Never commit `.env.production` files
2. **HTTPS**: Use reverse proxy (nginx) with SSL certificates
3. **Firewall**: Configure firewall to allow only necessary ports
4. **Database**: Use external database for production
5. **Secrets**: Rotate JWT secrets regularly

## 🗄️ Database Setup

### Option 1: External Database (Recommended)

```bash
# Update DATABASE_URL in admin-panel-backend/.env.production
DATABASE_URL="postgresql://username:password@your-db-server:5432/admin_panel"
```

### Option 2: Docker Database

```bash
# Add to admin-panel-backend/docker-compose.prod.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: admin_panel
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

## 📊 Monitoring

### Health Checks

```bash
# Test backend health
curl http://your-server-ip:3003/health

# Test frontend health
curl http://your-server-ip:3000/health
```

### Database Backup

```bash
# If using external database
pg_dump "postgresql://username:password@your-db-server:5432/admin_panel" > backup.sql

# If using Docker database
docker exec admin-panel-postgres pg_dump -U postgres admin_panel > backup.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose files
2. **Database connection**: Check DATABASE_URL and network connectivity
3. **Frontend can't reach backend**: Update VITE_API_URL
4. **Permission errors**: Make scripts executable with `chmod +x`

### Logs

```bash
# Check backend logs
docker compose -f admin-panel-backend/docker-compose.prod.yml logs backend

# Check frontend logs
docker compose -f admin-panel/docker-compose.prod.yml logs frontend
```

## 📚 Additional Resources

- [Backend Production Guide](admin-panel-backend/PRODUCTION.md)
- [Frontend Production Guide](admin-panel/PRODUCTION.md)
- [API Documentation](admin-panel-backend/API_DOCUMENTATION.md)
