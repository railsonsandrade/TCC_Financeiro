# 🎨 Documentação do Frontend - Next.js

## 🏗️ Arquitetura

O frontend utiliza Next.js 16 com App Router e TypeScript:

```
┌─────────────────────────────────────┐
│     Pages (App Router)              │  ← Rotas e páginas
├─────────────────────────────────────┤
│     Components (React)              │  ← Componentes reutilizáveis
├─────────────────────────────────────┤
│     Contexts (State Management)     │  ← Gerenciamento de estado
├─────────────────────────────────────┤
│     API Client (Axios)              │  ← Comunicação com backend
└─────────────────────────────────────┘
```

---

## 📦 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 16.0.3 | Framework React |
| React | 19 | Biblioteca UI |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 3.4 | Framework CSS |
| Axios | 1.7+ | Cliente HTTP |
| Radix UI | - | Componentes acessíveis |
| Lucide React | - | Ícones |
| date-fns | 4.1+ | Manipulação de datas |

---

## 🎨 Design System

### Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary (Azul) | `#1e40af` | Botões principais, links |
| Secondary (Verde) | `#10b981` | Sucesso, receitas |
| Accent (Laranja) | `#f59e0b` | Destaques, avisos |
| Destructive (Vermelho) | `#ef4444` | Erros, despesas |
| Background | `#f8fafc` | Fundo da aplicação |

### Gradientes

- **gradient-primary:** Azul (login, botões principais)
- **gradient-success:** Verde (registro, receitas)
- **gradient-danger:** Vermelho (despesas, erros)

### Animações

- **animate-fade-in:** Fade in com movimento para cima
- **animate-slide-up:** Deslizar para cima
- **animate-slide-in:** Deslizar da direita

---

## 📁 Estrutura de Pastas

```
frontend/
├── app/
│   ├── dashboard/              # Dashboard principal
│   │   ├── categorias/        # Gestão de categorias
│   │   ├── contas/            # Gestão de contas
│   │   ├── lancamentos/       # Gestão de lançamentos
│   │   ├── metas/             # Gestão de metas
│   │   ├── layout.tsx         # Layout do dashboard
│   │   └── page.tsx           # Página principal
│   ├── login/                 # Página de login
│   ├── register/              # Página de registro
│   ├── globals.css            # Estilos globais
│   └── layout.tsx             # Layout raiz
├── components/
│   └── ui/                    # Componentes UI (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticação
├── lib/
│   ├── api.ts                 # Cliente API (Axios)
│   └── utils.ts               # Funções utilitárias
└── public/                    # Arquivos estáticos
    └── logo.png               # Logo da aplicação
```

---

## 🔐 Autenticação

### AuthContext

Gerencia o estado de autenticação globalmente:

```typescript
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => void
  loading: boolean
}
```

### Fluxo de Autenticação

1. **Login/Registro:**
   - Usuário envia credenciais
   - API retorna token JWT + dados do usuário
   - Token é salvo no localStorage
   - Usuário é redirecionado para o dashboard

2. **Proteção de Rotas:**
   - Layout do dashboard verifica autenticação
   - Se não autenticado, redireciona para login

3. **Logout:**
   - Remove token do localStorage
   - Limpa estado do usuário
   - Redireciona para login

---

## 🌐 Comunicação com API

### Cliente Axios (lib/api.ts)

Configuração centralizada com interceptors:

```typescript
// Adiciona token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireciona para login
    }
    return Promise.reject(error)
  }
)
```

### Endpoints Utilizados

- **Autenticação:** `/api/v1/auth/*`
- **Contas:** `/api/v1/contas/*`
- **Categorias:** `/api/v1/categorias/*`
- **Lançamentos:** `/api/v1/lancamentos/*`
- **Metas:** `/api/v1/metas/*`

---

## 📄 Páginas Principais

### 1. Login (`/login`)
- Split-screen design
- Gradiente azul no lado esquerdo
- Formulário de login no lado direito
- Animações suaves

### 2. Registro (`/register`)
- Split-screen design
- Gradiente verde no lado esquerdo
- Formulário de registro no lado direito
- Lista de benefícios

### 3. Dashboard (`/dashboard`)
- Cards com resumo financeiro
- Saldo total, receitas e despesas
- Lista de contas ativas
- Progresso das metas

### 4. Contas (`/dashboard/contas`)
- Listagem de contas
- Formulário de criação/edição
- Seletor de cores
- Tipos de conta

### 5. Categorias (`/dashboard/categorias`)
- Listagem de categorias
- Separação por tipo (Receita/Despesa)
- Classificação 50/30/20
- Seletor de ícones e cores

### 6. Lançamentos (`/dashboard/lancamentos`)
- Listagem com filtros
- Filtro por data, conta e categoria
- Formulário de criação/edição
- Cálculo de totais

### 7. Metas (`/dashboard/metas`)
- Listagem de metas
- Barra de progresso visual
- Formulário de criação/edição
- Status da meta

