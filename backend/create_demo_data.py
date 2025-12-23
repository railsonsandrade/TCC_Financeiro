"""
Script simplificado para criar dados de demonstração
"""
import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import get_db
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.conta_financeira_repository import ContaFinanceiraRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.repositories.lancamento_repository import LancamentoRepository
from app.repositories.meta_financeira_repository import MetaFinanceiraRepository
from app.schemas.categoria import CategoriaCreate
from app.schemas.lancamento import LancamentoCreate
from app.schemas.meta_financeira import MetaFinanceiraCreate

def criar_dados_demo():
    db = get_db()
    
    print("🔍 Buscando usuário demo@nextwallet.com...")
    usuario_repo = UsuarioRepository(db)
    usuario = usuario_repo.get_by_email("demo@nextwallet.com")
    
    if not usuario:
        print("❌ Usuário não encontrado! Execute primeiro o script de criação de usuário.")
        return
    
    print(f"✅ Usuário encontrado: {usuario.nome} (ID: {usuario.id_usuario})")
    
    # Buscar contas
    conta_repo = ContaFinanceiraRepository(db)
    contas_list = conta_repo.get_by_usuario(usuario.id_usuario)
    contas = {c.nome: c for c in contas_list}
    print(f"✅ {len(contas)} contas encontradas")
    
    # 1. BUSCAR OU CRIAR CATEGORIAS
    print("\n🏷️  Verificando categorias...")
    categoria_repo = CategoriaRepository(db)

    # Buscar categorias existentes
    cats_existentes = categoria_repo.get_by_usuario(usuario.id_usuario)
    cats_desp = {c.nome: c for c in cats_existentes if c.tipo == "Despesa"}
    cats_rec = {c.nome: c for c in cats_existentes if c.tipo == "Receita"}

    categorias_despesa = [
        ("Moradia", "Essencial"),
        ("Alimentação", "Essencial"),
        ("Transporte", "Essencial"),
        ("Saúde", "Essencial"),
        ("Educação", "Essencial"),
        ("Lazer", "Desejável"),
        ("Restaurantes", "Desejável"),
        ("Compras", "Desejável"),
        ("Assinaturas", "Desejável"),
        ("Investimentos", "Poupança"),
    ]

    categorias_receita = ["Salário", "Freelance", "Investimentos", "Outros"]

    # Criar apenas as que não existem
    for nome, grupo in categorias_despesa:
        if nome not in cats_desp:
            try:
                cat = categoria_repo.create(
                    id_usuario=usuario.id_usuario,
                    categoria=CategoriaCreate(nome=nome, tipo="Despesa", grupo_50_30_20=grupo)
                )
                cats_desp[nome] = cat
                print(f"  ✅ Criada: {nome}")
            except Exception as e:
                print(f"  ⚠️  {nome} - {str(e)}")

    for nome in categorias_receita:
        if nome not in cats_rec:
            try:
                cat = categoria_repo.create(
                    id_usuario=usuario.id_usuario,
                    categoria=CategoriaCreate(nome=nome, tipo="Receita", grupo_50_30_20="Essencial")
                )
                cats_rec[nome] = cat
                print(f"  ✅ Criada: {nome}")
            except Exception as e:
                print(f"  ⚠️  {nome} - {str(e)}")

    print(f"\n✅ Categorias disponíveis: {len(cats_desp)} despesas, {len(cats_rec)} receitas")
    
    # 2. CRIAR LANÇAMENTOS
    print("\n💸 Criando lançamentos...")
    lancamento_repo = LancamentoRepository(db)
    hoje = datetime.now()
    lancamentos_criados = 0

    # Lançamentos do mês atual e dos 2 meses anteriores
    for mes in range(3):
        # Para o mês atual (mes=0), usar a data de hoje
        # Para meses anteriores, subtrair 30 dias por mês
        if mes == 0:
            data_base = hoje
        else:
            data_base = hoje - timedelta(days=30 * mes)

        # Salário
        try:
            data = data_base.replace(day=5)
            lancamento_repo.create(
                id_usuario=usuario.id_usuario,
                lancamento=LancamentoCreate(
                    id_conta=contas["Conta Corrente Banco do Brasil"].id_conta,
                    id_categoria=cats_rec["Salário"].id_categoria,
                    tipo="Receita",
                    valor=Decimal("6500.00"),
                    data=data.date(),
                    descricao="Salário mensal",
                    pago=True
                )
            )
            lancamentos_criados += 1
        except: pass

        # Aluguel
        try:
            data = data_base.replace(day=10)
            lancamento_repo.create(
                id_usuario=usuario.id_usuario,
                lancamento=LancamentoCreate(
                    id_conta=contas["Conta Corrente Banco do Brasil"].id_conta,
                    id_categoria=cats_desp["Moradia"].id_categoria,
                    tipo="Despesa",
                    valor=Decimal("1800.00"),
                    data=data.date(),
                    descricao="Aluguel",
                    pago=True
                )
            )
            lancamentos_criados += 1
        except: pass

        # Supermercado
        try:
            data = data_base.replace(day=15)
            lancamento_repo.create(
                id_usuario=usuario.id_usuario,
                lancamento=LancamentoCreate(
                    id_conta=contas["Conta Corrente Banco do Brasil"].id_conta,
                    id_categoria=cats_desp["Alimentação"].id_categoria,
                    tipo="Despesa",
                    valor=Decimal(str(random.uniform(400, 600))),
                    data=data.date(),
                    descricao="Supermercado",
                    pago=True
                )
            )
            lancamentos_criados += 1
        except: pass

        # Gasolina
        try:
            data = data_base.replace(day=20)
            lancamento_repo.create(
                id_usuario=usuario.id_usuario,
                lancamento=LancamentoCreate(
                    id_conta=contas["Conta Corrente Banco do Brasil"].id_conta,
                    id_categoria=cats_desp["Transporte"].id_categoria,
                    tipo="Despesa",
                    valor=Decimal(str(random.uniform(200, 300))),
                    data=data.date(),
                    descricao="Gasolina",
                    pago=True
                )
            )
            lancamentos_criados += 1
        except: pass

        # Restaurante
        try:
            data = data_base.replace(day=12)
            lancamento_repo.create(
                id_usuario=usuario.id_usuario,
                lancamento=LancamentoCreate(
                    id_conta=contas["Carteira Digital PicPay"].id_conta,
                    id_categoria=cats_desp["Restaurantes"].id_categoria,
                    tipo="Despesa",
                    valor=Decimal(str(random.uniform(80, 150))),
                    data=data.date(),
                    descricao="Restaurante",
                    pago=True
                )
            )
            lancamentos_criados += 1
        except: pass

        # Netflix
        try:
            data = data_base.replace(day=8)
            lancamento_repo.create(
                id_usuario=usuario.id_usuario,
                lancamento=LancamentoCreate(
                    id_conta=contas["Carteira Digital PicPay"].id_conta,
                    id_categoria=cats_desp["Assinaturas"].id_categoria,
                    tipo="Despesa",
                    valor=Decimal("55.90"),
                    data=data.date(),
                    descricao="Netflix",
                    pago=True
                )
            )
            lancamentos_criados += 1
        except: pass

        # Lançamentos adicionais apenas para o mês atual
        if mes == 0:
            lancamentos_mes_atual = [
                (8, "Conta de luz", "Moradia", 180.50, "Conta Corrente Banco do Brasil"),
                (12, "Conta de água", "Moradia", 85.30, "Conta Corrente Banco do Brasil"),
                (15, "Internet", "Moradia", 99.90, "Conta Corrente Banco do Brasil"),
                (18, "Spotify", "Assinaturas", 21.90, "Carteira Digital PicPay"),
                (3, "Uber", "Transporte", 45.30, "Carteira Digital PicPay"),
                (7, "Farmácia", "Saúde", 125.80, "Conta Corrente Banco do Brasil"),
                (14, "Cinema", "Lazer", 80.00, "Carteira Digital PicPay"),
                (16, "Livros", "Educação", 95.50, "Conta Corrente Banco do Brasil"),
                (20, "Roupas", "Compras", 320.00, "Conta Corrente Banco do Brasil"),
            ]

            for dia, descricao, categoria, valor, conta_nome in lancamentos_mes_atual:
                try:
                    data = hoje.replace(day=dia)
                    lancamento_repo.create(
                        id_usuario=usuario.id_usuario,
                        lancamento=LancamentoCreate(
                            id_conta=contas[conta_nome].id_conta,
                            id_categoria=cats_desp[categoria].id_categoria,
                            tipo="Despesa",
                            valor=Decimal(str(valor)),
                            data=data.date(),
                            descricao=descricao,
                            pago=True
                        )
                    )
                    lancamentos_criados += 1
                except Exception as e:
                    print(f"    ⚠️  Erro ao criar {descricao}: {str(e)}")

    print(f"  ✅ {lancamentos_criados} lançamentos criados")
    
    # 3. CRIAR METAS
    print("\n🎯 Criando metas...")
    meta_repo = MetaFinanceiraRepository(db)
    
    metas = [
        ("Viagem Europa", 15000, 8500, 180),
        ("Fundo Emergência", 20000, 12800, 365),
        ("Novo Notebook", 5000, 3200, 90),
        ("Curso", 3000, 2850, 60),
    ]
    
    for nome, alvo, atual, dias in metas:
        try:
            meta_repo.create(
                id_usuario=usuario.id_usuario,
                meta=MetaFinanceiraCreate(
                    nome=nome,
                    valor_alvo=Decimal(str(alvo)),
                    valor_atual=Decimal(str(atual)),
                    data_inicio=hoje.date(),
                    data_fim_prev=(hoje + timedelta(days=dias)).date()
                )
            )
            print(f"  ✅ {nome}")
        except Exception as e:
            print(f"  ⚠️  {nome} - {str(e)}")
    
    print("\n" + "="*60)
    print("🎉 DADOS DE DEMONSTRAÇÃO CRIADOS!")
    print("="*60)
    print(f"📧 Email: demo@nextwallet.com")
    print(f"🔑 Senha: demo123")
    print("="*60)

if __name__ == "__main__":
    criar_dados_demo()

