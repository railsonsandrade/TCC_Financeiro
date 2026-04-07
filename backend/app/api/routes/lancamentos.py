"""
Rotas de lançamentos
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.lancamento import (
    LancamentoCreate,
    LancamentoUpdate,
    LancamentoResponse,
    LancamentoComDetalhes
)
from app.schemas.usuario import UsuarioResponse
from app.services.lancamento_service import LancamentoService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/lancamentos", tags=["Lançamentos"])


@router.post("", response_model=LancamentoResponse, status_code=status.HTTP_201_CREATED, summary="Criar lançamento")
async def criar_lancamento(
    lancamento: LancamentoCreate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Cria um novo lançamento (receita ou despesa)
    
    - **id_conta**: ID da conta
    - **id_categoria**: ID da categoria
    - **tipo**: Tipo (Receita ou Despesa)
    - **valor**: Valor do lançamento (deve ser positivo)
    - **data**: Data do lançamento
    - **descricao**: Descrição
    - **origem**: Origem (Manual ou Recorrente)
    - **pago**: Se o lançamento foi pago/recebido
    """
    try:
        lancamento_service = LancamentoService()
        novo_lancamento = lancamento_service.criar_lancamento(current_user.id_usuario, lancamento)
        return novo_lancamento
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar lançamento: {str(e)}"
        )


@router.get("", response_model=List[LancamentoResponse], summary="Listar lançamentos")
async def listar_lancamentos(
    data_inicio: Optional[date] = Query(None, description="Data inicial do período"),
    data_fim: Optional[date] = Query(None, description="Data final do período"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (Receita/Despesa)"),
    id_conta: Optional[int] = Query(None, description="Filtrar por conta"),
    id_categoria: Optional[int] = Query(None, description="Filtrar por categoria"),
    pago: Optional[bool] = Query(None, description="Filtrar por status de pagamento"),
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista lançamentos do usuário autenticado com filtros opcionais
    """
    try:
        lancamento_service = LancamentoService()
        lancamentos = lancamento_service.listar_lancamentos(
            id_usuario=current_user.id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim,
            tipo=tipo,
            id_conta=id_conta,
            id_categoria=id_categoria,
            pago=pago,
            skip=skip,
            limit=limit
        )
        return lancamentos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar lançamentos: {str(e)}"
        )


@router.get("/detalhes", response_model=List[LancamentoComDetalhes], summary="Listar lançamentos com detalhes")
async def listar_lancamentos_com_detalhes(
    data_inicio: Optional[date] = Query(None, description="Data inicial do período"),
    data_fim: Optional[date] = Query(None, description="Data final do período"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (Receita/Despesa)"),
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Lista lançamentos com detalhes de conta e categoria (JOIN)
    """
    try:
        lancamento_service = LancamentoService()
        lancamentos = lancamento_service.listar_lancamentos_com_detalhes(
            id_usuario=current_user.id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim,
            tipo=tipo,
            skip=skip,
            limit=limit
        )
        return lancamentos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar lançamentos: {str(e)}"
        )


@router.get("/totais", summary="Obter totais do período")
async def obter_totais_periodo(
    data_inicio: date = Query(..., description="Data inicial do período"),
    data_fim: date = Query(..., description="Data final do período"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Calcula totais de receitas e despesas em um período
    """
    try:
        lancamento_service = LancamentoService()
        totais = lancamento_service.obter_totais_periodo(
            id_usuario=current_user.id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim
        )
        return totais
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular totais: {str(e)}"
        )


@router.get("/analytics/gastos-por-categoria", summary="Estatísticas agrupadas de gastos por categoria")
async def gastos_por_categoria(
    mes_ano: str = Query(..., description="Formato YYYY-MM"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """Retorna os gastos agrupados por categoria para gráficos (ex: Pizza ou Barras)"""
    from app.utils.database import db
    try:
        query = """
            SELECT categoria, tipo_categoria, grupo_50_30_20, CAST(total_valor AS FLOAT) as valor
            FROM vw_resumo_categoria_mes
            WHERE id_usuario = ? AND mes_ano = ?
        """
        rows = db.fetch_all(query, (current_user.id_usuario, mes_ano))
        return [dict(r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no analytic: {str(e)}")


@router.get("/analytics/evolucao-saldo", summary="Evolução financeira do usuário mês a mês")
async def evolucao_saldo(
    limite_meses: int = Query(6, description="Quantidade de meses para retroceder"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """Retorna o balanço de despesas/receitas agregado por mês para gráficos de linha/área"""
    from app.utils.database import db
    try:
        query = """
            SELECT 
                strftime('%Y-%m', data) as mes_ano,
                SUM(CASE WHEN tipo = 'Receita' THEN valor ELSE 0 END) as receitas,
                SUM(CASE WHEN tipo = 'Despesa' THEN valor ELSE 0 END) as despesas
            FROM lancamento
            WHERE id_usuario = ? AND pago = 1
            GROUP BY strftime('%Y-%m', data)
            ORDER BY mes_ano DESC
            LIMIT ?
        """
        rows = db.fetch_all(query, (current_user.id_usuario, limite_meses))
        
        # Inverter para ficar cronológico
        resultado_cronologico = [dict(r) for r in rows][::-1]
        return resultado_cronologico
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no analytic de saldo: {str(e)}")



@router.get("/{id_lancamento}", response_model=LancamentoResponse, summary="Obter lançamento")
async def obter_lancamento(
    id_lancamento: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Obtém um lançamento específico por ID
    """
    try:
        lancamento_service = LancamentoService()
        lancamento = lancamento_service.obter_lancamento(id_lancamento, current_user.id_usuario)

        if not lancamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lançamento não encontrado"
            )

        return lancamento
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
            detail=f"Erro ao obter lançamento: {str(e)}"
        )


@router.put("/{id_lancamento}", response_model=LancamentoResponse, summary="Atualizar lançamento")
async def atualizar_lancamento(
    id_lancamento: int,
    lancamento: LancamentoUpdate,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Atualiza um lançamento existente
    """
    try:
        lancamento_service = LancamentoService()
        lancamento_atualizado = lancamento_service.atualizar_lancamento(
            id_lancamento, current_user.id_usuario, lancamento
        )
        return lancamento_atualizado
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar lançamento: {str(e)}"
        )


@router.patch("/{id_lancamento}/marcar-pago", response_model=LancamentoResponse, summary="Marcar como pago")
async def marcar_como_pago(
    id_lancamento: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Marca um lançamento como pago/recebido
    """
    try:
        lancamento_service = LancamentoService()
        lancamento_atualizado = lancamento_service.marcar_como_pago(id_lancamento, current_user.id_usuario)
        return lancamento_atualizado
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao marcar lançamento como pago: {str(e)}"
        )


@router.delete("/{id_lancamento}", status_code=status.HTTP_204_NO_CONTENT, summary="Excluir lançamento")
async def excluir_lancamento(
    id_lancamento: int,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Exclui um lançamento permanentemente
    """
    try:
        lancamento_service = LancamentoService()
        lancamento_service.excluir_lancamento(id_lancamento, current_user.id_usuario)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir lançamento: {str(e)}"
        )

