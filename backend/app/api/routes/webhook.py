"""
Webhook para integração WhatsApp via OpenClaw
NOTA: Este é um placeholder preparatório. A implementação completa
será feita quando o OpenClaw for configurado.
Veja docs/OPENCLAW_GUIDE.md para instruções de setup.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Header, Request
from pydantic import BaseModel
from app.config import settings


router = APIRouter(prefix="/webhook", tags=["Webhook WhatsApp"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class WhatsAppMessage(BaseModel):
    """Mensagem recebida do OpenClaw"""
    event: str  # "message", "status", etc.
    sender: Optional[str] = None  # Número WhatsApp (+5511999999999) - campo alternativo
    message: str
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    # Campo "from" é reservado em Python, tratamos como alias
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "event": "message",
                "from": "+5511999999999",
                "message": "saldo",
                "timestamp": "2026-04-07T12:00:00Z",
                "metadata": {"channel": "whatsapp"}
            }
        }


class WhatsAppResponse(BaseModel):
    """Resposta para o OpenClaw"""
    reply: str
    status: str = "success"


# ─── Comandos suportados (futuro) ────────────────────────────────────────────

COMMAND_HELP = """
📱 *Sob Controle - Comandos WhatsApp*

💸 *Lançamentos:*
• `gasto 50 almoço` - Registrar despesa
• `receita 3000 salário` - Registrar receita

📊 *Consultas:*
• `saldo` - Ver saldo das contas
• `extrato` - Últimos lançamentos
• `resumo` - Resumo do mês

🎯 *Metas:*
• `metas` - Ver metas ativas
• `guardar 200 viagem` - Adicionar valor à meta

🤖 *IA:*
• `copilot [pergunta]` - Perguntar ao Copilot

❓ *Ajuda:*
• `ajuda` - Ver esta lista de comandos
"""


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/whatsapp", response_model=WhatsAppResponse, summary="Webhook WhatsApp (OpenClaw)")
async def webhook_whatsapp(
    message: WhatsAppMessage,
    request: Request,
    x_webhook_secret: Optional[str] = Header(None),
):
    """
    Endpoint de webhook para receber mensagens do WhatsApp via OpenClaw.
    
    **STATUS: PLACEHOLDER** - Este endpoint está preparado mas ainda não 
    processa comandos reais. Veja docs/OPENCLAW_GUIDE.md para setup completo.
    """
    # Validar secret (quando configurado)
    webhook_secret = getattr(settings, 'OPENCLAW_WEBHOOK_SECRET', '')
    if webhook_secret and x_webhook_secret != webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Webhook secret inválido"
        )
    
    # Log da mensagem recebida (para debug)
    print(f"[WhatsApp Webhook] Evento: {message.event}, De: {message.sender}, Msg: {message.message}")
    
    # Placeholder - retorna mensagem de que a feature está em desenvolvimento
    if message.event == "message":
        msg_lower = message.message.strip().lower()
        
        if msg_lower in ("ajuda", "help", "?"):
            return WhatsAppResponse(reply=COMMAND_HELP)
        
        return WhatsAppResponse(
            reply=(
                "🚧 *Sob Controle via WhatsApp*\n\n"
                "Esta funcionalidade está em desenvolvimento!\n\n"
                "Em breve você poderá controlar suas finanças "
                "diretamente pelo WhatsApp.\n\n"
                "Digite `ajuda` para ver os comandos que estarão disponíveis."
            )
        )
    
    return WhatsAppResponse(
        reply="Evento recebido",
        status="ok"
    )


@router.get("/whatsapp/status", summary="Status do webhook WhatsApp")
async def webhook_status():
    """Verifica se o webhook está ativo e configurado"""
    has_secret = bool(getattr(settings, 'OPENCLAW_WEBHOOK_SECRET', ''))
    has_api_key = bool(getattr(settings, 'OPENCLAW_API_KEY', ''))
    
    return {
        "status": "active",
        "webhook_configured": has_secret,
        "openclaw_configured": has_api_key,
        "feature_status": "placeholder",
        "message": "Webhook preparado. Veja docs/OPENCLAW_GUIDE.md para setup completo."
    }
