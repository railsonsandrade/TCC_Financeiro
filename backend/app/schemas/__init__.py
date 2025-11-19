"""
Schemas Pydantic para validação de dados
"""

from .usuario import (
    UsuarioBase,
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioInDB,
    UsuarioResponse,
    UsuarioLogin,
    Token,
    TokenData
)

from .conta_financeira import (
    ContaFinanceiraBase,
    ContaFinanceiraCreate,
    ContaFinanceiraUpdate,
    ContaFinanceiraInDB,
    ContaFinanceiraResponse,
    ContaFinanceiraComSaldo
)

from .categoria import (
    CategoriaBase,
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaInDB,
    CategoriaResponse
)

from .lancamento import (
    LancamentoBase,
    LancamentoCreate,
    LancamentoUpdate,
    LancamentoInDB,
    LancamentoResponse,
    LancamentoComDetalhes
)

from .meta_financeira import (
    MetaFinanceiraBase,
    MetaFinanceiraCreate,
    MetaFinanceiraUpdate,
    MetaFinanceiraInDB,
    MetaFinanceiraResponse,
    MetaFinanceiraComProgresso
)

__all__ = [
    # Usuario
    "UsuarioBase",
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioInDB",
    "UsuarioResponse",
    "UsuarioLogin",
    "Token",
    "TokenData",

    # Conta Financeira
    "ContaFinanceiraBase",
    "ContaFinanceiraCreate",
    "ContaFinanceiraUpdate",
    "ContaFinanceiraInDB",
    "ContaFinanceiraResponse",
    "ContaFinanceiraComSaldo",

    # Categoria
    "CategoriaBase",
    "CategoriaCreate",
    "CategoriaUpdate",
    "CategoriaInDB",
    "CategoriaResponse",

    # Lançamento
    "LancamentoBase",
    "LancamentoCreate",
    "LancamentoUpdate",
    "LancamentoInDB",
    "LancamentoResponse",
    "LancamentoComDetalhes",

    # Meta Financeira
    "MetaFinanceiraBase",
    "MetaFinanceiraCreate",
    "MetaFinanceiraUpdate",
    "MetaFinanceiraInDB",
    "MetaFinanceiraResponse",
    "MetaFinanceiraComProgresso",
]
