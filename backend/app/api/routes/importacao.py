"""
Rotas de importação de faturas bancárias
"""

import csv
import io
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel
from app.schemas.usuario import UsuarioResponse
from app.schemas.lancamento import LancamentoCreate
from app.schemas.categoria import CategoriaCreate
from app.services.lancamento_service import LancamentoService
from app.services.categoria_service import CategoriaService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/importacao", tags=["Importação"])


class ImportResult(BaseModel):
    total_importados: int
    total_duplicados: int
    erros: List[str]


class PreviewItem(BaseModel):
    date: str
    title: str
    amount: float
    tipo: str  # "Receita" ou "Despesa"
    suggested_category: str
    suggested_grupo: str  # "Essencial", "Desejável", "Poupança"


class PreviewResult(BaseModel):
    items: List[PreviewItem]


class ConfirmItem(BaseModel):
    date: str
    title: str
    amount: float
    tipo: str
    category: str
    grupo: str


class ConfirmRequest(BaseModel):
    id_conta: int
    items: List[ConfirmItem]


# ─── Mapeamento inteligente de categorias ───────────────────────────────

CATEGORY_RULES = [
    # Receitas (detectar por título)
    {"keywords": ["pagamento recebido"], "category": "Receita Geral", "tipo": "Receita", "grupo": "Essencial"},

    # Assinaturas digitais
    {"keywords": ["applecombill", "apple.com", "apple com"], "category": "Assinaturas", "tipo": "Despesa", "grupo": "Desejável"},
    {"keywords": ["netflix", "spotify", "disney", "hbo", "prime video", "youtube premium", "deezer"], "category": "Assinaturas", "tipo": "Despesa", "grupo": "Desejável"},
    {"keywords": ["gamers club", "pg *gamers", "xbox", "playstation", "steam"], "category": "Assinaturas", "tipo": "Despesa", "grupo": "Desejável"},

    # Alimentação - Delivery
    {"keywords": ["ifd*", "ifood", "uber eats", "rappi"], "category": "Alimentação", "tipo": "Despesa", "grupo": "Essencial"},

    # Alimentação - Restaurantes/Lanches
    {"keywords": ["burguer", "burger", "hamburgueria", "melkiburguer", "hotdog", "hot dog", "pizza", "pizzaria",
                   "restaurante", "lanchonete", "padaria", "cafe", "cafeteria", "sushi", "churrascaria",
                   "bomboniere", "bombonieri", "brigadeiro", "acai", "sorvete", "doce"],
     "category": "Alimentação", "tipo": "Despesa", "grupo": "Essencial"},

    # Alimentação - Bar/Bebidas
    {"keywords": ["bar ", "lounge", "pub", "cervejaria", "beer", "bebida", "adega", "chopp",
                   "conveniencia", "conveniência", "promise lounge", "arl bebidas", "goodbeer", "deposito de b"],
     "category": "Bares e Bebidas", "tipo": "Despesa", "grupo": "Desejável"},

    # Supermercado
    {"keywords": ["supermercado", "mercado", "hiper", "atacadão", "atacadao", "assai", "carrefour", "pao de acucar"],
     "category": "Supermercado", "tipo": "Despesa", "grupo": "Essencial"},

    # Transporte - Combustível/Posto
    {"keywords": ["posto", "auto posto", "petro terra", "combustivel", "gasolina", "etanol", "shell", "ipiranga", "br distribuidora"],
     "category": "Combustível", "tipo": "Despesa", "grupo": "Essencial"},

    # Transporte - Pedágio/Estacionamento
    {"keywords": ["sem parar", "parking", "estacionamento", "zona azul", "estapar"],
     "category": "Transporte", "tipo": "Despesa", "grupo": "Essencial"},

    # Transporte - Público
    {"keywords": ["metro*", "metro ", "top sp", "bilhete", "sptrans"],
     "category": "Transporte Público", "tipo": "Despesa", "grupo": "Essencial"},

    # Transporte - App
    {"keywords": ["uber", "99 ", "99app", "cabify", "indriver"],
     "category": "Transporte", "tipo": "Despesa", "grupo": "Essencial"},

    # Saúde/Farmácia
    {"keywords": ["drogaria", "drogasil", "droga raia", "raia", "farmacia", "farmácia", "kenko", "ultrafarma",
                   "drogaria sao paulo", "drogaria são paulo", "drogaria sao marcos"],
     "category": "Saúde e Farmácia", "tipo": "Despesa", "grupo": "Essencial"},

    # Educação
    {"keywords": ["colegio", "colégio", "escola", "faculdade", "universidade", "curso", "udemy", "alura", "conect"],
     "category": "Educação", "tipo": "Despesa", "grupo": "Essencial"},

    # Compras/Shopping
    {"keywords": ["shopping", "via shopping", "moda", "decoracao", "decoração", "roupa", "loja", "magazine",
                   "americanas", "casas bahia", "renner", "riachuelo", "c&a", "zara"],
     "category": "Compras", "tipo": "Despesa", "grupo": "Desejável"},

    # E-commerce
    {"keywords": ["amazon", "mercado livre", "shopee", "shein", "aliexpress", "jim.com", "admstore"],
     "category": "Compras Online", "tipo": "Despesa", "grupo": "Desejável"},

    # Viagem / Hospedagem
    {"keywords": ["airbnb", "booking", "hotel", "pousada", "hostel", "decolar", "latam", "gol ", "azul "],
     "category": "Viagem", "tipo": "Despesa", "grupo": "Desejável"},

    # Festas / Eventos
    {"keywords": ["festa", "evento", "ingresso", "ratimbum", "buffet", "decoracao festa"],
     "category": "Eventos e Festas", "tipo": "Despesa", "grupo": "Desejável"},

    # IOF/Taxas bancárias
    {"keywords": ["iof", "tarifa", "anuidade", "taxa"],
     "category": "Taxas Bancárias", "tipo": "Despesa", "grupo": "Essencial"},
]


def classify_transaction(title: str, amount: float) -> dict:
    """
    Classifica uma transação do extrato baseado no título e valor.
    Retorna dict com category, tipo e grupo sugeridos.
    """
    title_lower = title.lower().strip()

    # Se o valor é negativo, é um pagamento/crédito recebido
    if amount < 0:
        return {
            "category": "Receita Geral",
            "tipo": "Receita",
            "grupo": "Essencial"
        }

    # Tentar match pelas regras de categoria
    for rule in CATEGORY_RULES:
        for keyword in rule["keywords"]:
            if keyword in title_lower:
                return {
                    "category": rule["category"],
                    "tipo": rule["tipo"],
                    "grupo": rule["grupo"]
                }

    # Fallback: Se parece ser um nome de pessoa (transferência)
    # Heurística: se o título não tem espaços ou tem formato de CPF/nome
    words = title_lower.split()
    if len(words) == 1 and len(title) > 5 and title[0].isdigit():
        return {"category": "Transferências", "tipo": "Despesa", "grupo": "Desejável"}

    return {"category": "Outros", "tipo": "Despesa", "grupo": "Desejável"}


def parse_nubank_csv(content: str) -> List[dict]:
    """
    Parse CSV do Nubank.
    Formato real: date,title,amount
    """
    rows = []
    reader = csv.DictReader(io.StringIO(content))

    for row in reader:
        try:
            date_str = row.get('date', row.get('Data', '')).strip()
            title = row.get('title', row.get('Título', row.get('Descrição', ''))).strip()
            amount_str = row.get('amount', row.get('Valor', '0')).strip()

            if not date_str or not title:
                continue

            # Parse date
            try:
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                try:
                    parsed_date = datetime.strptime(date_str, '%d/%m/%Y').date()
                except ValueError:
                    continue

            # Parse amount
            amount = float(amount_str.replace(',', '.'))

            rows.append({
                'date': parsed_date,
                'title': title,
                'amount': amount,
            })
        except (ValueError, KeyError, AttributeError):
            continue

    return rows


# ─── Endpoints ──────────────────────────────────────────────────────────


@router.post("/nubank/preview", response_model=PreviewResult, summary="Preview da fatura Nubank")
async def preview_nubank(
    file: UploadFile = File(..., description="Arquivo CSV exportado do Nubank"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Faz o parse do CSV do Nubank e retorna os itens com categorias sugeridas
    para revisão antes da importação final.
    """
    if not file.filename or not (file.filename.endswith('.csv') or file.filename.endswith('.CSV')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo deve ser um CSV"
        )

    try:
        content = await file.read()
        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            text_content = content.decode('latin-1')

        rows = parse_nubank_csv(text_content)

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhuma transação encontrada no arquivo. Verifique se o formato está correto."
            )

        items = []
        for row in rows:
            classification = classify_transaction(row['title'], row['amount'])
            items.append(PreviewItem(
                date=row['date'].isoformat(),
                title=row['title'],
                amount=abs(row['amount']),
                tipo=classification['tipo'],
                suggested_category=classification['category'],
                suggested_grupo=classification['grupo']
            ))

        return PreviewResult(items=items)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )


@router.post("/nubank/confirm", response_model=ImportResult, summary="Confirmar importação Nubank")
async def confirm_nubank(
    request: ConfirmRequest,
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Confirma a importação dos lançamentos após revisão pelo usuário.
    Cria automaticamente categorias que não existirem.
    """
    lancamento_service = LancamentoService()
    categoria_service = CategoriaService()

    # Carregar categorias existentes do usuário
    categorias = categoria_service.listar_categorias(current_user.id_usuario)
    categorias_map = {c.nome.lower(): c.id_categoria for c in categorias}

    total_importados = 0
    total_duplicados = 0
    erros = []

    for item in request.items:
        try:
            # Buscar ou criar categoria
            cat_key = item.category.lower()
            id_categoria = categorias_map.get(cat_key)

            if not id_categoria:
                # Criar categoria automaticamente
                try:
                    nova_categoria = categoria_service.criar_categoria(
                        id_usuario=current_user.id_usuario,
                        categoria=CategoriaCreate(
                            nome=item.category,
                            tipo=item.tipo,
                            grupo_50_30_20=item.grupo if item.grupo in ["Essencial", "Desejável", "Poupança"] else "Desejável",
                            cor=None
                        )
                    )
                    id_categoria = nova_categoria.id_categoria
                    categorias_map[cat_key] = id_categoria
                except ValueError:
                    # Categoria pode já existir (race condition ou case sensitivity)
                    categorias = categoria_service.listar_categorias(current_user.id_usuario)
                    categorias_map = {c.nome.lower(): c.id_categoria for c in categorias}
                    id_categoria = categorias_map.get(cat_key)
                    if not id_categoria:
                        erros.append(f"Erro ao criar categoria '{item.category}' para: {item.title}")
                        continue

            # Parse date
            try:
                parsed_date = datetime.strptime(item.date, '%Y-%m-%d').date()
            except ValueError:
                erros.append(f"Data inválida para: {item.title}")
                continue

            # Verificar duplicidade
            existing = lancamento_service.listar_lancamentos(
                id_usuario=current_user.id_usuario,
                data_inicio=parsed_date,
                data_fim=parsed_date,
            )

            is_duplicate = any(
                l.descricao == item.title and abs(float(l.valor) - item.amount) < 0.01
                for l in existing
            )

            if is_duplicate:
                total_duplicados += 1
                continue

            # Criar lançamento
            lancamento_data = LancamentoCreate(
                id_conta=request.id_conta,
                id_categoria=id_categoria,
                tipo=item.tipo,
                valor=Decimal(str(item.amount)),
                data=parsed_date,
                descricao=item.title,
                pago=True
            )

            lancamento_service.criar_lancamento(current_user.id_usuario, lancamento_data)
            total_importados += 1

        except Exception as e:
            erros.append(f"Erro em '{item.title}': {str(e)}")

    return ImportResult(
        total_importados=total_importados,
        total_duplicados=total_duplicados,
        erros=erros[:20]
    )


# Manter endpoint antigo para compatibilidade
@router.post("/nubank", response_model=ImportResult, summary="Importar fatura Nubank (legado)")
async def importar_nubank(
    file: UploadFile = File(..., description="Arquivo CSV exportado do Nubank"),
    id_conta: int = Form(..., description="ID da conta para associar os lançamentos"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """Endpoint legado - redireciona para o novo fluxo preview+confirm."""
    # Preview
    content = await file.read()
    try:
        text_content = content.decode('utf-8')
    except UnicodeDecodeError:
        text_content = content.decode('latin-1')

    rows = parse_nubank_csv(text_content)
    if not rows:
        raise HTTPException(status_code=400, detail="Nenhuma transação encontrada no arquivo.")

    items = []
    for row in rows:
        classification = classify_transaction(row['title'], row['amount'])
        items.append(ConfirmItem(
            date=row['date'].isoformat(),
            title=row['title'],
            amount=abs(row['amount']),
            tipo=classification['tipo'],
            category=classification['category'],
            grupo=classification['grupo']
        ))

    # Confirm
    confirm_req = ConfirmRequest(id_conta=id_conta, items=items)
    return await confirm_nubank(confirm_req, current_user)
