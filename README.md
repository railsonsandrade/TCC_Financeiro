# 💰 TCC Financeira - Sistema de Gestão Financeira Pessoal

![Status](https://img.shields.io/badge/status-concluído-green)
![Python](https://img.shields.io/badge/python-3.13+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![SQLite](https://img.shields.io/badge/SQLite-3-blue)

## 📋 Sobre o Projeto

Sistema web completo de gestão financeira pessoal desenvolvido como Trabalho de Conclusão de Curso (TCC), com foco em:

- ✅ Autenticação e autorização com JWT
- ✅ Gestão de contas financeiras (Corrente, Poupança, Carteira)
- ✅ Cadastro de receitas e despesas com categorização
- ✅ Definição e acompanhamento de metas financeiras
- ✅ Dashboard com visão geral da situação financeira
- ✅ Metodologia 50/30/20 para organização de gastos
- ✅ Interface moderna e responsiva

### 🎯 Objetivos de Desenvolvimento Sustentável (ODS)

Este projeto contribui para:
- **ODS 4** - Educação de Qualidade: Promove educação financeira prática
- **ODS 8** - Trabalho Decente e Crescimento Econômico: Favorece estabilidade financeira individual
- **ODS 10** - Redução das Desigualdades: Acesso gratuito a ferramentas de planejamento financeiro

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│  Frontend (Next.js + TypeScript)    │
├─────────────────────────────────────┤
│     API REST (FastAPI)              │
├─────────────────────────────────────┤
│     Serviços (Business Logic)       │
├─────────────────────────────────────┤
│     Repositórios (Data Access)      │
├─────────────────────────────────────┤
│     Banco de Dados (SQLite)         │
└─────────────────────────────────────┘
```

## 🚀 Tecnologias

### Backend
- **Python 3.13+**
- **FastAPI 0.115+** - Framework web moderno e rápido
- **Pydantic 2.10+** - Validação de dados
- **SQLite** - Banco de dados leve e eficiente
- **Bcrypt** - Hash de senhas
- **PyJWT** - Autenticação JWT
- **Pytest** - Testes automatizados (84 testes, 73% cobertura)

### Frontend
- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Axios** - Cliente HTTP
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📦 Instalação e Configuração

### Pré-requisitos

- Python 3.13 ou superior
- Node.js 18 ou superior
- Git

### Instalação Rápida

1. **Clone o repositório**
```bash
git clone https://github.com/JoseRicadoTAS/TCC_Financeiro.git
cd TCC_Financeiro
```

2. **Configure o ambiente Python**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
```

3. **Configure o banco de dados**
```bash
cd database
sqlite3 tcc_financeira.db < schema_sqlite.sql
cd ..
```

4. **Configure o frontend**
```bash
cd frontend
npm install
cd ..
```

5. **Execute a aplicação**
```bash
# Método rápido (Windows)
iniciar_aplicacao.bat

# Ou manualmente:
# Terminal 1 - Backend
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs

### Credenciais de Teste

- **Email:** teste@teste.com
- **Senha:** 123456

## 📁 Estrutura do Projeto

```
TCC_FINANCERA/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Rotas da API
│   │   ├── repositories/   # Camada de dados
│   │   ├── schemas/        # Schemas Pydantic
│   │   ├── services/       # Lógica de negócio
│   │   └── utils/          # Utilitários
│   ├── tests/              # Testes automatizados
│   └── requirements.txt    # Dependências Python
├── frontend/               # Interface Next.js
│   ├── app/               # Páginas e rotas
│   ├── components/        # Componentes React
│   ├── contexts/          # Contextos React
│   └── lib/               # Bibliotecas e utils
├── database/              # Banco de dados
│   ├── schema_sqlite.sql  # Schema do banco
│   └── tcc_financeira.db  # Banco SQLite
├── iniciar_aplicacao.bat  # Script de inicialização
├── parar_aplicacao.bat    # Script para parar
└── README.md              # Este arquivo
```

## 🧪 Testes

O projeto possui 84 testes automatizados com 73% de cobertura de código.

```bash
cd backend
pytest
pytest --cov=app tests/
```

## 📚 Documentação

A documentação completa da API está disponível em:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

Documentação adicional:
- [Como Executar](COMO_EXECUTAR.md)
- [Planejamento de Desenvolvimento](PLANEJAMENTO_DESENVOLVIMENTO.md)

## 🔒 Segurança

- ✅ Senhas armazenadas com hash bcrypt
- ✅ Autenticação via JWT (Bearer Token)
- ✅ Validação de dados com Pydantic
- ✅ Proteção contra SQL Injection (queries parametrizadas)
- ✅ CORS configurado
- ✅ Autorização por usuário

## 📈 Status do Desenvolvimento

- [x] **FASE 1** - Setup e Infraestrutura
- [x] **FASE 2** - Banco de Dados (SQLite)
- [x] **FASE 3** - Camada de Modelos e Repositories
- [x] **FASE 4** - Camada de Serviços
- [x] **FASE 5** - Camada de API (Backend completo)
- [x] **FASE 6** - Testes Automatizados (84 testes, 73% cobertura)
- [x] **FASE 7** - Frontend (Next.js com todas as páginas CRUD)
- [x] **FASE 8** - Integração Frontend-Backend
- [ ] **FASE 9** - Refinamentos e Melhorias
- [ ] **FASE 10** - Documentação e Deploy

## 👨‍💻 Autor

Desenvolvido por José Ricardo

## 📄 Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC).

---

**⭐ Se este projeto foi útil, considere dar uma estrela no repositório!**

**Última atualização:** 2025-11-19

