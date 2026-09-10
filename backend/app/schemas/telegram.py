from typing import Optional
from pydantic import BaseModel
from datetime import datetime
class TelegramVinculo(BaseModel):
    id_vinculo: int
    id_usuario: int
    telegram_chat_id: Optional[int] = None
    telegram_username: Optional[str] = None
    codigo_vinculo: Optional[str] = None
    ativo: bool = True
    data_vinculo: Optional[datetime] = None
