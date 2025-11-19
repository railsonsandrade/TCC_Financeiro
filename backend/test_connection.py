"""
Script de teste de conexão com o banco de dados
Execute este script para verificar se a conexão com o SQL Server está funcionando
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.utils.database import db
from app.config import settings


def test_database_connection():
    """Testa a conexão com o banco de dados"""
    
    print("=" * 60)
    print("TESTE DE CONEXÃO COM O BANCO DE DADOS")
    print("=" * 60)
    print()
    
    print("Configurações:")
    print(f"  Servidor: {settings.DB_SERVER}:{settings.DB_PORT}")
    print(f"  Banco: {settings.DB_NAME}")
    print(f"  Usuário: {settings.DB_USER}")
    print()
    
    print("Testando conexão...")
    
    try:
        # Testa a conexão
        if db.test_connection():
            print("✅ Conexão estabelecida com sucesso!")
            print()
            
            # Testa uma query simples
            print("Testando query simples...")
            result = db.execute_scalar("SELECT @@VERSION")
            print(f"✅ Versão do SQL Server:")
            print(f"   {result[:100]}...")
            print()
            
            # Lista as tabelas do banco
            print("Listando tabelas do banco de dados...")
            tables = db.execute_query("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            """)
            
            if tables:
                print(f"✅ Encontradas {len(tables)} tabelas:")
                for table in tables:
                    print(f"   - {table['TABLE_NAME']}")
            else:
                print("⚠️  Nenhuma tabela encontrada. Execute o script schema.sql primeiro.")
            
            print()
            print("=" * 60)
            print("TESTE CONCLUÍDO COM SUCESSO!")
            print("=" * 60)
            return True
            
        else:
            print("❌ Falha ao conectar ao banco de dados")
            print()
            print("Verifique:")
            print("  1. Se o SQL Server está rodando")
            print("  2. Se as credenciais no arquivo .env estão corretas")
            print("  3. Se o banco de dados foi criado")
            print("  4. Se o ODBC Driver 17 for SQL Server está instalado")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar conexão: {str(e)}")
        print()
        print("Detalhes do erro:")
        print(f"  {type(e).__name__}: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)

