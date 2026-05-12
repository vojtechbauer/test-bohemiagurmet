@echo off
setlocal
title Bohemia Gourmet - Launcher

echo =========================================
echo    BOHEMIA GOURMET - E-SHOP LAUNCHER
echo =========================================
echo.

echo [1/3] Cisteni portu (4242, 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4242') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] Kontrola knihoven...
if not exist node_modules (
    echo Instaluji potrebne knihovny (to muze chvili trvat)...
    call npm install
)

echo [3/3] Spousteni E-shopu (Frontend + Backend)...
echo.
echo TIP: Pokud se otevre vice oken, pouzijte to s portem 5173.
echo.

call npm run dev

pause
