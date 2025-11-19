"""
Service para lógica de negócio relacionada a Lançamento
"""

from typing import Optional, List, Dict
from datetime import date, datetime
from decimal import Decimal
from app.repositories.lancamento_repository import LancamentoRepository
from app.repositories.conta_financeira_repository import ContaFinanceiraRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.schemas.lancamento import (
    LancamentoCreate,
    LancamentoUpdate,
    LancamentoResponse,
    LancamentoComDetalhes
)
import app.utils.database as db_module


class LancamentoService:
    """Service para gerenciar lógica de negócio de Lançamento"""

    def __init__(self):
        self.repository = LancamentoRepository(db_module.db)
        self.conta_repository = ContaFinanceiraRepository(db_module.db)
        self.categoria_repository = CategoriaRepository(db_module.db)
    
    def criar_lancamento(self, id_usuario: int, lancamento: LancamentoCreate) -> LancamentoResponse:
        """
        Cria um novo lançamento
        
        Regras de negócio:
        - RN001: Conta e categoria devem pertencer ao usuário
        - RN002: Tipo do lançamento deve corresponder ao tipo da categoria
        - Valor deve ser positivo
        
        Args:
            id_usuario: ID do usuário dono do lançamento
            lancamento: Dados do lançamento a ser criado
        
        Returns:
            Lançamento criado
        
        Raises:
            ValueError: Se dados inválidos
        """
        # RN001: Validar que conta pertence ao usuário
        conta = self.conta_repository.get_by_id(lancamento.id_conta)
        if not conta:
            raise ValueError("Conta não encontrada")
        if conta.id_usuario != id_usuario:
            raise ValueError("Conta não pertence ao usuário")
        
        # RN001: Validar que categoria pertence ao usuário
        categoria = self.categoria_repository.get_by_id(lancamento.id_categoria)
        if not categoria:
            raise ValueError("Categoria não encontrada")
        if categoria.id_usuario != id_usuario:
            raise ValueError("Categoria não pertence ao usuário")
        
        # RN002: Validar que tipo do lançamento corresponde ao tipo da categoria
        if lancamento.tipo != categoria.tipo:
            raise ValueError(
                f"Tipo do lançamento ({lancamento.tipo}) não corresponde "
                f"ao tipo da categoria ({categoria.tipo})"
            )
        
        # Validar valor
        if lancamento.valor <= 0:
            raise ValueError("Valor deve ser positivo")
        
        # Criar lançamento
        lancamento_db = self.repository.create(id_usuario, lancamento)
        
        return LancamentoResponse(
            id_lancamento=lancamento_db.id_lancamento,
            id_usuario=lancamento_db.id_usuario,
            id_conta=lancamento_db.id_conta,
            id_categoria=lancamento_db.id_categoria,
            tipo=lancamento_db.tipo,
            valor=lancamento_db.valor,
            data=lancamento_db.data,
            descricao=lancamento_db.descricao,
            origem=lancamento_db.origem,
            id_recorrencia=lancamento_db.id_recorrencia,
            data_criacao=lancamento_db.data_criacao,
            pago=lancamento_db.pago
        )
    
    def obter_lancamento(self, id_lancamento: int, id_usuario: int) -> Optional[LancamentoResponse]:
        """
        Obtém um lançamento por ID
        
        Args:
            id_lancamento: ID do lançamento
            id_usuario: ID do usuário (para validação de propriedade)
        
        Returns:
            Lançamento encontrado ou None
        
        Raises:
            ValueError: Se lançamento não pertence ao usuário
        """
        lancamento = self.repository.get_by_id(id_lancamento)
        
        if not lancamento:
            return None
        
        # Validar propriedade
        if lancamento.id_usuario != id_usuario:
            raise ValueError("Lançamento não pertence ao usuário")
        
        return LancamentoResponse(
            id_lancamento=lancamento.id_lancamento,
            id_usuario=lancamento.id_usuario,
            id_conta=lancamento.id_conta,
            id_categoria=lancamento.id_categoria,
            tipo=lancamento.tipo,
            valor=lancamento.valor,
            data=lancamento.data,
            descricao=lancamento.descricao,
            origem=lancamento.origem,
            id_recorrencia=lancamento.id_recorrencia,
            data_criacao=lancamento.data_criacao,
            pago=lancamento.pago
        )
    
    def listar_lancamentos(
        self,
        id_usuario: int,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None,
        tipo: Optional[str] = None,
        id_conta: Optional[int] = None,
        id_categoria: Optional[int] = None,
        pago: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LancamentoResponse]:
        """
        Lista lançamentos com filtros
        
        Args:
            id_usuario: ID do usuário
            data_inicio: Data inicial do período
            data_fim: Data final do período
            tipo: Filtrar por tipo (Receita/Despesa)
            id_conta: Filtrar por conta
            id_categoria: Filtrar por categoria
            pago: Filtrar por status de pagamento
            skip: Número de registros a pular
            limit: Número máximo de registros
        
        Returns:
            Lista de lançamentos
        """
        lancamentos = self.repository.get_by_usuario(
            id_usuario=id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim,
            tipo=tipo,
            id_conta=id_conta,
            id_categoria=id_categoria,
            pago=pago,
            skip=skip,
            limit=limit
        )

        return [
            LancamentoResponse(
                id_lancamento=l.id_lancamento,
                id_usuario=l.id_usuario,
                id_conta=l.id_conta,
                id_categoria=l.id_categoria,
                tipo=l.tipo,
                valor=l.valor,
                data=l.data,
                descricao=l.descricao,
                origem=l.origem,
                id_recorrencia=l.id_recorrencia,
                data_criacao=l.data_criacao,
                pago=l.pago
            )
            for l in lancamentos
        ]

    def listar_lancamentos_com_detalhes(
        self,
        id_usuario: int,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None,
        tipo: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LancamentoComDetalhes]:
        """
        Lista lançamentos com detalhes (JOIN com conta e categoria)

        Args:
            id_usuario: ID do usuário
            data_inicio: Data inicial do período
            data_fim: Data final do período
            tipo: Filtrar por tipo (Receita/Despesa)
            skip: Número de registros a pular
            limit: Número máximo de registros

        Returns:
            Lista de lançamentos com detalhes
        """
        return self.repository.get_com_detalhes(
            id_usuario=id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim,
            tipo=tipo,
            skip=skip,
            limit=limit
        )

    def obter_totais_periodo(
        self,
        id_usuario: int,
        data_inicio: date,
        data_fim: date
    ) -> Dict[str, Decimal]:
        """
        Calcula totais de receitas e despesas em um período

        RN003: Cálculo de fluxo de caixa

        Args:
            id_usuario: ID do usuário
            data_inicio: Data inicial do período
            data_fim: Data final do período

        Returns:
            Dicionário com total_receitas, total_despesas e saldo
        """
        # Calcular total de receitas
        total_receitas = self.repository.get_total_por_periodo(
            id_usuario=id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim,
            tipo="Receita",
            apenas_pagos=True
        )

        # Calcular total de despesas
        total_despesas = self.repository.get_total_por_periodo(
            id_usuario=id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim,
            tipo="Despesa",
            apenas_pagos=True
        )

        return {
            'total_receitas': total_receitas,
            'total_despesas': total_despesas,
            'saldo': total_receitas - total_despesas
        }

    def atualizar_lancamento(
        self,
        id_lancamento: int,
        id_usuario: int,
        lancamento: LancamentoUpdate
    ) -> LancamentoResponse:
        """
        Atualiza um lançamento

        Args:
            id_lancamento: ID do lançamento
            id_usuario: ID do usuário (para validação de propriedade)
            lancamento: Dados a serem atualizados

        Returns:
            Lançamento atualizado

        Raises:
            ValueError: Se lançamento não existe ou não pertence ao usuário
        """
        # Verificar se lançamento existe e pertence ao usuário
        lancamento_existente = self.repository.get_by_id(id_lancamento)
        if not lancamento_existente:
            raise ValueError("Lançamento não encontrado")

        if lancamento_existente.id_usuario != id_usuario:
            raise ValueError("Lançamento não pertence ao usuário")

        # Validar valor se estiver sendo alterado
        if lancamento.valor is not None and lancamento.valor <= 0:
            raise ValueError("Valor deve ser positivo")

        # Atualizar
        lancamento_atualizado = self.repository.update(id_lancamento, lancamento)

        return LancamentoResponse(
            id_lancamento=lancamento_atualizado.id_lancamento,
            id_usuario=lancamento_atualizado.id_usuario,
            id_conta=lancamento_atualizado.id_conta,
            id_categoria=lancamento_atualizado.id_categoria,
            tipo=lancamento_atualizado.tipo,
            valor=lancamento_atualizado.valor,
            data=lancamento_atualizado.data,
            descricao=lancamento_atualizado.descricao,
            origem=lancamento_atualizado.origem,
            id_recorrencia=lancamento_atualizado.id_recorrencia,
            data_criacao=lancamento_atualizado.data_criacao,
            pago=lancamento_atualizado.pago
        )

    def excluir_lancamento(self, id_lancamento: int, id_usuario: int) -> bool:
        """
        Exclui um lançamento

        Args:
            id_lancamento: ID do lançamento
            id_usuario: ID do usuário (para validação de propriedade)

        Returns:
            True se excluído com sucesso

        Raises:
            ValueError: Se lançamento não existe ou não pertence ao usuário
        """
        # Verificar se lançamento existe e pertence ao usuário
        lancamento = self.repository.get_by_id(id_lancamento)
        if not lancamento:
            raise ValueError("Lançamento não encontrado")

        if lancamento.id_usuario != id_usuario:
            raise ValueError("Lançamento não pertence ao usuário")

        return self.repository.delete(id_lancamento)

    def marcar_como_pago(self, id_lancamento: int, id_usuario: int) -> LancamentoResponse:
        """
        Marca um lançamento como pago

        Args:
            id_lancamento: ID do lançamento
            id_usuario: ID do usuário (para validação de propriedade)

        Returns:
            Lançamento atualizado

        Raises:
            ValueError: Se lançamento não existe ou não pertence ao usuário
        """
        lancamento_update = LancamentoUpdate(pago=True)
        return self.atualizar_lancamento(id_lancamento, id_usuario, lancamento_update)

