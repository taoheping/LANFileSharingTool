@echo off
chcp 437 >nul
title LAN Share Tool
color 0A
cls
echo.
echo ========================================
echo          LAN File Sharing Tool
echo ========================================
echo.

echo Initializing...

set NODE_PATH=%~dp0node-v24.14.0-win-x64
set NODE_EXE=%NODE_PATH%\node.exe

if not exist "%NODE_EXE%" (
    echo ERROR: Node.js not found
    echo Please put node-v24.14.0-win-x64 in this folder
    echo.
    pause
    exit /b 1
)

echo Node.js version:
"%NODE_EXE%" --version
echo.

if not exist "shared" (
    mkdir shared
    echo shared folder created
) else (
    echo shared folder exists
)
echo.

echo ========================================
echo          Server Starting
echo ========================================
echo.
echo Server running...
echo Open the URL in your browser
echo.

"%NODE_EXE%" server.js

echo.
echo ========================================
echo          Server Stopped
echo ========================================
echo.
echo Press any key to exit...
pause >nul