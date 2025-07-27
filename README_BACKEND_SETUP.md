# 🐍 Backend Setup Guide

## Prerequisites

### 1. Install Python 3.11+ on Windows

**Option A: Microsoft Store (Easiest)**
1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Click "Get" and install
4. Restart your terminal after installation

**Option B: Official Installer (Recommended)**
1. Visit [python.org/downloads](https://python.org/downloads)
2. Download "Python 3.12.x Windows installer (64-bit)"
3. Run installer as Administrator
4. **IMPORTANT**: Check ✅ "Add Python to PATH"
5. Click "Install Now"
6. Restart your terminal

### 2. Verify Python Installation

Open a new PowerShell window and run:
```powershell
python --version
```

You should see something like: `Python 3.12.x`

## Quick Setup

### Option 1: Use the Batch File
1. Double-click `setup_backend.bat`
2. Follow the prompts
3. Backend will start automatically

### Option 2: Manual Setup
```powershell
# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

## Backend Features

Once running, the backend provides these API endpoints:

- `GET /collatz/visualization/{start}/{end}` - 3D visualization data
- `GET /collatz/range/{start}/{end}` - Range analysis
- `GET /collatz/{number}` - Single number analysis
- `GET /collatz/sixn/{start}/{end}` - 6n analysis

## Troubleshooting

### "Python not found" Error
- Make sure Python is installed
- Check that "Add Python to PATH" was selected during installation
- Restart your terminal after installation

### "pip not found" Error
- Python installation might be incomplete
- Try reinstalling Python with "Add Python to PATH" checked

### Port 8000 Already in Use
- Change the port in `app.py` line 16
- Or kill the process using port 8000

## Testing the Backend

Once running, test with:
```powershell
curl http://localhost:8000/collatz/visualization/3/10
```

Or visit in browser:
`http://localhost:8000/collatz/visualization/3/10`

## Frontend Integration

The frontend will automatically use the backend when available, or fall back to local calculations if the backend is not running. 