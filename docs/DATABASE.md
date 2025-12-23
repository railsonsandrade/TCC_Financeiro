# 🗄️ Documentação do Banco de Dados - SQLite

## 📊 Diagrama ER (Entidade-Relacionamento)

```
┌─────────────────┐
│    usuario      │
├─────────────────┤
│ id_usuario (PK) │
│ nome            │
│ email (UNIQUE)  │
│ senha_hash      │
│ data_criacao    │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────────────────────────────────────────┐
    │                                             │
┌───▼──────────────┐  ┌──────────────────┐  ┌───▼──────────────┐
│conta_financeira  │  │   categoria      │  │meta_financeira   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│id_conta (PK)     │  │id_categoria (PK) │  │id_meta (PK)      │
│id_usuario (FK)   │  │id_usuario (FK)   │  │id_usuario (FK)   │
│nome              │  │nome              │  │nome              │
│tipo              │  │tipo              │  │descricao         │
│saldo_inicial     │  │icone             │  │valor_alvo        │
│cor               │  │cor               │  │valor_atual       │
│ativo             │  │grupo_50_30_20    │  │data_inicio       │
│data_criacao      │  │ativo             │  │data_fim          │
└────────┬─────────┘  └────────┬─────────┘  │status            │
         │                     │             │data_criacao      │
         │                     │             └──────────────────┘
         │                     │
         │ 1:N                 │ 1:N
         │                     │
         └──────────┬──────────┘
                    │
              ┌─────▼─────────┐
              │  lancamento   │
              ├───────────────┤
              │id_lancamento  │
              │id_conta (FK)  │
              │id_categoria   │
              │tipo           │
              │valor          │
              │descricao      │
              │data_lancamento│
              │pago           │
              │data_criacao   │
              └───────────────┘
```

---

## 📋 Tabelas

### 1. usuario

Armazena os dados dos usuários do sistema.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id_usuario | INTEGER | PK, AUTO INCREMENT | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome completo |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Email (login) |
| senha_hash | VARCHAR(255) | NOT NULL | Senha hasheada (bcrypt) |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de cadastro |

---

### 2. conta_financeira

Armazena as contas financeiras dos usuários.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id_conta | INTEGER | PK, AUTO INCREMENT | Identificador único |
| id_usuario | INTEGER | FK → usuario, NOT NULL | Dono da conta |
| nome | VARCHAR(100) | NOT NULL | Nome da conta |
| tipo | VARCHAR(50) | NOT NULL | Tipo (Conta Corrente, Poupança, etc) |
| saldo_inicial | DECIMAL(15,2) | DEFAULT 0 | Saldo inicial |
| cor | VARCHAR(7) | DEFAULT '#3B82F6' | Cor em hexadecimal |
| ativo | BOOLEAN | DEFAULT 1 | Conta ativa/inativa |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Tipos permitidos:**
- Conta Corrente
- Poupança
- Carteira
- Outro

---

### 3. categoria

Armazena as categorias de receitas e despesas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id_categoria | INTEGER | PK, AUTO INCREMENT | Identificador único |
| id_usuario | INTEGER | FK → usuario, NOT NULL | Dono da categoria |
| nome | VARCHAR(100) | NOT NULL | Nome da categoria |
| tipo | VARCHAR(20) | NOT NULL | Receita ou Despesa |
| icone | VARCHAR(50) | NULL | Nome do ícone |
| cor | VARCHAR(7) | DEFAULT '#10B981' | Cor em hexadecimal |
| grupo_50_30_20 | VARCHAR(20) | NULL | Classificação 50/30/20 |
| ativo | BOOLEAN | DEFAULT 1 | Categoria ativa/inativa |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Tipos permitidos:**
- Receita
- Despesa

**Grupos 50/30/20 (apenas para Despesas):**
- Essencial (50%)
- Desejável (30%)
- Poupança (20%)

---

### 4. lancamento

Armazena os lançamentos financeiros (receitas e despesas).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id_lancamento | INTEGER | PK, AUTO INCREMENT | Identificador único |
| id_conta | INTEGER | FK → conta_financeira, NOT NULL | Conta vinculada |
| id_categoria | INTEGER | FK → categoria, NOT NULL | Categoria vinculada |
| tipo | VARCHAR(20) | NOT NULL | Receita ou Despesa |
| valor | DECIMAL(15,2) | NOT NULL | Valor do lançamento |
| descricao | TEXT | NULL | Descrição detalhada |
| data_lancamento | DATE | NOT NULL | Data do lançamento |
| pago | BOOLEAN | DEFAULT 1 | Pago ou pendente |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

---

### 5. meta_financeira

Armazena as metas financeiras dos usuários.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id_meta | INTEGER | PK, AUTO INCREMENT | Identificador único |
| id_usuario | INTEGER | FK → usuario, NOT NULL | Dono da meta |
| nome | VARCHAR(100) | NOT NULL | Nome da meta |
| descricao | TEXT | NULL | Descrição detalhada |
| valor_alvo | DECIMAL(15,2) | NOT NULL | Valor objetivo |
| valor_atual | DECIMAL(15,2) | DEFAULT 0 | Valor atual |
| data_inicio | DATE | NOT NULL | Data de início |
| data_fim | DATE | NOT NULL | Data de término |
| status | VARCHAR(20) | DEFAULT 'Em Andamento' | Status da meta |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Status permitidos:**
- Em Andamento
- Concluída
- Cancelada

---

## 📊 Views

### 1. vw_contas_com_saldo

Calcula o saldo atual de cada conta baseado nos lançamentos.

```sql
CREATE VIEW vw_contas_com_saldo AS
SELECT 
    c.*,
    COALESCE(c.saldo_inicial, 0) + 
    COALESCE(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) as saldo_atual
FROM conta_financeira c
LEFT JOIN lancamento l ON c.id_conta = l.id_conta
GROUP BY c.id_conta;
```

### 2. vw_metas_com_percentual

Calcula o percentual atingido de cada meta.

```sql
CREATE VIEW vw_metas_com_percentual AS
SELECT 
    m.*,
    CASE 
        WHEN m.valor_alvo > 0 THEN (m.valor_atual * 100.0 / m.valor_alvo)
        ELSE 0 
    END as percentual_atingido
FROM meta_financeira m;
```

---

## 🔧 Índices

Para melhorar a performance das consultas:

```sql
CREATE INDEX idx_conta_usuario ON conta_financeira(id_usuario);
CREATE INDEX idx_categoria_usuario ON categoria(id_usuario);
CREATE INDEX idx_lancamento_conta ON lancamento(id_conta);
CREATE INDEX idx_lancamento_categoria ON lancamento(id_categoria);
CREATE INDEX idx_lancamento_data ON lancamento(data_lancamento);
CREATE INDEX idx_meta_usuario ON meta_financeira(id_usuario);
```

---

## 📝 Seed Data

O arquivo `backend/seed_test_data.py` cria dados de teste:

- 1 usuário de teste (teste@teste.com / 123456)
- 3 contas financeiras
- 10 categorias (5 receitas + 5 despesas)
- 20 lançamentos variados
- 3 metas financeiras

---

## 🚀 Como Usar

### Criar o Banco de Dados

```bash
cd database
sqlite3 tcc_financeira.db < schema_sqlite.sql
```

### Criar Dados de Teste

```bash
cd backend
python seed_test_data.py
```

### Conectar ao Banco

```bash
sqlite3 database/tcc_financeira.db
```

