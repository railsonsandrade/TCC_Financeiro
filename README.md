# 💰 Sistema de Gestão Financeira Pessoal

![Status](https://img.shields.io/badge/status-concluído-green)
![Python](https://img.shields.io/badge/python-3.13+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![SQLite](https://img.shields.io/badge/SQLite-3-blue)
![License](https://img.shields.io/badge/license-TCC-orange)

> Sistema completo de gestão financeira pessoal desenvolvido como Trabalho de Conclusão de Curso (TCC). Controle total de contas, categorias, lançamentos e metas financeiras com interface moderna e intuitiva.

---

## 📋 Funcionalidades

### 💳 Gestão de Contas
- Cadastro de múltiplas contas (Corrente, Poupança, Carteira, Outros)
- Controle de saldo em tempo real
- Cores personalizadas para identificação visual

### 📊 Categorias Inteligentes
- Categorias personalizadas para receitas e despesas
- Classificação automática pela regra 50/30/20
  - **50%** Essencial (moradia, alimentação, transporte)
  - **30%** Estilo de Vida (lazer, entretenimento)
  - **20%** Investimentos (poupança, aplicações)

### 💸 Lançamentos Financeiros
- Registro completo de receitas e despesas
- Filtros por data, conta e categoria
- Status de pagamento (Pago/Pendente)
- Cálculo automático de totais

### 🎯 Metas Financeiras
- Definição de objetivos financeiros
- Acompanhamento visual do progresso
- Cálculo automático de percentual atingido

### 📈 Dashboard Analítico
- Visão geral consolidada das finanças
- Cards com saldo total, receitas e despesas
- Lista de contas ativas
- Progresso das metas em andamento

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Python 3.13+** - Linguagem de programação
- **FastAPI 0.115+** - Framework web moderno e rápido
- **Pydantic 2.10+** - Validação de dados
- **SQLite** - Banco de dados leve e eficiente
- **Bcrypt** - Hash seguro de senhas
- **PyJWT** - Autenticação JWT
- **Pytest** - Testes automatizados

### Frontend
- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Axios** - Cliente HTTP
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

### Banco de Dados
- **SQLite** - Banco relacional leve
- 7 tabelas principais
- 2 views para consultas otimizadas

---

## 📦 Instalação Rápida

### Pré-requisitos
- Python 3.13 ou superior
- Node.js 18 ou superior
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/JoseRicadoTAS/TCC_Financeiro.git
cd TCC_Financeiro
```

2. **Execute o instalador automático**
```bash
# Windows
iniciar_aplicacao.bat
```

O script irá:
- ✅ Verificar e criar o ambiente virtual Python
- ✅ Instalar dependências do backend
- ✅ Verificar e criar o banco de dados
- ✅ Instalar dependências do frontend
- ✅ Iniciar backend (porta 8000)
- ✅ Iniciar frontend (porta 3000)
- ✅ Abrir o navegador automaticamente

### Acesso ao Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentação API:** http://localhost:8000/docs

### Credenciais de Teste

- **Email:** teste@teste.com
- **Senha:** 123456

---

## 📁 Estrutura do Projeto

```
TCC_FINANCERA/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── api/               # Rotas da API
│   │   ├── repositories/      # Camada de dados
│   │   ├── schemas/           # Schemas Pydantic
│   │   ├── services/          # Lógica de negócio
│   │   └── utils/             # Utilitários
│   ├── tests/                 # Testes automatizados (84 testes)
│   └── requirements.txt       # Dependências Python
├── frontend/                   # Interface Next.js
│   ├── app/                   # Páginas e rotas
│   ├── components/            # Componentes React
│   ├── contexts/              # Contextos React
│   └── lib/                   # Bibliotecas e utils
├── database/                   # Banco de dados
│   ├── schema_sqlite.sql      # Schema do banco
│   └── tcc_financeira.db      # Banco SQLite
├── docs/                       # Documentação
│   ├── BACKEND.md             # Documentação do backend
│   ├── FRONTEND.md            # Documentação do frontend
│   ├── DATABASE.md            # Documentação do banco
│   └── TESTES.md              # Relatório de testes
└── iniciar_aplicacao.bat      # Script de inicialização
```

---

## 📚 Documentação Completa

- 📘 [Documentação do Backend](docs/BACKEND.md)
- 🎨 [Documentação do Frontend](docs/FRONTEND.md)
- 🗄️ [Documentação do Banco de Dados](docs/DATABASE.md)
- 🧪 [Relatório de Testes](docs/TESTES.md)

