"""
Utilitários para conexão e operações com banco de dados SQLite
"""

import sqlite3
from typing import Optional, List, Dict, Any
from contextlib import contextmanager
from app.config import settings


class DatabaseConnection:
    """Gerenciador de conexão com SQLite"""

    def __init__(self):
        self.db_path = settings.database_url
        self._connection: Optional[sqlite3.Connection] = None

    def connect(self) -> sqlite3.Connection:
        """Estabelece conexão com o banco de dados com pragmas de performance"""
        try:
            self._connection = sqlite3.connect(
                self.db_path,
                timeout=30.0,           # Aguarda até 30s antes de lançar "database is locked"
                check_same_thread=False  # Permite uso em contextos multi-thread (FastAPI)
            )
            self._connection.row_factory = sqlite3.Row  # Acesso por nome de coluna

            # ─── Pragmas de Performance e Integridade ─────────────────────
            self._connection.execute("PRAGMA journal_mode=WAL;")       # Leitura e escrita simultâneas
            self._connection.execute("PRAGMA synchronous=NORMAL;")     # Reduz fsync agressivo (mais rápido)
            self._connection.execute("PRAGMA foreign_keys=ON;")        # Garante integridade referencial
            self._connection.execute("PRAGMA cache_size=-64000;")      # Cache de 64MB em memória
            self._connection.execute("PRAGMA temp_store=MEMORY;")      # Armazena tabelas temporárias em RAM
            # ───────────────────────────────────────────────────────────────

            return self._connection
        except sqlite3.Error as e:
            raise Exception(f"Erro ao conectar ao banco de dados: {str(e)}")

    
    def disconnect(self):
        """Fecha a conexão com o banco de dados"""
        if self._connection:
            self._connection.close()
            self._connection = None
    
    @contextmanager
    def get_cursor(self):
        """Context manager para obter cursor do banco de dados"""
        connection = self.connect()
        cursor = connection.cursor()
        try:
            yield cursor
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            self.disconnect()
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """
        Executa uma query SELECT e retorna os resultados como lista de dicionários
        
        Args:
            query: Query SQL a ser executada
            params: Parâmetros da query (opcional)
        
        Returns:
            Lista de dicionários com os resultados
        """
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            columns = [column[0] for column in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            return results
    
    def execute_non_query(self, query: str, params: tuple = ()) -> int:
        """
        Executa uma query INSERT, UPDATE ou DELETE
        
        Args:
            query: Query SQL a ser executada
            params: Parâmetros da query (opcional)
        
        Returns:
            Número de linhas afetadas
        """
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.rowcount
    
    def execute_scalar(self, query: str, params: tuple = ()) -> Any:
        """
        Executa uma query e retorna um único valor
        
        Args:
            query: Query SQL a ser executada
            params: Parâmetros da query (opcional)
        
        Returns:
            Valor único retornado pela query
        """
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return result[0] if result else None
    
    def execute_insert_with_identity(self, query: str, params: tuple = ()) -> int:
        """
        Executa um INSERT e retorna o ID gerado (AUTOINCREMENT)

        Args:
            query: Query SQL INSERT
            params: Parâmetros da query

        Returns:
            ID gerado pelo banco de dados
        """
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.lastrowid
    
    def test_connection(self) -> bool:
        """
        Testa a conexão com o banco de dados
        
        Returns:
            True se a conexão foi bem-sucedida, False caso contrário
        """
        try:
            with self.get_cursor() as cursor:
                cursor.execute("SELECT 1")
                return True
        except Exception as e:
            print(f"Erro ao testar conexão: {str(e)}")
            return False


# Instância global do gerenciador de banco de dados
db = DatabaseConnection()


def get_db() -> DatabaseConnection:
    """Retorna a instância do gerenciador de banco de dados"""
    return db

