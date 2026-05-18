import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "tcc_financeira.db")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(telegram_vinculos)")
if not cur.fetchall():
    cur.execute("""
        CREATE TABLE IF NOT EXISTS telegram_vinculos (
            id_vinculo INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            telegram_chat_id INTEGER NOT NULL UNIQUE,
            telegram_username VARCHAR(100),
            codigo_vinculo VARCHAR(10),
            ativo BOOLEAN NOT NULL DEFAULT 1,
            data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_telegram_chat_id ON telegram_vinculos(telegram_chat_id)")
    conn.commit()
    print("OK: tabela telegram_vinculos criada")
else:
    print("INFO: tabela telegram_vinculos ja existe")

conn.close()
