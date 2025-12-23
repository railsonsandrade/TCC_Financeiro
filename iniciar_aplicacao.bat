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
    echo [INFO] Banco de dados nao encontrado!
    echo [INFO] Criando banco de dados...
    cd database
    sqlite3 tcc_financeira.db < schema_sqlite.sql
    cd ..
    echo [OK] Banco de dados criado!
    echo.
    
    REM Criar dados de teste
    echo [INFO] Criando dados de teste...
    call venv\Scripts\activate.bat
    cd backend
    python seed_test_data.py
    cd ..
    echo [OK] Dados de teste criados!
    echo.
)

echo [OK] Banco de dados encontrado
echo.

REM Verificar se o ambiente virtual existe
if not exist "venv\Scripts\python.exe" (
    echo [INFO] Ambiente virtual nao encontrado!
    echo [INFO] Criando ambiente virtual Python...
    python -m venv venv
    echo [OK] Ambiente virtual criado!
    echo.
)

echo [OK] Ambiente virtual encontrado
echo.

REM Verificar dependencias do backend
echo [INFO] Verificando dependencias do backend...
call venv\Scripts\activate.bat
cd backend
pip install -q -r requirements.txt
cd ..
echo [OK] Dependencias do backend OK
echo.

REM Verificar se node_modules existe
if not exist "frontend\node_modules" (
    echo [INFO] Dependencias do frontend nao instaladas
    echo [INFO] Instalando dependencias do frontend...
    cd frontend
    call npm install
    cd ..
    echo [OK] Dependencias instaladas!
    echo.
)

echo [OK] Dependencias do frontend OK
echo.

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
echo      Email: teste@teste.com
echo      Senha: 123456
echo.
echo ============================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
