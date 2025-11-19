"""
Repository para operações de banco de dados relacionadas a Usuario
"""

from typing import Optional, List
from datetime import datetime
from app.utils.database import DatabaseConnection
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioInDB
from app.utils.security import SecurityUtils


class UsuarioRepository:
    """Repository para gerenciar operações de Usuario no banco de dados"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
    
    def create(self, usuario: UsuarioCreate) -> UsuarioInDB:
        """
        Cria um novo usuário no banco de dados
        
        Args:
            usuario: Dados do usuário a ser criado
        
        Returns:
            Usuario criado com ID
        """
        senha_hash = SecurityUtils.hash_password(usuario.senha)
        
        query = """
            INSERT INTO usuario (nome, email, senha_hash, data_criacao, ativo)
            VALUES (?, ?, ?, ?, ?)
        """
        
        params = (
            usuario.nome,
            usuario.email,
            senha_hash,
            datetime.now(),
            True
        )
        
        id_usuario = self.db.execute_insert_with_identity(query, params)
        
        return self.get_by_id(id_usuario)
    
    def get_by_id(self, id_usuario: int) -> Optional[UsuarioInDB]:
        """
        Busca um usuário por ID
        
        Args:
            id_usuario: ID do usuário
        
        Returns:
            Usuario encontrado ou None
        """
        query = """
            SELECT id_usuario, nome, email, senha_hash, data_criacao, data_atualizacao, ativo
            FROM usuario
            WHERE id_usuario = ?
        """
        
        result = self.db.execute_query(query, (id_usuario,))

        if result:
            row = result[0]
            return UsuarioInDB(
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                email=row['email'],
                senha_hash=row['senha_hash'],
                data_criacao=row['data_criacao'],
                data_atualizacao=row['data_atualizacao'],
                ativo=bool(row['ativo'])
            )
        
        return None
    
    def get_by_email(self, email: str) -> Optional[UsuarioInDB]:
        """
        Busca um usuário por email
        
        Args:
            email: Email do usuário
        
        Returns:
            Usuario encontrado ou None
        """
        query = """
            SELECT id_usuario, nome, email, senha_hash, data_criacao, data_atualizacao, ativo
            FROM usuario
            WHERE email = ?
        """
        
        result = self.db.execute_query(query, (email,))

        if result:
            row = result[0]
            return UsuarioInDB(
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                email=row['email'],
                senha_hash=row['senha_hash'],
                data_criacao=row['data_criacao'],
                data_atualizacao=row['data_atualizacao'],
                ativo=bool(row['ativo'])
            )
        
        return None
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[UsuarioInDB]:
        """
        Lista todos os usuários com paginação
        
        Args:
            skip: Número de registros a pular
            limit: Número máximo de registros a retornar
        
        Returns:
            Lista de usuários
        """
        query = """
            SELECT id_usuario, nome, email, senha_hash, data_criacao, data_atualizacao, ativo
            FROM usuario
            ORDER BY data_criacao DESC
            LIMIT ? OFFSET ?
        """
        
        results = self.db.execute_query(query, (limit, skip))
        
        usuarios = []
        for row in results:
            usuarios.append(UsuarioInDB(
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                email=row['email'],
                senha_hash=row['senha_hash'],
                data_criacao=row['data_criacao'],
                data_atualizacao=row['data_atualizacao'],
                ativo=bool(row['ativo'])
            ))
        
        return usuarios
    
    def update(self, id_usuario: int, usuario: UsuarioUpdate) -> Optional[UsuarioInDB]:
        """
        Atualiza um usuário existente

        Args:
            id_usuario: ID do usuário
            usuario: Dados a serem atualizados

        Returns:
            Usuario atualizado ou None
        """
        # Construir query dinamicamente baseado nos campos fornecidos
        update_fields = []
        params = []

        if usuario.nome is not None:
            update_fields.append("nome = ?")
            params.append(usuario.nome)

        if usuario.email is not None:
            update_fields.append("email = ?")
            params.append(usuario.email)

        if usuario.senha is not None:
            update_fields.append("senha_hash = ?")
            params.append(SecurityUtils.hash_password(usuario.senha))

        if usuario.ativo is not None:
            update_fields.append("ativo = ?")
            params.append(usuario.ativo)

        if not update_fields:
            return self.get_by_id(id_usuario)

        update_fields.append("data_atualizacao = ?")
        params.append(datetime.now())

        params.append(id_usuario)

        query = f"""
            UPDATE usuario
            SET {', '.join(update_fields)}
            WHERE id_usuario = ?
        """

        self.db.execute_non_query(query, tuple(params))

        return self.get_by_id(id_usuario)

    def delete(self, id_usuario: int) -> bool:
        """
        Deleta um usuário (soft delete - marca como inativo)

        Args:
            id_usuario: ID do usuário

        Returns:
            True se deletado com sucesso
        """
        query = """
            UPDATE usuario
            SET ativo = ?, data_atualizacao = ?
            WHERE id_usuario = ?
        """

        rows_affected = self.db.execute_non_query(query, (False, datetime.now(), id_usuario))

        return rows_affected > 0

    def exists_by_email(self, email: str, exclude_id: Optional[int] = None) -> bool:
        """
        Verifica se já existe um usuário com o email fornecido

        Args:
            email: Email a verificar
            exclude_id: ID do usuário a excluir da verificação (útil para updates)

        Returns:
            True se o email já existe
        """
        if exclude_id:
            query = "SELECT COUNT(*) FROM usuario WHERE email = ? AND id_usuario != ?"
            params = (email, exclude_id)
        else:
            query = "SELECT COUNT(*) FROM usuario WHERE email = ?"
            params = (email,)

        count = self.db.execute_scalar(query, params)

        return count > 0

