import socket
import time
import requests
import os
from dotenv import load_dotenv

# Monkeypatch para forçar IPv4 e evitar [Errno 11002] getaddrinfo failed
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [response for response in responses if response[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo

# Carregar variáveis de ambiente
load_dotenv(".env")
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_URL = "http://127.0.0.1:8000/api/v1/telegram/webhook"

if not TOKEN:
    print("ERRO: TELEGRAM_BOT_TOKEN não encontrado em backend/.env")
    exit(1)

print("Iniciando Dev Poller...")
print("Limpando Webhooks configurados no Telegram...")
requests.get(f"https://api.telegram.org/bot{TOKEN}/deleteWebhook")

offset = 0
print(f"Escutando mensagens... (Aperte Ctrl+C para parar)")

while True:
    try:
        res = requests.get(f"https://api.telegram.org/bot{TOKEN}/getUpdates?offset={offset}&timeout=30", timeout=40).json()
        if res.get("ok"):
            for update in res["result"]:
                offset = update["update_id"] + 1
                try:
                    r = requests.post(WEBHOOK_URL, json=update, timeout=10)
                    print(f"Update repassado: {update['update_id']} -> Local API (HTTP {r.status_code})")
                except requests.exceptions.RequestException as e:
                    print(f"Erro ao repassar update para a API local (API está rodando?): {e}")
        time.sleep(1)
    except Exception as e:
        print(f"Erro na conexão com o Telegram: {e}")
        time.sleep(5)
