@echo off
setlocal enabledelayedexpansion

REM Vehicle Tracker Docker Management Scripts for Windows

:main
if "%1"=="start" goto start_all
if "%1"=="stop" goto stop_all
if "%1"=="restart" goto restart_all
if "%1"=="status" goto show_status
if "%1"=="logs" goto show_logs
if "%1"=="api-logs" goto show_api_logs
if "%1"=="db-logs" goto show_db_logs
if "%1"=="migrate" goto run_migration
if "%1"=="seed" goto seed_database
if "%1"=="reset-db" goto reset_database
if "%1"=="pgadmin" goto open_pgadmin
if "%1"=="cleanup" goto cleanup
if "%1"=="help" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help
goto show_help

:start_all
echo ================================
echo Starting Vehicle Tracker with Docker
echo ================================
echo [INFO] Building and starting all services...
docker-compose up --build -d
echo [INFO] Services started! Check status with: docker-scripts.bat status
goto end

:stop_all
echo ================================
echo Stopping Vehicle Tracker
echo ================================
echo [INFO] Stopping all services...
docker-compose down
echo [INFO] All services stopped!
goto end

:restart_all
echo ================================
echo Restarting Vehicle Tracker
echo ================================
echo [INFO] Restarting all services...
docker-compose restart
echo [INFO] Services restarted!
goto end

:show_status
echo ================================
echo Vehicle Tracker Status
echo ================================
docker-compose ps
echo.
echo [INFO] API Health Check:
curl -s http://localhost:3000/health
echo.
echo [INFO] Database Connection:
docker-compose exec postgres pg_isready -U postgres -d vehicle_tracker
goto end

:show_logs
echo ================================
echo Vehicle Tracker Logs
echo ================================
docker-compose logs -f
goto end

:show_api_logs
echo ================================
echo API Logs
echo ================================
docker-compose logs -f api
goto end

:show_db_logs
echo ================================
echo Database Logs
echo ================================
docker-compose logs -f postgres
goto end

:run_migration
echo ================================
echo Running Database Migration
echo ================================
echo [INFO] Running Prisma migrations...
docker-compose exec api npx prisma migrate deploy
echo [INFO] Migration complete!
goto end

:seed_database
echo ================================
echo Seeding Database
echo ================================
echo [INFO] Seeding database with dummy data...
docker-compose exec api npx prisma db seed
echo [INFO] Database seeded!
goto end

:reset_database
echo ================================
echo Resetting Database
echo ================================
echo [WARNING] This will delete all data in the database!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo [INFO] Stopping services...
    docker-compose down
    echo [INFO] Removing database volume...
    docker volume rm vehicle-tracker_postgres_data
    echo [INFO] Starting services with fresh database...
    docker-compose up -d
    echo [INFO] Database reset complete!
) else (
    echo [INFO] Database reset cancelled.
)
goto end

:open_pgadmin
echo ================================
echo Opening pgAdmin
echo ================================
echo [INFO] pgAdmin is available at: http://localhost:5050
echo [INFO] Email: admin@vehicletracker.com
echo [INFO] Password: admin123
echo [INFO] Database connection:
echo [INFO]   Host: postgres
echo [INFO]   Port: 5432
echo [INFO]   Database: vehicle_tracker
echo [INFO]   Username: postgres
echo [INFO]   Password: password
goto end

:cleanup
echo ================================
echo Cleaning Up
echo ================================
echo [WARNING] This will remove all containers, volumes, and images!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo [INFO] Stopping and removing containers...
    docker-compose down -v
    echo [INFO] Removing images...
    docker-compose down --rmi all
    echo [INFO] Cleanup complete!
) else (
    echo [INFO] Cleanup cancelled.
)
goto end

:show_help
echo ================================
echo Vehicle Tracker Docker Scripts
echo ================================
echo Usage: docker-scripts.bat [command]
echo.
echo Commands:
echo   start       - Start all services
echo   stop        - Stop all services
echo   restart     - Restart all services
echo   status      - Show status of all services
echo   logs        - Show logs from all services
echo   api-logs    - Show API logs only
echo   db-logs     - Show database logs only
echo   migrate     - Run database migrations
echo   seed        - Seed database with dummy data
echo   reset-db    - Reset database (WARNING: deletes all data)
echo   pgadmin     - Show pgAdmin connection info
echo   cleanup     - Remove all containers and volumes
echo   help        - Show this help message
echo.
echo Examples:
echo   docker-scripts.bat start
echo   docker-scripts.bat status
echo   docker-scripts.bat api-logs
goto end

:end
endlocal
