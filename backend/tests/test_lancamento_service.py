"""
Testes unitários do LancamentoService
"""

import pytest
from datetime import date
from decimal import Decimal
from app.services.lancamento_service import LancamentoService
from app.services.categoria_service import CategoriaService
from app.schemas.lancamento import LancamentoCreate, LancamentoUpdate
from app.schemas.categoria import CategoriaCreate


@pytest.mark.unit
class TestLancamentoService:
    """Testes do LancamentoService"""
    
    def test_criar_lancamento(self, db, usuario_teste, conta_teste, categoria_teste):
        """Testa criação de lançamento"""
        service = LancamentoService()
        
        lancamento_data = LancamentoCreate(
            id_conta=conta_teste.id_conta,
            id_categoria=categoria_teste.id_categoria,
            tipo="Despesa",
            valor=Decimal("100.00"),
            data=date.today(),
            descricao="Teste",
            origem="Manual",
            pago=True
        )
        
        lancamento = service.criar_lancamento(usuario_teste.id_usuario, lancamento_data)
        
        assert lancamento.id_lancamento is not None
        assert lancamento.valor == Decimal("100.00")
        assert lancamento.tipo == "Despesa"
    
    def test_criar_lancamento_conta_outro_usuario(self, db, usuario_teste, categoria_teste):
        """Testa RN001: Conta deve pertencer ao usuário"""
        from app.services.usuario_service import UsuarioService
        from app.services.conta_financeira_service import ContaFinanceiraService
        from app.schemas.usuario import UsuarioCreate
        from app.schemas.conta_financeira import ContaFinanceiraCreate

        # Criar outro usuário e sua conta
        usuario_service = UsuarioService()
        outro_usuario = usuario_service.criar_usuario(UsuarioCreate(
            nome="Outro Usuário",
            email="outro@example.com",
            senha="Senha@123"
        ))

        conta_service = ContaFinanceiraService()
        conta_outro = conta_service.criar_conta(outro_usuario.id_usuario, ContaFinanceiraCreate(
            nome="Conta Outro",
            tipo="Conta Corrente",
            saldo_inicial=Decimal("1000.00")
        ))

        service = LancamentoService()
        lancamento_data = LancamentoCreate(
            id_conta=conta_outro.id_conta,  # Conta de outro usuário
            id_categoria=categoria_teste.id_categoria,
            tipo="Despesa",
            valor=Decimal("100.00"),
            data=date.today(),
            descricao="Teste",
            origem="Manual",
            pago=True
        )

        with pytest.raises(ValueError, match="Conta não pertence ao usuário"):
            service.criar_lancamento(usuario_teste.id_usuario, lancamento_data)
    
    def test_criar_lancamento_categoria_outro_usuario(self, db, usuario_teste, conta_teste):
        """Testa RN001: Categoria deve pertencer ao usuário"""
        from app.services.usuario_service import UsuarioService
        from app.services.categoria_service import CategoriaService
        from app.schemas.usuario import UsuarioCreate
        from app.schemas.categoria import CategoriaCreate

        # Criar outro usuário e sua categoria
        usuario_service = UsuarioService()
        outro_usuario = usuario_service.criar_usuario(UsuarioCreate(
            nome="Outro Usuário 2",
            email="outro2@example.com",
            senha="Senha@123"
        ))

        categoria_service = CategoriaService()
        categoria_outro = categoria_service.criar_categoria(outro_usuario.id_usuario, CategoriaCreate(
            nome="Categoria Outro",
            tipo="Despesa",
            grupo_50_30_20="Essencial"
        ))

        service = LancamentoService()
        lancamento_data = LancamentoCreate(
            id_conta=conta_teste.id_conta,
            id_categoria=categoria_outro.id_categoria,  # Categoria de outro usuário
            tipo="Despesa",
            valor=Decimal("100.00"),
            data=date.today(),
            descricao="Teste",
            origem="Manual",
            pago=True
        )

        with pytest.raises(ValueError, match="Categoria não pertence ao usuário"):
            service.criar_lancamento(usuario_teste.id_usuario, lancamento_data)
    
    def test_criar_lancamento_tipo_incompativel(self, db, usuario_teste, conta_teste, categoria_teste):
        """Testa RN002: Tipo do lançamento deve corresponder ao tipo da categoria"""
        service = LancamentoService()
        
        lancamento_data = LancamentoCreate(
            id_conta=conta_teste.id_conta,
            id_categoria=categoria_teste.id_categoria,  # Categoria é Despesa
            tipo="Receita",  # Mas lançamento é Receita
            valor=Decimal("100.00"),
            data=date.today(),
            descricao="Teste",
            origem="Manual",
            pago=True
        )
        
        with pytest.raises(ValueError, match="não corresponde ao tipo da categoria"):
            service.criar_lancamento(usuario_teste.id_usuario, lancamento_data)
    
    def test_obter_lancamento(self, db, usuario_teste, conta_teste, categoria_teste):
        """Testa obtenção de lançamento por ID"""
        service = LancamentoService()
        
        # Criar lançamento
        lancamento_data = LancamentoCreate(
            id_conta=conta_teste.id_conta,
            id_categoria=categoria_teste.id_categoria,
            tipo="Despesa",
            valor=Decimal("100.00"),
            data=date.today(),
            descricao="Teste",
            origem="Manual",
            pago=True
        )
        lancamento_criado = service.criar_lancamento(usuario_teste.id_usuario, lancamento_data)
        
        # Obter lançamento
        lancamento = service.obter_lancamento(lancamento_criado.id_lancamento, usuario_teste.id_usuario)
        
        assert lancamento is not None
        assert lancamento.id_lancamento == lancamento_criado.id_lancamento
    
    def test_listar_lancamentos(self, db, usuario_teste, conta_teste, categoria_teste):
        """Testa listagem de lançamentos"""
        service = LancamentoService()
        
        # Criar 2 lançamentos
        for i in range(2):
            lancamento_data = LancamentoCreate(
                id_conta=conta_teste.id_conta,
                id_categoria=categoria_teste.id_categoria,
                tipo="Despesa",
                valor=Decimal(f"{100 + i}.00"),
                data=date.today(),
                descricao=f"Teste {i}",
                origem="Manual",
                pago=True
            )
            service.criar_lancamento(usuario_teste.id_usuario, lancamento_data)
        
        lancamentos = service.listar_lancamentos(usuario_teste.id_usuario)
        
        assert len(lancamentos) == 2
    
    def test_obter_totais_periodo(self, db, usuario_teste, conta_teste):
        """Testa RN003: Cálculo de fluxo de caixa"""
        service = LancamentoService()
        categoria_service = CategoriaService()
        
        # Criar categoria de receita
        cat_receita = categoria_service.criar_categoria(
            usuario_teste.id_usuario,
            CategoriaCreate(nome="Salário", tipo="Receita", grupo_50_30_20="Poupança")
        )
        
        # Criar categoria de despesa
        cat_despesa = categoria_service.criar_categoria(
            usuario_teste.id_usuario,
            CategoriaCreate(nome="Alimentação", tipo="Despesa", grupo_50_30_20="Essencial")
        )
        
        # Criar receita
        service.criar_lancamento(usuario_teste.id_usuario, LancamentoCreate(
            id_conta=conta_teste.id_conta,
            id_categoria=cat_receita.id_categoria,
            tipo="Receita",
            valor=Decimal("3000.00"),
            data=date.today(),
            descricao="Salário",
            origem="Manual",
            pago=True
        ))
        
        # Criar despesa
        service.criar_lancamento(usuario_teste.id_usuario, LancamentoCreate(
            id_conta=conta_teste.id_conta,
            id_categoria=cat_despesa.id_categoria,
            tipo="Despesa",
            valor=Decimal("500.00"),
            data=date.today(),
            descricao="Supermercado",
            origem="Manual",
            pago=True
        ))
        
        # Calcular totais
        totais = service.obter_totais_periodo(
            usuario_teste.id_usuario,
            date.today(),
            date.today()
        )
        
        assert totais['total_receitas'] == Decimal("3000.00")
        assert totais['total_despesas'] == Decimal("500.00")
        assert totais['saldo'] == Decimal("2500.00")

