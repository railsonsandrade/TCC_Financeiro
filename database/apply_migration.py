"""
Script para aplicar migration no banco de dados
"""
import sqlite3
import os

# Caminho do banco de dados
db_path = os.path.join(os.path.dirname(__file__), 'tcc_financeira.db')
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '001_add_categoria_to_meta.sql')

print(f"📁 Banco de dados: {db_path}")
print(f"📄 Migration: {migration_path}")
print("="*60)

# Ler migration
with open(migration_path, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

# Conectar ao banco
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Executar migration
    print("🔄 Aplicando migration...")
    cursor.executescript(migration_sql)
    conn.commit()
    print("✅ Migration aplicada com sucesso!")
    
    # Verificar se a coluna foi adicionada
    cursor.execute("PRAGMA table_info(meta_financeira)")
    columns = cursor.fetchall()
    
    print("\n📊 Estrutura da tabela meta_financeira:")
    print("="*60)
    for col in columns:
        print(f"  {col[1]:20s} {col[2]:15s} {'NOT NULL' if col[3] else 'NULL':10s}")
    
except Exception as e:
    print(f"❌ Erro ao aplicar migration: {str(e)}")
    conn.rollback()
finally:
    conn.close()

print("="*60)
print("✅ Processo concluído!")

