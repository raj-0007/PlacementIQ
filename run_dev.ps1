# PlacementIQ - Launch Local Development Servers (FastAPI + Vite React)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting PlacementIQ Full-Stack Application" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend FastAPI Server
Write-Host "`n[1/2] Starting FastAPI backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'PlacementIQ Backend Service' -ForegroundColor Cyan; cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

# 2. Start Frontend Vite Server
Write-Host "[2/2] Starting React Vite frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'PlacementIQ Frontend Service' -ForegroundColor Green; cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nAll services launched!" -ForegroundColor Green
Write-Host "  - Frontend Web UI : http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  - Health Endpoint : http://127.0.0.1:8000/api/health`n" -ForegroundColor White
