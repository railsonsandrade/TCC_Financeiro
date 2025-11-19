"""
Rotas de contas financeiras
"""

from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.conta_financeira import (
    ContaFinanceiraCreate,
    ContaFinanceiraUpdate,
    ContaFinanceiraResponse,
    ContaFinanceiraComSaldo
)
from app.schemas.usuario import UsuarioResponse
from app.services.conta_financeira_service import ContaFinanceiraService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/contas", tags=["Contas Financeiras"])


@router.post("", response_model=ContaFinanceiraResponse, status_code=status.HTTP_201_CREATED, summary="Criar conta")
async def criar_conta(
    conta: ContaFinanceiraCreate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Cria uma nova conta financeira para o usuário autenticado
    
    - **nome**: Nome da conta (único por usuário e tipo)
    - **tipo**: Tipo da conta (Conta Corrente, Poupança, Cartão de Crédito, Dinheiro)
    - **saldo_inicial**: Saldo inicial da conta
    """
    try:
        conta_service = ContaFinanceiraService()
        nova_conta = conta_service.criar_conta(current_user.id_usuario, conta)
        return nova_conta
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar conta: {str(e)}"
        )


@router.get("", response_model=List[ContaFinanceiraResponse], summary="Listar contas")
async def listar_contas(
    apenas_ativas: bool = True,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista todas as contas do usuário autenticado
    
    - **apenas_ativas**: Se True, retorna apenas contas ativas (padrão: True)
    """
    try:
        conta_service = ContaFinanceiraService()
        contas = conta_service.listar_contas(current_user.id_usuario, apenas_ativas)
        return contas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar contas: {str(e)}"
        )


@router.get("/com-saldo", response_model=List[ContaFinanceiraComSaldo], summary="Listar contas com saldo")
async def listar_contas_com_saldo(
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista todas as contas do usuário com saldo calculado
    
    O saldo é calculado como: saldo_inicial + receitas - despesas
    """
    try:
        conta_service = ContaFinanceiraService()
        contas = conta_service.listar_contas_com_saldo(current_user.id_usuario)
        return contas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar contas: {str(e)}"
        )


@router.get("/{id_conta}", response_model=ContaFinanceiraResponse, summary="Obter conta")
async def obter_conta(
    id_conta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Obtém uma conta específica por ID
    
    - **id_conta**: ID da conta
    """
    try:
        conta_service = ContaFinanceiraService()
        conta = conta_service.obter_conta(id_conta, current_user.id_usuario)
        
        if not conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conta não encontrada"
            )
        
        return conta
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter conta: {str(e)}"
        )


@router.get("/{id_conta}/com-saldo", response_model=ContaFinanceiraComSaldo, summary="Obter conta com saldo")
async def obter_conta_com_saldo(
    id_conta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Obtém uma conta específica com saldo calculado
    
    - **id_conta**: ID da conta
    """
    try:
        conta_service = ContaFinanceiraService()
        conta = conta_service.obter_conta_com_saldo(id_conta, current_user.id_usuario)
        
        if not conta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conta não encontrada"
            )
        
        return conta
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter conta: {str(e)}"
        )


@router.put("/{id_conta}", response_model=ContaFinanceiraResponse, summary="Atualizar conta")
async def atualizar_conta(
    id_conta: int,
    conta: ContaFinanceiraUpdate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Atualiza uma conta existente

    - **id_conta**: ID da conta
    - **nome**: Novo nome (opcional)
    - **tipo**: Novo tipo (opcional)
    - **saldo_inicial**: Novo saldo inicial (opcional)
    """
    try:
        conta_service = ContaFinanceiraService()
        conta_atualizada = conta_service.atualizar_conta(id_conta, current_user.id_usuario, conta)
        return conta_atualizada
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar conta: {str(e)}"
        )


@router.delete("/{id_conta}", status_code=status.HTTP_204_NO_CONTENT, summary="Desativar conta")
async def desativar_conta(
    id_conta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Desativa uma conta (soft delete)

    - **id_conta**: ID da conta
    """
    try:
        conta_service = ContaFinanceiraService()
        conta_service.desativar_conta(id_conta, current_user.id_usuario)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao desativar conta: {str(e)}"
        )

