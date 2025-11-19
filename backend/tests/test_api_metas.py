"""
Testes de integração da API de Metas Financeiras
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal
from fastapi.testclient import TestClient


@pytest.mark.api
class TestMetasAPI:
    """Testes da API de Metas Financeiras"""
    
    def test_criar_meta(self, client, headers_auth):
        """Testa criação de meta via API"""
        response = client.post(
            "/api/v1/metas",
            json={
                "nome": "Viagem",
                "valor_alvo": "5000.00",
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() + timedelta(days=180))
            },
            headers=headers_auth
        )

        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Viagem"
        # Decimal pode ser retornado como "5000" ou "5000.00"
        assert float(data["valor_alvo"]) == 5000.00
        assert data["status"] == "Em Andamento"
    
    def test_criar_meta_sem_autenticacao(self, client):
        """Testa que criação de meta requer autenticação"""
        response = client.post(
            "/api/v1/metas",
            json={
                "nome": "Teste",
                "valor_alvo": "1000.00",
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() + timedelta(days=30))
            }
        )

        # FastAPI retorna 403 quando não há token
        assert response.status_code in [401, 403]
    
    def test_criar_meta_data_invalida(self, client, headers_auth):
        """Testa RN004: Data fim deve ser posterior à data início - validação Pydantic"""
        response = client.post(
            "/api/v1/metas",
            json={
                "nome": "Meta Inválida",
                "valor_alvo": "1000.00",
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() - timedelta(days=1))  # Data no passado
            },
            headers=headers_auth
        )

        # Pydantic retorna 422 para validação de schema
        assert response.status_code == 422
    
    def test_criar_meta_valor_invalido(self, client, headers_auth):
        """Testa RN004: Valor alvo deve ser positivo - validação Pydantic"""
        response = client.post(
            "/api/v1/metas",
            json={
                "nome": "Meta Inválida",
                "valor_alvo": "-100.00",  # Valor negativo
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() + timedelta(days=30))
            },
            headers=headers_auth
        )

        # Pydantic retorna 422 para validação de schema
        assert response.status_code == 422
    
    def test_listar_metas(self, client, headers_auth):
        """Testa listagem de metas"""
        # Criar meta
        client.post(
            "/api/v1/metas",
            json={
                "nome": "Meta Teste",
                "valor_alvo": "1000.00",
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() + timedelta(days=30))
            },
            headers=headers_auth
        )

        response = client.get("/api/v1/metas", headers=headers_auth)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_obter_meta(self, client, headers_auth):
        """Testa obtenção de meta por ID"""
        # Criar meta
        create_response = client.post(
            "/api/v1/metas",
            json={
                "nome": "Meta Teste",
                "valor_alvo": "1000.00",
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() + timedelta(days=30))
            },
            headers=headers_auth
        )

        assert create_response.status_code == 201
        meta_id = create_response.json()["id_meta"]

        # Obter meta
        response = client.get(f"/api/v1/metas/{meta_id}", headers=headers_auth)

        assert response.status_code == 200
        data = response.json()
        assert data["id_meta"] == meta_id
    
    def test_obter_meta_inexistente(self, client, headers_auth):
        """Testa obtenção de meta inexistente"""
        response = client.get("/api/v1/metas/99999", headers=headers_auth)
        
        assert response.status_code == 404
    
    def test_atualizar_meta(self, client, headers_auth):
        """Testa atualização de meta"""
        # Criar meta
        create_response = client.post(
            "/api/v1/metas",
            json={
                "nome": "Meta Original",
                "valor_alvo": "1000.00",
                "data_inicio": str(date.today()),
                "data_fim_prev": str(date.today() + timedelta(days=30))
            },
            headers=headers_auth
        )

        assert create_response.status_code == 201
        meta_id = create_response.json()["id_meta"]

        # Atualizar meta
        response = client.put(
            f"/api/v1/metas/{meta_id}",
            json={"nome": "Meta Atualizada", "valor_alvo": "2000.00"},
            headers=headers_auth
        )

        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == "Meta Atualizada"
        # Decimal pode ser retornado como "2000" ou "2000.00"
        assert float(data["valor_alvo"]) == 2000.00

