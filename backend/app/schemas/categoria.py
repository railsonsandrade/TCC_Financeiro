"""
Schemas Pydantic para Categoria
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal


class CategoriaBase(BaseModel):
    """Schema base para Categoria"""
    nome: str = Field(..., min_length=1, max_length=100, description="Nome da categoria")
    tipo: Literal["Receita", "Despesa"] = Field(..., description="Tipo da categoria")
    grupo_50_30_20: Optional[Literal["Essencial", "Desejável", "Poupança"]] = Field(None, description="Grupo da regra 50/30/20 (apenas para Despesas)")
    cor: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Cor em hexadecimal (ex: #FF5733)")


class CategoriaCreate(CategoriaBase):
    """Schema para criação de Categoria"""
    pass


class CategoriaUpdate(BaseModel):
    """Schema para atualização de Categoria"""
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    tipo: Optional[Literal["Receita", "Despesa"]] = None
    grupo_50_30_20: Optional[Literal["Essencial", "Desejável", "Poupança"]] = None
    cor: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    ativa: Optional[bool] = None


class CategoriaInDB(CategoriaBase):
    """Schema para Categoria no banco de dados"""
    id_categoria: int
    id_usuario: int
    ativa: bool = True
    
    model_config = ConfigDict(from_attributes=True)


class CategoriaResponse(CategoriaBase):
    """Schema para resposta da API"""
    id_categoria: int
    id_usuario: int
    ativa: bool
    
    model_config = ConfigDict(from_attributes=True)

