@echo off
cls

echo ============================================================
echo.
echo        SISTEMA DE GESTAO FINANCEIRA PESSOAL
echo.
echo ============================================================
echo.
echo Iniciando aplicacao...
echo.

REM Verificar se o banco de dados existe
if not exist "database\tcc_financeira.db" (
    echo ERRO: Banco de dados nao encontrado!
    echo Execute primeiro o script de criacao do banco.
    pause
    exit /b 1
)

echo [OK] Banco de dados encontrado
echo.

REM Verificar se o ambiente virtual existe
if not exist "venv\Scripts\python.exe" (
    echo ERRO: Ambiente virtual nao encontrado!
    echo Execute primeiro: python -m venv venv
    pause
    exit /b 1
)

echo [OK] Ambiente virtual encontrado
echo.

REM Verificar se node_modules existe
if not exist "frontend\node_modules" (
    echo AVISO: Dependencias do frontend nao instaladas
    echo Instalando dependencias...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo [OK] Dependencias do frontend OK
echo.

echo ============================================================
echo  INICIANDO SERVIDORES
echo ============================================================
echo.

REM Iniciar Backend em uma nova janela
echo Iniciando Backend (porta 8000)...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe -m uvicorn app.main:app --reload"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend em uma nova janela
echo Iniciando Frontend (porta 3000)...
start "Frontend - Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo  APLICACAO INICIADA COM SUCESSO!
echo ============================================================
echo.
echo URLs da aplicacao:
echo.
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    API Docs:  http://localhost:8000/docs
echo.
echo ============================================================
echo.
echo DICAS:
echo    - Aguarde alguns segundos para os servidores iniciarem
echo    - Duas janelas foram abertas (Backend e Frontend)
echo    - Para parar: feche as janelas ou pressione Ctrl+C
echo    - Credenciais de teste:
echo      Email: teste@teste.com
echo      Senha: 123456
echo.
echo ============================================================
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Aguardar mais um pouco para garantir que os servidores iniciaram
timeout /t 5 /nobreak >nul

REM Abrir navegador
start http://localhost:3000

echo.
echo Navegador aberto!
echo.
echo Esta janela pode ser fechada.
echo As janelas do Backend e Frontend devem permanecer abertas.
echo.
pause

