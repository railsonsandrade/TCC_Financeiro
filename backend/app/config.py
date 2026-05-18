"""
Configurações da aplicação
Carrega variáveis de ambiente e define configurações globais
"""

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Database - SQLite
    DB_PATH: str = "database/tcc_financeira.db"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    APP_NAME: str = "Sob Controle"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    # Email (opcional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    
    # AI Copilot (Google Gemini)
    GEMINI_API_KEY: str = ""
    
    # AI Copilot (Groq — Principal, usa Llama 3)
    GROQ_API_KEY: str = ""
    
    # Telegram Bot (integração de chatbot)
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""  # Token secreto para validar updates do Telegram

    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"
    
    @property
    def database_url(self) -> str:
        """Retorna o caminho completo do banco SQLite"""
        # Caminho relativo à pasta backend
        base_path = Path(__file__).parent.parent.parent
        db_path = base_path / self.DB_PATH
        # Criar diretório se não existir
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return str(db_path)
    
    @property
    def cors_origins(self) -> List[str]:
        """Retorna lista de origens permitidas para CORS"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Instância global de configurações
settings = Settings()

