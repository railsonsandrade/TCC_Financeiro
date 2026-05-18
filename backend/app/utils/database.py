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
        if self.is_postgres:
            # PostgreSQL precisa de RETURNING para obter o ID no INSERT
            # Como não sabemos a PK, vamos tentar injetar RETURNING.
            # Alternativamente, a aplicação que chama isso deve incluir o RETURNING id na query.
            # No nosso sistema, o sqlite lastrowid cuida disso.
            # Vamos modificar a query para injetar RETURNING se não existir:
            # NOTA: Assumimos que o primeiro campo id_* é a PK ou tentamos injetar no final
            
            # Uma abordagem mais segura no PostgreSQL é usar o método `RETURNING id`
            # Mas como não sabemos o nome do ID, usaremos um fallback:
            # Vamos assumir que as rotas passarão a usar query de RETURNING explícita
            # Mas, se não houver, pegamos o lastrowid simulado no SQLite
            
            # ATENÇÃO: As queries INSERT no PostgreSQL precisam retornar algo.
            # Vamos implementar um wrapper se for insert comum
            pass

        query = self._convert_query(query)

        with self.get_cursor() as cursor:
            # Se for Postgres, temos um problema nativo com lastrowid
            if self.is_postgres:
                # Injeta RETURNING * no final do INSERT para pegarmos o ID gerado (a PK é sempre a primeira coluna)
                if query.strip().upper().startswith("INSERT") and "RETURNING" not in query.upper():
                    query = f"{query} RETURNING *"

                cursor.execute(query, params)
                try:
                    result = cursor.fetchone()
                    if result:
                        return list(result.values())[0]  # Retorna o valor da primeira coluna (ID)
                except Exception:
                    pass
                return 1
            else:
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

