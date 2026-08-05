"""
Sob Controle - API Principal
Entry point da aplicação FastAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_router

# Criar instância do FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para gestão financeira pessoal",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Endpoint raiz - informações da API"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "message": "Bem-vindo à API de Gestão Financeira Pessoal"
    }


@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    from app.utils.database import db

    db_status = "ok" if db.test_connection() else "error"

    return {
        "status": "healthy" if db_status == "ok" else "unhealthy",
        "database": db_status,
        "version": settings.APP_VERSION
    }


# Registrar routers da API
app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    """Executado ao iniciar a aplicação"""
    try:
        from app.init_db import init_postgres_tables
        init_postgres_tables()
    except Exception as e:
        print(f"Erro na inicialização: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

