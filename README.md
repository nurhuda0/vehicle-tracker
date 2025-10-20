# Vehicle Tracker Dashboard

Aplikasi Vehicle Tracker Dashboard yang dibangun dengan Node.js, TypeScript, Express.js, React, dan PostgreSQL. Aplikasi ini menyediakan sistem manajemen kendaraan dengan fitur tracking real-time, laporan, dan dashboard analytics.

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (Express.js)  │◄──►│   Database      │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼───────────────────────────────┐
                                 │                               │
                    ┌─────────────────┐              ┌─────────────────┐
                    │   Nginx         │              │   Docker Hub    │
                    │   Reverse Proxy │              │   (Images)      │
                    │   SSL/HTTPS     │              │                 │
                    └─────────────────┘              └─────────────────┘
```

### Komponen Utama:
- **Frontend**: React dengan TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js dengan Express.js, TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **Containerization**: Docker dengan multi-stage builds
- **Reverse Proxy**: Nginx dengan SSL (Let's Encrypt)
- **CI/CD**: GitHub Actions dengan automated testing dan deployment

## 🚀 Fitur

- **Authentication**: Login dengan JWT (access & refresh token)
- **User Management**: CRUD operations untuk user
- **Vehicle Management**: Manajemen kendaraan dan status tracking
- **Reports**: Generate laporan dalam format .xlsx
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Input validation dengan Zod
- **Testing**: Unit test dan integration test

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

## 🐳 Docker Setup (Recommended)

### Quick Start dengan Docker Compose

1. Clone repository:
```bash
git clone <repository-url>
cd vehicle-tracker
```

2. Setup environment variables:
```bash
cp env.example .env
```

3. Start semua services:
```bash
docker-compose up -d
```

Aplikasi akan tersedia di:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **pgAdmin**: http://localhost:5050

### Development Setup

1. Clone repository:
```bash
git clone <repository-url>
cd vehicle-tracker
```

2. Install dependencies:
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

3. Setup environment variables:
```bash
cp env.example .env
```

Edit file `.env` dengan konfigurasi database dan JWT secrets Anda.

4. Setup database:
```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Seed database dengan data dummy
npm run seed
```

5. Start development servers:
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 API Documentation

Setelah menjalankan aplikasi, dokumentasi API tersedia di:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── config/          # Konfigurasi aplikasi
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic
├── validators/      # Input validation schemas
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── __tests__/       # Test files
└── index.ts         # Application entry point

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Database seeding
```

## 🔐 Authentication

API menggunakan JWT untuk authentication dengan access token dan refresh token:

- **Access Token**: Expires dalam 15 menit
- **Refresh Token**: Expires dalam 7 hari

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Using Access Token
```bash
Authorization: Bearer <access_token>
```

## 🗄️ Database Schema

### Users
- id, email, password, name, role, isActive, timestamps

### Vehicles
- id, plateNumber, model, brand, year, status, timestamps

### Vehicle Status Records
- id, vehicleId, status, latitude, longitude, speed, timestamp

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Vehicles (Protected)
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `GET /api/vehicles/:id/status` - Get vehicle status
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Reports (Protected)
- `GET /api/reports/generate` - Generate report

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vehicle_tracker"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3001"
```

## 🚀 Deployment

### Production Deployment ke VPS

1. **Persiapan Server (Ubuntu 20.04+)**
```bash
# Clone repository ke server
git clone <repository-url> /opt/vehicle-tracker
cd /opt/vehicle-tracker

# Jalankan script deployment
sudo chmod +x deploy/deploy.sh
sudo ./deploy/deploy.sh
```

2. **Setup Environment Variables**
```bash
# Edit file environment production
sudo nano .env

# Atau copy dari template
sudo cp env.example .env
```

3. **Setup SSL dengan Let's Encrypt**
```bash
# Jalankan script SSL setup
sudo chmod +x deploy/setup-ssl.sh
sudo DOMAIN=your-domain.com ./deploy/setup-ssl.sh
```

4. **Start Application**
```bash
# Start dengan systemd service
sudo systemctl start vehicle-tracker
sudo systemctl enable vehicle-tracker

# Check status
sudo systemctl status vehicle-tracker
```

### Manual Docker Deployment

```bash
# Build images
docker build -t vehicle-tracker-backend .
docker build -t vehicle-tracker-frontend ./frontend

# Run dengan production compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 CI/CD Pipeline

Aplikasi menggunakan GitHub Actions untuk CI/CD pipeline yang mencakup:

### Workflow Steps:
1. **Backend Testing**: Lint, unit tests, integration tests
2. **Frontend Testing**: Lint, build verification
3. **Docker Build**: Multi-stage builds untuk backend dan frontend
4. **Docker Push**: Push images ke Docker Hub
5. **Deploy**: Automated deployment ke VPS via SSH

### Required Secrets:
Tambahkan secrets berikut di GitHub repository settings:

```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
SERVER_HOST=your-server-ip
SERVER_USERNAME=your-server-username
SERVER_SSH_KEY=your-private-ssh-key
```

### Pipeline Triggers:
- **Push to main**: Full CI/CD pipeline dengan deployment
- **Pull Request**: Testing dan build verification
- **Push to develop**: Testing dan build tanpa deployment

## 📊 Monitoring & Logs

### Application Logs
```bash
# View application logs
sudo journalctl -u vehicle-tracker -f

# View Docker logs
docker-compose logs -f
```

## 🧪 Testing & Coverage

### Test Coverage Requirements
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run frontend tests
cd frontend && npm test
```

### Coverage Reports
Coverage reports tersedia di:
- **HTML Report**: `coverage/index.html`
- **LCOV Report**: `coverage/lcov.info`


