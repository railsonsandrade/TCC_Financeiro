# 📘 Documentação do Backend - API FastAPI

## 🏗️ Arquitetura

O backend segue uma arquitetura em camadas (Layered Architecture):

```
┌─────────────────────────────────────┐
│     API Routes (FastAPI)            │  ← Endpoints REST
├─────────────────────────────────────┤
│     Services (Business Logic)       │  ← Regras de negócio
├─────────────────────────────────────┤
│     Repositories (Data Access)      │  ← Acesso a dados
├─────────────────────────────────────┤
│     Database (SQLite)               │  ← Persistência
└─────────────────────────────────────┘
```

---

## 📦 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Python | 3.13+ | Linguagem de programação |
| FastAPI | 0.115+ | Framework web assíncrono |
| Pydantic | 2.10+ | Validação de dados |
| SQLite | 3 | Banco de dados |
| Bcrypt | 4.2+ | Hash de senhas |
| PyJWT | 2.10+ | Tokens JWT |
| Pytest | 8.3+ | Framework de testes |

---

## 🔐 Autenticação e Segurança

### JWT (JSON Web Tokens)

- **Algoritmo:** HS256
- **Expiração:** 30 minutos
- **Secret Key:** Configurável via variável de ambiente

### Fluxo de Autenticação

1. **Login:** `POST /api/v1/auth/login`
   - Recebe email e senha
   - Valida credenciais com bcrypt
   - Retorna token JWT + dados do usuário

2. **Registro:** `POST /api/v1/auth/register`
   - Recebe nome, email e senha
   - Valida unicidade do email
   - Cria usuário com senha hasheada
   - Retorna token JWT + dados do usuário

3. **Verificação:** `GET /api/v1/auth/me`
   - Requer token JWT no header `Authorization: Bearer <token>`
   - Retorna dados do usuário autenticado

### Proteção de Rotas

Todas as rotas (exceto login e register) requerem autenticação via JWT.

---

## 🛣️ Rotas da API

### Base URL
```
http://localhost:8000/api/v1
```

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login de usuário | ❌ |
| POST | `/auth/register` | Registro de usuário | ❌ |
| GET | `/auth/me` | Dados do usuário autenticado | ✅ |

### Contas Financeiras

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/contas` | Listar contas do usuário | ✅ |
| GET | `/contas/com-saldo` | Listar contas com saldo calculado | ✅ |
| GET | `/contas/{id}` | Buscar conta por ID | ✅ |
| POST | `/contas` | Criar nova conta | ✅ |
| PUT | `/contas/{id}` | Atualizar conta | ✅ |
| DELETE | `/contas/{id}` | Desativar conta | ✅ |

### Categorias

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/categorias` | Listar categorias do usuário | ✅ |
| GET | `/categorias/{id}` | Buscar categoria por ID | ✅ |
| POST | `/categorias` | Criar nova categoria | ✅ |
| PUT | `/categorias/{id}` | Atualizar categoria | ✅ |
| DELETE | `/categorias/{id}` | Desativar categoria | ✅ |

### Lançamentos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/lancamentos` | Listar lançamentos | ✅ |
| GET | `/lancamentos/detalhes` | Listar com detalhes completos | ✅ |
| GET | `/lancamentos/totais` | Obter totais do período | ✅ |
| GET | `/lancamentos/{id}` | Buscar lançamento por ID | ✅ |
| POST | `/lancamentos` | Criar novo lançamento | ✅ |
| PUT | `/lancamentos/{id}` | Atualizar lançamento | ✅ |
| DELETE | `/lancamentos/{id}` | Excluir lançamento | ✅ |

### Metas Financeiras

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/metas` | Listar metas do usuário | ✅ |
| GET | `/metas/{id}` | Buscar meta por ID | ✅ |
| POST | `/metas` | Criar nova meta | ✅ |
| PUT | `/metas/{id}` | Atualizar meta | ✅ |
| PUT | `/metas/{id}/progresso` | Atualizar progresso da meta | ✅ |
| DELETE | `/metas/{id}` | Excluir meta | ✅ |

---

## 🔧 Regras de Negócio Implementadas

### RN001 - Unicidade de Email
- Cada email pode ser cadastrado apenas uma vez no sistema
- Validação no momento do registro

### RN002 - Contas por Usuário
- Cada usuário só pode acessar suas próprias contas
- Isolamento de dados por `id_usuario`

### RN003 - Categorias por Usuário
- Cada usuário só pode acessar suas próprias categorias
- Isolamento de dados por `id_usuario`

### RN004 - Lançamentos Vinculados
- Lançamentos devem estar vinculados a contas e categorias do mesmo usuário
- Validação de propriedade antes de criar/atualizar

### RN005 - Metas por Usuário
- Cada usuário só pode acessar suas próprias metas
- Isolamento de dados por `id_usuario`

### RN006 - Cálculo de Saldo
- Saldo da conta é calculado automaticamente
- Fórmula: `saldo_atual = saldo_inicial + receitas - despesas`
- Atualizado via view `vw_contas_com_saldo`

### RN008 - Percentual de Meta
- Percentual atingido calculado automaticamente
- Fórmula: `percentual = (valor_atual / valor_alvo) * 100`

