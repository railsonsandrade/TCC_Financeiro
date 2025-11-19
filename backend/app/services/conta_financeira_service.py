"""
Service para lógica de negócio relacionada a Conta Financeira
"""

from typing import Optional, List
from decimal import Decimal
from app.repositories.conta_financeira_repository import ContaFinanceiraRepository
from app.schemas.conta_financeira import (
    ContaFinanceiraCreate,
    ContaFinanceiraUpdate,
    ContaFinanceiraResponse,
    ContaFinanceiraComSaldo
)
import app.utils.database as db_module


class ContaFinanceiraService:
    """Service para gerenciar lógica de negócio de Conta Financeira"""

    def __init__(self):
        self.repository = ContaFinanceiraRepository(db_module.db)
    
    def criar_conta(self, id_usuario: int, conta: ContaFinanceiraCreate) -> ContaFinanceiraResponse:
        """
        Cria uma nova conta financeira
        
        Regras de negócio:
        - Nome da conta deve ser único para o usuário
        - Saldo inicial não pode ser negativo
        
        Args:
            id_usuario: ID do usuário dono da conta
            conta: Dados da conta a ser criada
        
        Returns:
            Conta criada
        
        Raises:
            ValueError: Se nome já existe ou dados inválidos
        """
        # RN008: Validar unicidade do nome da conta
        if self.repository.exists_by_nome(id_usuario, conta.nome, conta.tipo):
            raise ValueError(f"Já existe uma conta com o nome '{conta.nome}' e tipo '{conta.tipo}'")
        
        # Validar saldo inicial
        if conta.saldo_inicial < 0:
            raise ValueError("Saldo inicial não pode ser negativo")
        
        # Criar conta
        conta_db = self.repository.create(id_usuario, conta)
        
        return ContaFinanceiraResponse(
            id_conta=conta_db.id_conta,
            id_usuario=conta_db.id_usuario,
            nome=conta_db.nome,
            tipo=conta_db.tipo,
            saldo_inicial=conta_db.saldo_inicial,
            data_criacao=conta_db.data_criacao,
            ativa=conta_db.ativa
        )
    
    def obter_conta(self, id_conta: int, id_usuario: int) -> Optional[ContaFinanceiraResponse]:
        """
        Obtém uma conta por ID
        
        Args:
            id_conta: ID da conta
            id_usuario: ID do usuário (para validação de propriedade)
        
        Returns:
            Conta encontrada ou None
        
        Raises:
            ValueError: Se conta não pertence ao usuário
        """
        conta = self.repository.get_by_id(id_conta)
        
        if not conta:
            return None
        
        # Validar propriedade
        if conta.id_usuario != id_usuario:
            raise ValueError("Conta não pertence ao usuário")
        
        return ContaFinanceiraResponse(
            id_conta=conta.id_conta,
            id_usuario=conta.id_usuario,
            nome=conta.nome,
            tipo=conta.tipo,
            saldo_inicial=conta.saldo_inicial,
            data_criacao=conta.data_criacao,
            ativa=conta.ativa
        )
    
    def obter_conta_com_saldo(self, id_conta: int, id_usuario: int) -> Optional[ContaFinanceiraComSaldo]:
        """
        Obtém uma conta com saldo calculado
        
        Args:
            id_conta: ID da conta
            id_usuario: ID do usuário (para validação de propriedade)
        
        Returns:
            Conta com saldo ou None
        
        Raises:
            ValueError: Se conta não pertence ao usuário
        """
        conta = self.repository.get_com_saldo(id_conta)
        
        if not conta:
            return None
        
        # Validar propriedade
        if conta.id_usuario != id_usuario:
            raise ValueError("Conta não pertence ao usuário")
        
        return conta
    
    def listar_contas(self, id_usuario: int, apenas_ativas: bool = True) -> List[ContaFinanceiraResponse]:
        """
        Lista todas as contas de um usuário
        
        Args:
            id_usuario: ID do usuário
            apenas_ativas: Se True, retorna apenas contas ativas
        
        Returns:
            Lista de contas
        """
        contas = self.repository.get_by_usuario(id_usuario, apenas_ativas)
        
        return [
            ContaFinanceiraResponse(
                id_conta=c.id_conta,
                id_usuario=c.id_usuario,
                nome=c.nome,
                tipo=c.tipo,
                saldo_inicial=c.saldo_inicial,
                data_criacao=c.data_criacao,
                ativa=c.ativa
            )
            for c in contas
        ]
    
    def listar_contas_com_saldo(self, id_usuario: int) -> List[ContaFinanceiraComSaldo]:
        """
        Lista todas as contas de um usuário com saldo calculado

        Args:
            id_usuario: ID do usuário

        Returns:
            Lista de contas com saldo
        """
        return self.repository.get_todas_com_saldo(id_usuario)

    def atualizar_conta(self, id_conta: int, id_usuario: int, conta: ContaFinanceiraUpdate) -> ContaFinanceiraResponse:
        """
        Atualiza uma conta financeira

        Args:
            id_conta: ID da conta
            id_usuario: ID do usuário (para validação de propriedade)
            conta: Dados a serem atualizados

        Returns:
            Conta atualizada

        Raises:
            ValueError: Se conta não existe, não pertence ao usuário ou nome já existe
        """
        # Verificar se conta existe e pertence ao usuário
        conta_existente = self.repository.get_by_id(id_conta)
        if not conta_existente:
            raise ValueError("Conta não encontrada")

        if conta_existente.id_usuario != id_usuario:
            raise ValueError("Conta não pertence ao usuário")

        # Verificar unicidade do nome (se estiver sendo alterado)
        if conta.nome and conta.nome != conta_existente.nome:
            tipo_verificar = conta.tipo if conta.tipo else conta_existente.tipo
            if self.repository.exists_by_nome(id_usuario, conta.nome, tipo_verificar, exclude_id=id_conta):
                raise ValueError(f"Já existe uma conta com o nome '{conta.nome}' e tipo '{tipo_verificar}'")

        # Atualizar
        conta_atualizada = self.repository.update(id_conta, conta)

        return ContaFinanceiraResponse(
            id_conta=conta_atualizada.id_conta,
            id_usuario=conta_atualizada.id_usuario,
            nome=conta_atualizada.nome,
            tipo=conta_atualizada.tipo,
            saldo_inicial=conta_atualizada.saldo_inicial,
            data_criacao=conta_atualizada.data_criacao,
            ativa=conta_atualizada.ativa
        )

    def desativar_conta(self, id_conta: int, id_usuario: int) -> bool:
        """
        Desativa uma conta (soft delete)

        Args:
            id_conta: ID da conta
            id_usuario: ID do usuário (para validação de propriedade)

        Returns:
            True se desativada com sucesso

        Raises:
            ValueError: Se conta não existe ou não pertence ao usuário
        """
        # Verificar se conta existe e pertence ao usuário
        conta = self.repository.get_by_id(id_conta)
        if not conta:
            raise ValueError("Conta não encontrada")

        if conta.id_usuario != id_usuario:
            raise ValueError("Conta não pertence ao usuário")

        return self.repository.delete(id_conta)

    def calcular_saldo_total(self, id_usuario: int) -> Decimal:
        """
        Calcula o saldo total de todas as contas ativas do usuário

        Args:
            id_usuario: ID do usuário

        Returns:
            Saldo total
        """
        contas = self.repository.get_todas_com_saldo(id_usuario)
        return sum(conta.saldo_atual for conta in contas)

