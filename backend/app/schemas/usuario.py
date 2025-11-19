"""
Schemas Pydantic para Usuario
Define os modelos de entrada e saída da API
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime


class UsuarioBase(BaseModel):
    """Schema base para Usuario"""
    nome: str = Field(..., min_length=3, max_length=150, description="Nome completo do usuário")
    email: EmailStr = Field(..., description="Email do usuário")


class UsuarioCreate(UsuarioBase):
    """Schema para criação de Usuario"""
    senha: str = Field(..., min_length=6, max_length=100, description="Senha do usuário")


class UsuarioUpdate(BaseModel):
    """Schema para atualização de Usuario"""
    nome: Optional[str] = Field(None, min_length=3, max_length=150)
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=6, max_length=100)
    ativo: Optional[bool] = None


class UsuarioInDB(UsuarioBase):
    """Schema para Usuario no banco de dados"""
    id_usuario: int
    senha_hash: str
    data_criacao: datetime
    data_atualizacao: Optional[datetime] = None
    ativo: bool = True
    
    model_config = ConfigDict(from_attributes=True)


class UsuarioResponse(UsuarioBase):
    """Schema para resposta da API (sem senha)"""
    id_usuario: int
    data_criacao: datetime
    data_atualizacao: Optional[datetime] = None
    ativo: bool
    
    model_config = ConfigDict(from_attributes=True)


class UsuarioLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    senha: str


class Token(BaseModel):
    """Schema para token de autenticação"""
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


class TokenData(BaseModel):
    """Schema para dados do token"""
    id_usuario: Optional[int] = None
    email: Optional[str] = None

