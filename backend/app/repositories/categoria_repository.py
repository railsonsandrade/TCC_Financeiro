"""
Repository para operações de banco de dados relacionadas a Categoria
"""

from typing import Optional, List
from app.utils.database import DatabaseConnection
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaInDB


class CategoriaRepository:
    """Repository para gerenciar operações de Categoria no banco de dados"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
    
    def create(self, id_usuario: int, categoria: CategoriaCreate) -> CategoriaInDB:
        """Cria uma nova categoria"""
        query = """
            INSERT INTO categoria (id_usuario, nome, tipo, grupo_50_30_20, cor, ativa)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        
        params = (
            id_usuario,
            categoria.nome,
            categoria.tipo,
            categoria.grupo_50_30_20,
            categoria.cor,
            True
        )
        
        id_categoria = self.db.execute_insert_with_identity(query, params)
        
        return self.get_by_id(id_categoria)
    
    def get_by_id(self, id_categoria: int) -> Optional[CategoriaInDB]:
        """Busca uma categoria por ID"""
        query = """
            SELECT id_categoria, id_usuario, nome, tipo, grupo_50_30_20, cor, ativa
            FROM categoria
            WHERE id_categoria = ?
        """
        
        result = self.db.execute_query(query, (id_categoria,))
        
        if result:
            row = result[0]
            return CategoriaInDB(
                id_categoria=row['id_categoria'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                tipo=row['tipo'],
                grupo_50_30_20=row['grupo_50_30_20'],
                cor=row['cor'],
                ativa=bool(row['ativa'])
            )
        
        return None
    
    def get_by_usuario(self, id_usuario: int, tipo: Optional[str] = None, apenas_ativas: bool = True) -> List[CategoriaInDB]:
        """Lista todas as categorias de um usuário, opcionalmente filtradas por tipo"""
        if tipo and apenas_ativas:
            query = """
                SELECT id_categoria, id_usuario, nome, tipo, grupo_50_30_20, cor, ativa
                FROM categoria
                WHERE id_usuario = ? AND tipo = ? AND ativa = 1
                ORDER BY nome
            """
            params = (id_usuario, tipo)
        elif tipo:
            query = """
                SELECT id_categoria, id_usuario, nome, tipo, grupo_50_30_20, cor, ativa
                FROM categoria
                WHERE id_usuario = ? AND tipo = ?
                ORDER BY nome
            """
            params = (id_usuario, tipo)
        elif apenas_ativas:
            query = """
                SELECT id_categoria, id_usuario, nome, tipo, grupo_50_30_20, cor, ativa
                FROM categoria
                WHERE id_usuario = ? AND ativa = 1
                ORDER BY nome
            """
            params = (id_usuario,)
        else:
            query = """
                SELECT id_categoria, id_usuario, nome, tipo, grupo_50_30_20, cor, ativa
                FROM categoria
                WHERE id_usuario = ?
                ORDER BY nome
            """
            params = (id_usuario,)
        
        results = self.db.execute_query(query, params)
        
        categorias = []
        for row in results:
            categorias.append(CategoriaInDB(
                id_categoria=row['id_categoria'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                tipo=row['tipo'],
                grupo_50_30_20=row['grupo_50_30_20'],
                cor=row['cor'],
                ativa=bool(row['ativa'])
            ))
        
        return categorias
    
    def get_by_grupo(self, id_usuario: int, grupo: str) -> List[CategoriaInDB]:
        """Lista categorias por grupo 50/30/20"""
        query = """
            SELECT id_categoria, id_usuario, nome, tipo, grupo_50_30_20, cor, ativa
            FROM categoria
            WHERE id_usuario = ? AND grupo_50_30_20 = ? AND ativa = 1
            ORDER BY nome
        """
        
        results = self.db.execute_query(query, (id_usuario, grupo))
        
        categorias = []
        for row in results:
            categorias.append(CategoriaInDB(
                id_categoria=row['id_categoria'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                tipo=row['tipo'],
                grupo_50_30_20=row['grupo_50_30_20'],
                cor=row['cor'],
                ativa=bool(row['ativa'])
            ))
        
        return categorias
    
    def update(self, id_categoria: int, categoria: CategoriaUpdate) -> Optional[CategoriaInDB]:
        """Atualiza uma categoria"""
        update_fields = []
        params = []

        if categoria.nome is not None:
            update_fields.append("nome = ?")
            params.append(categoria.nome)

        if categoria.tipo is not None:
            update_fields.append("tipo = ?")
            params.append(categoria.tipo)

        if categoria.grupo_50_30_20 is not None:
            update_fields.append("grupo_50_30_20 = ?")
            params.append(categoria.grupo_50_30_20)

        if categoria.cor is not None:
            update_fields.append("cor = ?")
            params.append(categoria.cor)

        if categoria.ativa is not None:
            update_fields.append("ativa = ?")
            params.append(categoria.ativa)

        if not update_fields:
            return self.get_by_id(id_categoria)

        params.append(id_categoria)

        query = f"""
            UPDATE categoria
            SET {', '.join(update_fields)}
            WHERE id_categoria = ?
        """

        self.db.execute_non_query(query, tuple(params))

        return self.get_by_id(id_categoria)

    def delete(self, id_categoria: int) -> bool:
        """Deleta uma categoria (soft delete)"""
        query = """
            UPDATE categoria
            SET ativa = ?
            WHERE id_categoria = ?
        """

        rows_affected = self.db.execute_non_query(query, (False, id_categoria))

        return rows_affected > 0

    def exists_by_nome(self, id_usuario: int, nome: str, exclude_id: Optional[int] = None) -> bool:
        """Verifica se já existe uma categoria com o mesmo nome para o usuário"""
        if exclude_id:
            query = """
                SELECT COUNT(*) FROM categoria
                WHERE id_usuario = ? AND nome = ? AND id_categoria != ?
            """
            params = (id_usuario, nome, exclude_id)
        else:
            query = """
                SELECT COUNT(*) FROM categoria
                WHERE id_usuario = ? AND nome = ?
            """
            params = (id_usuario, nome)

        count = self.db.execute_scalar(query, params)

        return count > 0

