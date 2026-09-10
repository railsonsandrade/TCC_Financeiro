"""Repository para telegram_vinculos"""
from typing import Optional
from app.utils.database import DatabaseConnection
from app.schemas.telegram import TelegramVinculo

class TelegramRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db

    def get_by_chat_id(self, chat_id: int) -> Optional[TelegramVinculo]:
        query = "SELECT id_vinculo, id_usuario, telegram_chat_id, telegram_username, codigo_vinculo, ativo, data_vinculo FROM telegram_vinculos WHERE telegram_chat_id = ? AND ativo = TRUE"
        results = self.db.execute_query(query, (chat_id,))
        if results:
            return TelegramVinculo(**results[0])
        return None

    def get_by_codigo(self, codigo: str) -> Optional[TelegramVinculo]:
        query = "SELECT id_vinculo, id_usuario, telegram_chat_id, telegram_username, codigo_vinculo, ativo, data_vinculo FROM telegram_vinculos WHERE codigo_vinculo = ? AND ativo = TRUE"
        results = self.db.execute_query(query, (codigo,))
        if results:
            return TelegramVinculo(**results[0])
        return None
        
    def get_by_id_usuario(self, id_usuario: int) -> Optional[TelegramVinculo]:
        query = "SELECT id_vinculo, id_usuario, telegram_chat_id, telegram_username, codigo_vinculo, ativo, data_vinculo FROM telegram_vinculos WHERE id_usuario = ? AND ativo = TRUE"
        results = self.db.execute_query(query, (id_usuario,))
        if results:
            return TelegramVinculo(**results[0])
        return None

    def create_or_update_codigo(self, id_usuario: int, codigo: str) -> TelegramVinculo:
        existente = self.get_by_id_usuario(id_usuario)
        if existente:
            query = "UPDATE telegram_vinculos SET codigo_vinculo = ? WHERE id_usuario = ? RETURNING id_vinculo, id_usuario, telegram_chat_id, telegram_username, codigo_vinculo, ativo, data_vinculo"
            results = self.db.execute_query(query, (codigo, id_usuario))
            return TelegramVinculo(**results[0])
        else:
            query = "INSERT INTO telegram_vinculos (id_usuario, codigo_vinculo, telegram_chat_id) VALUES (?, ?, ?) RETURNING id_vinculo, id_usuario, telegram_chat_id, telegram_username, codigo_vinculo, ativo, data_vinculo"
            results = self.db.execute_query(query, (id_usuario, codigo, -id_usuario))
            return TelegramVinculo(**results[0])

    def activate_vinculo(self, id_usuario: int, chat_id: int, username: str) -> bool:
        query = "UPDATE telegram_vinculos SET telegram_chat_id = ?, telegram_username = ?, codigo_vinculo = NULL WHERE id_usuario = ? RETURNING id_vinculo"
        results = self.db.execute_query(query, (chat_id, username, id_usuario))
        return len(results) > 0
