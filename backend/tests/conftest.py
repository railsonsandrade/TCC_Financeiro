"""
Fixtures compartilhadas para todos os testes
"""

import pytest
import os
import sqlite3
import tempfile
from datetime import date, datetime
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.utils.database import DatabaseConnection
from app.schemas.usuario import UsuarioCreate, UsuarioLogin
from app.schemas.conta_financeira import ContaFinanceiraCreate
from app.schemas.categoria import CategoriaCreate
from app.schemas.lancamento import LancamentoCreate
from app.schemas.meta_financeira import MetaFinanceiraCreate
from app.services.usuario_service import UsuarioService


@pytest.fixture(scope="function", autouse=True)
def db():
    """
    Fixture de função para fornecer conexão com banco de teste
    Cada teste recebe um banco limpo em arquivo temporário
    AUTOUSE=True para substituir automaticamente o banco global
    """
    # Criar arquivo temporário para o banco de teste
    temp_db = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.db')
    test_db_path = temp_db.name
    temp_db.close()

    # Criar banco de teste
    conn = sqlite3.connect(test_db_path, check_same_thread=False)
    cursor = conn.cursor()

    # Ler e executar schema
    with open("../database/schema_sqlite.sql", "r", encoding="utf-8") as f:
        schema = f.read()
        # Executar cada statement separadamente
        for statement in schema.split(';'):
            if statement.strip():
                cursor.execute(statement)

    conn.commit()

    # Configurar DatabaseConnection para usar este banco
    db_instance = DatabaseConnection()
    db_instance.db_path = test_db_path
    db_instance.connect = lambda: conn
    db_instance.disconnect = lambda: None  # Não fechar a conexão

    # Substituir database global pela de teste
    import app.utils.database as db_module
    original_db = db_module.db
    db_module.db = db_instance

    yield db_instance

    # Restaurar database original
    db_module.db = original_db

    # Cleanup
    conn.close()

    # Remover arquivo temporário
    try:
        os.unlink(test_db_path)
    except:
        pass


@pytest.fixture(scope="function")
def client():
    """
    Fixture para TestClient do FastAPI
    """
    client = TestClient(app)
    yield client


@pytest.fixture(scope="function")
def usuario_teste():
    """
    Fixture para criar usuário de teste
    """
    usuario_service = UsuarioService()
    usuario_data = UsuarioCreate(
        nome="Usuário Teste",
        email="teste@example.com",
        senha="Senha@123"
    )
    usuario = usuario_service.criar_usuario(usuario_data)
    return usuario


@pytest.fixture(scope="function")
def token_teste(client, usuario_teste):
    """
    Fixture para obter token JWT de autenticação
    """
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "teste@example.com",
            "senha": "Senha@123"
        }
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def headers_auth(token_teste):
    """
    Fixture para headers com autenticação
    """
    return {"Authorization": f"Bearer {token_teste}"}


@pytest.fixture(scope="function")
def conta_teste(usuario_teste):
    """
    Fixture para criar conta de teste
    """
    from app.services.conta_financeira_service import ContaFinanceiraService

    conta_service = ContaFinanceiraService()
    conta_data = ContaFinanceiraCreate(
        nome="Conta Teste",
        tipo="Conta Corrente",
        saldo_inicial=Decimal("1000.00")
    )
    conta = conta_service.criar_conta(usuario_teste.id_usuario, conta_data)
    return conta


@pytest.fixture(scope="function")
def categoria_teste(usuario_teste):
    """
    Fixture para criar categoria de teste
    """
    from app.services.categoria_service import CategoriaService

    categoria_service = CategoriaService()
    categoria_data = CategoriaCreate(
        nome="Categoria Teste",
        tipo="Despesa",
        grupo_50_30_20="Essencial"
    )
    categoria = categoria_service.criar_categoria(usuario_teste.id_usuario, categoria_data)
    return categoria

