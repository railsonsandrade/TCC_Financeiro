"""
Testes de integração da API - Contas Financeiras
"""

import pytest
from decimal import Decimal


@pytest.mark.integration
@pytest.mark.api
class TestContasAPI:
    """Testes dos endpoints de contas financeiras"""
    
    def test_criar_conta(self, client, headers_auth):
        """Testa criação de conta"""
        response = client.post(
            "/api/v1/contas",
            headers=headers_auth,
            json={
                "nome": "Conta Corrente",
                "tipo": "Conta Corrente",
                "saldo_inicial": 1000.00
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Conta Corrente"
        assert data["tipo"] == "Conta Corrente"
        assert float(data["saldo_inicial"]) == 1000.00
        assert data["ativa"] is True
    
    def test_criar_conta_sem_autenticacao(self, client):
        """Testa criação de conta sem autenticação"""
        response = client.post(
            "/api/v1/contas",
            json={
                "nome": "Conta Teste",
                "tipo": "Conta Corrente",
                "saldo_inicial": 1000.00
            }
        )
        
        assert response.status_code == 403
    
    def test_criar_conta_nome_duplicado(self, client, headers_auth, conta_teste):
        """Testa criação de conta com nome duplicado"""
        response = client.post(
            "/api/v1/contas",
            headers=headers_auth,
            json={
                "nome": "Conta Teste",  # Nome já existe
                "tipo": "Conta Corrente",
                "saldo_inicial": 500.00
            }
        )
        
        assert response.status_code == 400
        assert "Já existe uma conta" in response.json()["detail"]
    
    def test_listar_contas(self, client, headers_auth, conta_teste):
        """Testa listagem de contas"""
        response = client.get(
            "/api/v1/contas",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["nome"] == "Conta Teste"
    
    def test_listar_contas_com_saldo(self, client, headers_auth, conta_teste):
        """Testa listagem de contas com saldo"""
        response = client.get(
            "/api/v1/contas/com-saldo",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert "saldo_atual" in data[0]
    
    def test_obter_conta(self, client, headers_auth, conta_teste):
        """Testa obtenção de conta por ID"""
        response = client.get(
            f"/api/v1/contas/{conta_teste.id_conta}",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id_conta"] == conta_teste.id_conta
        assert data["nome"] == "Conta Teste"
    
    def test_obter_conta_inexistente(self, client, headers_auth):
        """Testa obtenção de conta inexistente"""
        response = client.get(
            "/api/v1/contas/99999",
            headers=headers_auth
        )
        
        assert response.status_code == 404
    
    def test_atualizar_conta(self, client, headers_auth, conta_teste):
        """Testa atualização de conta"""
        response = client.put(
            f"/api/v1/contas/{conta_teste.id_conta}",
            headers=headers_auth,
            json={
                "nome": "Conta Atualizada"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == "Conta Atualizada"
    
    def test_desativar_conta(self, client, headers_auth, conta_teste):
        """Testa desativação de conta"""
        response = client.delete(
            f"/api/v1/contas/{conta_teste.id_conta}",
            headers=headers_auth
        )
        
        assert response.status_code == 204
        
        # Verificar que conta foi desativada
        response = client.get(
            f"/api/v1/contas/{conta_teste.id_conta}",
            headers=headers_auth
        )
        assert response.status_code == 200
        assert response.json()["ativa"] is False

