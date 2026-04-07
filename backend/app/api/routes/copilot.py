"""
Rotas do Copilot IA - Assistente financeiro inteligente
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.schemas.usuario import UsuarioResponse
from app.api.dependencies import get_current_user
from app.services.lancamento_service import LancamentoService
from app.services.meta_financeira_service import MetaFinanceiraService
from app.config import settings
from datetime import date, timedelta
from decimal import Decimal


router = APIRouter(prefix="/copilot", tags=["Copilot IA"])


class CopilotMessage(BaseModel):
    role: str  # 'user' ou 'assistant'
    content: str


class CopilotRequest(BaseModel):
    mensagem: str
    historico: Optional[List[CopilotMessage]] = None


class CopilotResponse(BaseModel):
    resposta: str


def get_financial_context(id_usuario: int) -> str:
    """Coleta o contexto financeiro do usuário para enviar à IA"""
    try:
        lancamento_service = LancamentoService()
        meta_service = MetaFinanceiraService()
        
        # Dados do mês atual
        hoje = date.today()
        inicio_mes = hoje.replace(day=1)
        fim_mes = (inicio_mes + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        # Totais do mês
        totais = lancamento_service.obter_totais_periodo(
            id_usuario=id_usuario,
            data_inicio=inicio_mes,
            data_fim=fim_mes
        )
        
        # Lançamentos recentes (últimos 30 dias)
        lancamentos = lancamento_service.listar_lancamentos(
            id_usuario=id_usuario,
            data_inicio=inicio_mes,
            data_fim=fim_mes,
            limit=50
        )
        
        # Metas ativas
        metas = meta_service.listar_metas_com_progresso(id_usuario)
        metas_ativas = [m for m in metas if m.status == "Em Andamento"]
        
        # Construir contexto
        context_parts = []
        context_parts.append(f"=== CONTEXTO FINANCEIRO DO USUÁRIO (Mês: {inicio_mes.strftime('%B %Y')}) ===")
        
        if totais:
            total_receitas = getattr(totais, 'total_receitas', 0) if hasattr(totais, 'total_receitas') else totais.get('total_receitas', 0)
            total_despesas = getattr(totais, 'total_despesas', 0) if hasattr(totais, 'total_despesas') else totais.get('total_despesas', 0)
            context_parts.append(f"Receitas do mês: R$ {total_receitas}")
            context_parts.append(f"Despesas do mês: R$ {total_despesas}")
            saldo = float(str(total_receitas)) - float(str(total_despesas))
            context_parts.append(f"Saldo do mês: R$ {saldo:.2f}")
        
        # Gastos por categoria
        if lancamentos:
            gastos_por_categoria = {}
            for l in lancamentos:
                if l.tipo == 'Despesa':
                    cat_name = getattr(l, 'nome_categoria', None) or 'Sem categoria'
                    valor = float(str(l.valor))
                    gastos_por_categoria[cat_name] = gastos_por_categoria.get(cat_name, 0) + valor
            
            if gastos_por_categoria:
                context_parts.append("\nGastos por categoria (mês atual):")
                sorted_gastos = sorted(gastos_por_categoria.items(), key=lambda x: x[1], reverse=True)
                for cat, valor in sorted_gastos:
                    context_parts.append(f"  - {cat}: R$ {valor:.2f}")
        
        # Metas
        if metas_ativas:
            context_parts.append("\nMetas financeiras ativas:")
            for meta in metas_ativas:
                context_parts.append(
                    f"  - {meta.nome}: R$ {meta.valor_atual}/{meta.valor_alvo} ({meta.percentual_atingido:.1f}%)"
                )
                if meta.dias_restantes:
                    context_parts.append(f"    Dias restantes: {meta.dias_restantes}")
        
        return "\n".join(context_parts)
    
    except Exception as e:
        return f"[Erro ao coletar contexto financeiro: {str(e)}]"


SYSTEM_PROMPT = """Você é o Copilot Financeiro do sistema "Sob Controle". Você é um assistente financeiro inteligente e amigável que ajuda o usuário com:

1. **Análise de Gastos**: Analise os gastos do usuário e identifique padrões, categorias com mais gastos, e oportunidades de economia.

2. **Planejamento de Metas**: Ajude o usuário a criar planos de economia para atingir suas metas financeiras. Calcule quanto precisa guardar por mês/semana.

3. **Orientação Financeira**: Dê dicas práticas sobre como gerenciar dinheiro, organizar contas fixas, e investir com sabedoria.

4. **Planos de Economia**: Quando o usuário quiser viajar ou fazer uma compra grande, crie um plano detalhado mostrando como ajustar gastos e economizar.

Regras:
- Responda SEMPRE em português brasileiro
- Seja objetivo e prático
- Use valores em R$ (reais)
- Formate números com vírgula para decimais
- Dê respostas concisas mas completas
- Use emojis com moderação para tornar a conversa mais amigável
- Quando não tiver dados suficientes, peça mais informações ao usuário
- Nunca invente dados financeiros, use apenas o contexto fornecido
"""


async def call_gemini_api(messages: list, context: str) -> str:
    """Chama a API do Google Gemini"""
    try:
        import google.generativeai as genai
        
        api_key = getattr(settings, 'GEMINI_API_KEY', '').strip()
        if not api_key:
            return "⚠️ A chave da API do Gemini não está configurada.\n\nPara configurar, adicione a variável `GEMINI_API_KEY` no arquivo `.env` do backend.\n\nVocê pode obter uma chave gratuita em: https://aistudio.google.com/apikey"
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Construir prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\n"
        
        # Adicionar histórico
        for msg in messages:
            role = "Usuário" if msg.role == "user" else "Assistente"
            full_prompt += f"{role}: {msg.content}\n\n"
        
        response = model.generate_content(full_prompt)
        return response.text
        
    except ImportError:
        return "⚠️ A biblioteca `google-generativeai` não está instalada.\n\nPara instalar, execute:\n```\npip install google-generativeai\n```\n\nDepois, adicione `GEMINI_API_KEY=sua_chave` no arquivo `.env` do backend."
    
    except Exception as e:
        return f"⚠️ Erro ao conectar com a IA: {str(e)}\n\nVerifique se a chave da API está correta e se você tem acesso à API do Gemini."


@router.post("/chat", response_model=CopilotResponse, summary="Chat com o Copilot IA")
async def chat_copilot(
    request: CopilotRequest,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Envia uma mensagem para o Copilot IA e recebe uma resposta contextualizada
    com os dados financeiros do usuário.
    """
    try:
        # Coletar contexto financeiro
        context = get_financial_context(current_user.id_usuario)
        
        # Montar histórico
        messages = request.historico or []
        messages.append(CopilotMessage(role="user", content=request.mensagem))
        
        # Chamar API de IA
        resposta = await call_gemini_api(messages, context)
        
        return CopilotResponse(resposta=resposta)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no Copilot: {str(e)}"
        )
