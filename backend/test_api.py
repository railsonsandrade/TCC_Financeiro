"""
Script de teste da API REST
Testa todos os endpoints criados na FASE 5
"""

import requests
import json
from datetime import date, timedelta
from decimal import Decimal


BASE_URL = "http://localhost:8000/api/v1"


def print_section(title):
    """Imprime uma seção formatada"""
    print("\n" + "=" * 60)
    print(f"📝 {title}")
    print("=" * 60)


def print_success(message):
    """Imprime mensagem de sucesso"""
    print(f"   ✅ {message}")


def print_error(message):
    """Imprime mensagem de erro"""
    print(f"   ❌ {message}")


def test_auth():
    """Testa endpoints de autenticação"""
    print_section("Testando Autenticação")
    
    # 1. Login
    print("\n1. Login...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "joao@example.com",
            "senha": "senha123"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data["access_token"]
        print_success(f"Login bem-sucedido! Token: {token[:30]}...")
        return token
    else:
        print_error(f"Erro no login: {response.status_code} - {response.text}")
        return None


def test_me(token):
    """Testa endpoint /auth/me"""
    print("\n2. Obter usuário autenticado...")
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Usuário: {data['nome']} ({data['email']})")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")


def test_contas(token):
    """Testa endpoints de contas"""
    print_section("Testando Contas Financeiras")
    
    # 1. Listar contas
    print("\n1. Listar contas...")
    response = requests.get(
        f"{BASE_URL}/contas",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        contas = response.json()
        print_success(f"Contas encontradas: {len(contas)}")
        for conta in contas:
            print(f"      - {conta['nome']} ({conta['tipo']})")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")
    
    # 2. Listar contas com saldo
    print("\n2. Listar contas com saldo...")
    response = requests.get(
        f"{BASE_URL}/contas/com-saldo",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        contas = response.json()
        print_success(f"Contas com saldo:")
        total = 0
        for conta in contas:
            saldo = float(conta['saldo_atual'])
            total += saldo
            print(f"      - {conta['nome']}: R$ {saldo:.2f}")
        print(f"      Total: R$ {total:.2f}")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")


def test_categorias(token):
    """Testa endpoints de categorias"""
    print_section("Testando Categorias")
    
    # 1. Listar categorias
    print("\n1. Listar categorias...")
    response = requests.get(
        f"{BASE_URL}/categorias",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        categorias = response.json()
        print_success(f"Categorias encontradas: {len(categorias)}")
        for cat in categorias[:5]:  # Mostrar apenas 5
            print(f"      - {cat['nome']} ({cat['tipo']}) - {cat['grupo_50_30_20']}")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")
    
    # 2. Listar por grupo
    print("\n2. Listar categorias Essenciais...")
    response = requests.get(
        f"{BASE_URL}/categorias/grupo/Essencial",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        categorias = response.json()
        print_success(f"Categorias Essenciais: {len(categorias)}")
        for cat in categorias:
            print(f"      - {cat['nome']}")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")


def test_lancamentos(token):
    """Testa endpoints de lançamentos"""
    print_section("Testando Lançamentos")

    # 1. Listar lançamentos com detalhes
    print("\n1. Listar lançamentos com detalhes...")
    response = requests.get(
        f"{BASE_URL}/lancamentos/detalhes",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        lancamentos = response.json()
        print_success(f"Lançamentos encontrados: {len(lancamentos)}")
        for lanc in lancamentos[:3]:  # Mostrar apenas 3
            print(f"      - {lanc['data']}: {lanc['tipo']} R$ {lanc['valor']}")
            print(f"        {lanc['descricao']}")
            print(f"        Conta: {lanc['nome_conta']} | Categoria: {lanc['nome_categoria']}")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")

    # 2. Obter totais do período
    print("\n2. Obter totais do mês atual...")
    hoje = date.today()
    primeiro_dia = date(hoje.year, hoje.month, 1)

    response = requests.get(
        f"{BASE_URL}/lancamentos/totais",
        params={
            "data_inicio": primeiro_dia.isoformat(),
            "data_fim": hoje.isoformat()
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        totais = response.json()
        print_success("Totais do mês:")
        print(f"      - Receitas: R$ {totais['total_receitas']}")
        print(f"      - Despesas: R$ {totais['total_despesas']}")
        print(f"      - Saldo: R$ {totais['saldo']}")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")


def test_metas(token):
    """Testa endpoints de metas"""
    print_section("Testando Metas Financeiras")

    # 1. Listar metas com progresso
    print("\n1. Listar metas com progresso...")
    response = requests.get(
        f"{BASE_URL}/metas/com-progresso",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        metas = response.json()
        print_success(f"Metas encontradas: {len(metas)}")
        for meta in metas:
            print(f"      - {meta['nome']}: R$ {meta['valor_atual']} / R$ {meta['valor_alvo']}")
            print(f"        Progresso: {meta['percentual_atingido']:.1f}%")
            print(f"        Faltam: R$ {meta['valor_faltante']}")
            print(f"        Status: {meta['status']}")
    else:
        print_error(f"Erro: {response.status_code} - {response.text}")


def test_error_handling(token):
    """Testa tratamento de erros"""
    print_section("Testando Tratamento de Erros")

    # 1. Tentar acessar conta inexistente
    print("\n1. Tentar acessar conta inexistente...")
    response = requests.get(
        f"{BASE_URL}/contas/99999",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 404:
        print_success(f"Erro 404 retornado corretamente: {response.json()['detail']}")
    else:
        print_error(f"Erro inesperado: {response.status_code}")

    # 2. Tentar criar conta com nome duplicado
    print("\n2. Tentar criar conta com nome duplicado...")
    response = requests.post(
        f"{BASE_URL}/contas",
        json={
            "nome": "Conta Corrente",
            "tipo": "Conta Corrente",
            "saldo_inicial": 1000
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 400:
        print_success(f"Erro 400 retornado corretamente: {response.json()['detail']}")
    else:
        print_error(f"Erro inesperado: {response.status_code}")

    # 3. Tentar acessar sem token
    print("\n3. Tentar acessar sem token...")
    response = requests.get(f"{BASE_URL}/contas")

    if response.status_code == 403:
        print_success("Erro 403 retornado corretamente (sem autenticação)")
    else:
        print_error(f"Erro inesperado: {response.status_code}")


def main():
    """Função principal"""
    print("\n" + "=" * 60)
    print("TESTE DA API REST - FASE 5")
    print("=" * 60)

    # 1. Autenticação
    token = test_auth()
    if not token:
        print_error("Falha na autenticação. Abortando testes.")
        return

    # 2. Testar /auth/me
    test_me(token)

    # 3. Testar contas
    test_contas(token)

    # 4. Testar categorias
    test_categorias(token)

    # 5. Testar lançamentos
    test_lancamentos(token)

    # 6. Testar metas
    test_metas(token)

    # 7. Testar tratamento de erros
    test_error_handling(token)

    print("\n" + "=" * 60)
    print("🎉 TODOS OS TESTES DA API CONCLUÍDOS!")
    print("=" * 60)
    print("\n💡 Acesse a documentação interativa em:")
    print("   📖 Swagger UI: http://localhost:8000/docs")
    print("   📖 ReDoc: http://localhost:8000/redoc")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

