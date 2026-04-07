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
from app.services.lancamento_service import LancamentoService
from app.services.categoria_service import CategoriaService
from app.api.dependencies import get_current_user


router = APIRouter(prefix="/importacao", tags=["Importação"])


class ImportResult(BaseModel):
    total_importados: int
    total_duplicados: int
    erros: List[str]


# Mapeamento de categorias do Nubank para categorias padrão
NUBANK_CATEGORY_MAP = {
    "restaurante": "Alimentação",
    "supermercado": "Alimentação",
    "mercado": "Alimentação",
    "padaria": "Alimentação",
    "lanchonete": "Alimentação",
    "ifood": "Alimentação",
    "uber eats": "Alimentação",
    "transporte": "Transporte",
    "uber": "Transporte",
    "99": "Transporte",
    "combustível": "Transporte",
    "gasolina": "Transporte",
    "estacionamento": "Transporte",
    "saúde": "Saúde",
    "farmácia": "Saúde",
    "drogaria": "Saúde",
    "educação": "Educação",
    "curso": "Educação",
    "escola": "Educação",
    "faculdade": "Educação",
    "lazer": "Lazer",
    "cinema": "Lazer",
    "netflix": "Lazer",
    "spotify": "Lazer",
    "amazon": "Compras",
    "shopping": "Compras",
    "loja": "Compras",
    "magazine": "Compras",
    "eletrônico": "Compras",
    "vestuário": "Compras",
    "roupa": "Compras",
    "casa": "Moradia",
    "aluguel": "Moradia",
    "condomínio": "Moradia",
    "energia": "Moradia",
    "água": "Moradia",
    "internet": "Moradia",
    "telefone": "Moradia",
    "celular": "Moradia",
    "viagem": "Viagem",
    "hotel": "Viagem",
    "passagem": "Viagem",
    "outros": "Outros",
}


def find_category_match(description: str, nubank_category: str = "") -> str:
    """Tenta mapear a descrição/categoria Nubank para uma categoria do sistema"""
    search_text = f"{description} {nubank_category}".lower()
    
    for keyword, category in NUBANK_CATEGORY_MAP.items():
        if keyword in search_text:
            return category
    
    return "Outros"


def parse_nubank_csv(content: str) -> List[dict]:
    """
    Parse CSV do Nubank.
    Formato esperado: date,category,title,amount
    """
    rows = []
    reader = csv.DictReader(io.StringIO(content))
    
    for row in reader:
        try:
            # O Nubank usa diferentes formatos de coluna
            # Formato comum: date, category, title, amount
            date_str = row.get('date', row.get('Data', '')).strip()
            category = row.get('category', row.get('Categoria', '')).strip()
            title = row.get('title', row.get('Título', row.get('Descrição', ''))).strip()
            amount_str = row.get('amount', row.get('Valor', '0')).strip()
            
            if not date_str or not title:
                continue
            
            # Parse date (Nubank usa yyyy-MM-dd)
            try:
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                try:
                    parsed_date = datetime.strptime(date_str, '%d/%m/%Y').date()
                except ValueError:
                    continue
            
            # Parse amount (Nubank usa valores negativos para compras)
            amount = abs(Decimal(amount_str.replace(',', '.')))
            
            rows.append({
                'date': parsed_date,
                'category': category,
                'title': title,
                'amount': amount,
            })
        except (ValueError, KeyError, AttributeError) as e:
            continue
    
    return rows


@router.post("/nubank", response_model=ImportResult, summary="Importar fatura Nubank")
async def importar_nubank(
    file: UploadFile = File(..., description="Arquivo CSV exportado do Nubank"),
    id_conta: int = Form(..., description="ID da conta para associar os lançamentos"),
    current_user: UsuarioResponse = Depends(get_current_user)
):
    """
    Importa uma fatura do Nubank em formato CSV.
    
    O arquivo CSV do Nubank geralmente tem as colunas:
    - date: Data da transação (yyyy-MM-dd)
    - category: Categoria do Nubank
    - title: Descrição da transação
    - amount: Valor da transação (negativo para compras)
    """
    if not file.filename or not (file.filename.endswith('.csv') or file.filename.endswith('.CSV')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo deve ser um CSV"
        )
    
    try:
        content = await file.read()
        # Tentar decodar com utf-8, fallback para latin-1
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
        
        lancamento_service = LancamentoService()
        categoria_service = CategoriaService()
        
        # Obter categorias do usuário para mapeamento
        categorias = categoria_service.listar_categorias(current_user.id_usuario)
        categorias_map = {c.nome.lower(): c.id_categoria for c in categorias}
        
        total_importados = 0
        total_duplicados = 0
        erros = []
        
        for row in rows:
            try:
                # Mapear categoria
                mapped_category = find_category_match(row['title'], row['category'])
                id_categoria = categorias_map.get(mapped_category.lower())
                
                # Se não encontrou categoria, usar a primeira de despesa ou criar genérica
                if not id_categoria:
                    despesa_cats = [c for c in categorias if c.tipo == 'Despesa']
                    if despesa_cats:
                        id_categoria = despesa_cats[0].id_categoria
                    else:
                        erros.append(f"Sem categoria para: {row['title']}")
                        continue
                
                # Verificar duplicidade (mesma data, descrição e valor)
                existing = lancamento_service.listar_lancamentos(
                    id_usuario=current_user.id_usuario,
                    data_inicio=row['date'],
                    data_fim=row['date'],
                )
                
                is_duplicate = any(
                    l.descricao == row['title'] and abs(Decimal(str(l.valor)) - row['amount']) < Decimal('0.01')
                    for l in existing
                )
                
                if is_duplicate:
                    total_duplicados += 1
                    continue
                
                # Criar lançamento
                lancamento_data = LancamentoCreate(
                    id_conta=id_conta,
                    id_categoria=id_categoria,
                    tipo="Despesa",
                    valor=row['amount'],
                    data=row['date'],
                    descricao=row['title'],
                    pago=True,
                    origem="Importação Nubank"
                )
                
                lancamento_service.criar_lancamento(current_user.id_usuario, lancamento_data)
                total_importados += 1
                
            except Exception as e:
                erros.append(f"Erro em '{row['title']}': {str(e)}")
        
        return ImportResult(
            total_importados=total_importados,
            total_duplicados=total_duplicados,
            erros=erros[:10]  # Limitar erros retornados
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )
