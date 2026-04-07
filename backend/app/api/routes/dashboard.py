from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.api.routes.auth import get_current_user
from app.schemas.usuario import UsuarioResponse
from app.schemas.dashboard import DashboardLayoutUpdate, DashboardWidgetResponse, DashboardWidgetCreate
from app.utils.database import db
import json

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/layout", response_model=List[DashboardWidgetResponse], summary="Obter layout do dashboard")
async def get_layout(current_user: UsuarioResponse = Depends(get_current_user)):
    """Retorna todos os widgets e suas posições configurados pelo usuário."""
    query = """
        SELECT id_widget, id_usuario, tipo, x, y, w, h, configuracao, data_criacao
        FROM dashboard_widget 
        WHERE id_usuario = ?
    """
    rows = db.fetch_all(query, (current_user.id_usuario,))
    widgets = []
    for row in rows:
        widget_dict = dict(row)
        if widget_dict.get('configuracao'):
            try:
                widget_dict['configuracao'] = json.loads(widget_dict['configuracao'])
            except Exception:
                widget_dict['configuracao'] = None
        widgets.append(widget_dict)
        
    return widgets


@router.post("/layout", summary="Salvar o layout do dashboard")
async def save_layout(
    layout: DashboardLayoutUpdate, 
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Salva completamente o state do layout do usuário. 
    Esta API sobrescreve os widgets antigos enviados pelos novos.
    """
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        
        # 1. Apagar todos os widgets atuais do usuário para gravar o layout limpo
        cursor.execute("DELETE FROM dashboard_widget WHERE id_usuario = ?", (current_user.id_usuario,))
        
        # 2. Inserir os novos widgets
        for widget in layout.widgets:
            config_str = json.dumps(widget.configuracao) if widget.configuracao else None
            
            cursor.execute("""
                INSERT INTO dashboard_widget (id_widget, id_usuario, tipo, x, y, w, h, configuracao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                widget.id_widget,
                current_user.id_usuario,
                widget.tipo,
                widget.x,
                widget.y,
                widget.w,
                widget.h,
                config_str
            ))
            
        conn.commit()
        return {"status": "success", "message": "Layout salvo com sucesso."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar layout do dashboard: {str(e)}"
        )
    finally:
        conn.close()
