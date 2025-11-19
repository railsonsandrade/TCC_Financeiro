"""
Repository para operações de banco de dados relacionadas a Meta Financeira
"""

from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.utils.database import DatabaseConnection
from app.schemas.meta_financeira import (
    MetaFinanceiraCreate,
    MetaFinanceiraUpdate,
    MetaFinanceiraInDB,
    MetaFinanceiraComProgresso
)


class MetaFinanceiraRepository:
    """Repository para gerenciar operações de Meta Financeira no banco de dados"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
    
    def create(self, id_usuario: int, meta: MetaFinanceiraCreate) -> MetaFinanceiraInDB:
        """Cria uma nova meta financeira"""
        query = """
            INSERT INTO meta_financeira (
                id_usuario, nome, valor_alvo, valor_atual, data_inicio,
                data_fim_prev, status, data_criacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            id_usuario,
            meta.nome,
            float(meta.valor_alvo),
            float(meta.valor_atual),
            meta.data_inicio,
            meta.data_fim_prev,
            "Em Andamento",
            datetime.now()
        )
        
        id_meta = self.db.execute_insert_with_identity(query, params)
        
        return self.get_by_id(id_meta)
    
    def get_by_id(self, id_meta: int) -> Optional[MetaFinanceiraInDB]:
        """Busca uma meta por ID"""
        query = """
            SELECT id_meta, id_usuario, nome, valor_alvo, valor_atual,
                   data_inicio, data_fim_prev, status, data_criacao
            FROM meta_financeira
            WHERE id_meta = ?
        """
        
        result = self.db.execute_query(query, (id_meta,))
        
        if result:
            row = result[0]
            return MetaFinanceiraInDB(
                id_meta=row['id_meta'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                valor_alvo=Decimal(str(row['valor_alvo'])),
                valor_atual=Decimal(str(row['valor_atual'])),
                data_inicio=row['data_inicio'],
                data_fim_prev=row['data_fim_prev'],
                status=row['status'],
                data_criacao=row['data_criacao']
            )
        
        return None
    
    def get_by_usuario(
        self,
        id_usuario: int,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MetaFinanceiraInDB]:
        """Lista metas de um usuário, opcionalmente filtradas por status"""
        
        if status:
            query = """
                SELECT id_meta, id_usuario, nome, valor_alvo, valor_atual,
                       data_inicio, data_fim_prev, status, data_criacao
                FROM meta_financeira
                WHERE id_usuario = ? AND status = ?
                ORDER BY data_criacao DESC
                LIMIT ? OFFSET ?
            """
            params = (id_usuario, status, limit, skip)
        else:
            query = """
                SELECT id_meta, id_usuario, nome, valor_alvo, valor_atual,
                       data_inicio, data_fim_prev, status, data_criacao
                FROM meta_financeira
                WHERE id_usuario = ?
                ORDER BY data_criacao DESC
                LIMIT ? OFFSET ?
            """
            params = (id_usuario, limit, skip)
        
        results = self.db.execute_query(query, params)
        
        metas = []
        for row in results:
            metas.append(MetaFinanceiraInDB(
                id_meta=row['id_meta'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                valor_alvo=Decimal(str(row['valor_alvo'])),
                valor_atual=Decimal(str(row['valor_atual'])),
                data_inicio=row['data_inicio'],
                data_fim_prev=row['data_fim_prev'],
                status=row['status'],
                data_criacao=row['data_criacao']
            ))
        
        return metas
    
    def get_com_progresso(self, id_meta: int) -> Optional[MetaFinanceiraComProgresso]:
        """Busca uma meta com cálculo de progresso"""
        meta = self.get_by_id(id_meta)
        
        if not meta:
            return None
        
        # Calcular percentual atingido
        percentual = float((meta.valor_atual / meta.valor_alvo) * 100) if meta.valor_alvo > 0 else 0
        
        # Calcular valor faltante
        valor_faltante = max(meta.valor_alvo - meta.valor_atual, Decimal("0.00"))
        
        # Calcular dias restantes
        dias_restantes = None
        if meta.data_fim_prev:
            delta = meta.data_fim_prev - date.today()
            dias_restantes = delta.days if delta.days > 0 else 0
        
        return MetaFinanceiraComProgresso(
            id_meta=meta.id_meta,
            id_usuario=meta.id_usuario,
            nome=meta.nome,
            valor_alvo=meta.valor_alvo,
            valor_atual=meta.valor_atual,
            data_inicio=meta.data_inicio,
            data_fim_prev=meta.data_fim_prev,
            status=meta.status,
            data_criacao=meta.data_criacao,
            percentual_atingido=percentual,
            valor_faltante=valor_faltante,
            dias_restantes=dias_restantes
        )

    def update(self, id_meta: int, meta: MetaFinanceiraUpdate) -> Optional[MetaFinanceiraInDB]:
        """Atualiza uma meta financeira"""
        update_fields = []
        params = []

        if meta.nome is not None:
            update_fields.append("nome = ?")
            params.append(meta.nome)

        if meta.valor_alvo is not None:
            update_fields.append("valor_alvo = ?")
            params.append(float(meta.valor_alvo))

        if meta.valor_atual is not None:
            update_fields.append("valor_atual = ?")
            params.append(float(meta.valor_atual))

        if meta.data_inicio is not None:
            update_fields.append("data_inicio = ?")
            params.append(meta.data_inicio)

        if meta.data_fim_prev is not None:
            update_fields.append("data_fim_prev = ?")
            params.append(meta.data_fim_prev)

        if meta.status is not None:
            update_fields.append("status = ?")
            params.append(meta.status)

        if not update_fields:
            return self.get_by_id(id_meta)

        params.append(id_meta)

        query = f"""
            UPDATE meta_financeira
            SET {', '.join(update_fields)}
            WHERE id_meta = ?
        """

        self.db.execute_non_query(query, tuple(params))

        return self.get_by_id(id_meta)

    def adicionar_valor(self, id_meta: int, valor: Decimal) -> Optional[MetaFinanceiraInDB]:
        """Adiciona um valor ao valor atual da meta"""
        query = """
            UPDATE meta_financeira
            SET valor_atual = valor_atual + ?
            WHERE id_meta = ?
        """

        self.db.execute_non_query(query, (float(valor), id_meta))

        # Verificar se atingiu a meta
        meta = self.get_by_id(id_meta)
        if meta and meta.valor_atual >= meta.valor_alvo and meta.status == "Em Andamento":
            self.update(id_meta, MetaFinanceiraUpdate(status="Concluída"))

        return self.get_by_id(id_meta)

    def delete(self, id_meta: int) -> bool:
        """Deleta uma meta (hard delete)"""
        query = "DELETE FROM meta_financeira WHERE id_meta = ?"

        rows_affected = self.db.execute_non_query(query, (id_meta,))

        return rows_affected > 0

