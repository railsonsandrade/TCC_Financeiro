"""
Service para lógica de negócio relacionada a Meta Financeira
"""

from typing import Optional, List
from datetime import date
from decimal import Decimal
from app.repositories.meta_financeira_repository import MetaFinanceiraRepository
from app.schemas.meta_financeira import (
    MetaFinanceiraCreate,
    MetaFinanceiraUpdate,
    MetaFinanceiraResponse,
    MetaFinanceiraComProgresso
)
import app.utils.database as db_module


class MetaFinanceiraService:
    """Service para gerenciar lógica de negócio de Meta Financeira"""

    def __init__(self):
        self.repository = MetaFinanceiraRepository(db_module.db)
    
    def criar_meta(self, id_usuario: int, meta: MetaFinanceiraCreate) -> MetaFinanceiraResponse:
        """
        Cria uma nova meta financeira
        
        Regras de negócio:
        - RN004: Valor alvo deve ser positivo
        - RN004: Data fim deve ser posterior à data início
        - Valor atual inicial é zero
        
        Args:
            id_usuario: ID do usuário dono da meta
            meta: Dados da meta a ser criada
        
        Returns:
            Meta criada
        
        Raises:
            ValueError: Se dados inválidos
        """
        # RN004: Validar valor alvo
        if meta.valor_alvo <= 0:
            raise ValueError("Valor alvo deve ser positivo")

        # RN004: Validar datas (se data_fim_prev foi fornecida)
        if meta.data_fim_prev and meta.data_fim_prev <= meta.data_inicio:
            raise ValueError("Data fim deve ser posterior à data início")
        
        # Criar meta
        meta_db = self.repository.create(id_usuario, meta)
        
        return MetaFinanceiraResponse(
            id_meta=meta_db.id_meta,
            id_usuario=meta_db.id_usuario,
            nome=meta_db.nome,
            valor_alvo=meta_db.valor_alvo,
            valor_atual=meta_db.valor_atual,
            data_inicio=meta_db.data_inicio,
            data_fim_prev=meta_db.data_fim_prev,
            status=meta_db.status,
            data_criacao=meta_db.data_criacao
        )
    
    def obter_meta(self, id_meta: int, id_usuario: int) -> Optional[MetaFinanceiraResponse]:
        """
        Obtém uma meta por ID
        
        Args:
            id_meta: ID da meta
            id_usuario: ID do usuário (para validação de propriedade)
        
        Returns:
            Meta encontrada ou None
        
        Raises:
            ValueError: Se meta não pertence ao usuário
        """
        meta = self.repository.get_by_id(id_meta)
        
        if not meta:
            return None
        
        # Validar propriedade
        if meta.id_usuario != id_usuario:
            raise ValueError("Meta não pertence ao usuário")
        
        return MetaFinanceiraResponse(
            id_meta=meta.id_meta,
            id_usuario=meta.id_usuario,
            nome=meta.nome,
            valor_alvo=meta.valor_alvo,
            valor_atual=meta.valor_atual,
            data_inicio=meta.data_inicio,
            data_fim_prev=meta.data_fim_prev,
            status=meta.status,
            data_criacao=meta.data_criacao
        )
    
    def obter_meta_com_progresso(self, id_meta: int, id_usuario: int) -> Optional[MetaFinanceiraComProgresso]:
        """
        Obtém uma meta com cálculos de progresso
        
        RN005: Cálculo de progresso da meta
        
        Args:
            id_meta: ID da meta
            id_usuario: ID do usuário (para validação de propriedade)
        
        Returns:
            Meta com progresso ou None
        
        Raises:
            ValueError: Se meta não pertence ao usuário
        """
        meta = self.repository.get_com_progresso(id_meta)
        
        if not meta:
            return None
        
        # Validar propriedade
        if meta.id_usuario != id_usuario:
            raise ValueError("Meta não pertence ao usuário")
        
        return meta
    
    def listar_metas(
        self,
        id_usuario: int,
        status: Optional[str] = None
    ) -> List[MetaFinanceiraResponse]:
        """
        Lista metas de um usuário
        
        Args:
            id_usuario: ID do usuário
            status: Filtrar por status (Em Andamento/Concluída/Cancelada)
        
        Returns:
            Lista de metas
        """
        metas = self.repository.get_by_usuario(id_usuario, status)
        
        return [
            MetaFinanceiraResponse(
                id_meta=m.id_meta,
                id_usuario=m.id_usuario,
                nome=m.nome,
                valor_alvo=m.valor_alvo,
                valor_atual=m.valor_atual,
                data_inicio=m.data_inicio,
                data_fim_prev=m.data_fim_prev,
                status=m.status,
                data_criacao=m.data_criacao
            )
            for m in metas
        ]

    def listar_metas_com_progresso(self, id_usuario: int) -> List[MetaFinanceiraComProgresso]:
        """
        Lista todas as metas de um usuário com cálculos de progresso

        Args:
            id_usuario: ID do usuário

        Returns:
            Lista de metas com progresso
        """
        # Obter todas as metas
        metas = self.repository.get_by_usuario(id_usuario)

        # Obter progresso de cada meta
        metas_com_progresso = []
        for meta in metas:
            meta_progresso = self.repository.get_com_progresso(meta.id_meta)
            if meta_progresso:
                metas_com_progresso.append(meta_progresso)

        return metas_com_progresso

    def atualizar_meta(
        self,
        id_meta: int,
        id_usuario: int,
        meta: MetaFinanceiraUpdate
    ) -> MetaFinanceiraResponse:
        """
        Atualiza uma meta financeira

        Args:
            id_meta: ID da meta
            id_usuario: ID do usuário (para validação de propriedade)
            meta: Dados a serem atualizados

        Returns:
            Meta atualizada

        Raises:
            ValueError: Se meta não existe ou não pertence ao usuário
        """
        # Verificar se meta existe e pertence ao usuário
        meta_existente = self.repository.get_by_id(id_meta)
        if not meta_existente:
            raise ValueError("Meta não encontrada")

        if meta_existente.id_usuario != id_usuario:
            raise ValueError("Meta não pertence ao usuário")

        # Validar valor alvo se estiver sendo alterado
        if meta.valor_alvo is not None and meta.valor_alvo <= 0:
            raise ValueError("Valor alvo deve ser positivo")

        # Atualizar
        meta_atualizada = self.repository.update(id_meta, meta)

        return MetaFinanceiraResponse(
            id_meta=meta_atualizada.id_meta,
            id_usuario=meta_atualizada.id_usuario,
            nome=meta_atualizada.nome,
            valor_alvo=meta_atualizada.valor_alvo,
            valor_atual=meta_atualizada.valor_atual,
            data_inicio=meta_atualizada.data_inicio,
            data_fim_prev=meta_atualizada.data_fim_prev,
            status=meta_atualizada.status,
            data_criacao=meta_atualizada.data_criacao
        )

    def adicionar_valor_meta(
        self,
        id_meta: int,
        id_usuario: int,
        valor: Decimal
    ) -> MetaFinanceiraResponse:
        """
        Adiciona valor a uma meta

        RN006: Auto-completar meta quando atingir valor alvo

        Args:
            id_meta: ID da meta
            id_usuario: ID do usuário (para validação de propriedade)
            valor: Valor a ser adicionado

        Returns:
            Meta atualizada

        Raises:
            ValueError: Se meta não existe, não pertence ao usuário ou valor inválido
        """
        # Verificar se meta existe e pertence ao usuário
        meta = self.repository.get_by_id(id_meta)
        if not meta:
            raise ValueError("Meta não encontrada")

        if meta.id_usuario != id_usuario:
            raise ValueError("Meta não pertence ao usuário")

        # Validar valor
        if valor <= 0:
            raise ValueError("Valor deve ser positivo")

        # Adicionar valor (repository já implementa RN006)
        meta_atualizada = self.repository.adicionar_valor(id_meta, valor)

        return MetaFinanceiraResponse(
            id_meta=meta_atualizada.id_meta,
            id_usuario=meta_atualizada.id_usuario,
            nome=meta_atualizada.nome,
            valor_alvo=meta_atualizada.valor_alvo,
            valor_atual=meta_atualizada.valor_atual,
            data_inicio=meta_atualizada.data_inicio,
            data_fim_prev=meta_atualizada.data_fim_prev,
            status=meta_atualizada.status,
            data_criacao=meta_atualizada.data_criacao
        )

    def excluir_meta(self, id_meta: int, id_usuario: int) -> bool:
        """
        Exclui uma meta

        Args:
            id_meta: ID da meta
            id_usuario: ID do usuário (para validação de propriedade)

        Returns:
            True se excluída com sucesso

        Raises:
            ValueError: Se meta não existe ou não pertence ao usuário
        """
        # Verificar se meta existe e pertence ao usuário
        meta = self.repository.get_by_id(id_meta)
        if not meta:
            raise ValueError("Meta não encontrada")

        if meta.id_usuario != id_usuario:
            raise ValueError("Meta não pertence ao usuário")

        return self.repository.delete(id_meta)

