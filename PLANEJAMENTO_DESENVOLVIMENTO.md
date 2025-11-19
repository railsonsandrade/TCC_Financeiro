# Planejamento de Desenvolvimento - TCC Financeira
## Web App de Gestão Financeira Pessoal

---

## 📋 Visão Geral do Projeto

**Objetivo:** Desenvolver um web app responsivo de gestão financeira pessoal com foco em usabilidade, segurança e educação financeira.

**Tecnologias Principais:**
- **Backend:** Python (FastAPI/Flask)
- **Banco de Dados:** SQL Server
- **Frontend:** HTML5, CSS3, JavaScript (React - fase posterior)
- **Autenticação:** JWT + bcrypt
- **Testes:** pytest

---

## 🏗️ Arquitetura do Sistema

### Camadas da Aplicação:
```
┌─────────────────────────────────────┐
│     Frontend (Web Responsivo)       │
├─────────────────────────────────────┤
│     API REST (Controllers)          │
├─────────────────────────────────────┤
│     Serviços (Business Logic)       │
├─────────────────────────────────────┤
│     Repositórios (Data Access)      │
├─────────────────────────────────────┤
│     Banco de Dados (SQL Server)     │
└─────────────────────────────────────┘
```

---

## 📂 Estrutura de Pastas Proposta

```
TCC_FINANCERA/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Entry point da API
│   │   ├── config.py               # Configurações
│   │   ├── controllers/            # Endpoints REST
│   │   │   ├── __init__.py
│   │   │   ├── auth_controller.py
│   │   │   ├── lancamento_controller.py
│   │   │   ├── meta_controller.py
│   │   │   └── dashboard_controller.py
│   │   ├── services/               # Lógica de negócio
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── lancamento_service.py
│   │   │   ├── meta_service.py
│   │   │   ├── dashboard_service.py
│   │   │   ├── projecao_caixa_service.py
│   │   │   └── notificacao_service.py
│   │   ├── repositories/           # Acesso a dados
│   │   │   ├── __init__.py
│   │   │   ├── usuario_repository.py
│   │   │   ├── conta_repository.py
│   │   │   ├── categoria_repository.py
│   │   │   ├── lancamento_repository.py
│   │   │   ├── recorrencia_repository.py
│   │   │   └── meta_repository.py
│   │   ├── models/                 # Modelos de dados
│   │   │   ├── __init__.py
│   │   │   ├── usuario.py
│   │   │   ├── conta_financeira.py
│   │   │   ├── categoria.py
│   │   │   ├── lancamento.py
│   │   │   ├── recorrencia.py
│   │   │   └── meta_financeira.py
│   │   ├── schemas/                # DTOs (Pydantic)
│   │   │   ├── __init__.py
│   │   │   ├── usuario_schema.py
│   │   │   ├── lancamento_schema.py
│   │   │   └── meta_schema.py
│   │   └── utils/                  # Utilitários
│   │       ├── __init__.py
│   │       ├── database.py         # Conexão DB
│   │       ├── security.py         # Hash, JWT
│   │       └── validators.py       # Validações
│   ├── tests/                      # Testes
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_lancamentos.py
│   │   └── test_projecao.py
│   ├── requirements.txt            # Dependências Python
│   └── .env.example                # Exemplo de variáveis de ambiente
├── database/
│   ├── schema.sql                  # Script de criação das tabelas
│   ├── seed_data.sql               # Dados iniciais (opcional)
│   └── migrations/                 # Migrações futuras
├── frontend/                       # Frontend (fase posterior)
│   └── (a ser desenvolvido)
├── docs/                           # Documentação
│   ├── API.md                      # Documentação da API
│   ├── DIAGRAMAS/                  # UML, DER, etc
│   └── REQUISITOS.md               # Requisitos detalhados
├── .gitignore
└── README.md
```

---

## 🎯 Fases de Desenvolvimento (Baby Steps)

### **FASE 1: Setup e Infraestrutura** ✅
- [x] Criar estrutura de pastas
- [ ] Configurar ambiente virtual Python
- [ ] Instalar dependências iniciais
- [ ] Configurar conexão com SQL Server
- [ ] Criar arquivo de configuração (.env)

### **FASE 2: Banco de Dados** 🔄
- [ ] Criar script SQL com todas as tabelas
- [ ] Implementar constraints e índices
- [ ] Testar criação do schema
- [ ] Criar dados de teste iniciais

### **FASE 3: Camada de Modelos e Repository** 🔄
- [ ] Implementar classes de modelo (Usuario, Conta, etc)
- [ ] Implementar UsuarioRepository
- [ ] Implementar ContaRepository
- [ ] Implementar CategoriaRepository
- [ ] Implementar LancamentoRepository
- [ ] Testar cada repository isoladamente

### **FASE 4: Autenticação e Segurança** 🔄
- [ ] Implementar hash de senha (bcrypt)
- [ ] Implementar geração de JWT
- [ ] Criar AuthService
- [ ] Criar AuthController (registro e login)
- [ ] Testar autenticação completa

### **FASE 5: Funcionalidades Core** 🔄
- [ ] Implementar CRUD de Contas Financeiras
- [ ] Implementar CRUD de Categorias
- [ ] Implementar CRUD de Lançamentos
- [ ] Implementar lógica de recorrência
- [ ] Testar cada funcionalidade

### **FASE 6: Metas e Dashboard** 🔄
- [ ] Implementar CRUD de Metas
- [ ] Implementar cálculo 50/30/20
- [ ] Implementar DashboardService
- [ ] Criar endpoints de dashboard
- [ ] Testar visualizações

### **FASE 7: Projeção de Caixa** 🔄
- [ ] Implementar ProjecaoCaixaService
- [ ] Calcular saldo futuro
- [ ] Identificar períodos de risco
- [ ] Criar endpoint de projeção
- [ ] Testar diferentes cenários

### **FASE 8: Notificações** 🔄
- [ ] Implementar NotificacaoService
- [ ] Criar sistema de alertas
- [ ] Implementar envio de e-mail (opcional)
- [ ] Testar notificações

### **FASE 9: Frontend Básico** 🔄
- [ ] Criar página de login/registro
- [ ] Criar dashboard principal
- [ ] Criar tela de lançamentos
- [ ] Criar tela de metas
- [ ] Integrar com API

### **FASE 10: Testes e Refinamento** 🔄
- [ ] Testes unitários completos
- [ ] Testes de integração
- [ ] Testes de performance
- [ ] Correção de bugs
- [ ] Documentação final

---

## 📊 Próximos Passos Imediatos

1. ✅ Criar estrutura de pastas do projeto
2. ⏳ Configurar ambiente virtual Python
3. ⏳ Instalar dependências (FastAPI, pyodbc, bcrypt, PyJWT, pytest)
4. ⏳ Criar script SQL do banco de dados
5. ⏳ Testar conexão com SQL Server

---

## 🔧 Dependências Iniciais (requirements.txt)

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
pyodbc==5.0.1
bcrypt==4.1.1
PyJWT==2.8.0
pytest==7.4.3
pytest-asyncio==0.21.1
```

---

**Última atualização:** 2025-11-18
**Status:** Planejamento Inicial Completo ✅

