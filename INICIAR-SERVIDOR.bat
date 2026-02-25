@echo off
title PontoUm Digital - Servidor local
cd /d "%~dp0"

echo.
echo ========================================
echo   PontoUm Digital - Iniciando servidor
echo ========================================
echo.

if not exist "node_modules" (
    echo Instalando dependencias... Aguarde.
    call npm install
    if errorlevel 1 (
        echo ERRO: Instale o Node.js em https://nodejs.org
        pause
        exit /b 1
    )
    echo.
)

echo Abrindo: http://localhost:5173
echo Para parar: feche esta janela ou pressione Ctrl+C
echo ========================================
echo.

start "" http://localhost:5173
call npm run dev
pause
