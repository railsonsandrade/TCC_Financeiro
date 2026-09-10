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
from fastapi import APIRouter, HTTPException, status, Request, Header, Depends
from pydantic import BaseModel, Field
from app.config import settings
from app.api.dependencies import get_current_user
from app.utils.database import get_db

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


from app.services.telegram_service import TelegramService
from app.services.conta_financeira_service import ContaFinanceiraService
from app.services.lancamento_service import LancamentoService
from app.services.meta_financeira_service import MetaFinanceiraService
from app.services.categoria_service import CategoriaService
from app.api.routes.copilot import get_financial_context, call_ai_api, CopilotMessage
from app.schemas.lancamento import LancamentoCreate

from decimal import Decimal
from datetime import date


from app.services.telegram_service import TelegramService
from app.services.conta_financeira_service import ContaFinanceiraService
from app.services.lancamento_service import LancamentoService
from app.services.meta_financeira_service import MetaFinanceiraService
from app.services.categoria_service import CategoriaService
from app.api.routes.copilot import get_financial_context, call_ai_api, CopilotMessage
from app.schemas.lancamento import LancamentoCreate

from decimal import Decimal
from datetime import date

async def _handle_message(message: TelegramMessage) -> None:
    """Roteador de comandos do bot."""
    chat_id = message.chat.id
    username = getattr(message.from_user, "username", "") or ""
    text = (message.text or "").strip()

    if not text:
        return

    if not text.startswith("/"):
        await _send_message(chat_id, "Não entendi. Digite /ajuda para ver os comandos disponíveis.")
        return

    cmd, args = _parse_command(text)

    if cmd in ("start", "ajuda", "help"):
        await _send_message(chat_id, HELP_TEXT)
        return

    ts = TelegramService()

    if cmd == "vincular":
        if args:
            sucesso = ts.vincular(chat_id, username, args.strip().upper())
            if sucesso:
                await _send_message(chat_id, "✅ *Conta vinculada com sucesso!*\n\nAgora você pode usar todos os comandos.")
            else:
                await _send_message(chat_id, "❌ *Código inválido ou expirado.*\n\nGere um novo código no painel web.")
        else:
            await _send_message(chat_id, "Para vincular sua conta:\n1. Acesse o sistema web → Configurações → Telegram\n2. Gere o código e envie: `/vincular SEU_CODIGO`")
        return

    id_usuario = ts.get_usuario_by_chat_id(chat_id)
    if not id_usuario:
        await _send_message(chat_id, "⚠️ Você precisa vincular sua conta primeiro. Use `/vincular [código]`")
        return

    # Comandos autenticados
    if cmd == "saldo":
        try:
            contas = ContaFinanceiraService().listar_contas_com_saldo(id_usuario)
            if not contas:
                await _send_message(chat_id, "Nenhuma conta financeira ativa encontrada.")
                return
            linhas = ["💰 *Saldo das Contas*"]
            total = Decimal("0.0")
            for c in contas:
                linhas.append(f"🔹 {c.nome}: R$ {c.saldo_atual:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
                total += c.saldo_atual
            linhas.append(f"\n*Total:* R$ {total:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
            await _send_message(chat_id, "\n".join(linhas))
        except Exception as e:
            await _send_message(chat_id, f"Erro ao buscar saldo: {e}")

    elif cmd == "resumo":
        try:
            hoje = date.today()
            import calendar
            data_inicio = hoje.replace(day=1)
            ultimo_dia = calendar.monthrange(hoje.year, hoje.month)[1]
            data_fim = hoje.replace(day=ultimo_dia)
            resumo = LancamentoService().obter_totais_periodo(id_usuario, data_inicio, data_fim)
            
            # Converter de volta para Decimal pois o service retorna str
            rec = Decimal(str(resumo['total_receitas']))
            desp = Decimal(str(resumo['total_despesas']))
            saldo = Decimal(str(resumo['saldo']))
            
            msg = (
                f"📈 *Resumo do Mês ({hoje.month:02d}/{hoje.year})*\n\n"
                f"🔼 Receitas: R$ {rec:,.2f}\n"
                f"🔽 Despesas: R$ {desp:,.2f}\n"
                f"💰 Saldo do Mês: R$ {saldo:,.2f}"
            ).replace(",", "X").replace(".", ",").replace("X", ".")
            await _send_message(chat_id, msg)
        except Exception as e:
            await _send_message(chat_id, f"Erro ao buscar resumo: {e}")

    elif cmd == "extrato":
        try:
            lancamentos = LancamentoService().listar_lancamentos(id_usuario, skip=0, limit=10)
            if not lancamentos:
                await _send_message(chat_id, "Nenhum lançamento recente.")
                return
            linhas = ["📋 *Últimos 10 lançamentos*"]
            for l in lancamentos:
                icone = "🟢" if l.tipo == "Receita" else "🔴"
                data_str = l.data.strftime("%d/%m")
                desc_str = l.descricao or ''
                linhas.append(f"{icone} {data_str} - {desc_str}: R$ {l.valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
            await _send_message(chat_id, "\n".join(linhas))
        except Exception as e:
            await _send_message(chat_id, f"Erro ao buscar extrato: {e}")

    elif cmd == "metas":
        try:
            metas = MetaFinanceiraService().listar_metas(id_usuario)
            if not metas:
                await _send_message(chat_id, "Nenhuma meta ativa.")
                return
            linhas = ["🎯 *Suas Metas*"]
            for m in metas:
                pct = (m.valor_atual / m.valor_alvo) * 100 if m.valor_alvo > 0 else 0
                linhas.append(f"🔹 {m.nome}: R$ {m.valor_atual:,.2f} / R$ {m.valor_alvo:,.2f} ({pct:.1f}%)".replace(",", "X").replace(".", ",").replace("X", "."))
            await _send_message(chat_id, "\n".join(linhas))
        except Exception as e:
            await _send_message(chat_id, f"Erro ao buscar metas: {e}")

    elif cmd in ("gasto", "despesa", "receita", "entrada"):
        tipo = "Despesa" if cmd in ("gasto", "despesa") else "Receita"
        if not args:
            await _send_message(chat_id, f"Uso: `/{cmd} [valor] [descrição]`\nExemplo: `/{cmd} 50.00 Almoço`")
            return
        
        try:
            parts = args.split(" ", 1)
            valor_str = parts[0].replace(",", ".")
            valor = Decimal(valor_str)
            desc = parts[1] if len(parts) > 1 else f"{tipo} rápida (Telegram)"
            
            conta_svc = ContaFinanceiraService()
            cat_svc = CategoriaService()
            lanc_svc = LancamentoService()
            
            contas = conta_svc.listar_contas(id_usuario)
            if not contas:
                await _send_message(chat_id, f"⚠️ Crie uma conta no sistema primeiro.")
                return
            id_conta = contas[0].id_conta
            
            categorias = cat_svc.listar_categorias(id_usuario)
            cat_match = next((c for c in categorias if c.tipo == tipo), None)
            if not cat_match:
                await _send_message(chat_id, f"⚠️ Crie pelo menos uma categoria de {tipo} no sistema.")
                return
                
            lancamento = LancamentoCreate(
                id_conta=id_conta,
                id_categoria=cat_match.id_categoria,
                tipo=tipo,
                valor=valor,
                data=date.today(),
                descricao=desc,
                pago=True
            )
            lanc_svc.criar_lancamento(id_usuario, lancamento)
            icone = "🔴" if tipo == "Despesa" else "🟢"
            await _send_message(chat_id, f"✅ {icone} {tipo} de R$ {valor:,.2f} registrada com sucesso!".replace(",", "X").replace(".", ",").replace("X", "."))
            
        except Exception as e:
            await _send_message(chat_id, f"❌ Erro ao registrar: verifique o formato do valor. Ex: `/{cmd} 50.50 Almoço`\n({e})")

    elif cmd == "copilot":
        if not args:
            await _send_message(chat_id, "Uso: `/copilot [sua pergunta]`")
            return
            
        await _send_message(chat_id, "⏳ *PatarIA pensando...*")
        try:
            contexto = get_financial_context(id_usuario)
            msg = CopilotMessage(role="user", content=args)
            resposta = await call_ai_api([msg], contexto)
            await _send_message(chat_id, f"🤖 *PatarIA*\n\n{resposta}")
        except Exception as e:
            await _send_message(chat_id, f"❌ Erro ao consultar a PatarIA.")

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
async def telegram_status(db=Depends(get_db), current_user=Depends(get_current_user)):
    """Verifica se o bot está configurado e se o usuário está vinculado."""
    from app.services.telegram_service import TelegramService
    token_configurado = bool(settings.TELEGRAM_BOT_TOKEN)
    
    if not token_configurado:
        return {
            "status": "not_configured",
            "bot_configurado": False,
            "vinculado": False
        }
        
    ts = TelegramService()
    status_vinculo = ts.get_status(current_user.id_usuario)
    
    return {
        "status": "active",
        "bot_configurado": True,
        "vinculado": status_vinculo["vinculado"],
        "codigo": status_vinculo["codigo"],
        "username": status_vinculo.get("username")
    }

@router.post("/gerar-codigo", summary="Gera código de vinculação do Telegram")
async def gerar_codigo_telegram(db=Depends(get_db), current_user=Depends(get_current_user)):
    """Gera um código temporário para vincular o Telegram ao usuário logado."""
    from app.services.telegram_service import TelegramService
    ts = TelegramService()
    codigo = ts.gerar_codigo(current_user.id_usuario)
    return {"codigo": codigo}
