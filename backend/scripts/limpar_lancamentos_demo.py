"""
Script para limpar lançamentos da conta demo
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import get_db

def limpar_lancamentos():
    db = get_db()
    
    # Deletar todos os lançamentos do usuário 8 (demo)
    query = "DELETE FROM lancamento WHERE id_usuario = 8"
    
    rows = db.execute_non_query(query)
    
    print(f"✅ {rows} lançamentos removidos da conta demo")

if __name__ == "__main__":
    limpar_lancamentos()

