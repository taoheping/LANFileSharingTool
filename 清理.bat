@echo off
chcp 65001 >nul
cls
echo ========================================
echo FULL CACHE CLEANUP AND RESTART
echo ========================================
echo.

echo [1] Stopping Node.js server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo    Server stopped.
echo.

echo [2] Clearing browser cache instructions...
echo    Please clear your browser cache now:
echo    - Press Ctrl+Shift+Delete
echo    - Select "Cached images and files"
echo    - Click "Clear data"
echo    - Or use Incognito/Private mode
echo.

echo [3] Verification of fix...
echo.
echo Checking server.js:
findstr /C:"enableAuth" server.js
echo.

echo Checking HTML file input style:
findstr /C:"file-input" file-manager.css | findstr /C:"display"
echo.

echo Checking file-manager.js for role button:
findstr /C:"role.*button" file-manager.js
echo.

echo ========================================
echo READY TO START SERVER
echo ========================================
echo.
echo After clearing browser cache, press any key to start server...
pause >nul

cls
echo Starting server...
echo ========================================
echo Server is running at:
echo - http://localhost:8080
echo - http://YOUR_IP:8080
echo.
echo Please refresh your browser (Ctrl+F5) after server starts!
echo ========================================
echo.

node server.js

pause
