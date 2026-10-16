@echo off
title Yojana AI Launcher
echo ==========================================================
echo    Starting Yojana AI -- Smart Scheme Finder Platform
echo ==========================================================

echo [1/2] Launching Backend on http://127.0.0.1:8000 ...
start "Yojana AI Backend" cmd /k "cd /d %~dp0backend && set PYTHONPATH=%~dp0backend && venv\Scripts\python.exe run.py"

echo [2/2] Launching Frontend on http://127.0.0.1:5173 ...
start "Yojana AI Frontend" cmd /k "cd /d %~dp0frontend && set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && npm run dev"

echo.
echo Both servers started!
echo Frontend: http://127.0.0.1:5173
echo Backend:  http://127.0.0.1:8000/docs
echo.
pause
