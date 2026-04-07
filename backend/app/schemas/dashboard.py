from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class DashboardWidgetCreate(BaseModel):
    id_widget: str = Field(..., description="ID unico gerado no front-end para o widget")
    tipo: str = Field(..., description="Tipo do grafico ou card (ex: 'ResumoTotal', 'BarCategoria')")
    x: int = Field(..., description="Posição no eixo horizontal do grid")
    y: int = Field(..., description="Posição no eixo vertical do grid")
    w: int = Field(..., description="Largura do widget")
    h: int = Field(..., description="Altura do widget")
    configuracao: Optional[Dict[str, Any]] = Field(None, description="Configurações Json customizadas")

class DashboardWidgetResponse(DashboardWidgetCreate):
    id_usuario: int
    data_criacao: datetime
    
class DashboardLayoutUpdate(BaseModel):
    widgets: List[DashboardWidgetCreate] = Field(..., description="Lista completa de widgets e posicoes atuais")
