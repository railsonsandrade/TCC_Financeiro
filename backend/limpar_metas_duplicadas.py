#!/usr/bin/env python3
"""
Script para identificar e remover metas duplicadas.
Agrupa por (id_usuario, nome normalizado) e mantém a melhor entrada:
- Prioriza meta com maior percentual atingido (valor_atual / valor_alvo)
- Se empate, mantém a mais recente (`data_criacao`)

Uso:
  python backend/limpar_metas_duplicadas.py

Faça backup do banco antes de executar.
"""
import sys
import os
from decimal import Decimal
from datetime import datetime

# Garantir que o pacote `app` seja importável quando executado a partir da raiz do projeto
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.utils import database as db_module
from app.repositories.meta_financeira_repository import MetaFinanceiraRepository


def normalize_name(name: str) -> str:
    return ' '.join(name.lower().strip().split())


def main(dry_run: bool = True):
    db = db_module.db
    repo = MetaFinanceiraRepository(db)

    # Buscar todas as metas
    query = "SELECT id_meta, id_usuario, nome, valor_alvo, valor_atual, data_criacao FROM meta_financeira"
    rows = db.execute_query(query, ())

    if not rows:
        print('Nenhuma meta encontrada no banco.')
        return

    # Agrupar por (id_usuario, nome_normalizada)
    groups = {}
    for r in rows:
        key = (r['id_usuario'], normalize_name(r['nome']))
        entry = {
            'id_meta': r['id_meta'],
            'id_usuario': r['id_usuario'],
            'nome': r['nome'],
            'valor_alvo': Decimal(str(r['valor_alvo'])) if r['valor_alvo'] is not None else Decimal('0'),
            'valor_atual': Decimal(str(r['valor_atual'])) if r['valor_atual'] is not None else Decimal('0'),
            'data_criacao': r['data_criacao'] if r['data_criacao'] is not None else datetime.min
        }
        groups.setdefault(key, []).append(entry)

    duplicates = []
    for key, items in groups.items():
        if len(items) <= 1:
            continue

        # Calcular prioridade: percentual atingido, depois mais recente
        def score(item):
            alvo = item['valor_alvo'] if item['valor_alvo'] and item['valor_alvo'] > 0 else Decimal('0')
            percentual = (item['valor_atual'] / alvo) if alvo > 0 else Decimal('0')
            # retorno: (percentual, data_criacao)
            return (percentual, item['data_criacao'])

        items_sorted = sorted(items, key=score, reverse=True)
        keep = items_sorted[0]
        remove = items_sorted[1:]
        duplicates.append({'keep': keep, 'remove': remove})

    if not duplicates:
        print('Nenhuma meta duplicada encontrada.')
        return

    # Mostrar resumo
    total_remove = sum(len(d['remove']) for d in duplicates)
    print(f'Encontradas {len(duplicates)} chaves com duplicatas. Metas a remover: {total_remove}')
    for d in duplicates:
        keep = d['keep']
        print(f"Manter id={keep['id_meta']} usuario={keep['id_usuario']} nome='{keep['nome']}'")
        for rem in d['remove']:
            print(f"  Remover id={rem['id_meta']} usuario={rem['id_usuario']} nome='{rem['nome']}'")

    if dry_run:
        print('\nDry-run ativado. Nenhuma exclusão foi realizada.')
        print('Execute com `python backend/limpar_metas_duplicadas.py --apply` para confirmar.')
        return

    # Aplicar remoções
    for d in duplicates:
        for rem in d['remove']:
            ok = repo.delete(int(rem['id_meta']))
            print(f"Deletando id={rem['id_meta']} -> {'OK' if ok else 'FALHOU'}")

    print('Remoção de duplicadas finalizada.')


if __name__ == '__main__':
    apply_flag = '--apply'
    main(dry_run=(apply_flag not in sys.argv))
