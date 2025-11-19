"""
Utilitários de segurança: hash de senhas e JWT
"""

import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.config import settings


class SecurityUtils:
    """Utilitários de segurança"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Gera hash bcrypt de uma senha
        
        Args:
            password: Senha em texto plano
        
        Returns:
            Hash da senha
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verifica se uma senha corresponde ao hash
        
        Args:
            plain_password: Senha em texto plano
            hashed_password: Hash da senha armazenado
        
        Returns:
            True se a senha está correta, False caso contrário
        """
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Cria um token JWT
        
        Args:
            data: Dados a serem codificados no token
            expires_delta: Tempo de expiração (opcional)
        
        Returns:
            Token JWT
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decodifica e valida um token JWT
        
        Args:
            token: Token JWT
        
        Returns:
            Dados decodificados do token ou None se inválido
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Valida formato de e-mail
        
        Args:
            email: E-mail a ser validado
        
        Returns:
            True se o e-mail é válido, False caso contrário
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Valida força da senha
        
        Args:
            password: Senha a ser validada
        
        Returns:
            Tupla (válido, mensagem)
        """
        if len(password) < 8:
            return False, "A senha deve ter no mínimo 8 caracteres"
        
        if not any(char.isdigit() for char in password):
            return False, "A senha deve conter pelo menos um número"
        
        if not any(char.isupper() for char in password):
            return False, "A senha deve conter pelo menos uma letra maiúscula"
        
        if not any(char.islower() for char in password):
            return False, "A senha deve conter pelo menos uma letra minúscula"
        
        return True, "Senha válida"


# Instância global
security = SecurityUtils()

