"""
Script para popular o banco de dados do Usuário Demo para a Apresentação do TCC.
"""
import sys
import os
import sqlite3
from datetime import date, timedelta
import random

def populate_db():
    print("🚀 Populando banco de dados para a apresentação...")
    
    # Conectar ao banco de dados SQLite
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "tcc_financeira.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Pegar ID do usuário demo
    cursor.execute("SELECT id_usuario FROM usuario WHERE email='demo@nextwallet.com'")
    user = cursor.fetchone()
    if not user:
        print("❌ Usuário Demo não encontrado. Execute setup_demo_user.py primeiro.")
        return
    id_usuario = user[0]
    
    # 2. Garantir que tem uma conta
    cursor.execute(f"SELECT id_conta FROM conta_financeira WHERE id_usuario={id_usuario} LIMIT 1")
    conta = cursor.fetchone()
    if not conta:
        cursor.execute(f"INSERT INTO conta_financeira (id_usuario, nome, tipo, saldo_inicial, ativo) VALUES ({id_usuario}, 'Conta Corrente Padrão', 'Conta Corrente', 5000, 1)")
        id_conta = cursor.lastrowid
    else:
        id_conta = conta[0]
        
    # 3. Garantir Categorias Base
    categorias_padrao = [
        ('Alimentação', 'Despesa'),
        ('Salário', 'Receita'),
        ('Transporte', 'Despesa'),
        ('Lazer', 'Despesa'),
        ('Moradia', 'Despesa'),
        ('Freelance', 'Receita')
    ]
    
    categorias_ids = {}
    for nome, tipo in categorias_padrao:
        cursor.execute(f"SELECT id_categoria FROM categoria WHERE id_usuario={id_usuario} AND nome='{nome}'")
        cat = cursor.fetchone()
        if not cat:
            cursor.execute(f"INSERT INTO categoria (id_usuario, nome, tipo) VALUES ({id_usuario}, '{nome}', '{tipo}')")
            categorias_ids[nome] = cursor.lastrowid
        else:
            categorias_ids[nome] = cat[0]
            
    # 4. Inserir Lançamentos de Abril 2026
    # Vamos gerar alguns lançamentos realistas
    lancamentos_abril = [
        # Receitas
        (categorias_ids['Salário'], "Receita", 7500.00, "2026-04-05", "Salário Mensal", 1),
        (categorias_ids['Freelance'], "Receita", 1200.00, "2026-04-12", "Projeto Website", 1),
        
        # Despesas Fixas
        (categorias_ids['Moradia'], "Despesa", 2100.00, "2026-04-08", "Aluguel e Condomínio", 1),
        (categorias_ids['Moradia'], "Despesa", 250.00, "2026-04-10", "Conta de Luz", 1),
        (categorias_ids['Moradia'], "Despesa", 120.00, "2026-04-12", "Internet Fibra", 1),
        
        # Despesas Variáveis
        (categorias_ids['Alimentação'], "Despesa", 450.00, "2026-04-02", "Supermercado Mensal", 1),
        (categorias_ids['Alimentação'], "Despesa", 85.50, "2026-04-04", "Ifood - Pizza", 1),
        (categorias_ids['Alimentação'], "Despesa", 110.00, "2026-04-15", "Restaurante com amigos", 1),
        
        (categorias_ids['Transporte'], "Despesa", 200.00, "2026-04-06", "Uber/99", 1),
        (categorias_ids['Transporte'], "Despesa", 150.00, "2026-04-20", "Posto de Gasolina", 0),  # Não pago
        
        (categorias_ids['Lazer'], "Despesa", 350.00, "2026-04-18", "Ingressos Show", 1)
    ]
    
    # Limpar lançamentos de abril antes pra não duplicar no teste
    cursor.execute(f"DELETE FROM lancamento WHERE id_usuario={id_usuario} AND data >= '2026-04-01' AND data <= '2026-04-30'")
    
    for id_cat, tipo, valor, data, desc, pago in lancamentos_abril:
        cursor.execute(f"""
            INSERT INTO lancamento 
            (id_usuario, id_conta, id_categoria, tipo, valor, data, descricao, pago)
            VALUES ({id_usuario}, {id_conta}, {id_cat}, '{tipo}', {valor}, '{data}', '{desc}', {pago})
        """)
        
    print(f"✅ Lançamentos de Abril 2026 criados com sucesso!")
    
    # 5. Adicionar 2 Novas Metas (Em Andamento)
    # Limpar metas anteriores de "Apresentação" para evitar duplicidade
    cursor.execute(f"DELETE FROM meta_financeira WHERE id_usuario={id_usuario}")
    
    novas_metas = [
        ("Viagem Final de Ano", 5000.00, 1500.00, "2026-12-01", "Guarda de dinheiro para viagem nas férias", "Em Andamento"),
        ("Reserva de Emergência", 10000.00, 4300.00, "2027-01-01", "Construindo 3 meses de despesas", "Em Andamento"),
        ("Notebook Novo", 3500.00, 3500.00, "2026-03-31", "Macbook para o TCC", "Concluída"),
        ("Quitação do Carro", 15000.00, 15000.00, "2026-02-15", "Últimas parcelas quitadas", "Concluída")
    ]
    
    for nome, alvo, atual, prazo, desc, status in novas_metas:
        cursor.execute(f"""
            INSERT INTO meta_financeira
            (id_usuario, nome, valor_alvo, valor_atual, data_inicio, data_fim_prev, status)
            VALUES ({id_usuario}, '{nome}', {alvo}, {atual}, '2026-01-01', '{prazo}', '{status}')
        """)
        
    print(f"✅ Novas metas adicionadas, e algumas marcadas como Concluídas!")
    
    # Atualizar total da conta (só visualmente)
    conn.commit()
    conn.close()
    
    print("\n" + "="*60)
    print("🎉 BANCO DE DADOS POPULADO PARA A APRESENTAÇÃO!")
    print("="*60)

if __name__ == "__main__":
    populate_db()
