# 📋 Prototipação e Arquitetura do Sistema

## 5. Prototipação do Front-End

### 5.1 Instruções para Captura de Telas

Para documentar o protótipo do front-end, capture **prints (screenshots)** das seguintes telas:

#### **Telas Obrigatórias:**

1. **Tela de Login** (`/login`)
   - Capturar: Formulário de login completo
   - Arquivo sugerido: `print_01_login.png`

2. **Tela de Registro** (`/register`)
   - Capturar: Formulário de cadastro completo
   - Arquivo sugerido: `print_02_registro.png`

3. **Dashboard Principal** (`/dashboard`)
   - Capturar: Visão geral com resumo financeiro, contas e metas
   - Arquivo sugerido: `print_03_dashboard.png`

4. **Gestão de Contas** (`/dashboard/contas`)
   - Capturar: Lista de contas + modal de criação aberto
   - Arquivo sugerido: `print_04_contas.png`

5. **Gestão de Categorias** (`/dashboard/categorias`)
   - Capturar: Lista de categorias (tab Despesas) + classificação 50/30/20
   - Arquivo sugerido: `print_05_categorias.png`

6. **Gestão de Lançamentos** (`/dashboard/lancamentos`)
   - Capturar: Tabela de lançamentos com filtros e totalizadores
   - Arquivo sugerido: `print_06_lancamentos.png`

7. **Gestão de Metas** (`/dashboard/metas`)
   - Capturar: Lista de metas com barras de progresso
   - Arquivo sugerido: `print_07_metas.png`

---

### 5.2 Fluxo de Navegação

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUXO DE NAVEGAÇÃO                        │
└──────────────────────────────────────────────────────────────┘

1. AUTENTICAÇÃO
   ┌─────────────┐
   │   Login     │ ──> Usuário insere e-mail e senha
   └──────┬──────┘
          │
          ├─> Novo usuário? ──> [Registro] ──> Volta para Login
          │
          ▼
   ┌─────────────┐
   │  Dashboard  │ ──> Tela principal após login
   └──────┬──────┘
          │
          │
2. NAVEGAÇÃO PRINCIPAL (via Navbar)
          │
    ┌─────┴─────┬─────────┬──────────┬─────────┐
    │           │         │          │         │
    ▼           ▼         ▼          ▼         ▼
┌───────┐  ┌──────┐  ┌────────┐  ┌──────┐  ┌──────┐
│Contas │  │Categ.│  │Lançam. │  │Metas │  │ Sair │
└───────┘  └──────┘  └────────┘  └──────┘  └──────┘
    │          │          │          │         │
    │          │          │          │         └──> Logout
    │          │          │          │
    ▼          ▼          ▼          ▼
 CRUD       CRUD       CRUD        CRUD
 Contas     Categ.     Lançam.     Metas


3. OPERAÇÕES CRUD (Padrão em todas as telas)

   Listar ──> Criar ──> Editar ──> Excluir
     │          │         │          │
     │          ▼         ▼          ▼
     │      [Modal]   [Modal]   [Confirmação]
     │          │         │          │
     └──────────┴─────────┴──────────┘
                    │
                    ▼
            Atualiza Lista
```

---

### 5.3 Descrição Resumida das Telas

#### **1. Login**
- **Layout:** Split-screen (gradiente azul + formulário branco)
- **Campos:** E-mail, Senha
- **Ações:** Entrar, Link para Registro

#### **2. Registro**
- **Layout:** Split-screen (gradiente verde + formulário branco)
- **Campos:** Nome, E-mail, Senha, Confirmar Senha
- **Ações:** Cadastrar, Link para Login

#### **3. Dashboard**
- **Seções:**
  - Resumo Financeiro (3 cards: Receitas, Despesas, Saldo)
  - Contas Ativas (lista de cards)
  - Metas em Andamento (lista com progresso)
- **Navegação:** Navbar superior com menu

#### **4. Contas**
- **Exibição:** Grid de cards com nome, tipo e saldo
- **Modal:** Criar/Editar conta (Nome, Tipo, Saldo Inicial)
- **Ações:** Nova Conta, Editar, Excluir

#### **5. Categorias**
- **Exibição:** Tabs (Receitas/Despesas) + Grid de cards
- **Destaque:** Classificação 50/30/20 para despesas
- **Modal:** Criar/Editar categoria (Nome, Tipo, Grupo 50/30/20)
- **Ações:** Nova Categoria, Editar, Excluir

#### **6. Lançamentos**
- **Exibição:** Tabela com filtros (data, tipo, conta, categoria, status)
- **Totalizadores:** Cards com Receitas, Despesas e Saldo
- **Modal:** Criar/Editar lançamento (Conta, Categoria, Tipo, Valor, Data, Descrição)
- **Ações:** Novo Lançamento, Editar, Excluir, Marcar como Pago

#### **7. Metas**
- **Exibição:** Grid de cards com barra de progresso
- **Informações:** Nome, Valor Atual/Alvo, Percentual, Status
- **Modal:** Criar/Editar meta (Nome, Descrição, Valor Alvo, Datas)
- **Ações:** Nova Meta, Editar, Concluir, Cancelar, Excluir

---

### 5.4 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16 | Framework React com App Router |
| **React** | 19 | Biblioteca UI |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 3.4 | Estilização |
| **Radix UI** | - | Componentes acessíveis (shadcn/ui) |
| **Axios** | - | Cliente HTTP |
| **date-fns** | - | Manipulação de datas |

---

### 5.5 Paleta de Cores

| Cor | Código | Uso |
|-----|--------|-----|
| **Azul** | `#1e40af` | Botões principais, links |
| **Verde** | `#10b981` | Receitas, sucesso |
| **Vermelho** | `#ef4444` | Despesas, erros |
| **Amarelo** | `#f59e0b` | Avisos |
| **Cinza Claro** | `#f8fafc` | Fundo |

---

## 6. Prototipação Preliminar do Código (Principais Classes)

### 6.1 Arquitetura em Camadas

O backend segue uma **arquitetura em 3 camadas** (Controller/Service/Repository):

```
┌─────────────────────────────────────────────────┐
│    Camada de Apresentação (Controllers)        │
│  • Recebe requisições HTTP                      │
│  • Valida entrada e retorna respostas           │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│    Camada de Negócio (Services)                │
│  • Lógica de negócio e regras (RNs)            │
│  • Validações complexas                         │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│    Camada de Dados (Repositories)              │
│  • Acesso ao banco de dados (CRUD)              │
│  • Queries SQL                                  │
└─────────────────────────────────────────────────┘
```

---

### 6.2 Camada de Apresentação (Controllers/Routes)

**Responsabilidade:** Receber requisições HTTP, validar entrada superficialmente e orquestrar chamadas para a camada de serviço.

#### Exemplo: LancamentoController (`app/api/routes/lancamentos.py`)

**Principais Métodos:**

| Método HTTP | Endpoint | Descrição |
|-------------|----------|-----------|
| POST | `/api/v1/lancamentos` | Criar novo lançamento |
| GET | `/api/v1/lancamentos` | Listar lançamentos com filtros |
| GET | `/api/v1/lancamentos/detalhes` | Listar com JOIN (conta + categoria) |
| GET | `/api/v1/lancamentos/totais` | Calcular totais do período |
| GET | `/api/v1/lancamentos/{id}` | Obter lançamento por ID |
| PUT | `/api/v1/lancamentos/{id}` | Atualizar lançamento |
| DELETE | `/api/v1/lancamentos/{id}` | Excluir lançamento |
| PATCH | `/api/v1/lancamentos/{id}/marcar-pago` | Marcar como pago |

**Assinatura de Exemplo:**
```python
@router.post("", response_model=LancamentoResponse, status_code=201)
async def criar_lancamento(
    lancamento: LancamentoCreate,
    current_user: UsuarioResponse = Depends(get_current_user)
) -> LancamentoResponse
```

---

### 6.3 Camada de Serviço (Services)

**Responsabilidade:** Conter a lógica de negócio (Regras de Negócio - RNs), validar dados e coordenar repositórios.

#### Exemplo: LancamentoService (`app/services/lancamento_service.py`)

**Principais Métodos:**

```python
def criar_lancamento(id_usuario: int, lancamento: LancamentoCreate) -> LancamentoResponse
```
- **Regras de Negócio:**
  - **RN001:** Conta e categoria devem pertencer ao usuário
  - **RN002:** Tipo do lançamento deve corresponder ao tipo da categoria
  - **RN003:** Valor deve ser positivo
- **Lógica:**
  1. Valida conta via `ContaFinanceiraRepository.get_by_id()`
  2. Valida categoria via `CategoriaRepository.get_by_id()`
  3. Valida tipo e valor
  4. Salva via `LancamentoRepository.create()`

```python
def obter_totais_periodo(id_usuario: int, data_inicio: date, data_fim: date) -> Dict
```
- **Regra de Negócio:**
  - **RN004:** Cálculo de fluxo de caixa (receitas - despesas)
- **Lógica:**
  1. Calcula total de receitas pagas
  2. Calcula total de despesas pagas
  3. Retorna `{total_receitas, total_despesas, saldo}`

```python
def listar_lancamentos_com_detalhes(...) -> List[LancamentoComDetalhes]
```
- **Lógica:** Delega para repository com JOIN de conta e categoria

---

### 6.4 Camada de Dados (Repositories)

**Responsabilidade:** Abstrair acesso ao banco de dados (CRUD). **Sem lógica de negócio.**

#### Exemplo: LancamentoRepository (`app/repositories/lancamento_repository.py`)

**Principais Métodos:**

```python
def create(id_usuario: int, lancamento: LancamentoCreate) -> LancamentoInDB
```
- **SQL:** `INSERT INTO lancamento (...) VALUES (...)`
- **Retorno:** Lançamento criado com ID

```python
def get_by_id(id_lancamento: int) -> Optional[LancamentoInDB]
```
- **SQL:** `SELECT * FROM lancamento WHERE id_lancamento = ?`
- **Retorno:** Lançamento ou None

```python
def get_com_detalhes(...) -> List[LancamentoComDetalhes]
```
- **SQL:**
  ```sql
  SELECT l.*, c.nome AS nome_conta, cat.nome AS nome_categoria
  FROM lancamento l
  INNER JOIN conta_financeira c ON l.id_conta = c.id_conta
  INNER JOIN categoria cat ON l.id_categoria = cat.id_categoria
  WHERE l.id_usuario = ?
  ORDER BY l.data DESC
  ```

```python
def get_total_por_periodo(...) -> Decimal
```
- **SQL:** `SELECT COALESCE(SUM(valor), 0) FROM lancamento WHERE ...`
- **Retorno:** Total calculado

```python
def update(id_lancamento: int, lancamento: LancamentoUpdate) -> LancamentoInDB
```
- **SQL:** `UPDATE lancamento SET ... WHERE id_lancamento = ?`

```python
def delete(id_lancamento: int) -> bool
```
- **SQL:** `DELETE FROM lancamento WHERE id_lancamento = ?`

---

### 6.5 Resumo das Regras de Negócio (RNs)

| Código | Descrição | Camada |
|--------|-----------|--------|
| **RN001** | Conta e categoria devem pertencer ao usuário | Service |
| **RN002** | Tipo do lançamento deve corresponder ao tipo da categoria | Service |
| **RN003** | Valor do lançamento deve ser positivo | Service |
| **RN004** | Cálculo de fluxo de caixa (receitas - despesas) | Service |
| **RN005** | Nome da conta deve ser único para o usuário | Service |
| **RN006** | Não pode desativar conta com lançamentos futuros pendentes | Service |
| **RN007** | Nome da categoria deve ser único para o usuário | Service |
| **RN008** | Grupo 50/30/20 só é válido para despesas | Service |
| **RN009** | Valor alvo da meta deve ser positivo | Service |
| **RN010** | Só pode concluir meta em andamento | Service |
| **RN011** | Só pode cancelar meta em andamento | Service |

---

### 6.6 Fluxo de Dados (Exemplo: Criar Lançamento)

```
1. Frontend → POST /api/v1/lancamentos
   Body: {id_conta: 1, id_categoria: 2, tipo: "Despesa", valor: 100.00}

2. Controller → criar_lancamento()
   • Valida autenticação (JWT)
   • Extrai dados do request

3. Service → criar_lancamento()
   • RN001: Valida conta e categoria pertencem ao usuário
   • RN002: Valida tipo do lançamento vs categoria
   • RN003: Valida valor positivo

4. Repository → create()
   • INSERT INTO lancamento (...)
   • Retorna lançamento com ID

5. Service → Retorna LancamentoResponse

6. Controller → HTTP 201 Created + JSON

7. Frontend → Atualiza UI
```

---

## 7. Conclusão

Este documento apresentou:

1. **Prototipação do Front-End:** Descrição detalhada de todas as 7 telas principais, incluindo layout, componentes, fluxo de navegação e validações.

2. **Arquitetura do Backend:** Separação clara em 3 camadas (Controller/Service/Repository) com responsabilidades bem definidas e 11 regras de negócio documentadas.

A arquitetura em camadas garante:
- **Manutenibilidade:** Código organizado e fácil de entender
- **Testabilidade:** Cada camada pode ser testada isoladamente (84 testes automatizados)
- **Escalabilidade:** Fácil adicionar novas funcionalidades
- **Separação de Responsabilidades:** Cada classe tem um propósito único e bem definido


