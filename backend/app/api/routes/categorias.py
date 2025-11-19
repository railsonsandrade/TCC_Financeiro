"""
Rotas de categorias
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaResponse
)
from app.schemas.usuario import UsuarioResponse
from app.services.categoria_service import CategoriaService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.post("", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED, summary="Criar categoria")
async def criar_categoria(
    categoria: CategoriaCreate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Cria uma nova categoria para o usuário autenticado
    
    - **nome**: Nome da categoria (único por usuário)
    - **tipo**: Tipo (Receita ou Despesa)
    - **grupo_50_30_20**: Grupo do orçamento 50/30/20 (Essencial, Desejável, Poupança)
    - **cor**: Cor em hexadecimal (opcional)
    """
    try:
        categoria_service = CategoriaService()
        nova_categoria = categoria_service.criar_categoria(current_user.id_usuario, categoria)
        return nova_categoria
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar categoria: {str(e)}"
        )


@router.get("", response_model=List[CategoriaResponse], summary="Listar categorias")
async def listar_categorias(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (Receita/Despesa)"),
    apenas_ativas: bool = Query(True, description="Retornar apenas categorias ativas"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista todas as categorias do usuário autenticado
    
    - **tipo**: Filtrar por tipo (Receita/Despesa) - opcional
    - **apenas_ativas**: Se True, retorna apenas categorias ativas (padrão: True)
    """
    try:
        categoria_service = CategoriaService()
        categorias = categoria_service.listar_categorias(current_user.id_usuario, tipo, apenas_ativas)
        return categorias
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar categorias: {str(e)}"
        )


@router.get("/por-grupo", response_model=dict, summary="Listar categorias por grupo 50/30/20")
async def listar_categorias_por_grupo(
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista categorias de despesa agrupadas por grupo 50/30/20

    Retorna um dicionário com três chaves:
    - **Essencial**: Categorias essenciais (50%)
    - **Desejável**: Categorias desejáveis (30%)
    - **Poupança**: Categorias de poupança (20%)
    """
    try:
        categoria_service = CategoriaService()
        return categoria_service.listar_categorias_por_grupo(current_user.id_usuario)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar categorias por grupo: {str(e)}"
        )


@router.get("/{id_categoria}", response_model=CategoriaResponse, summary="Obter categoria")
async def obter_categoria(
    id_categoria: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Obtém uma categoria específica por ID
    
    - **id_categoria**: ID da categoria
    """
    try:
        categoria_service = CategoriaService()
        categoria = categoria_service.obter_categoria(id_categoria, current_user.id_usuario)
        
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )
        
        return categoria
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
            detail=f"Erro ao obter categoria: {str(e)}"
        )


@router.put("/{id_categoria}", response_model=CategoriaResponse, summary="Atualizar categoria")
async def atualizar_categoria(
    id_categoria: int,
    categoria: CategoriaUpdate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Atualiza uma categoria existente
    
    - **id_categoria**: ID da categoria
    - **nome**: Novo nome (opcional)
    - **tipo**: Novo tipo (opcional)
    - **grupo_50_30_20**: Novo grupo (opcional)
    - **cor**: Nova cor (opcional)
    """
    try:
        categoria_service = CategoriaService()
        categoria_atualizada = categoria_service.atualizar_categoria(id_categoria, current_user.id_usuario, categoria)
        return categoria_atualizada
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar categoria: {str(e)}"
        )


@router.delete("/{id_categoria}", status_code=status.HTTP_204_NO_CONTENT, summary="Desativar categoria")
async def desativar_categoria(
    id_categoria: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Desativa uma categoria (soft delete)

    - **id_categoria**: ID da categoria
    """
    try:
        categoria_service = CategoriaService()
        categoria_service.desativar_categoria(id_categoria, current_user.id_usuario)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao desativar categoria: {str(e)}"
        )

