
from app.services.telegram_service import TelegramService
from app.services.conta_financeira_service import ContaFinanceiraService
from app.services.lancamento_service import LancamentoService
from app.services.meta_financeira_service import MetaFinanceiraService
from app.services.categoria_service import CategoriaService
from app.api.routes.copilot import get_financial_context, call_ai_api
from app.schemas.lancamento import LancamentoCreate
from app.schemas.copilot import CopilotMessage
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
            contas = ContaFinanceiraService().listar_contas(id_usuario)
            if not contas:
                await _send_message(chat_id, "Nenhuma conta financeira ativa encontrada.")
                return
            linhas = ["💰 *Saldo das Contas*"]
            total = Decimal("0.0")
            for c in contas:
                linhas.append(f"• {c.nome}: R$ {c.saldo_atual:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
                total += c.saldo_atual
            linhas.append(f"\n*Total:* R$ {total:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
            await _send_message(chat_id, "\n".join(linhas))
        except Exception as e:
            await _send_message(chat_id, f"Erro ao buscar saldo: {e}")

    elif cmd == "resumo":
        try:
            hoje = date.today()
            resumo = LancamentoService().get_resumo_mes(id_usuario, hoje.year, hoje.month)
            msg = (
                f"📊 *Resumo do Mês ({hoje.month:02d}/{hoje.year})*\n\n"
                f"📈 Receitas: R$ {resumo.total_receitas:,.2f}\n"
                f"📉 Despesas: R$ {resumo.total_despesas:,.2f}\n"
                f"💵 Saldo do Mês: R$ {resumo.saldo_mes:,.2f}"
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
            linhas = ["📄 *Últimos 10 lançamentos*"]
            for l in lancamentos:
                icone = "🟢" if l.tipo == "Receita" else "🔴"
                data_str = l.data.strftime("%d/%m")
                linhas.append(f"{icone} {data_str} - {l.descricao or '}: R$ {l.valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
            await _send_message(chat_id, "\n".join(linhas))
        except Exception as e:
            await _send_message(chat_id, f"Erro ao buscar extrato: {e}")

    elif cmd == "metas":
        try:
            metas = MetaFinanceiraService().listar_metas(id_usuario)
            if not metas:
                await _send_message(chat_id, "Nenhuma meta ativa.")
                return
            linhas = ["🎯 *Metas Financeiras*"]
            for m in metas:
                pct = (m.valor_atual / m.valor_alvo * 100) if m.valor_alvo else 0
                linhas.append(f"• {m.nome}: R$ {m.valor_atual:,.2f} / R$ {m.valor_alvo:,.2f} ({pct:.1f}%)".replace(",", "X").replace(".", ",").replace("X", "."))
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
                await _send_message(chat_id, f"❌ Crie uma conta no sistema primeiro.")
                return
            id_conta = contas[0].id_conta
            
            categorias = cat_svc.listar_categorias(id_usuario)
            cat_match = next((c for c in categorias if c.tipo == tipo), None)
            if not cat_match:
                await _send_message(chat_id, f"❌ Crie pelo menos uma categoria de {tipo} no sistema.")
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
            lanc_svc.create(id_usuario, lancamento)
            icone = "💸" if tipo == "Despesa" else "💰"
            await _send_message(chat_id, f"✅ {icone} {tipo} de R$ {valor:,.2f} registrada com sucesso!".replace(",", "X").replace(".", ",").replace("X", "."))
            
        except Exception as e:
            await _send_message(chat_id, f"❌ Erro ao registrar: verifique o formato do valor. Ex: `/{cmd} 50.50 Almoço`")

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
