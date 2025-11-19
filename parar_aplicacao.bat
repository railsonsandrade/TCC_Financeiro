@echo off
cls

echo ============================================================
echo.
echo        PARAR SISTEMA DE GESTAO FINANCEIRA
echo.
echo ============================================================
echo.
echo Procurando processos da aplicacao...
echo.

REM Parar processos do Node.js (Frontend)
echo Parando Frontend (Node.js)...
taskkill /F /FI "WINDOWTITLE eq Frontend - Next.js*" 2>nul
if %errorlevel% equ 0 (
    echo    [OK] Frontend parado
) else (
    echo    [AVISO] Frontend nao estava rodando
)

REM Parar processos do Python/Uvicorn (Backend)
echo Parando Backend (Python/Uvicorn)...
taskkill /F /FI "WINDOWTITLE eq Backend - FastAPI*" 2>nul
if %errorlevel% equ 0 (
    echo    [OK] Backend parado
) else (
    echo    [AVISO] Backend nao estava rodando
)

echo.
echo ============================================================
echo  APLICACAO PARADA!
echo ============================================================
echo.
echo Para iniciar novamente, execute: iniciar_aplicacao.bat
echo.
pause

