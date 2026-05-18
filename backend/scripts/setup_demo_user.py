"""
Script para criar o usuário de demonstração
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import get_db
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.conta_financeira_repository import ContaFinanceiraRepository
from app.schemas.usuario import UsuarioCreate
from app.schemas.conta_financeira import ContaFinanceiraCreate

def setup_demo_user():
    db = get_db()
    usuario_repo = UsuarioRepository(db)
    
    print("🚀 Iniciando configuração do usuário demo...")
    
    # 1. Verificar se usuário já existe
    usuario = usuario_repo.get_by_email("demo@nextwallet.com")
    
    if usuario:
        print(f"✅ Usuário demo@nextwallet.com já existe (ID: {usuario.id_usuario})")
    else:
        # 2. Criar novo usuário
        print("👤 Criando usuário demo@nextwallet.com...")
        novo_usuario = UsuarioCreate(
            nome="Usuário Demo",
            email="demo@nextwallet.com",
            senha="demo123"
        )
        usuario = usuario_repo.create(novo_usuario)
        print(f"✅ Usuário criado com sucesso! (ID: {usuario.id_usuario})")
    
    # 3. Criar contas financeiras básicas se não existirem
    conta_repo = ContaFinanceiraRepository(db)
    contas_existentes = conta_repo.get_by_usuario(usuario.id_usuario)
    nomes_contas = [c.nome for c in contas_existentes]
    
    contas_para_criar = [
        ("Conta Corrente Banco do Brasil", "Conta Corrente", 5000.00),
        ("Carteira Digital PicPay", "Carteira", 1250.00)
    ]
    
    for nome, tipo, saldo in contas_para_criar:
        if nome not in nomes_contas:
            print(f"💰 Criando conta: {nome}...")
            conta_repo.create(
                id_usuario=usuario.id_usuario,
                conta=ContaFinanceiraCreate(
                    nome=nome,
                    tipo=tipo,
                    saldo_inicial=saldo
                )
            )
            print(f"  ✅ Conta {nome} criada.")
        else:
            print(f"  ℹ️ Conta {nome} já existe.")

    print("\n" + "="*60)
    print("🎉 USUÁRIO DEMO CONFIGURADO!")
    print("="*60)

if __name__ == "__main__":
    setup_demo_user()
