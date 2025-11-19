"""
Script para ajudar na configuração do arquivo .env
"""

import secrets
import os
from pathlib import Path


def generate_secret_key():
    """Gera uma chave secreta segura"""
    return secrets.token_urlsafe(32)


def create_env_file():
    """Cria o arquivo .env com base no .env.example"""
    
    print("=" * 60)
    print("CONFIGURAÇÃO DO ARQUIVO .ENV")
    print("=" * 60)
    print()
    
    # Verificar se .env já existe
    env_path = Path(".env")
    if env_path.exists():
        resposta = input("⚠️  Arquivo .env já existe. Deseja sobrescrever? (s/n): ")
        if resposta.lower() != 's':
            print("❌ Operação cancelada.")
            return
    
    print("Vamos configurar seu arquivo .env!")
    print()
    
    # Coletar informações do usuário
    print("📋 CONFIGURAÇÕES DO BANCO DE DADOS SQL SERVER")
    print("-" * 60)
    
    db_server = input("Servidor SQL Server [localhost]: ").strip() or "localhost"
    db_port = input("Porta [1433]: ").strip() or "1433"
    db_name = input("Nome do banco de dados [tcc_financeira]: ").strip() or "tcc_financeira"
    db_user = input("Usuário do SQL Server: ").strip()
    db_password = input("Senha do SQL Server: ").strip()
    
    print()
    print("🔐 CONFIGURAÇÕES DE SEGURANÇA")
    print("-" * 60)
    
    # Gerar chave secreta automaticamente
    secret_key = generate_secret_key()
    print(f"✅ Chave secreta gerada automaticamente")
    
    token_expire = input("Tempo de expiração do token em minutos [30]: ").strip() or "30"
    
    print()
    print("🌐 CONFIGURAÇÕES DA APLICAÇÃO")
    print("-" * 60)
    
    debug = input("Modo debug? (s/n) [s]: ").strip().lower() or "s"
    debug_value = "True" if debug == 's' else "False"
    
    allowed_origins = input("Origens permitidas (CORS) [http://localhost:3000,http://localhost:8000]: ").strip()
    if not allowed_origins:
        allowed_origins = "http://localhost:3000,http://localhost:8000"
    
    # Criar conteúdo do arquivo .env
    env_content = f"""# Database Configuration
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_SERVER={db_server}
DB_PORT={db_port}
DB_NAME={db_name}
DB_USER={db_user}
DB_PASSWORD={db_password}

# Security
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES={token_expire}

# Application
APP_NAME=TCC Financeira
APP_VERSION=1.0.0
DEBUG={debug_value}

# CORS (separar por vírgula se múltiplos)
ALLOWED_ORIGINS={allowed_origins}

# Email (opcional - para notificações)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu_email@gmail.com
# SMTP_PASSWORD=sua_senha_app
# EMAIL_FROM=noreply@tccfinanceira.com
"""
    
    # Salvar arquivo
    with open(".env", "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print()
    print("=" * 60)
    print("✅ Arquivo .env criado com sucesso!")
    print("=" * 60)
    print()
    print("📝 Resumo das configurações:")
    print(f"   Servidor: {db_server}:{db_port}")
    print(f"   Banco: {db_name}")
    print(f"   Usuário: {db_user}")
    print(f"   Debug: {debug_value}")
    print()
    print("⚠️  IMPORTANTE: Nunca compartilhe o arquivo .env!")
    print("   Ele contém informações sensíveis do seu projeto.")
    print()


if __name__ == "__main__":
    try:
        create_env_file()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário.")
    except Exception as e:
        print(f"\n\n❌ Erro: {str(e)}")

