"""
Auto-inicialização de tabelas e usuário demo no banco de dados (SQLite ou PostgreSQL)
"""

import os
from app.utils.database import db
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioCreate

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

            # Garantir que telegram_chat_id seja BIGINT (migração automática)
            try:
                cursor.execute("ALTER TABLE telegram_vinculos ALTER COLUMN telegram_chat_id TYPE BIGINT")
                print("Tabelas PostgreSQL verificadas/criadas com sucesso. Tipo de telegram_chat_id garantido como BIGINT.")
            except Exception as e:
                print(f"Aviso durante ALTER TABLE (pode ser ignorado se já estiver correto): {e}")

    except Exception as e:
        print(f"⚠️ Erro ao verificar/inicializar tabelas no PostgreSQL: {e}")

    # Garante a criação do usuário demo
    setup_demo_user()

def setup_demo_user():
    """Cria o usuário de demonstração padrão se ele ainda não existir."""
    try:
        usuario_repo = UsuarioRepository(db)
        user = usuario_repo.get_by_email("demo@nextwallet.com")
        if not user:
            print("👤 Criando usuário demo@nextwallet.com...")
            usuario_repo.create(UsuarioCreate(
                nome="Usuário Demo",
                email="demo@nextwallet.com",
                senha="demo123"
            ))
            print("✅ Usuário demo@nextwallet.com criado com sucesso!")
        else:
            print("ℹ️ Usuário demo@nextwallet.com já existe.")
    except Exception as e:
        print(f"⚠️ Aviso ao verificar usuário demo: {e}")
