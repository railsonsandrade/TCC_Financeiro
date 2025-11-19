"""
Testes unitários do ContaFinanceiraService
"""

import pytest
from decimal import Decimal
from app.services.conta_financeira_service import ContaFinanceiraService
from app.schemas.conta_financeira import ContaFinanceiraCreate, ContaFinanceiraUpdate


@pytest.mark.unit
class TestContaFinanceiraService:
    """Testes do ContaFinanceiraService"""
    
    def test_criar_conta(self, db, usuario_teste):
        """Testa criação de conta"""
        service = ContaFinanceiraService()
        
        conta_data = ContaFinanceiraCreate(
            nome="Conta Corrente",
            tipo="Conta Corrente",
            saldo_inicial=Decimal("1000.00")
        )
        
        conta = service.criar_conta(usuario_teste.id_usuario, conta_data)
        
        assert conta.id_conta is not None
        assert conta.nome == "Conta Corrente"
        assert conta.tipo == "Conta Corrente"
        assert conta.saldo_inicial == Decimal("1000.00")
        assert conta.ativa is True
    
    def test_criar_conta_nome_duplicado(self, db, usuario_teste, conta_teste):
        """Testa RN008: Nome da conta deve ser único por usuário e tipo"""
        service = ContaFinanceiraService()
        
        conta_data = ContaFinanceiraCreate(
            nome="Conta Teste",  # Nome já existe
            tipo="Conta Corrente",
            saldo_inicial=Decimal("500.00")
        )
        
        with pytest.raises(ValueError, match="Já existe uma conta"):
            service.criar_conta(usuario_teste.id_usuario, conta_data)
    
    def test_obter_conta(self, db, usuario_teste, conta_teste):
        """Testa obtenção de conta por ID"""
        service = ContaFinanceiraService()
        
        conta = service.obter_conta(conta_teste.id_conta, usuario_teste.id_usuario)
        
        assert conta is not None
        assert conta.id_conta == conta_teste.id_conta
        assert conta.nome == "Conta Teste"
    
    def test_obter_conta_outro_usuario(self, db, usuario_teste, conta_teste):
        """Testa que usuário não pode acessar conta de outro usuário"""
        service = ContaFinanceiraService()
        
        with pytest.raises(ValueError, match="não pertence ao usuário"):
            service.obter_conta(conta_teste.id_conta, 99999)
    
    def test_obter_conta_com_saldo(self, db, usuario_teste, conta_teste):
        """Testa obtenção de conta com saldo calculado"""
        service = ContaFinanceiraService()
        
        conta = service.obter_conta_com_saldo(conta_teste.id_conta, usuario_teste.id_usuario)
        
        assert conta is not None
        assert conta.saldo_atual == Decimal("1000.00")  # Sem lançamentos
    
    def test_listar_contas(self, db, usuario_teste, conta_teste):
        """Testa listagem de contas"""
        service = ContaFinanceiraService()
        
        # Criar mais uma conta
        conta_data = ContaFinanceiraCreate(
            nome="Poupança",
            tipo="Poupança",
            saldo_inicial=Decimal("5000.00")
        )
        service.criar_conta(usuario_teste.id_usuario, conta_data)
        
        contas = service.listar_contas(usuario_teste.id_usuario)
        
        assert len(contas) == 2
    
    def test_listar_contas_apenas_ativas(self, db, usuario_teste, conta_teste):
        """Testa listagem apenas de contas ativas"""
        service = ContaFinanceiraService()
        
        # Criar e desativar uma conta
        conta_data = ContaFinanceiraCreate(
            nome="Conta Inativa",
            tipo="Poupança",
            saldo_inicial=Decimal("100.00")
        )
        conta_inativa = service.criar_conta(usuario_teste.id_usuario, conta_data)
        service.desativar_conta(conta_inativa.id_conta, usuario_teste.id_usuario)
        
        # Listar apenas ativas
        contas = service.listar_contas(usuario_teste.id_usuario, apenas_ativas=True)
        
        assert len(contas) == 1
        assert contas[0].ativa is True
    
    def test_atualizar_conta(self, db, usuario_teste, conta_teste):
        """Testa atualização de conta"""
        service = ContaFinanceiraService()
        
        update_data = ContaFinanceiraUpdate(
            nome="Conta Atualizada"
        )
        
        conta = service.atualizar_conta(conta_teste.id_conta, usuario_teste.id_usuario, update_data)
        
        assert conta.nome == "Conta Atualizada"
        assert conta.tipo == "Conta Corrente"  # Tipo não mudou
    
    def test_desativar_conta(self, db, usuario_teste, conta_teste):
        """Testa desativação de conta (soft delete)"""
        service = ContaFinanceiraService()
        
        service.desativar_conta(conta_teste.id_conta, usuario_teste.id_usuario)
        
        conta = service.obter_conta(conta_teste.id_conta, usuario_teste.id_usuario)
        assert conta.ativa is False
    
    def test_calcular_saldo_total(self, db, usuario_teste, conta_teste):
        """Testa cálculo de saldo total"""
        service = ContaFinanceiraService()
        
        # Criar mais uma conta
        conta_data = ContaFinanceiraCreate(
            nome="Poupança",
            tipo="Poupança",
            saldo_inicial=Decimal("5000.00")
        )
        service.criar_conta(usuario_teste.id_usuario, conta_data)
        
        saldo_total = service.calcular_saldo_total(usuario_teste.id_usuario)
        
        assert saldo_total == Decimal("6000.00")  # 1000 + 5000

