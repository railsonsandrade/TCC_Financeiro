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

REM 1. Verificar se o .env existe no backend
if not exist "backend\.env" (
    echo [INFO] Arquivo backend\.env nao encontrado!
    echo [INFO] Criando backend\.env a partir de .env.example...
    copy "backend\.env.example" "backend\.env" >nul
    echo [OK] Arquivo backend\.env criado!
    echo.
) else (
    echo [OK] Arquivo backend\.env encontrado!
    echo.
)

REM 2. Verificar se o ambiente virtual existe
if not exist "venv\Scripts\python.exe" (
    echo [INFO] Ambiente virtual nao encontrado!
    echo [INFO] Criando ambiente virtual Python...
    python -m venv venv
    echo [OK] Ambiente virtual criado!
    echo.
) else (
    echo [OK] Ambiente virtual encontrado!
    echo.
)

REM 3. Verificar dependencias do backend
echo [INFO] Verificando/Instalando dependencias do backend...
call venv\Scripts\activate.bat
cd backend
pip install -q -r requirements.txt
cd ..
echo [OK] Dependencias do backend OK
echo.

REM 4. Verificar se o banco de dados existe
if not exist "database\tcc_financeira.db" (
    echo [INFO] Banco de dados nao encontrado!
    echo [INFO] Criando banco de dados...
    venv\Scripts\python.exe database\create_db.py
    echo [OK] Banco de dados criado!
    echo.
    
    REM Criar dados de teste
    echo [INFO] Criando dados de teste e usuario demo...
    venv\Scripts\python.exe backend\scripts\setup_demo_user.py
    venv\Scripts\python.exe backend\scripts\create_demo_data.py
    echo [OK] Dados de teste criados!
    echo.
) else (
    echo [OK] Banco de dados encontrado!
    echo.
)

REM 5. Verificar se node_modules existe
if not exist "frontend\node_modules" (
    echo [INFO] Dependencias do frontend nao instaladas
    echo [INFO] Instalando dependencias do frontend...
    cd frontend
    call npm install
    cd ..
    echo [OK] Dependencias instaladas!
    echo.
) else (
    echo [OK] Dependencias do frontend OK
    echo.
)

echo ============================================================
echo  INICIANDO SERVIDORES
echo ============================================================
echo.

REM Iniciar Backend em uma nova janela
echo [INFO] Iniciando Backend (porta 8000)...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe -m uvicorn app.main:app --reload"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend em uma nova janela
echo [INFO] Iniciando Frontend (porta 3000)...
start "Frontend - Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 8 /nobreak >nul

REM Abrir navegador
echo [INFO] Abrindo navegador...
start http://localhost:3000

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
echo      Email: demo@nextwallet.com
echo      Senha: demo123
echo.
echo ============================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
