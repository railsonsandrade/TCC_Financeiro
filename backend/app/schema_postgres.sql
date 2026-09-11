-- =============================================
-- TCC FINANCEIRA - SCHEMA DO BANCO DE DADOS
-- PostgreSQL (Supabase / Render / Railway)
-- =============================================

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    renda_mensal DECIMAL(10,2) DEFAULT 0.00,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (email LIKE '%_@__%.__%')
);

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);

CREATE TABLE IF NOT EXISTS conta_financeira (
    id_conta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (tipo IN ('Conta Corrente', 'Poupança', 'Carteira', 'Outro')),
    UNIQUE (id_usuario, nome, tipo)
);

CREATE INDEX IF NOT EXISTS idx_conta_usuario ON conta_financeira(id_usuario);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    grupo_50_30_20 VARCHAR(20),
    cor VARCHAR(7),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (tipo IN ('Receita', 'Despesa')),
    CHECK (grupo_50_30_20 IS NULL OR grupo_50_30_20 IN ('Essencial', 'Desejável', 'Poupança')),
    UNIQUE (id_usuario, nome)
);

CREATE INDEX IF NOT EXISTS idx_categoria_usuario_tipo ON categoria(id_usuario, tipo);

CREATE TABLE IF NOT EXISTS recorrencia (
    id_recorrencia SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    periodicidade VARCHAR(20) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    tipo VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    id_conta INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    descricao VARCHAR(255),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_conta) REFERENCES conta_financeira(id_conta),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CHECK (periodicidade IN ('Diária', 'Semanal', 'Mensal', 'Anual')),
    CHECK (tipo IN ('Receita', 'Despesa')),
    CHECK (valor > 0),
    CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_recorrencia_usuario ON recorrencia(id_usuario);

CREATE TABLE IF NOT EXISTS lancamento (
    id_lancamento SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_conta INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    descricao VARCHAR(255),
    origem VARCHAR(20) NOT NULL DEFAULT 'Manual',
    id_recorrencia INTEGER,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pago BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_conta) REFERENCES conta_financeira(id_conta),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_recorrencia) REFERENCES recorrencia(id_recorrencia),
    CHECK (tipo IN ('Receita', 'Despesa')),
    CHECK (valor > 0),
    CHECK (origem IN ('Manual', 'Recorrente'))
);

CREATE INDEX IF NOT EXISTS idx_lancamento_usuario ON lancamento(id_usuario);
CREATE INDEX IF NOT EXISTS idx_lancamento_data ON lancamento(data);
CREATE INDEX IF NOT EXISTS idx_lancamento_usuario_data ON lancamento(id_usuario, data);

CREATE TABLE IF NOT EXISTS meta_financeira (
    id_meta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nome VARCHAR(150) NOT NULL,
    valor_alvo DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_inicio DATE NOT NULL,
    data_fim_prev DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Em Andamento',
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (valor_alvo > 0),
    CHECK (valor_atual >= 0),
    CHECK (status IN ('Em Andamento', 'Concluída', 'Cancelada')),
    CHECK (data_fim_prev IS NULL OR data_fim_prev >= data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_meta_usuario ON meta_financeira(id_usuario);

CREATE TABLE IF NOT EXISTS notificacao (
    id_notificacao SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CHECK (tipo IN ('Alerta', 'Lembrete', 'Meta', 'ProjecaoNegativa'))
);

CREATE INDEX IF NOT EXISTS idx_notificacao_usuario_lida ON notificacao(id_usuario, lida);

CREATE TABLE IF NOT EXISTS dashboard_widget (
    id_widget VARCHAR(100) PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    w INTEGER NOT NULL,
    h INTEGER NOT NULL,
    configuracao JSON,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widget_usuario ON dashboard_widget(id_usuario);

CREATE TABLE IF NOT EXISTS telegram_vinculos (
    id_vinculo SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    telegram_chat_id BIGINT NOT NULL UNIQUE,
    telegram_username VARCHAR(100),
    codigo_vinculo VARCHAR(10),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telegram_chat_id ON telegram_vinculos(telegram_chat_id);

CREATE OR REPLACE VIEW vw_saldo_conta AS
SELECT
    c.id_conta,
    c.id_usuario,
    c.nome AS nome_conta,
    c.tipo AS tipo_conta,
    c.saldo_inicial,
    c.cor,
    COALESCE(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = TRUE THEN l.valor ELSE 0 END), 0) AS total_receitas,
    COALESCE(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = TRUE THEN l.valor ELSE 0 END), 0) AS total_despesas,
    c.saldo_inicial +
    COALESCE(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = TRUE THEN l.valor ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = TRUE THEN l.valor ELSE 0 END), 0) AS saldo_atual
FROM conta_financeira c
LEFT JOIN lancamento l ON c.id_conta = l.id_conta
WHERE c.ativa = TRUE
GROUP BY c.id_conta, c.id_usuario, c.nome, c.tipo, c.saldo_inicial, c.cor;

CREATE OR REPLACE VIEW vw_resumo_categoria_mes AS
SELECT
    l.id_usuario,
    c.id_categoria,
    c.nome AS categoria,
    c.tipo AS tipo_categoria,
    c.grupo_50_30_20,
    TO_CHAR(l.data, 'YYYY-MM') AS mes_ano,
    COUNT(l.id_lancamento) AS qtd_lancamentos,
    SUM(l.valor) AS total_valor
FROM lancamento l
INNER JOIN categoria c ON l.id_categoria = c.id_categoria
WHERE l.pago = TRUE
GROUP BY l.id_usuario, c.id_categoria, c.nome, c.tipo, c.grupo_50_30_20, TO_CHAR(l.data, 'YYYY-MM');


