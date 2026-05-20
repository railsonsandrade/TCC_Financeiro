import os
import sqlite3

def init_database():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'tcc_financeira.db')
    schema_path = os.path.join(base_dir, 'schema_sqlite.sql')
    migration_sql_path = os.path.join(base_dir, 'migrations', '001_add_categoria_to_meta.sql')

    print(f"📁 Criando e configurando banco de dados SQLite em: {db_path}")

    # Conectar ao banco (cria se não existir)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Ler e executar o schema básico
        print("⚡ Aplicando esquema base do banco de dados (schema_sqlite.sql)...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        cursor.executescript(schema_sql)
        conn.commit()
        print("✅ Esquema básico criado!")

        # 2. Aplicar migration SQL de Metas se existir
        if os.path.exists(migration_sql_path):
            print("🔄 Aplicando migration de Metas (001_add_categoria_to_meta.sql)...")
            with open(migration_sql_path, 'r', encoding='utf-8') as f:
                migration_sql = f.read()
            cursor.executescript(migration_sql)
            conn.commit()
            print("✅ Migration de Metas aplicada!")

        # 3. Aplicar a migração de adicionar coluna 'cor' na tabela 'conta_financeira'
        print("🔄 Verificando migração de cores das contas...")
        cursor.execute("PRAGMA table_info(conta_financeira)")
        cols = [row[1] for row in cursor.fetchall()]
        if "cor" not in cols:
            cursor.execute("ALTER TABLE conta_financeira ADD COLUMN cor VARCHAR(7) DEFAULT '#3B82F6'")
            conn.commit()
            print("✅ Coluna 'cor' adicionada com sucesso em conta_financeira!")
        else:
            print("ℹ️ Coluna 'cor' já existe em conta_financeira.")

        # 4. Aplicar a migração para a tabela 'telegram_vinculos'
        print("🔄 Verificando migração da tabela telegram_vinculos...")
        cursor.execute("PRAGMA table_info(telegram_vinculos)")
        if not cursor.fetchall():
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS telegram_vinculos (
                    id_vinculo INTEGER PRIMARY KEY AUTOINCREMENT,
                    id_usuario INTEGER NOT NULL,
                    telegram_chat_id INTEGER NOT NULL UNIQUE,
                    telegram_username VARCHAR(100),
                    codigo_vinculo VARCHAR(10),
                    ativo BOOLEAN NOT NULL DEFAULT 1,
                    data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_telegram_chat_id ON telegram_vinculos(telegram_chat_id)")
            conn.commit()
            print("✅ Tabela telegram_vinculos criada com sucesso!")
        else:
            print("ℹ️ Tabela telegram_vinculos já existe.")

        print("🎉 Configuração completa do banco de dados concluída com sucesso!")

    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {str(e)}")
        conn.rollback()
        raise e
    finally:
        conn.close()

if __name__ == "__main__":
    init_database()
