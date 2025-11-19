"""
Testes unitários do MetaFinanceiraService
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal
from app.services.meta_financeira_service import MetaFinanceiraService
from app.schemas.meta_financeira import MetaFinanceiraCreate, MetaFinanceiraUpdate


@pytest.mark.unit
class TestMetaFinanceiraService:
    """Testes do MetaFinanceiraService"""
    
    def test_criar_meta(self, db, usuario_teste):
        """Testa criação de meta financeira"""
        service = MetaFinanceiraService()

        meta_data = MetaFinanceiraCreate(
            nome="Viagem",
            valor_alvo=Decimal("5000.00"),
            data_inicio=date.today(),
            data_fim_prev=date.today() + timedelta(days=180)
        )

        meta = service.criar_meta(usuario_teste.id_usuario, meta_data)

        assert meta.id_meta is not None
        assert meta.nome == "Viagem"
        assert meta.valor_alvo == Decimal("5000.00")
        assert meta.status == "Em Andamento"
    
    def test_criar_meta_data_invalida(self, db, usuario_teste):
        """Testa RN004: Data fim deve ser posterior à data início - validação Pydantic"""
        from pydantic import ValidationError

        # Pydantic já valida que data_fim_prev deve ser >= data_inicio
        with pytest.raises(ValidationError):
            meta_data = MetaFinanceiraCreate(
                nome="Meta Inválida",
                valor_alvo=Decimal("1000.00"),
                data_inicio=date.today(),
                data_fim_prev=date.today() - timedelta(days=1)  # Data fim no passado
            )
    
    def test_criar_meta_valor_invalido(self, db, usuario_teste):
        """Testa RN004: Valor alvo deve ser positivo - validação no Pydantic"""
        service = MetaFinanceiraService()

        # Pydantic já valida que valor_alvo deve ser > 0
        # Então este teste verifica a validação do schema
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            meta_data = MetaFinanceiraCreate(
                nome="Meta Inválida",
                valor_alvo=Decimal("-100.00"),  # Valor negativo
                data_inicio=date.today(),
                data_fim_prev=date.today() + timedelta(days=30)
            )
    
    def test_obter_meta(self, db, usuario_teste):
        """Testa obtenção de meta por ID"""
        service = MetaFinanceiraService()

        # Criar meta
        meta_criada = service.criar_meta(usuario_teste.id_usuario, MetaFinanceiraCreate(
            nome="Teste",
            valor_alvo=Decimal("1000.00"),
            data_inicio=date.today(),
            data_fim_prev=date.today() + timedelta(days=30)
        ))

        # Obter meta
        meta = service.obter_meta(usuario_teste.id_usuario, meta_criada.id_meta)

        assert meta.id_meta == meta_criada.id_meta
        assert meta.nome == "Teste"
    
    def test_obter_meta_com_progresso(self, db, usuario_teste):
        """Testa RN005: Obtenção de meta com cálculo de progresso"""
        service = MetaFinanceiraService()

        # Criar meta
        meta = service.criar_meta(usuario_teste.id_usuario, MetaFinanceiraCreate(
            nome="Viagem",
            valor_alvo=Decimal("1000.00"),
            data_inicio=date.today(),
            data_fim_prev=date.today() + timedelta(days=180)
        ))

        # Obter meta com progresso
        meta_progresso = service.obter_meta_com_progresso(usuario_teste.id_usuario, meta.id_meta)

        # Verificar que retorna os campos de progresso
        assert meta_progresso is not None
        assert meta_progresso.id_meta == meta.id_meta
        assert hasattr(meta_progresso, 'percentual_atingido')
        assert hasattr(meta_progresso, 'valor_faltante')
        assert hasattr(meta_progresso, 'dias_restantes')
    
    def test_atualizar_meta(self, db, usuario_teste):
        """Testa atualização de meta"""
        service = MetaFinanceiraService()

        # Criar meta
        meta = service.criar_meta(usuario_teste.id_usuario, MetaFinanceiraCreate(
            nome="Meta Original",
            valor_alvo=Decimal("1000.00"),
            data_inicio=date.today(),
            data_fim_prev=date.today() + timedelta(days=30)
        ))

        # Atualizar meta
        meta_update = MetaFinanceiraUpdate(
            nome="Meta Atualizada",
            valor_alvo=Decimal("2000.00")
        )

        meta_atualizada = service.atualizar_meta(
            usuario_teste.id_usuario,
            meta.id_meta,
            meta_update
        )

        assert meta_atualizada.nome == "Meta Atualizada"
        assert meta_atualizada.valor_alvo == Decimal("2000.00")
    
    def test_listar_metas(self, db, usuario_teste):
        """Testa listagem de metas"""
        service = MetaFinanceiraService()

        # Criar 2 metas
        for i in range(2):
            service.criar_meta(usuario_teste.id_usuario, MetaFinanceiraCreate(
                nome=f"Meta {i}",
                valor_alvo=Decimal("1000.00"),
                data_inicio=date.today(),
                data_fim_prev=date.today() + timedelta(days=30)
            ))

        metas = service.listar_metas(usuario_teste.id_usuario)

        assert len(metas) >= 2

