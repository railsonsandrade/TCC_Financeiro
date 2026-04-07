"""
API - Camada de rotas e endpoints
"""

from fastapi import APIRouter
from app.api.routes import auth, contas, categorias, lancamentos, metas, importacao, copilot, webhook


# Router principal da API
api_router = APIRouter(prefix="/api/v1")

# Incluir todas as rotas
api_router.include_router(auth.router)
api_router.include_router(contas.router)
api_router.include_router(categorias.router)
api_router.include_router(lancamentos.router)
api_router.include_router(metas.router)
api_router.include_router(importacao.router)
api_router.include_router(copilot.router)
api_router.include_router(webhook.router)


__all__ = ['api_router']
