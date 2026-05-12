@echo off
setlocal
title Bohemia Gourmet - Launcher

echo =========================================
echo    BOHEMIA GOURMET - E-SHOP LAUNCHER
echo =========================================
echo.

echo [1/3] Cisteni portu (4242, 5173)...
:: Using PowerShell for more reliable process killing on Windows
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 4242 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue" >nul 2>&1
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue" >nul 2>&1

echo [2/3] Kontrola knihoven...
if not exist node_modules (
    echo Instaluji potrebne knihovny (to muze chvili trvat)...
    call npm install
)

echo [3/3] Spousteni E-shopu (Frontend + Backend)...
echo.
echo TIP: Pokud se web nespusti, zkuste rucne 'npm run dev' v terminalu.
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo CHYBA: Aplikaci se nepodarilo spustit.
    echo Ujistete se, ze mate nainstalovane Node.js (prikaz 'node -v' v terminalu).
    pause
)

pause
