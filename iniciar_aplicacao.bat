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

REM ============================================================
REM DIRETORIO BASE
REM ============================================================

set BASE_DIR=%~dp0

REM ============================================================
REM 1. VERIFICAR .ENV
REM ============================================================

if not exist "%BASE_DIR%backend\.env" (

    echo [INFO] Arquivo backend\.env nao encontrado!
    echo [INFO] Criando backend\.env a partir de .env.example...

    copy "%BASE_DIR%backend\.env.example" "%BASE_DIR%backend\.env" >nul

    if errorlevel 1 (
        echo [ERRO] Falha ao criar backend\.env
        pause
        exit /b 1
    )

    echo [OK] Arquivo backend\.env criado!
    echo.

) else (

    echo [OK] Arquivo backend\.env encontrado!
    echo.

)

REM ============================================================
REM 2. VERIFICAR AMBIENTE VIRTUAL
REM ============================================================

if not exist "%BASE_DIR%venv\Scripts\python.exe" (

    echo [INFO] Ambiente virtual nao encontrado!
    echo [INFO] Criando ambiente virtual Python...

    python -m venv "%BASE_DIR%venv"

    if errorlevel 1 (
        echo [ERRO] Falha ao criar ambiente virtual
        pause
        exit /b 1
    )

    echo [OK] Ambiente virtual criado!
    echo.

) else (

    echo [OK] Ambiente virtual encontrado!
    echo.

)

REM ============================================================
REM 3. INSTALAR DEPENDENCIAS BACKEND
REM ============================================================

echo [INFO] Verificando/Instalando dependencias do backend...

call "%BASE_DIR%venv\Scripts\activate.bat"

cd /d "%BASE_DIR%backend"

pip install -q -r requirements.txt

if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias do backend
    pause
    exit /b 1
)

cd /d "%BASE_DIR%"

echo [OK] Dependencias do backend OK
echo.

REM ============================================================
REM 4. CRIAR BANCO DE DADOS
REM ============================================================

if not exist "%BASE_DIR%database\tcc_financeira.db" (

    echo [INFO] Banco de dados nao encontrado!
    echo [INFO] Criando banco de dados...

    "%BASE_DIR%venv\Scripts\python.exe" "%BASE_DIR%database\create_db.py"

    if errorlevel 1 (
        echo [ERRO] Falha ao criar banco de dados
        pause
        exit /b 1
    )

    echo [OK] Banco de dados criado!
    echo.

    REM ========================================================
    REM CRIAR USUARIO DEMO
    REM ========================================================

    echo [INFO] Criando usuario demo...

    cd /d "%BASE_DIR%backend"

    "%BASE_DIR%venv\Scripts\python.exe" -m scripts.setup_demo_user

    if errorlevel 1 (
        echo [ERRO] Falha ao criar usuario demo
        pause
        exit /b 1
    )

    echo [OK] Usuario demo criado!
    echo.

    REM ========================================================
    REM CRIAR DADOS DEMO
    REM ========================================================

    echo [INFO] Criando dados de teste...

    "%BASE_DIR%venv\Scripts\python.exe" -m scripts.create_demo_data

    if errorlevel 1 (
        echo [ERRO] Falha ao criar dados de teste
        pause
        exit /b 1
    )

    cd /d "%BASE_DIR%"

    echo [OK] Dados de teste criados!
    echo.

) else (

    echo [OK] Banco de dados encontrado!
    echo.

)

REM ============================================================
REM 5. INSTALAR DEPENDENCIAS FRONTEND
REM ============================================================

if not exist "%BASE_DIR%frontend\node_modules" (

    echo [INFO] Dependencias do frontend nao instaladas
    echo [INFO] Instalando dependencias do frontend...

    cd /d "%BASE_DIR%frontend"

    call npm install

    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do frontend
        pause
        exit /b 1
    )

    cd /d "%BASE_DIR%"

    echo [OK] Dependencias instaladas!
    echo.

) else (

    echo [OK] Dependencias do frontend OK
    echo.

)

REM ============================================================
REM INICIAR SERVIDORES
REM ============================================================

echo ============================================================
echo  INICIANDO SERVIDORES
echo ============================================================
echo.

REM ============================================================
REM BACKEND
REM ============================================================

echo [INFO] Iniciando Backend (porta 8000)...

start "Backend - FastAPI" cmd /k "cd /d %BASE_DIR%backend && ..\venv\Scripts\python.exe -m uvicorn app.main:app --reload"

timeout /t 3 /nobreak >nul

REM ============================================================
REM FRONTEND
REM ============================================================

echo [INFO] Iniciando Frontend (porta 3000)...

start "Frontend - Next.js" cmd /k "cd /d %BASE_DIR%frontend && npm run dev"

timeout /t 8 /nobreak >nul

REM ============================================================
REM ABRIR NAVEGADOR
REM ============================================================

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
echo.
echo Credenciais de teste:
echo    Email: demo@nextwallet.com
echo    Senha: demo123
echo.
echo ============================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...

pause >nul