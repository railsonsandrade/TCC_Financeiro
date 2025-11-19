"""
Testes de integração da API - Lançamentos
"""

import pytest
from datetime import date
from decimal import Decimal


@pytest.mark.integration
@pytest.mark.api
class TestLancamentosAPI:
    """Testes dos endpoints de lançamentos"""
    
    def test_criar_lancamento(self, client, headers_auth, conta_teste, categoria_teste):
        """Testa criação de lançamento"""
        response = client.post(
            "/api/v1/lancamentos",
            headers=headers_auth,
            json={
                "id_conta": conta_teste.id_conta,
                "id_categoria": categoria_teste.id_categoria,
                "tipo": "Despesa",
                "valor": 100.00,
                "data": date.today().isoformat(),
                "descricao": "Teste",
                "origem": "Manual",
                "pago": True
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert float(data["valor"]) == 100.00
        assert data["tipo"] == "Despesa"
    
    def test_criar_lancamento_tipo_incompativel(self, client, headers_auth, conta_teste, categoria_teste):
        """Testa RN002: Tipo incompatível com categoria"""
        response = client.post(
            "/api/v1/lancamentos",
            headers=headers_auth,
            json={
                "id_conta": conta_teste.id_conta,
                "id_categoria": categoria_teste.id_categoria,  # Categoria é Despesa
                "tipo": "Receita",  # Mas lançamento é Receita
                "valor": 100.00,
                "data": date.today().isoformat(),
                "descricao": "Teste",
                "origem": "Manual",
                "pago": True
            }
        )
        
        assert response.status_code == 400
        assert "não corresponde ao tipo da categoria" in response.json()["detail"]
    
    def test_listar_lancamentos(self, client, headers_auth, conta_teste, categoria_teste):
        """Testa listagem de lançamentos"""
        # Criar lançamento primeiro
        client.post(
            "/api/v1/lancamentos",
            headers=headers_auth,
            json={
                "id_conta": conta_teste.id_conta,
                "id_categoria": categoria_teste.id_categoria,
                "tipo": "Despesa",
                "valor": 100.00,
                "data": date.today().isoformat(),
                "descricao": "Teste",
                "origem": "Manual",
                "pago": True
            }
        )
        
        response = client.get(
            "/api/v1/lancamentos",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
    
    def test_listar_lancamentos_com_detalhes(self, client, headers_auth, conta_teste, categoria_teste):
        """Testa listagem de lançamentos com detalhes"""
        # Criar lançamento primeiro
        client.post(
            "/api/v1/lancamentos",
            headers=headers_auth,
            json={
                "id_conta": conta_teste.id_conta,
                "id_categoria": categoria_teste.id_categoria,
                "tipo": "Despesa",
                "valor": 100.00,
                "data": date.today().isoformat(),
                "descricao": "Teste",
                "origem": "Manual",
                "pago": True
            }
        )
        
        response = client.get(
            "/api/v1/lancamentos/detalhes",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert "nome_conta" in data[0]
        assert "nome_categoria" in data[0]
    
    def test_obter_totais_periodo(self, client, headers_auth, conta_teste, categoria_teste):
        """Testa RN003: Cálculo de totais do período"""
        # Criar lançamento
        client.post(
            "/api/v1/lancamentos",
            headers=headers_auth,
            json={
                "id_conta": conta_teste.id_conta,
                "id_categoria": categoria_teste.id_categoria,
                "tipo": "Despesa",
                "valor": 100.00,
                "data": date.today().isoformat(),
                "descricao": "Teste",
                "origem": "Manual",
                "pago": True
            }
        )
        
        response = client.get(
            "/api/v1/lancamentos/totais",
            headers=headers_auth,
            params={
                "data_inicio": date.today().isoformat(),
                "data_fim": date.today().isoformat()
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_receitas" in data
        assert "total_despesas" in data
        assert "saldo" in data
    
    def test_marcar_como_pago(self, client, headers_auth, conta_teste, categoria_teste):
        """Testa marcação de lançamento como pago"""
        # Criar lançamento não pago
        response_create = client.post(
            "/api/v1/lancamentos",
            headers=headers_auth,
            json={
                "id_conta": conta_teste.id_conta,
                "id_categoria": categoria_teste.id_categoria,
                "tipo": "Despesa",
                "valor": 100.00,
                "data": date.today().isoformat(),
                "descricao": "Teste",
                "origem": "Manual",
                "pago": False
            }
        )
        id_lancamento = response_create.json()["id_lancamento"]
        
        # Marcar como pago
        response = client.patch(
            f"/api/v1/lancamentos/{id_lancamento}/marcar-pago",
            headers=headers_auth
        )
        
        assert response.status_code == 200
        assert response.json()["pago"] is True

