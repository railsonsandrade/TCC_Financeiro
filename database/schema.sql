-- =============================================
-- TCC FINANCEIRA - SCHEMA DO BANCO DE DADOS
-- Sistema de Gestão Financeira Pessoal
-- SQL Server
-- =============================================

-- Criar banco de dados (executar separadamente se necessário)
-- CREATE DATABASE tcc_financeira;
-- GO

USE tcc_financeira;
GO

-- =============================================
-- TABELA: USUARIO
-- =============================================
IF OBJECT_ID('dbo.USUARIO', 'U') IS NOT NULL
    DROP TABLE dbo.USUARIO;
GO

CREATE TABLE dbo.USUARIO (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao DATETIME NOT NULL DEFAULT GETDATE(),
    data_atualizacao DATETIME NULL,
    ativo BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT CK_USUARIO_email CHECK (email LIKE '%@%')
);
GO

-- Índice para busca por email
CREATE INDEX IX_USUARIO_email ON dbo.USUARIO(email);
GO

-- =============================================
-- TABELA: CONTA_FINANCEIRA
-- =============================================
IF OBJECT_ID('dbo.CONTA_FINANCEIRA', 'U') IS NOT NULL
    DROP TABLE dbo.CONTA_FINANCEIRA;
GO

CREATE TABLE dbo.CONTA_FINANCEIRA (
    id_conta INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_criacao DATETIME NOT NULL DEFAULT GETDATE(),
    ativa BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT FK_CONTA_USUARIO FOREIGN KEY (id_usuario) 
        REFERENCES dbo.USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT CK_CONTA_tipo CHECK (tipo IN ('Conta Corrente', 'Poupança', 'Carteira', 'Outro')),
    CONSTRAINT UQ_CONTA_usuario_nome_tipo UNIQUE (id_usuario, nome, tipo)
);
GO

-- Índice para busca por usuário
CREATE INDEX IX_CONTA_usuario ON dbo.CONTA_FINANCEIRA(id_usuario);
GO

-- =============================================
-- TABELA: CATEGORIA
-- =============================================
IF OBJECT_ID('dbo.CATEGORIA', 'U') IS NOT NULL
    DROP TABLE dbo.CATEGORIA;
GO

CREATE TABLE dbo.CATEGORIA (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    grupo_50_30_20 VARCHAR(20) NOT NULL,
    cor VARCHAR(7) NULL, -- Hex color code (ex: #FF5733)
    ativa BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT FK_CATEGORIA_USUARIO FOREIGN KEY (id_usuario) 
        REFERENCES dbo.USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT CK_CATEGORIA_tipo CHECK (tipo IN ('Receita', 'Despesa')),
    CONSTRAINT CK_CATEGORIA_grupo CHECK (grupo_50_30_20 IN ('Essencial', 'Desejável', 'Poupança')),
    CONSTRAINT UQ_CATEGORIA_usuario_nome UNIQUE (id_usuario, nome)
);
GO

-- Índice para busca por usuário e tipo
CREATE INDEX IX_CATEGORIA_usuario_tipo ON dbo.CATEGORIA(id_usuario, tipo);
GO

-- =============================================
-- TABELA: RECORRENCIA
-- =============================================
IF OBJECT_ID('dbo.RECORRENCIA', 'U') IS NOT NULL
    DROP TABLE dbo.RECORRENCIA;
GO

CREATE TABLE dbo.RECORRENCIA (
    id_recorrencia INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    periodicidade VARCHAR(20) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NULL,
    tipo VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    id_conta INT NOT NULL,
    id_categoria INT NOT NULL,
    descricao VARCHAR(255) NULL,
    ativa BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT FK_RECORRENCIA_USUARIO FOREIGN KEY (id_usuario) 
        REFERENCES dbo.USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT FK_RECORRENCIA_CONTA FOREIGN KEY (id_conta) 
        REFERENCES dbo.CONTA_FINANCEIRA(id_conta),
    CONSTRAINT FK_RECORRENCIA_CATEGORIA FOREIGN KEY (id_categoria) 
        REFERENCES dbo.CATEGORIA(id_categoria),
    CONSTRAINT CK_RECORRENCIA_periodicidade CHECK (periodicidade IN ('Diária', 'Semanal', 'Mensal', 'Anual')),
    CONSTRAINT CK_RECORRENCIA_tipo CHECK (tipo IN ('Receita', 'Despesa')),
    CONSTRAINT CK_RECORRENCIA_valor CHECK (valor > 0),
    CONSTRAINT CK_RECORRENCIA_datas CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);
GO

-- Índice para busca por usuário
CREATE INDEX IX_RECORRENCIA_usuario ON dbo.RECORRENCIA(id_usuario);
GO

-- =============================================
-- TABELA: LANCAMENTO
-- =============================================
IF OBJECT_ID('dbo.LANCAMENTO', 'U') IS NOT NULL
    DROP TABLE dbo.LANCAMENTO;
GO

CREATE TABLE dbo.LANCAMENTO (
    id_lancamento INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_conta INT NOT NULL,
    id_categoria INT NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    descricao VARCHAR(255) NULL,
    origem VARCHAR(20) NOT NULL DEFAULT 'Manual',
    id_recorrencia INT NULL,
    data_criacao DATETIME NOT NULL DEFAULT GETDATE(),
    pago BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_LANCAMENTO_USUARIO FOREIGN KEY (id_usuario) 
        REFERENCES dbo.USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT FK_LANCAMENTO_CONTA FOREIGN KEY (id_conta) 
        REFERENCES dbo.CONTA_FINANCEIRA(id_conta),
    CONSTRAINT FK_LANCAMENTO_CATEGORIA FOREIGN KEY (id_categoria) 
        REFERENCES dbo.CATEGORIA(id_categoria),
    CONSTRAINT FK_LANCAMENTO_RECORRENCIA FOREIGN KEY (id_recorrencia) 
        REFERENCES dbo.RECORRENCIA(id_recorrencia),
    CONSTRAINT CK_LANCAMENTO_tipo CHECK (tipo IN ('Receita', 'Despesa')),
    CONSTRAINT CK_LANCAMENTO_valor CHECK (valor > 0),
    CONSTRAINT CK_LANCAMENTO_origem CHECK (origem IN ('Manual', 'Recorrente'))
);
GO

-- Índices para busca e performance
CREATE INDEX IX_LANCAMENTO_usuario ON dbo.LANCAMENTO(id_usuario);
CREATE INDEX IX_LANCAMENTO_data ON dbo.LANCAMENTO(data);
CREATE INDEX IX_LANCAMENTO_usuario_data ON dbo.LANCAMENTO(id_usuario, data);
GO

-- =============================================
-- TABELA: META_FINANCEIRA
-- =============================================
IF OBJECT_ID('dbo.META_FINANCEIRA', 'U') IS NOT NULL
    DROP TABLE dbo.META_FINANCEIRA;
GO

CREATE TABLE dbo.META_FINANCEIRA (
    id_meta INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    valor_alvo DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_inicio DATE NOT NULL,
    data_fim_prev DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Em Andamento',
    data_criacao DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_META_USUARIO FOREIGN KEY (id_usuario)
        REFERENCES dbo.USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT CK_META_valor_alvo CHECK (valor_alvo > 0),
    CONSTRAINT CK_META_valor_atual CHECK (valor_atual >= 0),
    CONSTRAINT CK_META_status CHECK (status IN ('Em Andamento', 'Concluída', 'Cancelada')),
    CONSTRAINT CK_META_datas CHECK (data_fim_prev IS NULL OR data_fim_prev >= data_inicio)
);
GO

-- Índice para busca por usuário
CREATE INDEX IX_META_usuario ON dbo.META_FINANCEIRA(id_usuario);
GO

-- =============================================
-- TABELA: NOTIFICACAO
-- =============================================
IF OBJECT_ID('dbo.NOTIFICACAO', 'U') IS NOT NULL
    DROP TABLE dbo.NOTIFICACAO;
GO

CREATE TABLE dbo.NOTIFICACAO (
    id_notificacao INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem VARCHAR(500) NOT NULL,
    data_envio DATETIME NOT NULL DEFAULT GETDATE(),
    lida BIT NOT NULL DEFAULT 0,
    data_leitura DATETIME NULL,

    CONSTRAINT FK_NOTIFICACAO_USUARIO FOREIGN KEY (id_usuario)
        REFERENCES dbo.USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT CK_NOTIFICACAO_tipo CHECK (tipo IN ('Meta', 'Conta', 'ProjecaoNegativa', 'Sistema'))
);
GO

-- Índice para busca por usuário e status de leitura
CREATE INDEX IX_NOTIFICACAO_usuario_lida ON dbo.NOTIFICACAO(id_usuario, lida);
GO

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Saldo atual por conta
CREATE OR ALTER VIEW vw_saldo_conta AS
SELECT
    c.id_conta,
    c.id_usuario,
    c.nome AS nome_conta,
    c.tipo,
    c.saldo_inicial,
    ISNULL(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) AS total_receitas,
    ISNULL(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) AS total_despesas,
    c.saldo_inicial +
        ISNULL(SUM(CASE WHEN l.tipo = 'Receita' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) -
        ISNULL(SUM(CASE WHEN l.tipo = 'Despesa' AND l.pago = 1 THEN l.valor ELSE 0 END), 0) AS saldo_atual
FROM dbo.CONTA_FINANCEIRA c
LEFT JOIN dbo.LANCAMENTO l ON c.id_conta = l.id_conta
WHERE c.ativa = 1
GROUP BY c.id_conta, c.id_usuario, c.nome, c.tipo, c.saldo_inicial;
GO

-- View: Resumo mensal por categoria
CREATE OR ALTER VIEW vw_resumo_categoria_mes AS
SELECT
    l.id_usuario,
    YEAR(l.data) AS ano,
    MONTH(l.data) AS mes,
    c.nome AS categoria,
    c.tipo,
    c.grupo_50_30_20,
    SUM(l.valor) AS total,
    COUNT(*) AS quantidade_lancamentos
FROM dbo.LANCAMENTO l
INNER JOIN dbo.CATEGORIA c ON l.id_categoria = c.id_categoria
WHERE l.pago = 1
GROUP BY l.id_usuario, YEAR(l.data), MONTH(l.data), c.nome, c.tipo, c.grupo_50_30_20;
GO

-- =============================================
-- DADOS INICIAIS (SEED DATA)
-- =============================================

-- Categorias padrão serão criadas via aplicação quando usuário se cadastrar

PRINT 'Schema criado com sucesso!';
PRINT 'Tabelas: USUARIO, CONTA_FINANCEIRA, CATEGORIA, RECORRENCIA, LANCAMENTO, META_FINANCEIRA, NOTIFICACAO';
PRINT 'Views: vw_saldo_conta, vw_resumo_categoria_mes';
GO

