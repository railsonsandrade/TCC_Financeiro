# 🚀 FASE 1: Setup e Infraestrutura

**Objetivo:** Configurar completamente o ambiente de desenvolvimento

---

## ✅ Checklist da Fase 1

- [x] Criar estrutura de pastas
- [ ] Configurar ambiente virtual Python
- [ ] Instalar dependências iniciais
- [ ] Configurar conexão com SQL Server
- [ ] Criar arquivo de configuração (.env)

---

## 📝 Passo a Passo

### **1. Configurar Ambiente Virtual Python** (2 minutos)

Abra o PowerShell na pasta raiz do projeto (`TCC_FINANCERA`):

```powershell
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\activate

# Você verá (venv) no início da linha do terminal
```

**✅ Verificação:** O terminal deve mostrar `(venv)` antes do caminho.

---

### **2. Instalar Dependências** (3-5 minutos)

Com o ambiente virtual ativado:

```powershell
# Navegar para a pasta backend
cd backend

# Atualizar pip (recomendado)
python -m pip install --upgrade pip

# Instalar todas as dependências
pip install -r requirements.txt
```

**Dependências que serão instaladas:**
- ✅ FastAPI (framework web)
- ✅ Uvicorn (servidor ASGI)
- ✅ Pydantic (validação de dados)
- ✅ pyodbc (conexão SQL Server)
- ✅ bcrypt (hash de senhas)
- ✅ PyJWT (autenticação)
- ✅ pytest (testes)

**✅ Verificação:** Não deve haver erros de instalação.

---

### **3. Configurar SQL Server** (10-15 minutos)

#### 3.1. Verificar se o SQL Server está instalado

```powershell
# Verificar serviço do SQL Server
Get-Service -Name MSSQLSERVER
```

Se não estiver instalado, baixe em: https://www.microsoft.com/sql-server/sql-server-downloads

#### 3.2. Instalar ODBC Driver 17

Se ainda não tiver, baixe em: https://docs.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server

#### 3.3. Criar o banco de dados

Opção A - **SQL Server Management Studio (SSMS)**:
1. Abra o SSMS
2. Conecte-se ao servidor
3. Clique com botão direito em "Databases" → "New Database"
4. Nome: `tcc_financeira`
5. Clique OK

Opção B - **Linha de comando**:
```powershell
sqlcmd -S localhost -U seu_usuario -P sua_senha -Q "CREATE DATABASE tcc_financeira"
```

#### 3.4. Executar o script de schema

No SSMS:
1. Abra o arquivo `database/schema.sql`
2. Certifique-se de estar conectado ao banco `tcc_financeira`
3. Execute o script (F5)

Ou via linha de comando:
```powershell
sqlcmd -S localhost -U seu_usuario -P sua_senha -d tcc_financeira -i ..\database\schema.sql
```

**✅ Verificação:** Devem ser criadas 7 tabelas:
- USUARIO
- CONTA_FINANCEIRA
- CATEGORIA
- RECORRENCIA
- LANCAMENTO
- META_FINANCEIRA
- NOTIFICACAO

---

### **4. Criar Arquivo .env** (2 minutos)

Execute o script de configuração:

```powershell
# Ainda na pasta backend
python setup_env.py
```

O script vai perguntar:
- Servidor SQL Server (padrão: localhost)
- Porta (padrão: 1433)
- Nome do banco (padrão: tcc_financeira)
- Usuário do SQL Server
- Senha do SQL Server
- Tempo de expiração do token (padrão: 30 minutos)
- Modo debug (padrão: sim)

**✅ Verificação:** Arquivo `.env` criado na pasta `backend/`

---

### **5. Verificar Setup Completo** (1 minuto)

Execute o script de verificação:

```powershell
# Ainda na pasta backend
python verify_setup.py
```

**Resultado esperado:**
```
============================================================
VERIFICAÇÃO DO SETUP - TCC FINANCEIRA
============================================================

🐍 Verificando versão do Python...
   ✅ Python 3.x.x
📦 Verificando ambiente virtual...
   ✅ Ambiente virtual ativado
📚 Verificando dependências...
   ✅ FastAPI
   ✅ Uvicorn
   ✅ Pydantic
   ✅ pyodbc
   ✅ bcrypt
   ✅ python-jose
   ✅ pytest
   ✅ python-dotenv
⚙️  Verificando arquivo .env...
   ✅ Arquivo .env encontrado
📁 Verificando estrutura do projeto...
   ✅ app/
   ✅ app/controllers/
   ✅ app/services/
   ✅ app/repositories/
   ✅ app/models/
   ✅ app/schemas/
   ✅ app/utils/
   ✅ tests/
🗄️  Verificando conexão com banco de dados...
   ✅ Conexão com banco de dados OK

============================================================
RESUMO DA VERIFICAÇÃO
============================================================
✅ Python
✅ Ambiente Virtual
✅ Dependências
✅ Arquivo .env
✅ Estrutura
✅ Banco de Dados

🎉 TUDO PRONTO! Você pode iniciar o desenvolvimento.
```

---

### **6. Testar a API** (1 minuto)

Inicie a aplicação:

```powershell
# Ainda na pasta backend
uvicorn app.main:app --reload
```

Abra o navegador em:
- **API:** http://localhost:8000
- **Documentação:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

**✅ Verificação:** 
- Endpoint `/` deve retornar informações da API
- Endpoint `/health` deve mostrar `"database": "ok"`

---

## 🎯 Resultado Final da Fase 1

Ao completar esta fase, você terá:

- ✅ Ambiente virtual Python configurado
- ✅ Todas as dependências instaladas
- ✅ SQL Server configurado e rodando
- ✅ Banco de dados criado com todas as tabelas
- ✅ Arquivo .env configurado
- ✅ API FastAPI funcionando
- ✅ Conexão com banco de dados testada

---

## 🚨 Problemas Comuns

### Erro: "python não é reconhecido"
**Solução:** Adicione Python ao PATH ou use `py` ao invés de `python`

### Erro: "Unable to connect to database"
**Solução:** 
1. Verifique se o SQL Server está rodando
2. Confirme usuário e senha no .env
3. Teste a conexão com SSMS primeiro

### Erro: "ODBC Driver not found"
**Solução:** Instale o ODBC Driver 17 for SQL Server

### Erro: "Port 8000 already in use"
**Solução:** Use outra porta: `uvicorn app.main:app --reload --port 8001`

---

## ➡️ Próximo Passo

Após completar a Fase 1, vamos para:

**FASE 2: Banco de Dados**
- Validar schema criado
- Criar dados de teste iniciais
- Testar queries básicas

---

**Dúvidas?** Consulte o [INICIO_RAPIDO.md](INICIO_RAPIDO.md) ou [README.md](README.md)

