@echo off
chcp 65001 >nul
echo ========================================
echo Restart File Manager Server
echo ========================================
echo.
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done.

echo.
echo Starting server...
echo.
echo ========================================
echo SERVER STARTED
echo ========================================
echo.
echo Access at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
node server.js
pause
