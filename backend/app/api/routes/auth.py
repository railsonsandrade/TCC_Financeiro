"""
Rotas de autenticação
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.usuario import UsuarioLogin, Token, UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.services.usuario_service import UsuarioService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=Token, summary="Login de usuário")
async def login(login_data: UsuarioLogin):
    """
    Autentica um usuário e retorna um token JWT
    
    - **email**: Email do usuário
    - **senha**: Senha do usuário
    
    Retorna um token de acesso JWT válido por 30 minutos
    """
    try:
        usuario_service = UsuarioService()
        token = usuario_service.autenticar(login_data)
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao autenticar: {str(e)}"
        )


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, summary="Registrar novo usuário")
async def register(usuario: UsuarioCreate):
    """
    Registra um novo usuário no sistema
    
    - **nome**: Nome completo do usuário
    - **email**: Email único do usuário
    - **senha**: Senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)
    
    Retorna os dados do usuário criado
    """
    try:
        usuario_service = UsuarioService()
        novo_usuario = usuario_service.criar_usuario(usuario)
        return novo_usuario
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )


@router.get("/me", response_model=UsuarioResponse, summary="Obter usuário autenticado")
async def get_me(current_user: UsuarioResponse = Depends(get_current_user)):
    """
    Retorna os dados do usuário autenticado
    
    Requer autenticação via token JWT no header:
    ```
    Authorization: Bearer <token>
    ```
    """
    return current_user

@router.put("/me", response_model=UsuarioResponse, summary="Atualizar usuário autenticado")
async def update_me(usuario_update: UsuarioUpdate, current_user: UsuarioResponse = Depends(get_current_user)):
    """
    Atualiza os dados do usuário autenticado.
    """
    try:
        usuario_service = UsuarioService()
        updated_user = usuario_service.atualizar_usuario(current_user.id_usuario, usuario_update)
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar usuário: {str(e)}"
        )

