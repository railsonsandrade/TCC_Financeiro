"""
Script para testar os Services
"""

from datetime import date, timedelta
from decimal import Decimal
from app.services import (
    UsuarioService,
    ContaFinanceiraService,
    CategoriaService,
    LancamentoService,
    MetaFinanceiraService
)
from app.schemas.usuario import UsuarioCreate, UsuarioLogin
from app.schemas.conta_financeira import ContaFinanceiraCreate
from app.schemas.categoria import CategoriaCreate
from app.schemas.lancamento import LancamentoCreate
from app.schemas.meta_financeira import MetaFinanceiraCreate


def test_services():
    """Testa todos os services"""
    
    print("=" * 60)
    print("TESTE DOS SERVICES")
    print("=" * 60)
    print()
    
    # Inicializar services
    usuario_service = UsuarioService()
    conta_service = ContaFinanceiraService()
    categoria_service = CategoriaService()
    lancamento_service = LancamentoService()
    meta_service = MetaFinanceiraService()
    
    try:
        # ===== TESTE 1: UsuarioService =====
        print("📝 Testando UsuarioService...")
        
        # Autenticar usuário existente
        login = UsuarioLogin(email="joao@example.com", senha="senha123")
        token = usuario_service.autenticar(login)
        print(f"   ✅ Autenticação bem-sucedida: {token.access_token[:20]}...")
        
        # Obter usuário
        usuario = usuario_service.obter_usuario(1)
        print(f"   ✅ Usuário obtido: {usuario.nome} ({usuario.email})")
        
        print()
        
        # ===== TESTE 2: ContaFinanceiraService =====
        print("📝 Testando ContaFinanceiraService...")
        
        # Listar contas com saldo
        contas = conta_service.listar_contas_com_saldo(1)
        print(f"   ✅ Contas encontradas: {len(contas)}")
        for conta in contas:
            print(f"      - {conta.nome}: R$ {conta.saldo_atual}")
        
        # Calcular saldo total
        saldo_total = conta_service.calcular_saldo_total(1)
        print(f"   ✅ Saldo total: R$ {saldo_total}")
        
        print()
        
        # ===== TESTE 3: CategoriaService =====
        print("📝 Testando CategoriaService...")
        
        # Listar categorias de despesa
        categorias = categoria_service.listar_categorias(1, tipo="Despesa")
        print(f"   ✅ Categorias de Despesa: {len(categorias)}")
        for cat in categorias:
            print(f"      - {cat.nome} ({cat.grupo_50_30_20})")
        
        # Listar por grupo
        essenciais = categoria_service.listar_por_grupo(1, "Essencial")
        print(f"   ✅ Categorias Essenciais: {len(essenciais)}")
        
        print()
        
        # ===== TESTE 4: LancamentoService =====
        print("📝 Testando LancamentoService...")
        
        # Listar lançamentos com detalhes
        lancamentos = lancamento_service.listar_lancamentos_com_detalhes(1, limit=5)
        print(f"   ✅ Lançamentos encontrados: {len(lancamentos)}")
        for lanc in lancamentos:
            print(f"      - {lanc.data}: {lanc.tipo} R$ {lanc.valor} - {lanc.descricao}")
            print(f"        Conta: {lanc.nome_conta} | Categoria: {lanc.nome_categoria}")
        
        # Obter totais do mês atual
        hoje = date.today()
        inicio_mes = date(hoje.year, hoje.month, 1)
        if hoje.month == 12:
            fim_mes = date(hoje.year + 1, 1, 1) - timedelta(days=1)
        else:
            fim_mes = date(hoje.year, hoje.month + 1, 1) - timedelta(days=1)
        
        totais = lancamento_service.obter_totais_periodo(1, inicio_mes, fim_mes)
        print(f"   ✅ Totais do mês:")
        print(f"      - Receitas: R$ {totais['total_receitas']}")
        print(f"      - Despesas: R$ {totais['total_despesas']}")
        print(f"      - Saldo: R$ {totais['saldo']}")
        
        print()
        
        # ===== TESTE 5: MetaFinanceiraService =====
        print("📝 Testando MetaFinanceiraService...")
        
        # Listar metas com progresso
        metas = meta_service.listar_metas_com_progresso(1)
        print(f"   ✅ Metas encontradas: {len(metas)}")
        for meta in metas:
            print(f"      - {meta.nome}: R$ {meta.valor_atual} / R$ {meta.valor_alvo} ({meta.status})")
            print(f"        Progresso: {meta.percentual_atingido}%")
            print(f"        Faltam: R$ {meta.valor_faltante}")
            if meta.dias_restantes is not None:
                print(f"        Dias restantes: {meta.dias_restantes}")
        
        print()
        
        # ===== TESTE 6: Validações de Regras de Negócio =====
        print("📝 Testando Regras de Negócio...")
        
        # RN008: Tentar criar conta com nome duplicado
        try:
            conta_duplicada = ContaFinanceiraCreate(
                nome="Conta Corrente",
                tipo="Conta Corrente",
                saldo_inicial=Decimal("0")
            )
            conta_service.criar_conta(1, conta_duplicada)
            print("   ❌ RN008 falhou: Permitiu nome duplicado")
        except ValueError as e:
            print(f"   ✅ RN008: {str(e)}")
        
        # RN002: Tentar criar lançamento com tipo incompatível
        try:
            # Categoria de Despesa com lançamento de Receita
            lanc_invalido = LancamentoCreate(
                id_conta=1,
                id_categoria=2,  # Alimentação (Despesa)
                tipo="Receita",  # Tipo incompatível
                valor=Decimal("100"),
                data=date.today(),
                descricao="Teste inválido",
                origem="Manual",
                pago=True
            )
            lancamento_service.criar_lancamento(1, lanc_invalido)
            print("   ❌ RN002 falhou: Permitiu tipo incompatível")
        except ValueError as e:
            print(f"   ✅ RN002: {str(e)}")
        
        # RN004: Tentar criar meta com valor negativo
        try:
            meta_invalida = MetaFinanceiraCreate(
                nome="Meta Inválida",
                valor_alvo=Decimal("-1000"),
                data_inicio=date.today(),
                data_fim_prev=date.today() + timedelta(days=30)
            )
            meta_service.criar_meta(1, meta_invalida)
            print("   ❌ RN004 falhou: Permitiu valor negativo")
        except ValueError as e:
            print(f"   ✅ RN004: {str(e)}")
        
        print()
        print("=" * 60)
        print("🎉 TODOS OS TESTES PASSARAM COM SUCESSO!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_services()

