# 🐳 Docker Setup Guide - Vehicle Tracker

Panduan lengkap untuk menjalankan aplikasi Vehicle Tracker menggunakan Docker.

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (untuk Windows/Mac)
- [Docker Engine](https://docs.docker.com/engine/install/) (untuk Linux)

### Verifikasi Installation
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

### 1. Clone dan Setup
```bash
# Jika belum ada, clone repository
git clone <repository-url>
cd vehicle-tracker

# Pastikan file .env sudah ada
cp env.example .env
```

### 2. Jalankan dengan Docker
```bash
# Start semua services
docker-compose up --build -d

# Atau gunakan script helper (Windows)
docker-scripts.bat start

# Atau gunakan script helper (Linux/Mac)
chmod +x docker-scripts.sh
./docker-scripts.sh start
```

### 3. Verifikasi
```bash
# Cek status services
docker-compose ps

# Test API
curl http://localhost:3000/health

# Buka browser ke:
# - API: http://localhost:3000
# - API Docs: http://localhost:3000/api-docs
# - pgAdmin: http://localhost:5050
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vehicle       │    │   PostgreSQL    │    │   pgAdmin       │
│   Tracker API   │◄──►│   Database      │◄──►│   (Optional)    │
│   (Port 3000)   │    │   (Port 5432)   │    │   (Port 5050)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Docker Files

- `Dockerfile` - Konfigurasi untuk build aplikasi
- `docker-compose.yml` - Orchestration untuk semua services
- `init-db.sql` - Script inisialisasi database
- `.dockerignore` - File yang diabaikan saat build
- `docker-scripts.bat` - Helper scripts untuk Windows
- `docker-scripts.sh` - Helper scripts untuk Linux/Mac

## 🛠️ Management Commands

### Menggunakan docker-compose langsung:

```bash
# Start semua services
docker-compose up -d

# Start dengan rebuild
docker-compose up --build -d

# Stop semua services
docker-compose down

# Restart services
docker-compose restart

# Lihat logs
docker-compose logs -f

# Lihat logs API saja
docker-compose logs -f api

# Lihat logs database saja
docker-compose logs -f postgres

# Cek status
docker-compose ps

# Run migration
docker-compose exec api npx prisma migrate deploy

# Seed database
docker-compose exec api npx prisma db seed
```

### Menggunakan Helper Scripts:

#### Windows (docker-scripts.bat):
```cmd
docker-scripts.bat start      # Start semua services
docker-scripts.bat stop       # Stop semua services
docker-scripts.bat status     # Cek status
docker-scripts.bat logs       # Lihat logs
docker-scripts.bat api-logs   # Lihat logs API
docker-scripts.bat migrate    # Run migration
docker-scripts.bat seed       # Seed database
docker-scripts.bat pgadmin    # Info pgAdmin
docker-scripts.bat help       # Bantuan
```

#### Linux/Mac (docker-scripts.sh):
```bash
chmod +x docker-scripts.sh
./docker-scripts.sh start      # Start semua services
./docker-scripts.sh stop       # Stop semua services
./docker-scripts.sh status     # Cek status
./docker-scripts.sh logs       # Lihat logs
./docker-scripts.sh api-logs   # Lihat logs API
./docker-scripts.sh migrate    # Run migration
./docker-scripts.sh seed       # Seed database
./docker-scripts.sh pgadmin    # Info pgAdmin
./docker-scripts.sh help       # Bantuan
```

## 🔧 Configuration

### Environment Variables
File `.env` akan digunakan untuk konfigurasi:

```env
# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/vehicle_tracker"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"
CORS_ORIGIN="http://localhost:3001"
```

### Ports
- **API**: http://localhost:3000
- **Database**: localhost:5432
- **pgAdmin**: http://localhost:5050

### Volumes
- `postgres_data` - Data PostgreSQL
- `pgadmin_data` - Data pgAdmin
- `./uploads` - File uploads aplikasi

## 🗄️ Database Management

### pgAdmin Access
1. Buka http://localhost:5050
2. Login dengan:
   - **Email**: admin@vehicletracker.com
   - **Password**: admin123
3. Add server dengan konfigurasi:
   - **Host**: postgres
   - **Port**: 5432
   - **Database**: vehicle_tracker
   - **Username**: postgres
   - **Password**: password

### Database Commands
```bash
# Connect ke database
docker-compose exec postgres psql -U postgres -d vehicle_tracker

# Backup database
docker-compose exec postgres pg_dump -U postgres vehicle_tracker > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d vehicle_tracker < backup.sql

# Reset database (HATI-HATI: menghapus semua data)
docker-compose down
docker volume rm vehicle-tracker_postgres_data
docker-compose up -d
```

## 🧪 Testing

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Test Database Connection
```bash
# Test connection
docker-compose exec postgres pg_isready -U postgres -d vehicle_tracker

# List tables
docker-compose exec postgres psql -U postgres -d vehicle_tracker -c "\dt"
```

## 🚨 Troubleshooting

### Port sudah digunakan
```bash
# Cek port yang digunakan
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Stop service yang menggunakan port
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5432 | xargs kill -9
```

### Container tidak start
```bash
# Lihat logs
docker-compose logs api
docker-compose logs postgres

# Rebuild container
docker-compose down
docker-compose up --build -d
```

### Database connection error
```bash
# Cek status database
docker-compose exec postgres pg_isready -U postgres

# Restart database
docker-compose restart postgres

# Reset database
docker-compose down
docker volume rm vehicle-tracker_postgres_data
docker-compose up -d
```

### Permission issues
```bash
# Fix permission untuk uploads folder
sudo chown -R 1001:1001 ./uploads
sudo chmod -R 755 ./uploads
```

## 🔄 Development Workflow

### 1. Development Mode
```bash
# Start services
docker-compose up -d postgres pgadmin

# Run API di local (dengan hot reload)
npm run dev
```

### 2. Production Mode
```bash
# Start semua services
docker-compose up -d

# Monitor logs
docker-compose logs -f api
```

### 3. Update Code
```bash
# Rebuild dan restart API
docker-compose up --build -d api

# Atau restart semua
docker-compose restart
```

## 📊 Monitoring

### Health Checks
```bash
# API health
curl http://localhost:3000/health

# Database health
docker-compose exec postgres pg_isready -U postgres

# Container status
docker-compose ps
```

### Resource Usage
```bash
# Lihat resource usage
docker stats

# Lihat disk usage
docker system df
```

## 🚀 Production Deployment

### 1. Update Environment Variables
```bash
# Edit .env untuk production
nano .env
```

### 2. Build dan Deploy
```bash
# Build production image
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### 3. Setup Reverse Proxy (Optional)
```bash
# Install nginx
sudo apt install nginx

# Configure nginx untuk reverse proxy ke port 3000
```

## 📝 Notes

- Database data akan persist di volume `postgres_data`
- pgAdmin data akan persist di volume `pgadmin_data`
- File uploads akan tersimpan di folder `./uploads`
- Logs bisa dilihat dengan `docker-compose logs -f`
- Untuk development, bisa run API di local dan database di Docker

## 🆘 Support

Jika ada masalah:
1. Cek logs: `docker-compose logs -f`
2. Cek status: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Rebuild: `docker-compose up --build -d`
