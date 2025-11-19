"""
Dependências para as rotas da API
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.security import SecurityUtils
from app.services.usuario_service import UsuarioService
from app.schemas.usuario import UsuarioResponse


# Security scheme para JWT
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UsuarioResponse:
    """
    Dependência para obter o usuário autenticado a partir do token JWT
    
    Args:
        credentials: Credenciais HTTP Bearer (token JWT)
    
    Returns:
        Usuário autenticado
    
    Raises:
        HTTPException: Se token inválido ou usuário não encontrado
    """
    token = credentials.credentials
    
    # Decodificar token
    payload = SecurityUtils.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Obter ID do usuário do payload
    id_usuario: Optional[int] = payload.get("id_usuario")
    if id_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Buscar usuário no banco
    usuario_service = UsuarioService()
    usuario = usuario_service.obter_usuario(id_usuario)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )
    
    return usuario


async def get_current_active_user(
    current_user: UsuarioResponse = Depends(get_current_user)
) -> UsuarioResponse:
    """
    Dependência para garantir que o usuário está ativo
    
    Args:
        current_user: Usuário autenticado
    
    Returns:
        Usuário ativo
    
    Raises:
        HTTPException: Se usuário inativo
    """
    if not current_user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    return current_user

