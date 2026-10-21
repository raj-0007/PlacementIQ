@echo off
echo ==========================================================
echo   Starting PlacementIQ Full-Stack Application
echo ==========================================================

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start "PlacementIQ Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
start "PlacementIQ Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services launched!
echo - Frontend Web UI : http://localhost:5173
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause
