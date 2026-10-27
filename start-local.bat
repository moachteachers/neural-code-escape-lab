@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
  start "" "http://127.0.0.1:8000"
  py -m http.server 8000 --bind 127.0.0.1 --directory dist
  exit /b
)

where python >nul 2>&1
if %errorlevel%==0 (
  start "" "http://127.0.0.1:8000"
  python -m http.server 8000 --bind 127.0.0.1 --directory dist
  exit /b
)

echo Python 3 was not found.
echo Install Python 3, then run this file again.
pause
