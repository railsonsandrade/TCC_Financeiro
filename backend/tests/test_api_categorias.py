"""
Testes de integração da API de Categorias
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.api
class TestCategoriasAPI:
    """Testes da API de Categorias"""
    
    def test_criar_categoria(self, client, headers_auth):
        """Testa criação de categoria via API"""
        response = client.post(
            "/api/v1/categorias",
            json={
                "nome": "Alimentação",
                "tipo": "Despesa",
                "grupo_50_30_20": "Essencial"
            },
            headers=headers_auth
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Alimentação"
        assert data["tipo"] == "Despesa"
        assert data["grupo_50_30_20"] == "Essencial"
    
    def test_criar_categoria_sem_autenticacao(self, client):
        """Testa que criação de categoria requer autenticação"""
        response = client.post(
            "/api/v1/categorias",
            json={
                "nome": "Teste",
                "tipo": "Despesa",
                "grupo_50_30_20": "Essencial"
            }
        )

        # FastAPI retorna 403 quando não há token
        assert response.status_code in [401, 403]
    
    def test_criar_categoria_nome_duplicado(self, client, headers_auth):
        """Testa que não permite criar categoria com nome duplicado"""
        categoria_data = {
            "nome": "Transporte",
            "tipo": "Despesa",
            "grupo_50_30_20": "Essencial"
        }
        
        # Criar primeira categoria
        client.post("/api/v1/categorias", json=categoria_data, headers=headers_auth)
        
        # Tentar criar categoria com mesmo nome
        response = client.post("/api/v1/categorias", json=categoria_data, headers=headers_auth)
        
        assert response.status_code == 400
    
    def test_listar_categorias(self, client, headers_auth, categoria_teste):
        """Testa listagem de categorias"""
        response = client.get("/api/v1/categorias", headers=headers_auth)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_listar_categorias_por_tipo(self, client, headers_auth):
        """Testa listagem de categorias filtradas por tipo"""
        # Criar categoria de despesa
        client.post(
            "/api/v1/categorias",
            json={"nome": "Despesa 1", "tipo": "Despesa", "grupo_50_30_20": "Essencial"},
            headers=headers_auth
        )
        
        # Criar categoria de receita
        client.post(
            "/api/v1/categorias",
            json={"nome": "Receita 1", "tipo": "Receita"},
            headers=headers_auth
        )
        
        # Listar apenas despesas
        response = client.get("/api/v1/categorias?tipo=Despesa", headers=headers_auth)
        
        assert response.status_code == 200
        data = response.json()
        assert all(c["tipo"] == "Despesa" for c in data)
    
    def test_obter_categoria(self, client, headers_auth, categoria_teste):
        """Testa obtenção de categoria por ID"""
        response = client.get(
            f"/api/v1/categorias/{categoria_teste.id_categoria}",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id_categoria"] == categoria_teste.id_categoria
    
    def test_obter_categoria_inexistente(self, client, headers_auth):
        """Testa obtenção de categoria inexistente"""
        response = client.get("/api/v1/categorias/99999", headers=headers_auth)
        
        assert response.status_code == 404
    
    def test_atualizar_categoria(self, client, headers_auth, categoria_teste):
        """Testa atualização de categoria"""
        response = client.put(
            f"/api/v1/categorias/{categoria_teste.id_categoria}",
            json={"nome": "Categoria Atualizada"},
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == "Categoria Atualizada"
    
    def test_desativar_categoria(self, client, headers_auth, categoria_teste):
        """Testa desativação de categoria"""
        response = client.delete(
            f"/api/v1/categorias/{categoria_teste.id_categoria}",
            headers=headers_auth
        )

        # DELETE retorna 204 No Content
        assert response.status_code == 204
    
    def test_listar_categorias_por_grupo(self, client, headers_auth):
        """Testa listagem de categorias agrupadas por 50/30/20"""
        # Criar categorias de diferentes grupos
        client.post(
            "/api/v1/categorias",
            json={"nome": "Essencial 1", "tipo": "Despesa", "grupo_50_30_20": "Essencial"},
            headers=headers_auth
        )
        
        client.post(
            "/api/v1/categorias",
            json={"nome": "Desejável 1", "tipo": "Despesa", "grupo_50_30_20": "Desejável"},
            headers=headers_auth
        )
        
        response = client.get("/api/v1/categorias/por-grupo", headers=headers_auth)
        
        assert response.status_code == 200
        data = response.json()
        assert "Essencial" in data
        assert "Desejável" in data

