import os
import sqlite3

def init_database():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'tcc_financeira.db')
    schema_path = os.path.join(base_dir, 'schema_sqlite.sql')
    migration_path = os.path.join(base_dir, 'migrations', '001_add_categoria_to_meta.sql')

    print(f"📁 Criando banco de dados SQLite em: {db_path}")

    # Conectar ao banco (cria se não existir)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Ler e executar o schema
        print("⚡ Aplicando esquema do banco de dados (schema_sqlite.sql)...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        cursor.executescript(schema_sql)
        conn.commit()
        print("✅ Esquema básico criado com sucesso!")

        # Aplicar migration se existir
        if os.path.exists(migration_path):
            print("🔄 Aplicando migrations adicionais...")
            with open(migration_path, 'r', encoding='utf-8') as f:
                migration_sql = f.read()
            cursor.executescript(migration_sql)
            conn.commit()
            print("✅ Migrations aplicadas com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {str(e)}")
        conn.rollback()
        raise e
    finally:
        conn.close()

if __name__ == "__main__":
    init_database()
