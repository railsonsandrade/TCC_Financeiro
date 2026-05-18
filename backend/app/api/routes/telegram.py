"""
Rota Telegram Bot — Sob Controle
Integração direta com a API do Telegram (sem OpenClaw ou intermediários).
Custo: ZERO. Setup: crie um bot em @BotFather e coloque o token no .env.

Comandos suportados:
  /start       — Boas-vindas e instruções de vinculação
  /vincular    — Vincula o número de telefone Telegram à conta do sistema
  /saldo       — Consulta saldo de todas as contas
  /extrato     — Últimos 10 lançamentos
  /resumo      — Resumo do mês atual (receitas, despesas, saldo)
  /metas       — Lista metas ativas com progresso
  /gasto       — Registra despesa: /gasto 50 Almoço
  /receita     — Registra receita: /receita 3000 Salário
  /copilot     — Pergunta à PatarIA: /copilot em que gastei mais?
  /ajuda       — Lista de comandos
"""

import hmac
import hashlib
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Request, Header
from pydantic import BaseModel, Field
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])


# ─── Schemas do Telegram ─────────────────────────────────────────────────────

class TelegramUser(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None


class TelegramChat(BaseModel):
    id: int
    type: str


class TelegramMessage(BaseModel):
    message_id: int
    from_user: Optional[TelegramUser] = Field(None, alias="from")
    chat: TelegramChat
    text: Optional[str] = None

    model_config = {"populate_by_name": True}


class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[TelegramMessage] = None

    model_config = {"populate_by_name": True}


# ─── Helpers ──────────────────────────────────────────────────────────────────

HELP_TEXT = """
*Sob Controle — Bot Telegram*

*Consultas:*
/saldo — Ver saldo das contas
/extrato — Últimos 10 lançamentos
/resumo — Resumo do mês atual
/metas — Metas financeiras ativas

*Registro rápido:*
/gasto 50 Almoço — Registrar despesa
/receita 3000 Salário — Registrar receita

*Inteligência Artificial:*
/copilot [pergunta] — Perguntar à PatarIA

*Conta:*
/vincular [código] — Vincular sua conta
/ajuda — Esta mensagem de ajuda
"""


def _build_telegram_api_url(method: str) -> str:
    token = settings.TELEGRAM_BOT_TOKEN
    return f"https://api.telegram.org/bot{token}/{method}"


async def _send_message(chat_id: int, text: str, parse_mode: str = "Markdown") -> None:
    """Envia uma mensagem de volta ao usuário via Telegram API."""
    import httpx
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN não configurado — mensagem não enviada")
        return
    url = _build_telegram_api_url("sendMessage")
    payload = {"chat_id": chat_id, "text": text, "parse_mode": parse_mode}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            logger.error(f"Erro ao enviar mensagem Telegram: {resp.text}")


def _parse_command(text: str):
    """Extrai o comando e os argumentos de uma mensagem Telegram."""
    parts = text.strip().split(maxsplit=1)
    cmd = parts[0].lower().lstrip("/").split("@")[0]  # remove @botname se houver
    args = parts[1] if len(parts) > 1 else ""
    return cmd, args


# ─── Processador de comandos ──────────────────────────────────────────────────

async def _handle_message(message: TelegramMessage) -> None:
    """Roteador de comandos do bot."""
    chat_id = message.chat.id
    text = (message.text or "").strip()

    if not text:
        return

    if not text.startswith("/"):
        await _send_message(chat_id, "Não entendi. Digite /ajuda para ver os comandos disponíveis.")
        return

    cmd, args = _parse_command(text)

    if cmd in ("start", "ajuda", "help"):
        await _send_message(chat_id, HELP_TEXT)

    elif cmd == "saldo":
        await _send_message(
            chat_id,
            "⚠️ *Funcionalidade em implementação*\n\n"
            "Para ver seu saldo, acesse o sistema web.\n"
            "Vincule sua conta com /vincular para habilitar os comandos."
        )

    elif cmd == "resumo":
        await _send_message(
            chat_id,
            "⚠️ *Funcionalidade em implementação*\n\n"
            "O resumo do mês estará disponível após a vinculação da conta.\n"
            "Use /vincular [código] para começar."
        )

    elif cmd == "extrato":
        await _send_message(
            chat_id,
            "⚠️ *Funcionalidade em implementação*\n\n"
            "O extrato estará disponível após a vinculação da conta."
        )

    elif cmd == "metas":
        await _send_message(
            chat_id,
            "⚠️ *Funcionalidade em implementação*\n\n"
            "Suas metas aparecerão aqui após vincular a conta."
        )

    elif cmd in ("gasto", "despesa"):
        await _send_message(
            chat_id,
            f"⚠️ *Registro em implementação*\n\n"
            f"Você tentou registrar: `{args}`\n"
            "Esta funcionalidade estará disponível em breve!"
        )

    elif cmd in ("receita", "entrada"):
        await _send_message(
            chat_id,
            f"⚠️ *Registro em implementação*\n\n"
            f"Você tentou registrar receita: `{args}`\n"
            "Esta funcionalidade estará disponível em breve!"
        )

    elif cmd == "copilot":
        if args:
            await _send_message(chat_id, f"🤖 *PatarIA*\n\nSua pergunta: _{args}_\n\nEsta integração estará disponível em breve!")
        else:
            await _send_message(chat_id, "Uso: /copilot [sua pergunta]\nExemplo: /copilot em que gastei mais este mês?")

    elif cmd == "vincular":
        if args:
            await _send_message(
                chat_id,
                f"🔗 *Vinculação de conta*\n\nCódigo recebido: `{args}`\n\n"
                "Validação em implementação. Em breve você poderá vincular sua conta!"
            )
        else:
            await _send_message(
                chat_id,
                "Para vincular sua conta:\n"
                "1. Acesse o sistema web → Perfil → Gerar código de vinculação\n"
                "2. Envie aqui: /vincular SEU_CODIGO"
            )

    else:
        await _send_message(chat_id, f"Comando `/{cmd}` não reconhecido. Use /ajuda para ver os comandos disponíveis.")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/webhook", summary="Webhook do Telegram Bot")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None),
):
    """
    Endpoint de webhook para receber updates do Telegram.
    Configure o webhook no Telegram apontando para:
      POST https://seu-dominio.com/api/v1/telegram/webhook
    """
    # Validar secret token opcional (configure no setWebhook com secret_token)
    webhook_secret = getattr(settings, "TELEGRAM_WEBHOOK_SECRET", "")
    if webhook_secret and x_telegram_bot_api_secret_token != webhook_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    try:
        body = await request.json()
        update = TelegramUpdate.model_validate(body)

        if update.message:
            await _handle_message(update.message)

        return {"ok": True}

    except Exception as e:
        logger.exception(f"Erro ao processar update do Telegram: {e}")
        # Sempre retorna 200 para o Telegram não reenviar o update
        return {"ok": False, "error": str(e)}


@router.get("/status", summary="Status do Telegram Bot")
async def telegram_status():
    """Verifica se o bot está configurado."""
    token_configurado = bool(settings.TELEGRAM_BOT_TOKEN)
    return {
        "status": "active" if token_configurado else "not_configured",
        "bot_configurado": token_configurado,
        "instrucoes": (
            "Configure TELEGRAM_BOT_TOKEN no .env e registre o webhook com:\n"
            "curl -X POST https://api.telegram.org/bot{TOKEN}/setWebhook"
            " -d 'url=https://seu-dominio.com/api/v1/telegram/webhook'"
            if not token_configurado else "Bot pronto. Acesse /api/v1/telegram/status para monitorar."
        )
    }
