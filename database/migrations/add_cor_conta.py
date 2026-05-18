import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "tcc_financeira.db")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(conta_financeira)")
cols = [row[1] for row in cur.fetchall()]

if "cor" not in cols:
    cur.execute("ALTER TABLE conta_financeira ADD COLUMN cor VARCHAR(7) DEFAULT '#3B82F6'")
    conn.commit()
    print("OK: coluna 'cor' adicionada em conta_financeira")
else:
    print("INFO: coluna 'cor' ja existe")

conn.close()
