"""
Utilitários para conexão e operações com banco de dados SQLite
"""

import sqlite3
import re
from typing import Optional, List, Dict, Any
from contextlib import contextmanager
from app.config import settings

# Tentar importar psycopg2 (PostgreSQL) se disponível
try:
    import psycopg2
    import psycopg2.extras
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False



class DatabaseConnection:
    """Gerenciador de conexão com SQLite"""

    def __init__(self):
        self.db_url = getattr(settings, 'DATABASE_URL', None) or settings.database_url
        self.is_postgres = self.db_url and self.db_url.startswith(('postgres://', 'postgresql://'))
        self._connection = None

    def _convert_query(self, query: str) -> str:
        """Converte placeholders do SQLite (?) para PostgreSQL (%s) se necessário."""
        if self.is_postgres:
            # Substitui '?' que não estão dentro de aspas por '%s'
            # Uma regex simples que cobre 99% dos casos básicos de CRUD
            return query.replace('?', '%s')
        return query

    def connect(self):
        """Estabelece conexão com o banco de dados (SQLite ou PostgreSQL)"""
        try:
            if self.is_postgres:
                if not HAS_PSYCOPG2:
                    raise ImportError("psycopg2-binary não está instalado. Instale-o para usar PostgreSQL.")
                
                # Corrigir o esquema postgres:// para postgresql:// se necessário para algumas libs, 
                # psycopg2 aceita ambos na string de conexão
                self._connection = psycopg2.connect(self.db_url)
                # O psycopg2 faz auto-commit apenas se configurado, mas manteremos o manual no contextmanager
                return self._connection
            else:
                # Conexão SQLite original
                self._connection = sqlite3.connect(
                    self.db_url,
                    timeout=30.0,
                    check_same_thread=False
                )
                self._connection.row_factory = sqlite3.Row

                # Pragmas de Performance
                self._connection.execute("PRAGMA journal_mode=WAL;")
                self._connection.execute("PRAGMA synchronous=NORMAL;")
                self._connection.execute("PRAGMA foreign_keys=ON;")
                self._connection.execute("PRAGMA cache_size=-64000;")
                self._connection.execute("PRAGMA temp_store=MEMORY;")
                
                return self._connection
        except Exception as e:
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
        
        if self.is_postgres:
            # Usa DictCursor para que o Postgres retorne dicionários, como o sqlite3.Row
            cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
        else:
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
        query = self._convert_query(query)
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            
            if self.is_postgres:
                # O DictCursor já retorna os dicionários
                return [dict(row) for row in cursor.fetchall()]
            else:
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
        query = self._convert_query(query)
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
        query = self._convert_query(query)
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
        query_converted = self._convert_query(query)

        with self.get_cursor() as cursor:
            if self.is_postgres:
                # Detecta o nome da coluna PK a partir do INSERT.
                # A convenção do projeto é: tabela 'usuario' -> 'id_usuario', 'conta_financeira' -> 'id_conta', etc.
                # Extraimos o nome da tabela e montamos o id correspondente.
                pk_col = 'id'  # fallback genérico
                table_match = re.search(r'INSERT\s+INTO\s+(\w+)', query, re.IGNORECASE)
                if table_match:
                    table_name = table_match.group(1).lower()
                    # Mapeia tabela -> coluna PK
                    pk_map = {
                        'usuario': 'id_usuario',
                        'conta_financeira': 'id_conta',
                        'categoria': 'id_categoria',
                        'lancamento': 'id_lancamento',
                        'meta_financeira': 'id_meta',
                        'dashboard_widget': 'id_widget',
                        'telegram_usuario': 'id',
                    }
                    pk_col = pk_map.get(table_name, 'id')

                from psycopg2 import sql
                returning_query = sql.SQL("{} RETURNING {}").format(
                    sql.SQL(query_converted),
                    sql.Identifier(pk_col)
                )
                cursor.execute(returning_query, params)
                result = cursor.fetchone()
                if result:
                    return result[0]
                return 1
            else:
                cursor.execute(query_converted, params)
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

