"""
Script para corrigir acesso a dados nos repositories
Converte row[0] para row['column_name']
"""

import re
from pathlib import Path

# Mapeamento de colunas para cada tabela
COLUMN_MAPPINGS = {
    'conta_financeira': {
        0: 'id_conta',
        1: 'id_usuario',
        2: 'nome',
        3: 'tipo',
        4: 'saldo_inicial',
        5: 'data_criacao',
        6: 'ativa'
    },
    'conta_financeira_view': {
        0: 'id_conta',
        1: 'id_usuario',
        2: 'nome_conta',
        3: 'tipo_conta',
        4: 'saldo_inicial',
        5: 'total_receitas',
        6: 'total_despesas',
        7: 'saldo_atual'
    },
    'categoria': {
        0: 'id_categoria',
        1: 'id_usuario',
        2: 'nome',
        3: 'tipo',
        4: 'grupo_50_30_20',
        5: 'cor',
        6: 'ativa'
    },
    'lancamento': {
        0: 'id_lancamento',
        1: 'id_usuario',
        2: 'id_conta',
        3: 'id_categoria',
        4: 'tipo',
        5: 'valor',
        6: 'data',
        7: 'descricao',
        8: 'origem',
        9: 'id_recorrencia',
        10: 'data_criacao',
        11: 'pago'
    },
    'lancamento_detalhes': {
        0: 'id_lancamento',
        1: 'id_usuario',
        2: 'id_conta',
        3: 'id_categoria',
        4: 'tipo',
        5: 'valor',
        6: 'data',
        7: 'descricao',
        8: 'origem',
        9: 'id_recorrencia',
        10: 'data_criacao',
        11: 'pago',
        12: 'nome_conta',
        13: 'tipo_conta',
        14: 'nome_categoria',
        15: 'grupo_50_30_20',
        16: 'cor'
    },
    'meta_financeira': {
        0: 'id_meta',
        1: 'id_usuario',
        2: 'nome',
        3: 'valor_alvo',
        4: 'valor_atual',
        5: 'data_inicio',
        6: 'data_fim_prev',
        7: 'status',
        8: 'data_criacao'
    }
}

def fix_file(file_path: Path, table_name: str):
    """Corrige um arquivo de repository"""
    print(f"Corrigindo {file_path.name}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    mapping = COLUMN_MAPPINGS.get(table_name)
    if not mapping:
        print(f"  ⚠️  Sem mapeamento para {table_name}")
        return
    
    # Substituir row[N] por row['column_name']
    for index, column_name in mapping.items():
        pattern = rf'row\[{index}\]'
        replacement = f"row['{column_name}']"
        content = re.sub(pattern, replacement, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ Corrigido!")

# Corrigir cada repository
backend_path = Path(__file__).parent
repos_path = backend_path / 'app' / 'repositories'

# Conta Financeira
fix_file(repos_path / 'conta_financeira_repository.py', 'conta_financeira')
fix_file(repos_path / 'conta_financeira_repository.py', 'conta_financeira_view')

# Categoria
fix_file(repos_path / 'categoria_repository.py', 'categoria')

# Lançamento
fix_file(repos_path / 'lancamento_repository.py', 'lancamento')
fix_file(repos_path / 'lancamento_repository.py', 'lancamento_detalhes')

# Meta Financeira
fix_file(repos_path / 'meta_financeira_repository.py', 'meta_financeira')

print("\n✅ Todos os repositories corrigidos!")

