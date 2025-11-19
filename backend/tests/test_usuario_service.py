"""
Testes unitários do UsuarioService
"""

import pytest
from app.services.usuario_service import UsuarioService
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioLogin


@pytest.mark.unit
class TestUsuarioService:
    """Testes do UsuarioService"""
    
    def test_criar_usuario(self, db):
        """Testa criação de usuário"""
        service = UsuarioService()
        
        usuario_data = UsuarioCreate(
            nome="João Silva",
            email="joao@example.com",
            senha="Senha@123"
        )
        
        usuario = service.criar_usuario(usuario_data)
        
        assert usuario.id_usuario is not None
        assert usuario.nome == "João Silva"
        assert usuario.email == "joao@example.com"
        assert usuario.ativo is True
        assert not hasattr(usuario, 'senha_hash')  # Não deve retornar senha
    
    def test_criar_usuario_email_duplicado(self, db, usuario_teste):
        """Testa RN008: Email deve ser único"""
        service = UsuarioService()
        
        usuario_data = UsuarioCreate(
            nome="Outro Usuário",
            email="teste@example.com",  # Email já existe
            senha="Senha@123"
        )
        
        with pytest.raises(ValueError, match="já está cadastrado"):
            service.criar_usuario(usuario_data)
    
    def test_autenticar_sucesso(self, db, usuario_teste):
        """Testa autenticação com credenciais corretas"""
        service = UsuarioService()
        
        login_data = UsuarioLogin(
            email="teste@example.com",
            senha="Senha@123"
        )
        
        token = service.autenticar(login_data)
        
        assert token.access_token is not None
        assert token.token_type == "bearer"
    
    def test_autenticar_email_invalido(self, db):
        """Testa autenticação com email inválido"""
        service = UsuarioService()
        
        login_data = UsuarioLogin(
            email="naoexiste@example.com",
            senha="Senha@123"
        )
        
        with pytest.raises(ValueError, match="Email ou senha incorretos"):
            service.autenticar(login_data)
    
    def test_autenticar_senha_invalida(self, db, usuario_teste):
        """Testa autenticação com senha inválida"""
        service = UsuarioService()
        
        login_data = UsuarioLogin(
            email="teste@example.com",
            senha="SenhaErrada@123"
        )
        
        with pytest.raises(ValueError, match="Email ou senha incorretos"):
            service.autenticar(login_data)
    
    def test_obter_usuario(self, db, usuario_teste):
        """Testa obtenção de usuário por ID"""
        service = UsuarioService()
        
        usuario = service.obter_usuario(usuario_teste.id_usuario)
        
        assert usuario is not None
        assert usuario.id_usuario == usuario_teste.id_usuario
        assert usuario.email == "teste@example.com"
    
    def test_obter_usuario_inexistente(self, db):
        """Testa obtenção de usuário inexistente"""
        service = UsuarioService()
        
        usuario = service.obter_usuario(99999)
        
        assert usuario is None
    
    def test_atualizar_usuario(self, db, usuario_teste):
        """Testa atualização de usuário"""
        service = UsuarioService()
        
        update_data = UsuarioUpdate(
            nome="Nome Atualizado"
        )
        
        usuario = service.atualizar_usuario(usuario_teste.id_usuario, update_data)
        
        assert usuario.nome == "Nome Atualizado"
        assert usuario.email == "teste@example.com"  # Email não mudou
    
    def test_desativar_usuario(self, db, usuario_teste):
        """Testa desativação de usuário (soft delete)"""
        service = UsuarioService()
        
        service.desativar_usuario(usuario_teste.id_usuario)
        
        usuario = service.obter_usuario(usuario_teste.id_usuario)
        assert usuario.ativo is False
    
    def test_listar_usuarios(self, db, usuario_teste):
        """Testa listagem de usuários"""
        service = UsuarioService()
        
        # Criar mais um usuário
        usuario_data = UsuarioCreate(
            nome="Outro Usuário",
            email="outro@example.com",
            senha="Senha@123"
        )
        service.criar_usuario(usuario_data)
        
        usuarios = service.listar_usuarios()
        
        assert len(usuarios) == 2
    
    def test_listar_usuarios_apenas_ativos(self, db, usuario_teste):
        """Testa listagem apenas de usuários ativos"""
        service = UsuarioService()
        
        # Criar e desativar um usuário
        usuario_data = UsuarioCreate(
            nome="Usuário Inativo",
            email="inativo@example.com",
            senha="Senha@123"
        )
        usuario_inativo = service.criar_usuario(usuario_data)
        service.desativar_usuario(usuario_inativo.id_usuario)
        
        # Listar apenas ativos
        usuarios = service.listar_usuarios(apenas_ativos=True)
        
        assert len(usuarios) == 1
        assert usuarios[0].ativo is True

