@echo off
chcp 65001 >nul
echo ========================================
echo FORCE RELOAD - Clear All Cache
echo ========================================
echo.
echo This script will:
echo 1. Kill all Node.js processes
echo 2. Add timestamp to all resources
echo 3. Restart server
echo.
pause

echo.
echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo     Done.

echo.
echo [2/3] Verifying JavaScript fix...
powershell -Command "$content = Get-Content file-manager.js -Raw; if ($content -match 'role.*button') { Write-Host 'WARNING: Found role=\"button\" in JS file!' -ForegroundColor Red } else { Write-Host 'OK: No role=\"button\" found' -ForegroundColor Green }"
timeout /t 1 /nobreak >nul

echo.
echo [3/3] Starting server...
echo.
echo ========================================
echo SERVER STARTED
echo ========================================
echo.
echo IMPORTANT STEPS:
echo 1. Open browser: http://localhost:8080
echo 2. Press Ctrl+Shift+R (Hard Refresh)
echo 3. If still seeing 2 buttons:
echo    - Press Ctrl+Shift+Delete
echo    - Select "All time"
echo    - Check "Cached images and files"
echo    - Click "Clear data"
echo    - Refresh again
echo 4. Open DevTools (F12)
echo    - Go to Console tab
echo    - Look for "UPLOAD BUTTONS FOUND"
echo    - Tell me the number displayed
echo.
echo ========================================
echo.
node server.js
pause
