@echo off
echo Setting up Collatz Visualizer Backend...
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo Python not found! Please install Python first.
    echo Visit: https://python.org/downloads
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting backend server...
echo Backend will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python app.py

pause 