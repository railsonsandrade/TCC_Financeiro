-- =============================================
-- TCC FINANCEIRA - SCHEMA DO BANCO DE DADOS
-- Sistema de Gestão Financeira Pessoal
-- SQLite
-- =============================================

-- Habilitar foreign keys
PRAGMA foreign_keys = ON;

-- =============================================
-- TABELA: USUARIO
-- =============================================
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME,
    ativo BOOLEAN NOT NULL DEFAULT 1,
    
    CHECK (email LIKE '%_@__%.__%')
);

-- Índice para busca por email
CREATE INDEX idx_usuario_email ON usuario(email);

-- =============================================
-- TABELA: CONTA_FINANCEIRA
-- =============================================
DROP TABLE IF EXISTS conta_financeira;

CREATE TABLE conta_financeira (
    id_conta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativa BOOLEAN NOT NULL DEFAULT 1,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (tipo IN ('Conta Corrente', 'Poupança', 'Carteira', 'Outro')),
    UNIQUE (id_usuario, nome, tipo)
);

-- Índice para busca por usuário
CREATE INDEX idx_conta_usuario ON conta_financeira(id_usuario);

-- =============================================
-- TABELA: CATEGORIA
-- =============================================
DROP TABLE IF EXISTS categoria;

CREATE TABLE categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    grupo_50_30_20 VARCHAR(20), -- NULL para Receitas, obrigatório para Despesas
    cor VARCHAR(7), -- Hex color code (ex: #FF5733)
    ativa BOOLEAN NOT NULL DEFAULT 1,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (tipo IN ('Receita', 'Despesa')),
    CHECK (grupo_50_30_20 IS NULL OR grupo_50_30_20 IN ('Essencial', 'Desejável', 'Poupança')),
    UNIQUE (id_usuario, nome)
);

-- Índice para busca por usuário e tipo
CREATE INDEX idx_categoria_usuario_tipo ON categoria(id_usuario, tipo);

-- =============================================
-- TABELA: RECORRENCIA
-- =============================================
DROP TABLE IF EXISTS recorrencia;

CREATE TABLE recorrencia (
    id_recorrencia INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    periodicidade VARCHAR(20) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    tipo VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    id_conta INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    descricao VARCHAR(255),
    ativa BOOLEAN NOT NULL DEFAULT 1,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_conta) REFERENCES conta_financeira(id_conta),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CHECK (periodicidade IN ('Diária', 'Semanal', 'Mensal', 'Anual')),
    CHECK (tipo IN ('Receita', 'Despesa')),
    CHECK (valor > 0),
    CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- Índice para busca por usuário
CREATE INDEX idx_recorrencia_usuario ON recorrencia(id_usuario);

-- =============================================
-- TABELA: LANCAMENTO
-- =============================================
DROP TABLE IF EXISTS lancamento;

CREATE TABLE lancamento (
    id_lancamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_conta INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    descricao VARCHAR(255),
    origem VARCHAR(20) NOT NULL DEFAULT 'Manual',
    id_recorrencia INTEGER,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pago BOOLEAN NOT NULL DEFAULT 0,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_conta) REFERENCES conta_financeira(id_conta),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_recorrencia) REFERENCES recorrencia(id_recorrencia),
    CHECK (tipo IN ('Receita', 'Despesa')),
    CHECK (valor > 0),
    CHECK (origem IN ('Manual', 'Recorrente'))
);

-- Índices para busca e performance
CREATE INDEX idx_lancamento_usuario ON lancamento(id_usuario);
CREATE INDEX idx_lancamento_data ON lancamento(data);
CREATE INDEX idx_lancamento_usuario_data ON lancamento(id_usuario, data);

-- =============================================
-- TABELA: META_FINANCEIRA
-- =============================================
DROP TABLE IF EXISTS meta_financeira;

CREATE TABLE meta_financeira (
    id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    nome VARCHAR(150) NOT NULL,
    valor_alvo DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_inicio DATE NOT NULL,
    data_fim_prev DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Em Andamento',
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (valor_alvo > 0),
    CHECK (valor_atual >= 0),
    CHECK (status IN ('Em Andamento', 'Concluída', 'Cancelada')),
    CHECK (data_fim_prev IS NULL OR data_fim_prev >= data_inicio)
);

-- Índice para busca por usuário
CREATE INDEX idx_meta_usuario ON meta_financeira(id_usuario);

-- =============================================
-- TABELA: NOTIFICACAO
-- =============================================
DROP TABLE IF EXISTS notificacao;

CREATE TABLE notificacao (
    id_notificacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN NOT NULL DEFAULT 0,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (tipo IN ('Alerta', 'Lembrete', 'Meta', 'ProjecaoNegativa'))
);

-- Índice para busca por usuário e status de leitura
CREATE INDEX idx_notificacao_usuario_lida ON notificacao(id_usuario, lida);

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Saldo atual de cada conta
DROP VIEW IF EXISTS vw_saldo_conta;

CREATE VIEW vw_saldo_conta AS
SELECT
    c.id_conta,
    c.id_usuario,
    c.nome AS nome_conta,
    c.tipo AS tipo_conta,
    c.saldo_inicial,
    c.cor,
    COALESCE(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) AS total_receitas,
    COALESCE(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) AS total_despesas,
    c.saldo_inicial +
    COALESCE(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) AS saldo_atual
FROM conta_financeira c
LEFT JOIN lancamento l ON c.id_conta = l.id_conta
WHERE c.ativa = 1
GROUP BY c.id_conta, c.id_usuario, c.nome, c.tipo, c.saldo_inicial, c.cor;

-- View: Resumo de gastos por categoria no mês
DROP VIEW IF EXISTS vw_resumo_categoria_mes;

CREATE VIEW vw_resumo_categoria_mes AS
SELECT
    l.id_usuario,
    c.id_categoria,
    c.nome AS categoria,
    c.tipo AS tipo_categoria,
    c.grupo_50_30_20,
    strftime('%Y-%m', l.data) AS mes_ano,
    COUNT(l.id_lancamento) AS qtd_lancamentos,
    SUM(l.valor) AS total_valor
FROM lancamento l
INNER JOIN categoria c ON l.id_categoria = c.id_categoria
WHERE l.pago = 1
GROUP BY l.id_usuario, c.id_categoria, c.nome, c.tipo, c.grupo_50_30_20, strftime('%Y-%m', l.data);

-- =============================================
-- TABELA: DASHBOARD_WIDGET
-- =============================================
DROP TABLE IF EXISTS dashboard_widget;

CREATE TABLE dashboard_widget (
    id_widget VARCHAR(100) PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    w INTEGER NOT NULL,
    h INTEGER NOT NULL,
    configuracao JSON,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_dashboard_widget_usuario ON dashboard_widget(id_usuario);

-- =============================================
-- TABELA: TELEGRAM_VINCULOS
-- Vincula um chat_id do Telegram a um usuário do sistema
-- =============================================
CREATE TABLE IF NOT EXISTS telegram_vinculos (
    id_vinculo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    telegram_chat_id INTEGER NOT NULL UNIQUE,
    telegram_username VARCHAR(100),
    codigo_vinculo VARCHAR(10),        -- Código temporário gerado pelo app web
    ativo BOOLEAN NOT NULL DEFAULT 1,
    data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_telegram_chat_id ON telegram_vinculos(telegram_chat_id);

-- =============================================
-- FIM DO SCHEMA
-- =============================================
