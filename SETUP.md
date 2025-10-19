# Setup Guide - Vehicle Tracker Backend

## 🚀 Status Project

✅ **Backend API sudah siap dan berjalan!**

### Yang Sudah Selesai:
- ✅ Project structure dengan TypeScript + Express
- ✅ Authentication system dengan JWT (login, register, refresh token)
- ✅ Input validation dengan Zod
- ✅ Swagger API documentation
- ✅ Unit test dan integration test
- ✅ Security middleware (helmet, cors, rate limiting)
- ✅ Error handling
- ✅ Database schema dengan Prisma

### Yang Perlu Diselesaikan:
- ⏳ Setup PostgreSQL database
- ⏳ User Management CRUD
- ⏳ Vehicle API (list kendaraan, detail status)
- ⏳ Report API (generate .xlsx)

## 🔧 Cara Menjalankan Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
File `.env` sudah dibuat dengan konfigurasi default:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vehicle_tracker"
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3001"
```

### 3. Setup PostgreSQL Database

#### Option A: Menggunakan Laragon (Recommended)
1. Buka Laragon
2. Start Apache & MySQL (atau PostgreSQL jika ada)
3. Buka phpPgAdmin atau pgAdmin
4. Buat database baru dengan nama `vehicle_tracker`
5. Update `DATABASE_URL` di file `.env` sesuai konfigurasi PostgreSQL Anda

#### Option B: Menggunakan Docker
```bash
docker run --name postgres-vehicle-tracker -e POSTGRES_PASSWORD=password -e POSTGRES_DB=vehicle_tracker -p 5432:5432 -d postgres:13
```

### 4. Run Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database dengan data dummy
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Server akan berjalan di: http://localhost:3000

## 📚 API Documentation

Setelah server berjalan, buka:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Endpoints dengan cURL

#### 1. Health Check
```bash
curl http://localhost:3000/health
```

#### 2. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'
```

#### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

#### 4. Get Profile (dengan token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔐 Authentication Flow

1. **Register** → Dapat access token & refresh token
2. **Login** → Dapat access token & refresh token
3. **Use Access Token** → Untuk akses protected endpoints
4. **Refresh Token** → Untuk mendapatkan access token baru
5. **Logout** → Invalidate token

## 🎯 Next Steps

1. **Setup PostgreSQL** dan jalankan migration
2. **Test login endpoint** dengan data dummy
3. **Implementasi User Management CRUD**
4. **Implementasi Vehicle API**
5. **Implementasi Report API**
6. **Deploy ke production**
