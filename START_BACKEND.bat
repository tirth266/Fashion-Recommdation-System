@echo off
echo ========================================
echo  FASHION RECOMMENDATION SYSTEM
echo  Starting Backend Server...
echo ========================================
echo.

cd /d "%~dp0backend"

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Starting Flask backend on port 5000...
echo Wait for "Recommender Loaded" message
echo.
python run.py

pause
