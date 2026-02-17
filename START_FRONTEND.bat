@echo off
echo ========================================
echo  FASHION RECOMMENDATION SYSTEM
echo  Starting Frontend Server...
echo ========================================
echo.

cd /d "%~dp0frontend"

echo Starting Vite dev server on port 5173...
echo Wait for "Local: http://localhost:5173"
echo.
call npm run dev

pause
