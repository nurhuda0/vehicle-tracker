# Vehicle Tracker Dashboard Backend

Backend API untuk aplikasi Vehicle Tracker Dashboard yang dibangun dengan Node.js, TypeScript, Express.js, dan PostgreSQL.

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

## 🔧 Installation

1. Clone repository:
```bash
git clone <repository-url>
cd vehicle-tracker
```

2. Install dependencies:
```bash
npm install
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

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database
- `npm run generate` - Generate Prisma client

