"""
Rotas do PatarIA - Assistente financeiro inteligente
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.schemas.usuario import UsuarioResponse
from app.api.dependencies import get_current_user
from app.services.lancamento_service import LancamentoService
from app.services.meta_financeira_service import MetaFinanceiraService
from app.services.categoria_service import CategoriaService
from app.config import settings
from datetime import date, timedelta
from decimal import Decimal


router = APIRouter(prefix="/copilot", tags=["PatarIA"])


class CopilotMessage(BaseModel):
    role: str  # 'user' ou 'assistant'
    content: str


class CopilotRequest(BaseModel):
    mensagem: str
    historico: Optional[List[CopilotMessage]] = None


class CopilotResponse(BaseModel):
    resposta: str


def get_financial_context(id_usuario: int) -> str:
    """Coleta o contexto financeiro completo do usuário (últimos 3 meses) para enviar à IA"""
    try:
        lancamento_service = LancamentoService()
        meta_service = MetaFinanceiraService()
        categoria_service = CategoriaService()

        hoje = date.today()
        context_parts = []

        # ─── Dados dos últimos 3 meses ──────────────────────────────────
        for meses_atras in range(0, 3):
            # Calcular início e fim de cada mês
            ref = hoje.replace(day=1) - timedelta(days=meses_atras * 28)
            inicio_mes = ref.replace(day=1)
            fim_mes = (inicio_mes + timedelta(days=32)).replace(day=1) - timedelta(days=1)

            # Nomes dos meses em português
            nomes_meses = {
                1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
                5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
                9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
            }
            nome_mes = nomes_meses.get(inicio_mes.month, str(inicio_mes.month))
            label = f"{nome_mes} {inicio_mes.year}"
            is_current = meses_atras == 0

            context_parts.append(f"\n{'='*50}")
            context_parts.append(f"{'📌 ' if is_current else ''}MÊS: {label} {'(MÊS ATUAL)' if is_current else ''}")
            context_parts.append(f"Período: {inicio_mes.strftime('%d/%m/%Y')} a {fim_mes.strftime('%d/%m/%Y')}")
            context_parts.append(f"{'='*50}")

            # Totais do mês
            totais = lancamento_service.obter_totais_periodo(
                id_usuario=id_usuario,
                data_inicio=inicio_mes,
                data_fim=fim_mes
            )

            if totais:
                total_receitas = float(str(totais.get('total_receitas', 0)))
                total_despesas = float(str(totais.get('total_despesas', 0)))
                saldo = total_receitas - total_despesas
                context_parts.append(f"  Receitas: R$ {total_receitas:,.2f}")
                context_parts.append(f"  Despesas: R$ {total_despesas:,.2f}")
                context_parts.append(f"  Saldo: R$ {saldo:,.2f}")

            # Lançamentos com detalhes (categoria inclusa)
            lancamentos = lancamento_service.listar_lancamentos_com_detalhes(
                id_usuario=id_usuario,
                data_inicio=inicio_mes,
                data_fim=fim_mes,
                limit=100
            )

            if lancamentos:
                # Gastos por categoria
                gastos_por_categoria = {}
                receitas_por_categoria = {}
                for l in lancamentos:
                    cat_name = getattr(l, 'nome_categoria', None) or 'Sem categoria'
                    valor = float(str(l.valor))
                    if l.tipo == 'Despesa':
                        gastos_por_categoria[cat_name] = gastos_por_categoria.get(cat_name, 0) + valor
                    else:
                        receitas_por_categoria[cat_name] = receitas_por_categoria.get(cat_name, 0) + valor

                if gastos_por_categoria:
                    context_parts.append(f"\n  Gastos por categoria em {label}:")
                    sorted_gastos = sorted(gastos_por_categoria.items(), key=lambda x: x[1], reverse=True)
                    for cat, valor in sorted_gastos:
                        context_parts.append(f"    - {cat}: R$ {valor:,.2f}")

                if receitas_por_categoria:
                    context_parts.append(f"\n  Receitas por categoria em {label}:")
                    for cat, valor in receitas_por_categoria.items():
                        context_parts.append(f"    - {cat}: R$ {valor:,.2f}")

                # Lista dos 10 maiores gastos do mês
                despesas = [l for l in lancamentos if l.tipo == 'Despesa']
                despesas_sorted = sorted(despesas, key=lambda l: float(str(l.valor)), reverse=True)[:10]
                if despesas_sorted:
                    context_parts.append(f"\n  Maiores gastos em {label}:")
                    for l in despesas_sorted:
                        cat = getattr(l, 'nome_categoria', 'N/A')
                        context_parts.append(f"    - {l.descricao}: R$ {float(str(l.valor)):,.2f} ({cat}) em {l.data}")

        # ─── Metas financeiras ativa ─────────────────────────────────────
        metas = meta_service.listar_metas_com_progresso(id_usuario)
        metas_ativas = [m for m in metas if m.status == "Em Andamento"]

        if metas_ativas:
            context_parts.append(f"\n{'='*50}")
            context_parts.append("METAS FINANCEIRAS ATIVAS:")
            context_parts.append(f"{'='*50}")
            for meta in metas_ativas:
                context_parts.append(
                    f"  - {meta.nome}: R$ {meta.valor_atual:,.2f} / R$ {meta.valor_alvo:,.2f} ({meta.percentual_atingido:.1f}%)"
                )
                if meta.dias_restantes:
                    context_parts.append(f"    Dias restantes: {meta.dias_restantes}")

        # ─── Categorias do usuário ───────────────────────────────────────
        categorias = categoria_service.listar_categorias(id_usuario)
        if categorias:
            context_parts.append(f"\n{'='*50}")
            context_parts.append("CATEGORIAS DO USUÁRIO:")
            context_parts.append(f"{'='*50}")
            for c in categorias:
                grupo = f" ({c.grupo_50_30_20})" if c.grupo_50_30_20 else ""
                context_parts.append(f"  - {c.nome} [{c.tipo}]{grupo}")

        return "\n".join(context_parts)

    except Exception as e:
        return f"[Erro ao coletar contexto financeiro: {str(e)}]"


SYSTEM_PROMPT = """Você é a PatarIA, a assistente financeira inteligente do sistema "Sob Controle". Você é amigável, prática e especialista em finanças pessoais.

Você tem acesso aos dados financeiros do usuário dos ÚLTIMOS 3 MESES. Use esses dados para responder com precisão.

Suas capacidades:
1. **Análise de Gastos**: Analise os gastos do usuário por mês e categoria. Identifique padrões, compare meses, e aponte oportunidades de economia.
2. **Histórico**: Você pode ver dados de meses anteriores. Quando o usuário perguntar sobre março, abril, etc., use os dados do contexto.
3. **Planejamento de Metas**: Ajude o usuário a criar planos de economia para atingir suas metas financeiras.
4. **Orientação Financeira**: Dê dicas práticas sobre gerenciamento de dinheiro.
5. **Comparações**: Compare gastos entre meses diferentes para identificar tendências.

Regras:
- Responda SEMPRE em português brasileiro
- Seja objetiva e prática
- Use valores em R$ (reais) formatados com vírgula para decimais
- Dê respostas concisas mas completas
- Use emojis com moderação para tornar a conversa mais amigável
- Quando não tiver dados suficientes, peça mais informações ao usuário
- Nunca invente dados financeiros, use APENAS o contexto fornecido
- Se o usuário perguntar sobre um mês que não está no seu contexto, informe que só tem acesso aos últimos 3 meses
"""


async def call_ai_api(messages: list, context: str) -> str:
    """Chama a API do Groq primeiro. Se falhar, usa o Gemini como fallback."""
    import requests
    import json
    
    # ─── TENTATIVA 1: GROQ (Principal) ───────────────────────────────────
    groq_api_key = getattr(settings, 'GROQ_API_KEY', '').strip()
    
    if groq_api_key:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
            
            # Montar mensagens no formato OpenAI/Groq
            groq_messages = [
                {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context}"}
            ]
            
            for msg in messages:
                role = "user" if msg.role == "user" else "assistant"
                groq_messages.append({"role": role, "content": msg.content})
                
            payload = {
                "model": "llama-3.3-70b-versatile", # O melhor modelo atual do Groq
                "messages": groq_messages,
                "temperature": 0.7
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                # Se der erro 429 ou outro no Groq, silenciosamente passamos para o Gemini
                pass
                
        except Exception as e:
            # Em caso de erro de timeout ou conexão com Groq, passamos para o Gemini
            pass

    # ─── TENTATIVA 2: GEMINI (Fallback) ──────────────────────────────────
    try:
        import google.generativeai as genai

        primary_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
        
        api_keys = [k for k in [primary_key] if k]
        
        if not api_keys:
            return "⚠️ As chaves de API não estão configuradas."

        full_prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\n"
        for msg in messages:
            role = "Usuário" if msg.role == "user" else "PatarIA"
            full_prompt += f"{role}: {msg.content}\n\n"

        models_to_try = [
            'gemini-1.5-flash-002',
            'gemini-1.5-flash-001',
            'gemini-pro',
            'gemini-1.5-pro-latest',
        ]

        errors_log = []
        
        for key in api_keys:
            try:
                genai.configure(api_key=key)
                for model_name in models_to_try:
                    try:
                        model = genai.GenerativeModel(model_name)
                        response = model.generate_content(full_prompt)
                        return response.text
                    except Exception as e:
                        error_str = str(e)
                        errors_log.append(f"[Gemini: {model_name}] {error_str}")
                        if any(err in error_str.lower() for err in ['429', '404', '403', 'quota', 'not found']):
                            continue
                        else:
                            raise
            except Exception as e:
                errors_log.append(f"[Erro de Configuração] {str(e)}")

        formatted_errors = "\n".join(errors_log)
        return f"⚠️ IA Indisponível. O Groq e o Gemini falharam nestas tentativas:\n\n{formatted_errors}\n\nDica: Verifique se os limites foram batidos no Groq (groq.com) e no Gemini."

    except ImportError:
        return "⚠️ A biblioteca `google-generativeai` não está instalada (necessária para o fallback). Instale com: `pip install google-generativeai` e a `requests` para o Groq."

    except Exception as e:
        return f"⚠️ Erro crítico ao conectar com a IA: {str(e)}"


@router.post("/chat", response_model=CopilotResponse, summary="Chat com a PatarIA")
async def chat_copilot(
    request: CopilotRequest,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Envia uma mensagem para a PatarIA e recebe uma resposta contextualizada
    com os dados financeiros do usuário.
    """
    try:
        # Coletar contexto financeiro (últimos 3 meses)
        context = get_financial_context(current_user.id_usuario)

        # Montar histórico
        messages = request.historico or []
        messages.append(CopilotMessage(role="user", content=request.mensagem))

        # Chamar API de IA (Groq -> Gemini)
        resposta = await call_ai_api(messages, context)

        return CopilotResponse(resposta=resposta)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na PatarIA: {str(e)}"
        )
