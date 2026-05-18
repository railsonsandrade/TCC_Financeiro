"""
Script para testar a API de totais
"""
import sys
import os
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.lancamento_service import LancamentoService

def testar_totais():
    # Obter primeiro e último dia do mês atual
    hoje = datetime.now()
    primeiro_dia = date(hoje.year, hoje.month, 1)
    
    # Último dia do mês
    if hoje.month == 12:
        ultimo_dia = date(hoje.year, 12, 31)
    else:
        proximo_mes = date(hoje.year, hoje.month + 1, 1)
        from datetime import timedelta
        ultimo_dia = proximo_mes - timedelta(days=1)
    
    print(f"📅 Período: {primeiro_dia} a {ultimo_dia}")
    print("="*60)
    
    # Testar serviço
    service = LancamentoService()
    totais = service.obter_totais_periodo(
        id_usuario=8,
        data_inicio=primeiro_dia,
        data_fim=ultimo_dia
    )
    
    print(f"💰 Receitas: R$ {totais['total_receitas']:,.2f}")
    print(f"💸 Despesas: R$ {totais['total_despesas']:,.2f}")
    print(f"📊 Saldo:    R$ {totais['saldo']:,.2f}")
    print("="*60)

if __name__ == "__main__":
    testar_totais()

