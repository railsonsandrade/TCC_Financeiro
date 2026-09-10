"""
Service para lógica de negócio relacionada a Usuario
"""

from typing import Optional, List
from datetime import datetime, timedelta
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    UsuarioLogin,
    Token,
    TokenData
)
from app.utils.security import SecurityUtils
import app.utils.database as db_module


class UsuarioService:
    """Service para gerenciar lógica de negócio de Usuario"""

    def __init__(self):
        self.repository = UsuarioRepository(db_module.db)
    
    def criar_usuario(self, usuario: UsuarioCreate) -> UsuarioResponse:
        """
        Cria um novo usuário
        
        Regras de negócio:
        - Email deve ser único
        - Senha deve ter no mínimo 6 caracteres
        
        Args:
            usuario: Dados do usuário a ser criado
        
        Returns:
            Usuario criado
        
        Raises:
            ValueError: Se email já existe ou dados inválidos
        """
        # RN008: Validar unicidade do email
        if self.repository.exists_by_email(usuario.email):
            raise ValueError(f"Email '{usuario.email}' já está cadastrado")
        
        # Criar usuário
        usuario_db = self.repository.create(usuario)
        
        # Retornar sem a senha
        return UsuarioResponse(
            id_usuario=usuario_db.id_usuario,
            nome=usuario_db.nome,
            email=usuario_db.email,
            data_criacao=usuario_db.data_criacao,
            data_atualizacao=usuario_db.data_atualizacao,
            ativo=usuario_db.ativo
        )
    
    def autenticar(self, login: UsuarioLogin) -> Token:
        """
        Autentica um usuário e retorna um token JWT
        
        Args:
            login: Credenciais de login
        
        Returns:
            Token de acesso
        
        Raises:
            ValueError: Se credenciais inválidas
        """
        # Buscar usuário por email
        usuario = self.repository.get_by_email(login.email)
        
        if not usuario:
            raise ValueError("Email ou senha incorretos")
        
        # Verificar se usuário está ativo
        if not usuario.ativo:
            raise ValueError("Usuário inativo")
        
        # Verificar senha
        if not SecurityUtils.verify_password(login.senha, usuario.senha_hash):
            raise ValueError("Email ou senha incorretos")
        
        # Gerar token JWT
        token_data = TokenData(
            id_usuario=usuario.id_usuario,
            email=usuario.email
        )
        
        access_token = SecurityUtils.create_access_token(
            data={"sub": usuario.email, "id_usuario": usuario.id_usuario}
        )

        # Criar resposta do usuário (sem senha)
        usuario_response = UsuarioResponse(
            id_usuario=usuario.id_usuario,
            nome=usuario.nome,
            email=usuario.email,
            data_criacao=usuario.data_criacao,
            data_atualizacao=usuario.data_atualizacao,
            ativo=usuario.ativo
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            usuario=usuario_response
        )
    
    def obter_usuario(self, id_usuario: int) -> Optional[UsuarioResponse]:
        """
        Obtém um usuário por ID
        
        Args:
            id_usuario: ID do usuário
        
        Returns:
            Usuario encontrado ou None
        """
        usuario = self.repository.get_by_id(id_usuario)
        
        if not usuario:
            return None
        
        return UsuarioResponse(
            id_usuario=usuario.id_usuario,
            nome=usuario.nome,
            email=usuario.email,
            data_criacao=usuario.data_criacao,
            data_atualizacao=usuario.data_atualizacao,
            ativo=usuario.ativo
        )
    
    def atualizar_usuario(self, id_usuario: int, usuario: UsuarioUpdate) -> UsuarioResponse:
        """
        Atualiza um usuário
        
        Args:
            id_usuario: ID do usuário
            usuario: Dados a serem atualizados
        
        Returns:
            Usuario atualizado
        
        Raises:
            ValueError: Se usuário não existe ou email já cadastrado
        """
        # Verificar se usuário existe
        usuario_existente = self.repository.get_by_id(id_usuario)
        if not usuario_existente:
            raise ValueError("Usuário não encontrado")
        
        # Verificar unicidade do email (se estiver sendo alterado)
        if usuario.email and usuario.email != usuario_existente.email:
            if self.repository.exists_by_email(usuario.email, exclude_id=id_usuario):
                raise ValueError(f"Email '{usuario.email}' já está cadastrado")
        
        # Atualizar
        usuario_atualizado = self.repository.update(id_usuario, usuario)
        
        return UsuarioResponse(
            id_usuario=usuario_atualizado.id_usuario,
            nome=usuario_atualizado.nome,
            email=usuario_atualizado.email,
            data_criacao=usuario_atualizado.data_criacao,
            data_atualizacao=usuario_atualizado.data_atualizacao,
            ativo=usuario_atualizado.ativo
        )

    def desativar_usuario(self, id_usuario: int) -> bool:
        """
        Desativa um usuário (soft delete)

        Args:
            id_usuario: ID do usuário

        Returns:
            True se desativado com sucesso

        Raises:
            ValueError: Se usuário não existe
        """
        usuario = self.repository.get_by_id(id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        return self.repository.delete(id_usuario)

    def listar_usuarios(self, skip: int = 0, limit: int = 100, apenas_ativos: bool = False) -> List[UsuarioResponse]:
        """
        Lista todos os usuários com paginação

        Args:
            skip: Número de registros a pular
            limit: Número máximo de registros
            apenas_ativos: Se True, retorna apenas usuários ativos

        Returns:
            Lista de usuários
        """
        usuarios = self.repository.get_all(skip=skip, limit=limit)

        # Filtrar apenas ativos se solicitado
        if apenas_ativos:
            usuarios = [u for u in usuarios if u.ativo]

        return [
            UsuarioResponse(
                id_usuario=u.id_usuario,
                nome=u.nome,
                email=u.email,
                data_criacao=u.data_criacao,
                data_atualizacao=u.data_atualizacao,
                ativo=u.ativo
            )
            for u in usuarios
        ]

    def atualizar_usuario(self, id_usuario: int, update_data: UsuarioUpdate) -> UsuarioResponse:
        # Se estiver atualizando o email, verificar se ja existe
        if update_data.email:
            existing = self.repository.get_by_email(update_data.email)
            if existing and existing.id_usuario != id_usuario:
                raise ValueError(f"Email '{update_data.email}' já está em uso")
                
        usuario_db = self.repository.update(id_usuario, update_data)
        if not usuario_db:
            raise ValueError("Usuário não encontrado")
        return UsuarioResponse.model_validate(usuario_db)

