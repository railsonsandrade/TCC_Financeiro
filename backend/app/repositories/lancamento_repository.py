"""
Repository para operações de banco de dados relacionadas a Lançamento
"""

from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.utils.database import DatabaseConnection
from app.schemas.lancamento import (
    LancamentoCreate,
    LancamentoUpdate,
    LancamentoInDB,
    LancamentoComDetalhes
)


class LancamentoRepository:
    """Repository para gerenciar operações de Lançamento no banco de dados"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
    
    def create(self, id_usuario: int, lancamento: LancamentoCreate) -> LancamentoInDB:
        """Cria um novo lançamento"""
        query = """
            INSERT INTO lancamento (
                id_usuario, id_conta, id_categoria, tipo, valor, data,
                descricao, origem, pago, data_criacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            id_usuario,
            lancamento.id_conta,
            lancamento.id_categoria,
            lancamento.tipo,
            float(lancamento.valor),
            lancamento.data,
            lancamento.descricao,
            "Manual",
            lancamento.pago,
            datetime.now()
        )
        
        id_lancamento = self.db.execute_insert_with_identity(query, params)
        
        return self.get_by_id(id_lancamento)
    
    def get_by_id(self, id_lancamento: int) -> Optional[LancamentoInDB]:
        """Busca um lançamento por ID"""
        query = """
            SELECT id_lancamento, id_usuario, id_conta, id_categoria, tipo, valor,
                   data, descricao, origem, id_recorrencia, data_criacao, pago
            FROM lancamento
            WHERE id_lancamento = ?
        """
        
        result = self.db.execute_query(query, (id_lancamento,))
        
        if result:
            row = result[0]
            return LancamentoInDB(
                id_lancamento=row['id_lancamento'],
                id_usuario=row['id_usuario'],
                id_conta=row['id_conta'],
                id_categoria=row['id_categoria'],
                tipo=row['tipo'],
                valor=Decimal(str(row['valor'])),
                data=row['data'],
                descricao=row['descricao'],
                origem=row['origem'],
                id_recorrencia=row['id_recorrencia'],
                data_criacao=row['data_criacao'],
                pago=bool(row['pago'])
            )
        
        return None
    
    def get_by_usuario(
        self,
        id_usuario: int,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None,
        tipo: Optional[str] = None,
        id_conta: Optional[int] = None,
        id_categoria: Optional[int] = None,
        pago: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LancamentoInDB]:
        """Lista lançamentos de um usuário com filtros opcionais"""

        conditions = ["id_usuario = ?"]
        params = [id_usuario]

        if data_inicio:
            conditions.append("data >= ?")
            params.append(data_inicio)

        if data_fim:
            conditions.append("data <= ?")
            params.append(data_fim)

        if tipo:
            conditions.append("tipo = ?")
            params.append(tipo)

        if id_conta:
            conditions.append("id_conta = ?")
            params.append(id_conta)

        if id_categoria:
            conditions.append("id_categoria = ?")
            params.append(id_categoria)

        if pago is not None:
            conditions.append("pago = ?")
            params.append(1 if pago else 0)
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
            SELECT id_lancamento, id_usuario, id_conta, id_categoria, tipo, valor,
                   data, descricao, origem, id_recorrencia, data_criacao, pago
            FROM lancamento
            WHERE {where_clause}
            ORDER BY data DESC, data_criacao DESC
            LIMIT ? OFFSET ?
        """
        
        params.extend([limit, skip])
        
        results = self.db.execute_query(query, tuple(params))
        
        lancamentos = []
        for row in results:
            lancamentos.append(LancamentoInDB(
                id_lancamento=row['id_lancamento'],
                id_usuario=row['id_usuario'],
                id_conta=row['id_conta'],
                id_categoria=row['id_categoria'],
                tipo=row['tipo'],
                valor=Decimal(str(row['valor'])),
                data=row['data'],
                descricao=row['descricao'],
                origem=row['origem'],
                id_recorrencia=row['id_recorrencia'],
                data_criacao=row['data_criacao'],
                pago=bool(row['pago'])
            ))
        
        return lancamentos

    def get_com_detalhes(
        self,
        id_usuario: int,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None,
        tipo: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LancamentoComDetalhes]:
        """Lista lançamentos com detalhes de conta e categoria"""

        conditions = ["l.id_usuario = ?"]
        params = [id_usuario]

        if data_inicio:
            conditions.append("l.data >= ?")
            params.append(data_inicio)

        if data_fim:
            conditions.append("l.data <= ?")
            params.append(data_fim)

        if tipo:
            conditions.append("l.tipo = ?")
            params.append(tipo)

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                l.id_lancamento, l.id_usuario, l.id_conta, l.id_categoria,
                l.tipo, l.valor, l.data, l.descricao, l.origem,
                l.id_recorrencia, l.data_criacao, l.pago,
                c.nome AS nome_conta, c.tipo AS tipo_conta,
                cat.nome AS nome_categoria, cat.grupo_50_30_20, cat.cor
            FROM lancamento l
            INNER JOIN conta_financeira c ON l.id_conta = c.id_conta
            INNER JOIN categoria cat ON l.id_categoria = cat.id_categoria
            WHERE {where_clause}
            ORDER BY l.data DESC, l.data_criacao DESC
            LIMIT ? OFFSET ?
        """

        params.extend([limit, skip])

        results = self.db.execute_query(query, tuple(params))

        lancamentos = []
        for row in results:
            lancamentos.append(LancamentoComDetalhes(
                id_lancamento=row['id_lancamento'],
                id_usuario=row['id_usuario'],
                id_conta=row['id_conta'],
                id_categoria=row['id_categoria'],
                tipo=row['tipo'],
                valor=Decimal(str(row['valor'])),
                data=row['data'],
                descricao=row['descricao'],
                origem=row['origem'],
                id_recorrencia=row['id_recorrencia'],
                data_criacao=row['data_criacao'],
                pago=bool(row['pago']),
                nome_conta=row['nome_conta'],
                tipo_conta=row['tipo_conta'],
                nome_categoria=row['nome_categoria'],
                grupo_categoria=row['grupo_50_30_20'],
                cor_categoria=row['cor']
            ))

        return lancamentos

    def update(self, id_lancamento: int, lancamento: LancamentoUpdate) -> Optional[LancamentoInDB]:
        """Atualiza um lançamento"""
        update_fields = []
        params = []

        if lancamento.id_conta is not None:
            update_fields.append("id_conta = ?")
            params.append(lancamento.id_conta)

        if lancamento.id_categoria is not None:
            update_fields.append("id_categoria = ?")
            params.append(lancamento.id_categoria)

        if lancamento.tipo is not None:
            update_fields.append("tipo = ?")
            params.append(lancamento.tipo)

        if lancamento.valor is not None:
            update_fields.append("valor = ?")
            params.append(float(lancamento.valor))

        if lancamento.data is not None:
            update_fields.append("data = ?")
            params.append(lancamento.data)

        if lancamento.descricao is not None:
            update_fields.append("descricao = ?")
            params.append(lancamento.descricao)

        if lancamento.pago is not None:
            update_fields.append("pago = ?")
            params.append(lancamento.pago)

        if not update_fields:
            return self.get_by_id(id_lancamento)

        params.append(id_lancamento)

        query = f"""
            UPDATE lancamento
            SET {', '.join(update_fields)}
            WHERE id_lancamento = ?
        """

        self.db.execute_non_query(query, tuple(params))

        return self.get_by_id(id_lancamento)

    def delete(self, id_lancamento: int) -> bool:
        """Deleta um lançamento (hard delete)"""
        query = "DELETE FROM lancamento WHERE id_lancamento = ?"

        rows_affected = self.db.execute_non_query(query, (id_lancamento,))

        return rows_affected > 0

    def get_total_por_periodo(
        self,
        id_usuario: int,
        data_inicio: date,
        data_fim: date,
        tipo: Optional[str] = None,
        apenas_pagos: bool = True
    ) -> Decimal:
        """Calcula o total de lançamentos em um período"""

        conditions = ["id_usuario = ?", "data >= ?", "data <= ?"]
        params = [id_usuario, data_inicio, data_fim]

        if tipo:
            conditions.append("tipo = ?")
            params.append(tipo)

        if apenas_pagos:
            conditions.append("pago = TRUE")

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT COALESCE(SUM(valor), 0)
            FROM lancamento
            WHERE {where_clause}
        """

        total = self.db.execute_scalar(query, tuple(params))

        return Decimal(str(total)) if total else Decimal("0.00")

