# 🚀 Guia de Início Rápido - TCC Financeira

Este guia vai te ajudar a configurar e executar o projeto pela primeira vez.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Python 3.9 ou superior** - [Download](https://www.python.org/downloads/)
- ✅ **SQL Server 2019 ou superior** - [Download](https://www.microsoft.com/sql-server/sql-server-downloads)
- ✅ **ODBC Driver 17 for SQL Server** - [Download](https://docs.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server)
- ✅ **Git** (opcional) - [Download](https://git-scm.com/)

---

## 🔧 Passo 1: Configurar Ambiente Python

### 1.1. Criar ambiente virtual

Abra o PowerShell ou CMD na pasta do projeto e execute:

```powershell
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual (Windows)
.\venv\Scripts\activate

# Você verá (venv) no início da linha do terminal
```

### 1.2. Instalar dependências

```powershell
# Navegar para a pasta backend
cd backend

# Instalar todas as dependências
pip install -r requirements.txt

# Aguarde a instalação (pode levar alguns minutos)
```

---

## 🗄️ Passo 2: Configurar Banco de Dados

### 2.1. Criar o banco de dados

Abra o **SQL Server Management Studio (SSMS)** ou use o **sqlcmd**:

```sql
-- Criar o banco de dados
CREATE DATABASE tcc_financeira;
GO
```

### 2.2. Executar o script de schema

No SSMS:
1. Abra o arquivo `database/schema.sql`
2. Conecte-se ao seu SQL Server
3. Execute o script (F5)
4. Verifique se todas as tabelas foram criadas

Ou via linha de comando:

```powershell
sqlcmd -S localhost -U seu_usuario -P sua_senha -i ..\database\schema.sql
```

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### 3.1. Criar arquivo .env

Na pasta `backend`, copie o arquivo de exemplo:

```powershell
# Ainda na pasta backend
copy .env.example .env
```

### 3.2. Editar o arquivo .env

Abra o arquivo `.env` em um editor de texto e configure:

```env
# Database Configuration
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=tcc_financeira
DB_USER=seu_usuario_aqui
DB_PASSWORD=sua_senha_aqui

# Security (IMPORTANTE: Gere uma chave forte!)
SECRET_KEY=sua_chave_secreta_super_forte_aqui_123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
APP_NAME=TCC Financeira
APP_VERSION=1.0.0
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

**⚠️ IMPORTANTE:** 
- Substitua `seu_usuario_aqui` e `sua_senha_aqui` pelas credenciais do seu SQL Server
- Gere uma SECRET_KEY forte (pode usar: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)

---

## 🧪 Passo 4: Testar Conexão

Antes de iniciar a API, vamos testar se tudo está funcionando:

```powershell
# Ainda na pasta backend, com o venv ativado
python test_connection.py
```

**Resultado esperado:**
```
============================================================
TESTE DE CONEXÃO COM O BANCO DE DADOS
============================================================

Configurações:
  Servidor: localhost:1433
  Banco: tcc_financeira
  Usuário: seu_usuario

Testando conexão...
✅ Conexão estabelecida com sucesso!

Testando query simples...
✅ Versão do SQL Server:
   Microsoft SQL Server 2019...

Listando tabelas do banco de dados...
✅ Encontradas 7 tabelas:
   - CATEGORIA
   - CONTA_FINANCEIRA
   - LANCAMENTO
   - META_FINANCEIRA
   - NOTIFICACAO
   - RECORRENCIA
   - USUARIO

============================================================
TESTE CONCLUÍDO COM SUCESSO!
============================================================
```

**Se der erro:**
- Verifique se o SQL Server está rodando
- Confirme as credenciais no arquivo .env
- Verifique se o banco de dados foi criado
- Confirme se o ODBC Driver está instalado

---

## 🚀 Passo 5: Iniciar a API

Com tudo configurado, inicie a aplicação:

```powershell
# Ainda na pasta backend
uvicorn app.main:app --reload
```

**Resultado esperado:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🎉 Passo 6: Testar a API

Abra seu navegador e acesse:

### Página Principal
```
http://localhost:8000
```

Você verá:
```json
{
  "app": "TCC Financeira",
  "version": "1.0.0",
  "status": "online",
  "docs": "/docs",
  "message": "Bem-vindo à API de Gestão Financeira Pessoal"
}
```

### Health Check
```
http://localhost:8000/health
```

Você verá:
```json
{
  "status": "healthy",
  "database": "ok",
  "version": "1.0.0"
}
```

### Documentação Interativa (Swagger)
```
http://localhost:8000/docs
```

Aqui você pode testar todos os endpoints da API!

---

## ✅ Checklist de Verificação

- [ ] Python 3.9+ instalado
- [ ] SQL Server rodando
- [ ] ODBC Driver instalado
- [ ] Ambiente virtual criado e ativado
- [ ] Dependências instaladas
- [ ] Banco de dados criado
- [ ] Script schema.sql executado
- [ ] Arquivo .env configurado
- [ ] Teste de conexão passou
- [ ] API iniciou sem erros
- [ ] Endpoints respondendo corretamente

---

## 🆘 Problemas Comuns

### Erro: "No module named 'app'"
**Solução:** Certifique-se de estar na pasta `backend` e com o venv ativado

### Erro: "Unable to connect to database"
**Solução:** Verifique credenciais no .env e se o SQL Server está rodando

### Erro: "ODBC Driver not found"
**Solução:** Instale o ODBC Driver 17 for SQL Server

### Erro: "Port 8000 already in use"
**Solução:** Mude a porta: `uvicorn app.main:app --reload --port 8001`

---

## 📚 Próximos Passos

Agora que tudo está funcionando:

1. Leia o [PLANEJAMENTO_DESENVOLVIMENTO.md](PLANEJAMENTO_DESENVOLVIMENTO.md)
2. Veja o [PROGRESSO.md](PROGRESSO.md) para acompanhar o desenvolvimento
3. Consulte [docs/REQUISITOS.md](docs/REQUISITOS.md) para entender os requisitos
4. Comece a desenvolver seguindo a task list!

---

**Dúvidas?** Consulte o [README.md](README.md) principal ou a documentação completa.

**Boa sorte com o desenvolvimento! 🚀**

