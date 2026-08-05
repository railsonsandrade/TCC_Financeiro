"""
Auto-inicialização de tabelas no banco de dados (SQLite ou PostgreSQL)
"""

import os
from app.utils.database import db

def init_postgres_tables():
    """Verifica e cria as tabelas do PostgreSQL no Railway/Supabase se ainda não existirem."""
    if not db.is_postgres:
        return

    try:
        with db.get_cursor() as cursor:
            # Verifica se a tabela 'usuario' existe
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuario');")
            result = cursor.fetchone()
            exists = result[0] if result else False

            if not exists:
                print("⚡ Inicializando tabelas do PostgreSQL no Railway...")
                sql_file = os.path.join(os.path.dirname(__file__), 'schema_postgres.sql')
                if os.path.exists(sql_file):
                    with open(sql_file, 'r', encoding='utf-8') as f:
                        sql_script = f.read()
                    cursor.execute(sql_script)
                    print("✅ Tabelas do PostgreSQL criadas com sucesso no Railway!")
            else:
                print("ℹ️ Tabelas do PostgreSQL já existem no Railway.")
    except Exception as e:
        print(f"⚠️ Erro ao verificar/inicializar tabelas no PostgreSQL: {e}")
