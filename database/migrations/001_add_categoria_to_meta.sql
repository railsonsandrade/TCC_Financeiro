-- Migration: Adicionar categoria vinculada à meta financeira
-- Data: 2025-11-21
-- Descrição: Permite vincular uma categoria de poupança a cada meta,
--            fazendo com que lançamentos nessa categoria atualizem automaticamente o valor da meta

-- Adicionar coluna id_categoria na tabela meta_financeira
ALTER TABLE meta_financeira ADD COLUMN id_categoria INTEGER;

-- Adicionar foreign key constraint
-- Nota: SQLite não suporta ADD CONSTRAINT em ALTER TABLE
-- A constraint será validada pela aplicação

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_meta_categoria ON meta_financeira(id_categoria);

-- Comentários sobre a estrutura:
-- id_categoria: ID da categoria de poupança vinculada à meta
--               Quando NULL, a meta funciona no modo antigo (manual)
--               Quando preenchido, o valor_atual é calculado automaticamente
--               baseado na soma dos lançamentos dessa categoria

