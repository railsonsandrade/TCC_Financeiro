"""
Schemas Pydantic para Conta Financeira
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from decimal import Decimal


class ContaFinanceiraBase(BaseModel):
    """Schema base para Conta Financeira"""
    nome: str = Field(..., min_length=1, max_length=100, description="Nome da conta")
    tipo: Literal["Conta Corrente", "Poupança", "Carteira", "Outro"] = Field(..., description="Tipo da conta")
    saldo_inicial: Decimal = Field(default=0.00, ge=0, description="Saldo inicial da conta")
    cor: Optional[str] = Field(default='#3B82F6', max_length=7, description="Cor hexadecimal da conta")


class ContaFinanceiraCreate(ContaFinanceiraBase):
    """Schema para criação de Conta Financeira"""
    pass


class ContaFinanceiraUpdate(BaseModel):
    """Schema para atualização de Conta Financeira"""
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    tipo: Optional[Literal["Conta Corrente", "Poupança", "Carteira", "Outro"]] = None
    saldo_inicial: Optional[Decimal] = Field(None, ge=0)
    ativa: Optional[bool] = None
    cor: Optional[str] = Field(None, max_length=7)


class ContaFinanceiraInDB(ContaFinanceiraBase):
    """Schema para Conta Financeira no banco de dados"""
    id_conta: int
    id_usuario: int
    data_criacao: datetime
    ativa: bool = True
    cor: Optional[str] = '#3B82F6'
    
    model_config = ConfigDict(from_attributes=True)


class ContaFinanceiraResponse(ContaFinanceiraBase):
    """Schema para resposta da API"""
    id_conta: int
    id_usuario: int
    data_criacao: datetime
    ativa: bool
    
    model_config = ConfigDict(from_attributes=True)


class ContaFinanceiraComSaldo(ContaFinanceiraResponse):
    """Schema para Conta Financeira com saldo calculado"""
    saldo_atual: Decimal = Field(..., description="Saldo atual calculado")
    total_receitas: Decimal = Field(default=0.00, description="Total de receitas")
    total_despesas: Decimal = Field(default=0.00, description="Total de despesas")
    
    model_config = ConfigDict(from_attributes=True)

