"""
Repository para operações de banco de dados relacionadas a Conta Financeira
"""

from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.utils.database import DatabaseConnection
from app.schemas.conta_financeira import (
    ContaFinanceiraCreate,
    ContaFinanceiraUpdate,
    ContaFinanceiraInDB,
    ContaFinanceiraComSaldo
)


class ContaFinanceiraRepository:
    """Repository para gerenciar operações de Conta Financeira no banco de dados"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
    
    def create(self, id_usuario: int, conta: ContaFinanceiraCreate) -> ContaFinanceiraInDB:
        """Cria uma nova conta financeira"""
        query = """
            INSERT INTO conta_financeira (id_usuario, nome, tipo, saldo_inicial, data_criacao, ativa, cor)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            id_usuario,
            conta.nome,
            conta.tipo,
            float(conta.saldo_inicial),
            datetime.now(),
            True,
            conta.cor or '#3B82F6'
        )
        
        id_conta = self.db.execute_insert_with_identity(query, params)
        
        return self.get_by_id(id_conta)
    
    def get_by_id(self, id_conta: int) -> Optional[ContaFinanceiraInDB]:
        """Busca uma conta por ID"""
        query = """
            SELECT id_conta, id_usuario, nome, tipo, saldo_inicial, data_criacao, ativa, cor
            FROM conta_financeira
            WHERE id_conta = ?
        """
        
        result = self.db.execute_query(query, (id_conta,))
        
        if result:
            row = result[0]
            return ContaFinanceiraInDB(
                id_conta=row['id_conta'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                tipo=row['tipo'],
                saldo_inicial=Decimal(str(row['saldo_inicial'])),
                data_criacao=row['data_criacao'],
                ativa=bool(row['ativa']),
                cor=row.get('cor') or '#3B82F6'
            )
        
        return None
    
    def get_by_usuario(self, id_usuario: int, apenas_ativas: bool = True) -> List[ContaFinanceiraInDB]:
        """Lista todas as contas de um usuário"""
        if apenas_ativas:
            query = """
                SELECT id_conta, id_usuario, nome, tipo, saldo_inicial, data_criacao, ativa, cor
                FROM conta_financeira
                WHERE id_usuario = ? AND ativa = TRUE
                ORDER BY nome
            """
        else:
            query = """
                SELECT id_conta, id_usuario, nome, tipo, saldo_inicial, data_criacao, ativa, cor
                FROM conta_financeira
                WHERE id_usuario = ?
                ORDER BY nome
            """
        
        results = self.db.execute_query(query, (id_usuario,))
        
        contas = []
        for row in results:
            contas.append(ContaFinanceiraInDB(
                id_conta=row['id_conta'],
                id_usuario=row['id_usuario'],
                nome=row['nome'],
                tipo=row['tipo'],
                saldo_inicial=Decimal(str(row['saldo_inicial'])),
                data_criacao=row['data_criacao'],
                ativa=bool(row['ativa']),
                cor=row.get('cor') or '#3B82F6'
            ))
        
        return contas
    
    def get_com_saldo(self, id_conta: int) -> Optional[ContaFinanceiraComSaldo]:
        """Busca uma conta com saldo calculado usando a view"""
        query = """
            SELECT id_conta, id_usuario, nome_conta, tipo_conta, saldo_inicial,
                   total_receitas, total_despesas, saldo_atual
            FROM vw_saldo_conta
            WHERE id_conta = ?
        """
        
        result = self.db.execute_query(query, (id_conta,))
        
        if result:
            row = result[0]
            return ContaFinanceiraComSaldo(
                id_conta=row['id_conta'],
                id_usuario=row['id_usuario'],
                nome=row['nome_conta'],
                tipo=row['tipo_conta'],
                saldo_inicial=Decimal(str(row['saldo_inicial'])),
                total_receitas=Decimal(str(row['total_receitas'])),
                total_despesas=Decimal(str(row['total_despesas'])),
                saldo_atual=Decimal(str(row['saldo_atual'])),
                data_criacao=datetime.now(),  # View não tem data_criacao
                ativa=True
            )
        
        return None
    
    def get_todas_com_saldo(self, id_usuario: int) -> List[ContaFinanceiraComSaldo]:
        """Lista todas as contas de um usuário com saldo calculado"""
        query = """
            SELECT id_conta, id_usuario, nome_conta, tipo_conta, saldo_inicial,
                   total_receitas, total_despesas, saldo_atual
            FROM vw_saldo_conta
            WHERE id_usuario = ?
            ORDER BY nome_conta
        """
        
        results = self.db.execute_query(query, (id_usuario,))
        
        contas = []
        for row in results:
            contas.append(ContaFinanceiraComSaldo(
                id_conta=row['id_conta'],
                id_usuario=row['id_usuario'],
                nome=row['nome_conta'],
                tipo=row['tipo_conta'],
                saldo_inicial=Decimal(str(row['saldo_inicial'])),
                total_receitas=Decimal(str(row['total_receitas'])),
                total_despesas=Decimal(str(row['total_despesas'])),
                saldo_atual=Decimal(str(row['saldo_atual'])),
                data_criacao=datetime.now(),
                ativa=True
            ))

        return contas

    def update(self, id_conta: int, conta: ContaFinanceiraUpdate) -> Optional[ContaFinanceiraInDB]:
        """Atualiza uma conta financeira"""
        update_fields = []
        params = []

        if conta.nome is not None:
            update_fields.append("nome = ?")
            params.append(conta.nome)

        if conta.tipo is not None:
            update_fields.append("tipo = ?")
            params.append(conta.tipo)

        if conta.saldo_inicial is not None:
            update_fields.append("saldo_inicial = ?")
            params.append(float(conta.saldo_inicial))

        if conta.ativa is not None:
            update_fields.append("ativa = ?")
            params.append(conta.ativa)

        if conta.cor is not None:
            update_fields.append("cor = ?")
            params.append(conta.cor)

        if not update_fields:
            return self.get_by_id(id_conta)

        params.append(id_conta)

        query = f"""
            UPDATE conta_financeira
            SET {', '.join(update_fields)}
            WHERE id_conta = ?
        """

        self.db.execute_non_query(query, tuple(params))

        return self.get_by_id(id_conta)

    def delete(self, id_conta: int) -> bool:
        """Deleta uma conta (soft delete)"""
        query = """
            UPDATE conta_financeira
            SET ativa = ?
            WHERE id_conta = ?
        """

        rows_affected = self.db.execute_non_query(query, (False, id_conta))

        return rows_affected > 0

    def exists_by_nome(self, id_usuario: int, nome: str, tipo: str, exclude_id: Optional[int] = None) -> bool:
        """Verifica se já existe uma conta com o mesmo nome e tipo para o usuário"""
        if exclude_id:
            query = """
                SELECT COUNT(*) FROM conta_financeira
                WHERE id_usuario = ? AND nome = ? AND tipo = ? AND id_conta != ?
            """
            params = (id_usuario, nome, tipo, exclude_id)
        else:
            query = """
                SELECT COUNT(*) FROM conta_financeira
                WHERE id_usuario = ? AND nome = ? AND tipo = ?
            """
            params = (id_usuario, nome, tipo)

        count = self.db.execute_scalar(query, params)

        return count > 0

