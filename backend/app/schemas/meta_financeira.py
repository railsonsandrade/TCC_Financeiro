"""
Schemas Pydantic para Meta Financeira
"""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, Literal
from datetime import datetime, date
from decimal import Decimal


class MetaFinanceiraBase(BaseModel):
    """Schema base para Meta Financeira"""
    nome: str = Field(..., min_length=1, max_length=150, description="Nome da meta")
    valor_alvo: Decimal = Field(..., gt=0, description="Valor alvo da meta")
    data_inicio: date = Field(..., description="Data de início da meta")
    data_fim_prev: Optional[date] = Field(None, description="Data prevista para conclusão")
    
    @field_validator('data_fim_prev')
    @classmethod
    def validar_data_fim(cls, v, info):
        if v and 'data_inicio' in info.data and v < info.data['data_inicio']:
            raise ValueError('Data fim deve ser maior ou igual à data início')
        return v


class MetaFinanceiraCreate(MetaFinanceiraBase):
    """Schema para criação de Meta Financeira"""
    valor_atual: Decimal = Field(default=0.00, ge=0, description="Valor atual economizado")


class MetaFinanceiraUpdate(BaseModel):
    """Schema para atualização de Meta Financeira"""
    nome: Optional[str] = Field(None, min_length=1, max_length=150)
    valor_alvo: Optional[Decimal] = Field(None, gt=0)
    valor_atual: Optional[Decimal] = Field(None, ge=0)
    data_inicio: Optional[date] = None
    data_fim_prev: Optional[date] = None
    status: Optional[Literal["Em Andamento", "Concluída", "Cancelada"]] = None


class MetaFinanceiraInDB(MetaFinanceiraBase):
    """Schema para Meta Financeira no banco de dados"""
    id_meta: int
    id_usuario: int
    valor_atual: Decimal
    status: Literal["Em Andamento", "Concluída", "Cancelada"]
    data_criacao: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MetaFinanceiraResponse(MetaFinanceiraBase):
    """Schema para resposta da API"""
    id_meta: int
    id_usuario: int
    valor_atual: Decimal
    status: str
    data_criacao: datetime
    percentual_atingido: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)


class MetaFinanceiraComProgresso(MetaFinanceiraResponse):
    """Schema para Meta Financeira com cálculo de progresso"""
    percentual_atingido: float = Field(..., description="Percentual atingido da meta")
    valor_faltante: Decimal = Field(..., description="Valor que falta para atingir a meta")
    dias_restantes: Optional[int] = Field(None, description="Dias restantes até a data prevista")
    
    model_config = ConfigDict(from_attributes=True)

