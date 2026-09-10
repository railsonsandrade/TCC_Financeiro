with open('backend/app/schema_postgres.sql', 'r', encoding='utf-8') as f: content = f.read()
content = content.replace('senha_hash VARCHAR(255) NOT NULL,', 'senha_hash VARCHAR(255) NOT NULL,\n    renda_mensal DECIMAL(10,2) DEFAULT 0.00,')

if 'telegram_vinculos' not in content:
    content += '''
-- Vincula um chat_id do Telegram a um usuário do sistema
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
'''
with open('backend/app/schema_postgres.sql', 'w', encoding='utf-8') as f: f.write(content)
