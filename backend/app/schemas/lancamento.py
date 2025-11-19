"""
Schemas Pydantic para Lançamento
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime, date
from decimal import Decimal


class LancamentoBase(BaseModel):
    """Schema base para Lançamento"""
    id_conta: int = Field(..., description="ID da conta financeira")
    id_categoria: int = Field(..., description="ID da categoria")
    tipo: Literal["Receita", "Despesa"] = Field(..., description="Tipo do lançamento")
    valor: Decimal = Field(..., gt=0, description="Valor do lançamento")
    data: date = Field(..., description="Data do lançamento")
    descricao: Optional[str] = Field(None, max_length=255, description="Descrição do lançamento")
    pago: bool = Field(default=False, description="Se o lançamento foi pago/recebido")


class LancamentoCreate(LancamentoBase):
    """Schema para criação de Lançamento"""
    pass


class LancamentoUpdate(BaseModel):
    """Schema para atualização de Lançamento"""
    id_conta: Optional[int] = None
    id_categoria: Optional[int] = None
    tipo: Optional[Literal["Receita", "Despesa"]] = None
    valor: Optional[Decimal] = Field(None, gt=0)
    data: Optional[date] = None
    descricao: Optional[str] = Field(None, max_length=255)
    pago: Optional[bool] = None


class LancamentoInDB(LancamentoBase):
    """Schema para Lançamento no banco de dados"""
    id_lancamento: int
    id_usuario: int
    origem: Literal["Manual", "Recorrente"] = "Manual"
    id_recorrencia: Optional[int] = None
    data_criacao: datetime
    
    model_config = ConfigDict(from_attributes=True)


class LancamentoResponse(LancamentoBase):
    """Schema para resposta da API"""
    id_lancamento: int
    id_usuario: int
    origem: str
    id_recorrencia: Optional[int] = None
    data_criacao: datetime
    
    model_config = ConfigDict(from_attributes=True)


class LancamentoComDetalhes(LancamentoResponse):
    """Schema para Lançamento com detalhes de conta e categoria"""
    nome_conta: str
    tipo_conta: str
    nome_categoria: str
    grupo_categoria: str
    cor_categoria: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

