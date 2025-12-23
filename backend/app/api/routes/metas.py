"""
Rotas de metas financeiras
"""

from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.meta_financeira import (
    MetaFinanceiraCreate,
    MetaFinanceiraUpdate,
    MetaFinanceiraResponse,
    MetaFinanceiraComProgresso
)
from app.schemas.usuario import UsuarioResponse
from app.services.meta_financeira_service import MetaFinanceiraService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/metas", tags=["Metas Financeiras"])


@router.post("", response_model=MetaFinanceiraResponse, status_code=status.HTTP_201_CREATED, summary="Criar meta")
async def criar_meta(
    meta: MetaFinanceiraCreate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Cria uma nova meta financeira
    
    - **nome**: Nome da meta
    - **valor_alvo**: Valor alvo (deve ser positivo)
    - **data_inicio**: Data de início
    - **data_fim_prev**: Data prevista de conclusão (deve ser posterior à data de início)
    """
    try:
        meta_service = MetaFinanceiraService()
        nova_meta = meta_service.criar_meta(current_user.id_usuario, meta)
        return nova_meta
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar meta: {str(e)}"
        )


@router.get("", response_model=List[MetaFinanceiraComProgresso], summary="Listar metas")
async def listar_metas(
    status_meta: Optional[str] = Query(None, alias="status", description="Filtrar por status (Em Andamento/Concluída/Cancelada)"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista todas as metas do usuário autenticado com progresso
    
    - **status**: Filtrar por status (Em Andamento, Concluída, Cancelada) - opcional
    """
    try:
        meta_service = MetaFinanceiraService()
        
        # Obter todas as metas com progresso
        todas_metas = meta_service.listar_metas_com_progresso(current_user.id_usuario)
        
        # Filtrar por status se necessário
        if status_meta:
            return [meta for meta in todas_metas if meta.status == status_meta]
        else:
            return todas_metas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar metas: {str(e)}"
        )


@router.get("/com-progresso", response_model=List[MetaFinanceiraComProgresso], summary="Listar metas com progresso")
async def listar_metas_com_progresso(
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista todas as metas do usuário com cálculos de progresso
    
    Retorna para cada meta:
    - Percentual atingido
    - Valor faltante
    - Dias restantes até a data prevista
    """
    try:
        meta_service = MetaFinanceiraService()
        metas = meta_service.listar_metas_com_progresso(current_user.id_usuario)
        return metas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar metas: {str(e)}"
        )


@router.get("/{id_meta}", response_model=MetaFinanceiraResponse, summary="Obter meta")
async def obter_meta(
    id_meta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Obtém uma meta específica por ID
    """
    try:
        meta_service = MetaFinanceiraService()
        meta = meta_service.obter_meta(id_meta, current_user.id_usuario)
        
        if not meta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta não encontrada"
            )
        
        return meta
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
            detail=f"Erro ao obter meta: {str(e)}"
        )


@router.get("/{id_meta}/progresso", response_model=MetaFinanceiraComProgresso, summary="Obter meta com progresso")
async def obter_meta_com_progresso(
    id_meta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Obtém uma meta específica com cálculos de progresso
    """
    try:
        meta_service = MetaFinanceiraService()
        meta = meta_service.obter_meta_com_progresso(id_meta, current_user.id_usuario)
        
        if not meta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta não encontrada"
            )
        
        return meta
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
            detail=f"Erro ao obter meta: {str(e)}"
        )


@router.put("/{id_meta}", response_model=MetaFinanceiraResponse, summary="Atualizar meta")
async def atualizar_meta(
    id_meta: int,
    meta: MetaFinanceiraUpdate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Atualiza uma meta existente
    """
    try:
        meta_service = MetaFinanceiraService()
        meta_atualizada = meta_service.atualizar_meta(id_meta, current_user.id_usuario, meta)
        return meta_atualizada
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar meta: {str(e)}"
        )


@router.patch("/{id_meta}/concluir", response_model=MetaFinanceiraResponse, summary="Concluir meta")
async def concluir_meta(
    id_meta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Marca uma meta como concluída
    """
    try:
        meta_service = MetaFinanceiraService()
        from app.schemas.meta_financeira import MetaFinanceiraUpdate
        meta_atualizada = meta_service.atualizar_meta(
            id_meta, 
            current_user.id_usuario, 
            MetaFinanceiraUpdate(status="Concluída")
        )
        return meta_atualizada
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao concluir meta: {str(e)}"
        )


@router.patch("/{id_meta}/cancelar", response_model=MetaFinanceiraResponse, summary="Cancelar meta")
async def cancelar_meta(
    id_meta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Marca uma meta como cancelada
    """
    try:
        meta_service = MetaFinanceiraService()
        from app.schemas.meta_financeira import MetaFinanceiraUpdate
        meta_atualizada = meta_service.atualizar_meta(
            id_meta, 
            current_user.id_usuario, 
            MetaFinanceiraUpdate(status="Cancelada")
        )
        return meta_atualizada
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao cancelar meta: {str(e)}"
        )


@router.patch("/{id_meta}/adicionar-valor", response_model=MetaFinanceiraResponse, summary="Adicionar valor à meta")
async def adicionar_valor_meta(
    id_meta: int,
    valor: Decimal = Query(..., gt=0, description="Valor a ser adicionado (deve ser positivo)"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Adiciona valor a uma meta

    A meta será automaticamente marcada como "Concluída" quando atingir o valor alvo
    """
    try:
        meta_service = MetaFinanceiraService()
        meta_atualizada = meta_service.adicionar_valor_meta(id_meta, current_user.id_usuario, valor)
        return meta_atualizada
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar valor à meta: {str(e)}"
        )


@router.delete("/{id_meta}", status_code=status.HTTP_204_NO_CONTENT, summary="Excluir meta")
async def excluir_meta(
    id_meta: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Exclui uma meta permanentemente
    """
    try:
        meta_service = MetaFinanceiraService()
        meta_service.excluir_meta(id_meta, current_user.id_usuario)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir meta: {str(e)}"
        )

