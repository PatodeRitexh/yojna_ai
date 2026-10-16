Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting Yojana AI — Smart Scheme Finder Platform      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$pythonExe = Join-Path $backendPath "venv\Scripts\python.exe"

# Start Backend in a new window
Write-Host "[1/2] Launching Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH = '$backendPath'; Set-Location '$backendPath'; & '$pythonExe' run.py"

# Start Frontend in a new window
Write-Host "[2/2] Launching Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Yellow
$nodePath = "$env:LOCALAPPDATA\Programs\nodejs"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$nodePath;' + `$env:PATH; Set-Location '$frontendPath'; npm run dev"

Start-Sleep -Seconds 2
Write-Host "Both servers launched!" -ForegroundColor Green
Write-Host "• Frontend UI: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "• Backend API: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Press any key to exit this launcher window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
