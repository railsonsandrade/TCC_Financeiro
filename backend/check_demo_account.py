"""
Script para verificar a conta de demonstração
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import get_db
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.conta_financeira_repository import ContaFinanceiraRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.repositories.lancamento_repository import LancamentoRepository
from app.repositories.meta_financeira_repository import MetaFinanceiraRepository

def verificar_conta_demo():
    db = get_db()
    
    print("🔍 Verificando conta de demonstração...\n")
    
    # Verificar usuário
    usuario_repo = UsuarioRepository(db)
    usuario = usuario_repo.get_by_email("demo@nextwallet.com")
    
    if not usuario:
        print("❌ Usuário demo@nextwallet.com NÃO encontrado!")
        return
    
    print(f"✅ Usuário: {usuario.nome} (ID: {usuario.id_usuario})")
    print(f"   Email: {usuario.email}")
    
    # Verificar contas
    conta_repo = ContaFinanceiraRepository(db)
    contas = conta_repo.get_by_usuario(usuario.id_usuario)
    print(f"\n💰 Contas Financeiras: {len(contas)}")
    for conta in contas:
        print(f"   • {conta.nome} ({conta.tipo})")
    
    # Verificar categorias
    categoria_repo = CategoriaRepository(db)
    categorias = categoria_repo.get_by_usuario(usuario.id_usuario)
    cats_desp = [c for c in categorias if c.tipo == "Despesa"]
    cats_rec = [c for c in categorias if c.tipo == "Receita"]
    print(f"\n🏷️  Categorias: {len(categorias)}")
    print(f"   • Despesas: {len(cats_desp)}")
    print(f"   • Receitas: {len(cats_rec)}")
    
    # Verificar lançamentos
    lancamento_repo = LancamentoRepository(db)
    lancamentos = lancamento_repo.get_by_usuario(usuario.id_usuario)
    print(f"\n💸 Lançamentos: {len(lancamentos)}")
    
    # Verificar metas
    meta_repo = MetaFinanceiraRepository(db)
    metas = meta_repo.get_by_usuario(usuario.id_usuario)
    print(f"\n🎯 Metas: {len(metas)}")
    for meta in metas:
        percentual = (meta.valor_atual / meta.valor_alvo * 100) if meta.valor_alvo > 0 else 0
        print(f"   • {meta.nome}: {percentual:.1f}%")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    verificar_conta_demo()

