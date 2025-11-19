"""
Script para testar os repositories
"""

import sys
from pathlib import Path
from datetime import date, timedelta
from decimal import Decimal

# Adicionar o diretório pai ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.utils.database import db
from app.repositories import (
    UsuarioRepository,
    ContaFinanceiraRepository,
    CategoriaRepository,
    LancamentoRepository,
    MetaFinanceiraRepository
)
from app.schemas import (
    UsuarioCreate,
    ContaFinanceiraCreate,
    CategoriaCreate,
    LancamentoCreate,
    MetaFinanceiraCreate
)


def test_repositories():
    """Testa todos os repositories"""
    
    print("=" * 60)
    print("TESTE DOS REPOSITORIES")
    print("=" * 60)
    print()
    
    try:
        # Conectar ao banco
        db.connect()
        print("✅ Conexão com banco estabelecida")
        print()
        
        # 1. Testar UsuarioRepository
        print("📝 Testando UsuarioRepository...")
        usuario_repo = UsuarioRepository(db)
        
        # Buscar usuário existente
        usuario = usuario_repo.get_by_email("joao@example.com")
        if usuario:
            print(f"   ✅ Usuário encontrado: {usuario.nome} (ID: {usuario.id_usuario})")
            id_usuario = usuario.id_usuario
        else:
            print("   ❌ Usuário não encontrado")
            return
        
        print()
        
        # 2. Testar ContaFinanceiraRepository
        print("📝 Testando ContaFinanceiraRepository...")
        conta_repo = ContaFinanceiraRepository(db)
        
        # Listar contas do usuário
        contas = conta_repo.get_by_usuario(id_usuario)
        print(f"   ✅ Contas encontradas: {len(contas)}")
        for conta in contas:
            print(f"      - {conta.nome} ({conta.tipo})")
        
        # Buscar conta com saldo
        if contas:
            conta_com_saldo = conta_repo.get_com_saldo(contas[0].id_conta)
            if conta_com_saldo:
                print(f"   ✅ Saldo da conta '{conta_com_saldo.nome}': R$ {conta_com_saldo.saldo_atual}")
        
        print()
        
        # 3. Testar CategoriaRepository
        print("📝 Testando CategoriaRepository...")
        categoria_repo = CategoriaRepository(db)
        
        # Listar categorias
        categorias = categoria_repo.get_by_usuario(id_usuario)
        print(f"   ✅ Categorias encontradas: {len(categorias)}")
        for cat in categorias:
            print(f"      - {cat.nome} ({cat.tipo} - {cat.grupo_50_30_20})")
        
        # Listar por tipo
        categorias_despesa = categoria_repo.get_by_usuario(id_usuario, tipo="Despesa")
        print(f"   ✅ Categorias de Despesa: {len(categorias_despesa)}")
        
        print()
        
        # 4. Testar LancamentoRepository
        print("📝 Testando LancamentoRepository...")
        lancamento_repo = LancamentoRepository(db)
        
        # Listar lançamentos
        lancamentos = lancamento_repo.get_by_usuario(id_usuario, limit=10)
        print(f"   ✅ Lançamentos encontrados: {len(lancamentos)}")
        for lanc in lancamentos:
            print(f"      - {lanc.data}: {lanc.tipo} R$ {lanc.valor} - {lanc.descricao}")
        
        # Listar com detalhes
        lancamentos_detalhes = lancamento_repo.get_com_detalhes(id_usuario, limit=5)
        print(f"   ✅ Lançamentos com detalhes: {len(lancamentos_detalhes)}")
        for lanc in lancamentos_detalhes:
            print(f"      - {lanc.nome_categoria}: R$ {lanc.valor} ({lanc.nome_conta})")
        
        # Calcular total do mês
        hoje = date.today()
        inicio_mes = date(hoje.year, hoje.month, 1)
        total_receitas = lancamento_repo.get_total_por_periodo(
            id_usuario, inicio_mes, hoje, tipo="Receita"
        )
        total_despesas = lancamento_repo.get_total_por_periodo(
            id_usuario, inicio_mes, hoje, tipo="Despesa"
        )
        print(f"   ✅ Total do mês:")
        print(f"      - Receitas: R$ {total_receitas}")
        print(f"      - Despesas: R$ {total_despesas}")
        print(f"      - Saldo: R$ {total_receitas - total_despesas}")
        
        print()
        
        # 5. Testar MetaFinanceiraRepository
        print("📝 Testando MetaFinanceiraRepository...")
        meta_repo = MetaFinanceiraRepository(db)
        
        # Listar metas
        metas = meta_repo.get_by_usuario(id_usuario)
        print(f"   ✅ Metas encontradas: {len(metas)}")
        for meta in metas:
            print(f"      - {meta.nome}: R$ {meta.valor_atual} / R$ {meta.valor_alvo} ({meta.status})")
        
        # Buscar meta com progresso
        if metas:
            meta_progresso = meta_repo.get_com_progresso(metas[0].id_meta)
            if meta_progresso:
                print(f"   ✅ Progresso da meta '{meta_progresso.nome}':")
                print(f"      - Percentual: {meta_progresso.percentual_atingido:.2f}%")
                print(f"      - Faltam: R$ {meta_progresso.valor_faltante}")
                if meta_progresso.dias_restantes is not None:
                    print(f"      - Dias restantes: {meta_progresso.dias_restantes}")
        
        print()
        print("=" * 60)
        print("🎉 TODOS OS TESTES PASSARAM COM SUCESSO!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.disconnect()
        print("\n🔌 Conexão com banco encerrada")


if __name__ == "__main__":
    test_repositories()

