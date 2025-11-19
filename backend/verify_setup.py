"""
Script de verificação do setup completo
Verifica se todas as dependências e configurações estão corretas
"""

import sys
from pathlib import Path


def check_python_version():
    """Verifica a versão do Python"""
    print("🐍 Verificando versão do Python...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 9:
        print(f"   ✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"   ❌ Python {version.major}.{version.minor}.{version.micro} (requer 3.9+)")
        return False


def check_virtual_env():
    """Verifica se está em um ambiente virtual"""
    print("📦 Verificando ambiente virtual...")
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("   ✅ Ambiente virtual ativado")
        return True
    else:
        print("   ⚠️  Ambiente virtual não detectado")
        print("      Execute: .\\venv\\Scripts\\activate")
        return False


def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print("📚 Verificando dependências...")
    
    required_packages = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'pydantic': 'Pydantic',
        'pyodbc': 'pyodbc',
        'bcrypt': 'bcrypt',
        'jose': 'python-jose',
        'pytest': 'pytest',
        'dotenv': 'python-dotenv'
    }
    
    all_installed = True
    for package, name in required_packages.items():
        try:
            __import__(package)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name} não instalado")
            all_installed = False
    
    return all_installed


def check_env_file():
    """Verifica se o arquivo .env existe"""
    print("⚙️  Verificando arquivo .env...")
    env_path = Path(".env")
    if env_path.exists():
        print("   ✅ Arquivo .env encontrado")
        return True
    else:
        print("   ❌ Arquivo .env não encontrado")
        print("      Execute: python setup_env.py")
        return False


def check_project_structure():
    """Verifica a estrutura de pastas do projeto"""
    print("📁 Verificando estrutura do projeto...")
    
    required_dirs = [
        'app',
        'app/controllers',
        'app/services',
        'app/repositories',
        'app/models',
        'app/schemas',
        'app/utils',
        'tests'
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        path = Path(dir_path)
        if path.exists():
            print(f"   ✅ {dir_path}/")
        else:
            print(f"   ❌ {dir_path}/ não encontrado")
            all_exist = False
    
    return all_exist


def check_database_connection():
    """Verifica conexão com o banco de dados"""
    print("🗄️  Verificando conexão com banco de dados...")
    
    try:
        # Adiciona o diretório ao path
        sys.path.insert(0, str(Path(__file__).parent))
        
        from app.utils.database import db
        
        if db.test_connection():
            print("   ✅ Conexão com banco de dados OK")
            return True
        else:
            print("   ❌ Falha ao conectar ao banco de dados")
            return False
    except Exception as e:
        print(f"   ❌ Erro ao testar conexão: {str(e)}")
        return False


def main():
    """Executa todas as verificações"""
    print("=" * 60)
    print("VERIFICAÇÃO DO SETUP - TCC FINANCEIRA")
    print("=" * 60)
    print()
    
    results = {
        "Python": check_python_version(),
        "Ambiente Virtual": check_virtual_env(),
        "Dependências": check_dependencies(),
        "Arquivo .env": check_env_file(),
        "Estrutura": check_project_structure(),
        "Banco de Dados": check_database_connection()
    }
    
    print()
    print("=" * 60)
    print("RESUMO DA VERIFICAÇÃO")
    print("=" * 60)
    
    for item, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {item}")
    
    print()
    
    if all(results.values()):
        print("🎉 TUDO PRONTO! Você pode iniciar o desenvolvimento.")
        print()
        print("Para iniciar a API, execute:")
        print("   uvicorn app.main:app --reload")
        return 0
    else:
        print("⚠️  Alguns itens precisam de atenção.")
        print()
        print("Próximos passos:")
        if not results["Ambiente Virtual"]:
            print("   1. Ative o ambiente virtual: .\\venv\\Scripts\\activate")
        if not results["Dependências"]:
            print("   2. Instale as dependências: pip install -r requirements.txt")
        if not results["Arquivo .env"]:
            print("   3. Configure o .env: python setup_env.py")
        if not results["Banco de Dados"]:
            print("   4. Configure o SQL Server e execute o schema.sql")
        return 1


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n❌ Verificação cancelada.")
        sys.exit(1)

