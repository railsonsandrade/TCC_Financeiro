"""
Script para inicializar o banco de dados SQLite
Cria todas as tabelas e insere dados de teste
"""

import sqlite3
import sys
from pathlib import Path

# Adicionar o diretório pai ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings
from app.utils.security import SecurityUtils


def init_database():
    """Inicializa o banco de dados"""
    
    print("=" * 60)
    print("INICIALIZAÇÃO DO BANCO DE DADOS")
    print("=" * 60)
    print()
    
    # Caminho do banco de dados
    db_path = settings.database_url
    print(f"📁 Caminho do banco: {db_path}")
    
    # Caminho do schema
    schema_path = Path(__file__).parent.parent / "database" / "schema_sqlite.sql"
    
    if not schema_path.exists():
        print(f"❌ Arquivo de schema não encontrado: {schema_path}")
        return False
    
    print(f"📄 Schema: {schema_path}")
    print()
    
    try:
        # Conectar ao banco
        print("🔌 Conectando ao banco de dados...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Ler e executar o schema
        print("📝 Executando schema SQL...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # Executar o schema (pode conter múltiplos comandos)
        cursor.executescript(schema_sql)
        conn.commit()
        
        print("✅ Schema criado com sucesso!")
        print()
        
        # Inserir dados de teste
        print("📊 Inserindo dados de teste...")
        insert_test_data(cursor)
        conn.commit()
        
        print("✅ Dados de teste inseridos!")
        print()
        
        # Verificar tabelas criadas
        print("📋 Tabelas criadas:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"   ✅ {table[0]:<25} ({count} registros)")
        
        print()
        print("📋 Views criadas:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name")
        views = cursor.fetchall()
        for view in views:
            print(f"   ✅ {view[0]}")
        
        cursor.close()
        conn.close()
        
        print()
        print("=" * 60)
        print("🎉 BANCO DE DADOS INICIALIZADO COM SUCESSO!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def insert_test_data(cursor):
    """Insere dados de teste no banco"""
    
    # 1. Criar usuário de teste
    senha_hash = SecurityUtils.hash_password("senha123")
    cursor.execute("""
        INSERT INTO usuario (nome, email, senha_hash, ativo)
        VALUES (?, ?, ?, ?)
    """, ("João Silva", "joao@example.com", senha_hash, 1))
    id_usuario = cursor.lastrowid
    print(f"   ✅ Usuário criado: João Silva (ID: {id_usuario})")
    
    # 2. Criar contas financeiras
    cursor.execute("""
        INSERT INTO conta_financeira (id_usuario, nome, tipo, saldo_inicial, ativa)
        VALUES (?, ?, ?, ?, ?)
    """, (id_usuario, "Conta Corrente", "Conta Corrente", 1000.00, 1))
    id_conta_corrente = cursor.lastrowid
    
    cursor.execute("""
        INSERT INTO conta_financeira (id_usuario, nome, tipo, saldo_inicial, ativa)
        VALUES (?, ?, ?, ?, ?)
    """, (id_usuario, "Poupança", "Poupança", 5000.00, 1))
    id_poupanca = cursor.lastrowid
    
    print(f"   ✅ Contas criadas: Conta Corrente, Poupança")
    
    # 3. Criar categorias
    categorias = [
        ("Salário", "Receita", "Poupança", "#4CAF50"),
        ("Alimentação", "Despesa", "Essencial", "#FF5722"),
        ("Transporte", "Despesa", "Essencial", "#2196F3"),
        ("Lazer", "Despesa", "Desejável", "#9C27B0"),
        ("Moradia", "Despesa", "Essencial", "#FF9800"),
        ("Investimentos", "Despesa", "Poupança", "#00BCD4"),
    ]
    
    ids_categorias = {}
    for nome, tipo, grupo, cor in categorias:
        cursor.execute("""
            INSERT INTO categoria (id_usuario, nome, tipo, grupo_50_30_20, cor, ativa)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (id_usuario, nome, tipo, grupo, cor, 1))
        ids_categorias[nome] = cursor.lastrowid
    
    print(f"   ✅ Categorias criadas: {len(categorias)} categorias")
    
    # 4. Criar lançamentos
    cursor.execute("""
        INSERT INTO lancamento (id_usuario, id_conta, id_categoria, tipo, valor, data, descricao, pago)
        VALUES (?, ?, ?, ?, ?, DATE('now', '-5 days'), ?, ?)
    """, (id_usuario, id_conta_corrente, ids_categorias["Salário"], "Receita", 3000.00, "Salário mensal", 1))
    
    cursor.execute("""
        INSERT INTO lancamento (id_usuario, id_conta, id_categoria, tipo, valor, data, descricao, pago)
        VALUES (?, ?, ?, ?, ?, DATE('now', '-3 days'), ?, ?)
    """, (id_usuario, id_conta_corrente, ids_categorias["Alimentação"], "Despesa", 150.00, "Supermercado", 1))
    
    cursor.execute("""
        INSERT INTO lancamento (id_usuario, id_conta, id_categoria, tipo, valor, data, descricao, pago)
        VALUES (?, ?, ?, ?, ?, DATE('now', '-2 days'), ?, ?)
    """, (id_usuario, id_conta_corrente, ids_categorias["Transporte"], "Despesa", 80.00, "Combustível", 1))
    
    print(f"   ✅ Lançamentos criados: 3 lançamentos")
    
    # 5. Criar meta financeira
    cursor.execute("""
        INSERT INTO meta_financeira (id_usuario, nome, valor_alvo, valor_atual, data_inicio, data_fim_prev, status)
        VALUES (?, ?, ?, ?, DATE('now'), DATE('now', '+6 months'), ?)
    """, (id_usuario, "Viagem de Férias", 5000.00, 1000.00, "Em Andamento"))
    
    print(f"   ✅ Meta criada: Viagem de Férias")


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)

