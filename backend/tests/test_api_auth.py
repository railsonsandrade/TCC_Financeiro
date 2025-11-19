"""
Testes de integração da API - Autenticação
"""

import pytest


@pytest.mark.integration
@pytest.mark.auth
class TestAuthAPI:
    """Testes dos endpoints de autenticação"""
    
    def test_register_sucesso(self, client):
        """Testa registro de novo usuário"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "nome": "Novo Usuário",
                "email": "novo@example.com",
                "senha": "Senha@123"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Novo Usuário"
        assert data["email"] == "novo@example.com"
        assert data["ativo"] is True
        assert "senha" not in data
        assert "senha_hash" not in data
    
    def test_register_email_duplicado(self, client, usuario_teste):
        """Testa registro com email duplicado"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "nome": "Outro Usuário",
                "email": "teste@example.com",  # Email já existe
                "senha": "Senha@123"
            }
        )
        
        assert response.status_code == 400
        assert "já está cadastrado" in response.json()["detail"]
    
    def test_register_senha_fraca(self, client):
        """Testa registro com senha fraca"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "nome": "Usuário",
                "email": "usuario@example.com",
                "senha": "123"  # Senha muito fraca
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_login_sucesso(self, client, usuario_teste):
        """Testa login com credenciais corretas"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "teste@example.com",
                "senha": "Senha@123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_email_invalido(self, client):
        """Testa login com email inválido"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "naoexiste@example.com",
                "senha": "Senha@123"
            }
        )
        
        assert response.status_code == 401
        assert "incorretos" in response.json()["detail"]
    
    def test_login_senha_invalida(self, client, usuario_teste):
        """Testa login com senha inválida"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "teste@example.com",
                "senha": "SenhaErrada@123"
            }
        )
        
        assert response.status_code == 401
        assert "incorretos" in response.json()["detail"]
    
    def test_get_me_sucesso(self, client, headers_auth, usuario_teste):
        """Testa obtenção do usuário autenticado"""
        response = client.get(
            "/api/v1/auth/me",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "teste@example.com"
        assert data["nome"] == "Usuário Teste"
    
    def test_get_me_sem_token(self, client):
        """Testa acesso sem token"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403
    
    def test_get_me_token_invalido(self, client):
        """Testa acesso com token inválido"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer token_invalido"}
        )
        
        assert response.status_code == 401

