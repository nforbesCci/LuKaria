@echo off
echo Installing CA certificate to Windows certificate store...
echo.
echo This script will install the CA certificate so your browser will trust
echo the HTTPS certificates for localhost development.
echo.
echo IMPORTANT: You must run this as Administrator!
echo.
pause

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - proceeding with installation...
    echo.
    
    REM Run the PowerShell script
    powershell -ExecutionPolicy Bypass -File "install-certificate.ps1"
    
    echo.
    echo Installation complete!
    echo Please restart your browser and try accessing https://localhost:3000
) else (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

pause

