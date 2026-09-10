import random
import string
from typing import Optional
from app.repositories.telegram_repository import TelegramRepository
from app.schemas.telegram import TelegramVinculo
import app.utils.database as db_module

class TelegramService:
    def __init__(self):
        self.repository = TelegramRepository(db_module.db)

    def gerar_codigo(self, id_usuario: int) -> str:
        codigo = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        self.repository.create_or_update_codigo(id_usuario, codigo)
        return codigo

    def get_status(self, id_usuario: int) -> dict:
        vinculo = self.repository.get_by_id_usuario(id_usuario)
        if not vinculo:
            return {"vinculado": False, "codigo": None}
        if vinculo.telegram_chat_id and vinculo.telegram_chat_id > 0:
            return {"vinculado": True, "codigo": None, "username": vinculo.telegram_username}
        return {"vinculado": False, "codigo": vinculo.codigo_vinculo}

    def get_usuario_by_chat_id(self, chat_id: int) -> Optional[int]:
        vinculo = self.repository.get_by_chat_id(chat_id)
        if vinculo:
            return vinculo.id_usuario
        return None

    def vincular(self, chat_id: int, username: str, codigo: str) -> bool:
        vinculo = self.repository.get_by_codigo(codigo)
        if not vinculo:
            return False
        return self.repository.activate_vinculo(vinculo.id_usuario, chat_id, username)
