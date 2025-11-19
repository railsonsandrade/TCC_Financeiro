"""
Service para lógica de negócio relacionada a Categoria
"""

from typing import Optional, List
from app.repositories.categoria_repository import CategoriaRepository
from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaResponse
)
import app.utils.database as db_module


class CategoriaService:
    """Service para gerenciar lógica de negócio de Categoria"""

    def __init__(self):
        self.repository = CategoriaRepository(db_module.db)
    
    def criar_categoria(self, id_usuario: int, categoria: CategoriaCreate) -> CategoriaResponse:
        """
        Cria uma nova categoria
        
        Regras de negócio:
        - Nome da categoria deve ser único para o usuário
        - Grupo 50/30/20 deve ser válido
        
        Args:
            id_usuario: ID do usuário dono da categoria
            categoria: Dados da categoria a ser criada
        
        Returns:
            Categoria criada
        
        Raises:
            ValueError: Se nome já existe ou dados inválidos
        """
        # RN008: Validar unicidade do nome da categoria
        if self.repository.exists_by_nome(id_usuario, categoria.nome):
            raise ValueError(f"Já existe uma categoria com o nome '{categoria.nome}'")
        
        # Criar categoria
        categoria_db = self.repository.create(id_usuario, categoria)
        
        return CategoriaResponse(
            id_categoria=categoria_db.id_categoria,
            id_usuario=categoria_db.id_usuario,
            nome=categoria_db.nome,
            tipo=categoria_db.tipo,
            grupo_50_30_20=categoria_db.grupo_50_30_20,
            cor=categoria_db.cor,
            ativa=categoria_db.ativa
        )
    
    def obter_categoria(self, id_categoria: int, id_usuario: int) -> Optional[CategoriaResponse]:
        """
        Obtém uma categoria por ID
        
        Args:
            id_categoria: ID da categoria
            id_usuario: ID do usuário (para validação de propriedade)
        
        Returns:
            Categoria encontrada ou None
        
        Raises:
            ValueError: Se categoria não pertence ao usuário
        """
        categoria = self.repository.get_by_id(id_categoria)
        
        if not categoria:
            return None
        
        # Validar propriedade
        if categoria.id_usuario != id_usuario:
            raise ValueError("Categoria não pertence ao usuário")
        
        return CategoriaResponse(
            id_categoria=categoria.id_categoria,
            id_usuario=categoria.id_usuario,
            nome=categoria.nome,
            tipo=categoria.tipo,
            grupo_50_30_20=categoria.grupo_50_30_20,
            cor=categoria.cor,
            ativa=categoria.ativa
        )
    
    def listar_categorias(
        self,
        id_usuario: int,
        tipo: Optional[str] = None,
        apenas_ativas: bool = True
    ) -> List[CategoriaResponse]:
        """
        Lista categorias de um usuário
        
        Args:
            id_usuario: ID do usuário
            tipo: Filtrar por tipo (Receita/Despesa)
            apenas_ativas: Se True, retorna apenas categorias ativas
        
        Returns:
            Lista de categorias
        """
        categorias = self.repository.get_by_usuario(id_usuario, tipo, apenas_ativas)
        
        return [
            CategoriaResponse(
                id_categoria=c.id_categoria,
                id_usuario=c.id_usuario,
                nome=c.nome,
                tipo=c.tipo,
                grupo_50_30_20=c.grupo_50_30_20,
                cor=c.cor,
                ativa=c.ativa
            )
            for c in categorias
        ]
    
    def listar_por_grupo(
        self,
        id_usuario: int,
        grupo: str
    ) -> List[CategoriaResponse]:
        """
        Lista categorias por grupo 50/30/20

        Args:
            id_usuario: ID do usuário
            grupo: Grupo (Essencial/Desejável/Poupança)

        Returns:
            Lista de categorias (apenas ativas)
        """
        categorias = self.repository.get_by_grupo(id_usuario, grupo)
        
        return [
            CategoriaResponse(
                id_categoria=c.id_categoria,
                id_usuario=c.id_usuario,
                nome=c.nome,
                tipo=c.tipo,
                grupo_50_30_20=c.grupo_50_30_20,
                cor=c.cor,
                ativa=c.ativa
            )
            for c in categorias
        ]

    def atualizar_categoria(
        self,
        id_categoria: int,
        id_usuario: int,
        categoria: CategoriaUpdate
    ) -> CategoriaResponse:
        """
        Atualiza uma categoria

        Args:
            id_categoria: ID da categoria
            id_usuario: ID do usuário (para validação de propriedade)
            categoria: Dados a serem atualizados

        Returns:
            Categoria atualizada

        Raises:
            ValueError: Se categoria não existe, não pertence ao usuário ou nome já existe
        """
        # Verificar se categoria existe e pertence ao usuário
        categoria_existente = self.repository.get_by_id(id_categoria)
        if not categoria_existente:
            raise ValueError("Categoria não encontrada")

        if categoria_existente.id_usuario != id_usuario:
            raise ValueError("Categoria não pertence ao usuário")

        # Verificar unicidade do nome (se estiver sendo alterado)
        if categoria.nome and categoria.nome != categoria_existente.nome:
            if self.repository.exists_by_nome(id_usuario, categoria.nome, exclude_id=id_categoria):
                raise ValueError(f"Já existe uma categoria com o nome '{categoria.nome}'")

        # Atualizar
        categoria_atualizada = self.repository.update(id_categoria, categoria)

        return CategoriaResponse(
            id_categoria=categoria_atualizada.id_categoria,
            id_usuario=categoria_atualizada.id_usuario,
            nome=categoria_atualizada.nome,
            tipo=categoria_atualizada.tipo,
            grupo_50_30_20=categoria_atualizada.grupo_50_30_20,
            cor=categoria_atualizada.cor,
            ativa=categoria_atualizada.ativa
        )

    def desativar_categoria(self, id_categoria: int, id_usuario: int) -> bool:
        """
        Desativa uma categoria (soft delete)

        Args:
            id_categoria: ID da categoria
            id_usuario: ID do usuário (para validação de propriedade)

        Returns:
            True se desativada com sucesso

        Raises:
            ValueError: Se categoria não existe ou não pertence ao usuário
        """
        # Verificar se categoria existe e pertence ao usuário
        categoria = self.repository.get_by_id(id_categoria)
        if not categoria:
            raise ValueError("Categoria não encontrada")

        if categoria.id_usuario != id_usuario:
            raise ValueError("Categoria não pertence ao usuário")

        return self.repository.delete(id_categoria)

    def listar_categorias_por_grupo(self, id_usuario: int) -> dict:
        """
        Lista categorias agrupadas por grupo 50/30/20

        Args:
            id_usuario: ID do usuário

        Returns:
            Dicionário com categorias agrupadas por grupo
        """
        categorias = self.listar_categorias(id_usuario, tipo="Despesa")

        grupos = {
            "Essencial": [],
            "Desejável": [],
            "Poupança": []
        }

        for categoria in categorias:
            if categoria.grupo_50_30_20 in grupos:
                grupos[categoria.grupo_50_30_20].append(categoria)

        return grupos

