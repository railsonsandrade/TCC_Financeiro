import os
import psycopg2

def init_db():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print('Erro: DATABASE_URL nao configurada.')
        return
    if not db_url.startswith('postgres'):
        print('Isso parece ser SQLite, ignorer.')
        return
    
    print('Conectando ao PostgreSQL...')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    with open('app/schema_postgres.sql', 'r', encoding='utf-8') as f:
        schema = f.read()
        
    print('Criando tabelas...')
    cursor.execute(schema)
    conn.commit()
    cursor.close()
    conn.close()
    print('Banco de dados inicializado com sucesso!')

if __name__ == '__main__':
    init_db()
