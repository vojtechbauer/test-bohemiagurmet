@echo off
title Bohemia Gourmet Launcher
echo =====================================
echo    BOHEMIA GOURMET - START
echo =====================================
echo.

echo [1/2] Kontrola instalace...
call npm install

echo.
echo [2/2] Spousteni e-shopu...
echo.
echo DULEZITE: Pokud se web sam neotevre, otevrete v prohlizeci:
echo http://localhost:5173
echo.

call npm run dev

echo.
echo Aplikace byla ukoncena.
pause
