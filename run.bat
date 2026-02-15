@echo off
echo.
echo   UI5 Theme Switching POC - Indito
echo   ================================
echo.
echo   1. Local mod    (UI5 CLI, port 8100)
echo   2. CDN mod      (SAPUI5 CDN, port 8080)
echo   3. Hybrid mod   (backend proxy, port 8300)
echo.
set /p choice="  Valassz (1-3): "

if "%choice%"=="1" (
    echo.
    echo   Local mod indul a 8100-as porton...
    npx @ui5/cli serve --open index.html --port 8100
)
if "%choice%"=="2" (
    echo.
    echo   CDN mod indul a 8080-as porton...
    npx http-server webapp -p 8080 -o index-cdn.html
)
if "%choice%"=="3" (
    echo.
    echo   Hybrid mod indul a 8300-as porton...
    npx @ui5/cli serve --config ui5-backend.yaml --open index-hybrid.html --port 8300
)
