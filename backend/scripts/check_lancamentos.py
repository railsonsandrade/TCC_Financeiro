"""
Script para verificar lançamentos da conta demo
"""
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import get_db

def verificar_lancamentos():
    db = get_db()
    
    # Buscar lançamentos do usuário 8 (demo)
    query = """
    SELECT
        strftime('%Y-%m', data) as mes,
        tipo,
        COUNT(*) as qtd,
        SUM(valor) as total
    FROM lancamento
    WHERE id_usuario = 8
    GROUP BY mes, tipo
    ORDER BY mes DESC, tipo
    """
    
    result = db.execute_query(query)
    
    print("📊 Lançamentos por mês e tipo:")
    print("="*60)
    
    for row in result:
        mes = row['mes']
        tipo = row['tipo']
        qtd = row['qtd']
        total = row['total']
        print(f"{mes} - {tipo:8s}: {qtd:2d} lançamentos = R$ {total:,.2f}")
    
    print("\n" + "="*60)
    
    # Totais do mês atual
    hoje = datetime.now()
    mes_atual = hoje.strftime('%Y-%m')
    
    query_mes_atual = f"""
    SELECT
        tipo,
        COUNT(*) as qtd,
        SUM(valor) as total
    FROM lancamento
    WHERE id_usuario = 8
      AND strftime('%Y-%m', data) = '{mes_atual}'
    GROUP BY tipo
    """
    
    result_mes = db.execute_query(query_mes_atual)
    
    print(f"\n📅 Mês atual ({mes_atual}):")
    print("="*60)
    
    total_receitas = 0
    total_despesas = 0
    
    for row in result_mes:
        tipo = row['tipo']
        qtd = row['qtd']
        total = row['total']
        if tipo == "Receita":
            total_receitas = total
        else:
            total_despesas = total
        print(f"{tipo:8s}: {qtd:2d} lançamentos = R$ {total:,.2f}")
    
    saldo = total_receitas - total_despesas
    
    print("="*60)
    print(f"💰 Receitas: R$ {total_receitas:,.2f}")
    print(f"💸 Despesas: R$ {total_despesas:,.2f}")
    print(f"📊 Saldo:    R$ {saldo:,.2f}")
    print("="*60)

if __name__ == "__main__":
    verificar_lancamentos()

