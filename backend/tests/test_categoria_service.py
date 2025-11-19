"""
Testes unitários do CategoriaService
"""

import pytest
from app.services.categoria_service import CategoriaService
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


@pytest.mark.unit
class TestCategoriaService:
    """Testes do CategoriaService"""
    
    def test_criar_categoria(self, db, usuario_teste):
        """Testa criação de categoria"""
        service = CategoriaService()
        
        categoria_data = CategoriaCreate(
            nome="Alimentação",
            tipo="Despesa",
            grupo_50_30_20="Essencial"
        )
        
        categoria = service.criar_categoria(usuario_teste.id_usuario, categoria_data)
        
        assert categoria.id_categoria is not None
        assert categoria.nome == "Alimentação"
        assert categoria.tipo == "Despesa"
        assert categoria.grupo_50_30_20 == "Essencial"
    
    def test_criar_categoria_nome_duplicado(self, db, usuario_teste):
        """Testa RN008: Nome de categoria deve ser único por usuário"""
        service = CategoriaService()

        categoria_data = CategoriaCreate(
            nome="Transporte",
            tipo="Despesa",
            grupo_50_30_20="Essencial"
        )

        # Criar primeira categoria
        service.criar_categoria(usuario_teste.id_usuario, categoria_data)

        # Tentar criar categoria com mesmo nome
        with pytest.raises(ValueError, match="Já existe uma categoria com o nome"):
            service.criar_categoria(usuario_teste.id_usuario, categoria_data)
    
    def test_obter_categoria(self, db, usuario_teste, categoria_teste):
        """Testa obtenção de categoria por ID"""
        service = CategoriaService()
        
        categoria = service.obter_categoria(usuario_teste.id_usuario, categoria_teste.id_categoria)
        
        assert categoria.id_categoria == categoria_teste.id_categoria
        assert categoria.nome == categoria_teste.nome
    
    def test_obter_categoria_outro_usuario(self, db, usuario_teste, categoria_teste):
        """Testa que usuário não pode acessar categoria de outro usuário"""
        from app.services.usuario_service import UsuarioService
        from app.schemas.usuario import UsuarioCreate
        
        # Criar outro usuário
        usuario_service = UsuarioService()
        outro_usuario = usuario_service.criar_usuario(UsuarioCreate(
            nome="Outro Usuário",
            email="outro@example.com",
            senha="Senha@123"
        ))
        
        service = CategoriaService()
        
        # Tentar acessar categoria do primeiro usuário
        categoria = service.obter_categoria(outro_usuario.id_usuario, categoria_teste.id_categoria)
        
        assert categoria is None
    
    def test_listar_categorias(self, db, usuario_teste):
        """Testa listagem de categorias"""
        service = CategoriaService()
        
        # Criar 2 categorias
        for i in range(2):
            categoria_data = CategoriaCreate(
                nome=f"Categoria {i}",
                tipo="Despesa",
                grupo_50_30_20="Essencial"
            )
            service.criar_categoria(usuario_teste.id_usuario, categoria_data)
        
        categorias = service.listar_categorias(usuario_teste.id_usuario)
        
        assert len(categorias) >= 2
    
    def test_listar_categorias_por_tipo(self, db, usuario_teste):
        """Testa listagem de categorias filtradas por tipo"""
        service = CategoriaService()

        # Criar categoria de despesa
        service.criar_categoria(usuario_teste.id_usuario, CategoriaCreate(
            nome="Despesa 1",
            tipo="Despesa",
            grupo_50_30_20="Essencial"
        ))

        # Criar categoria de receita (não tem grupo 50/30/20)
        service.criar_categoria(usuario_teste.id_usuario, CategoriaCreate(
            nome="Receita 1",
            tipo="Receita"
        ))

        # Listar apenas despesas
        despesas = service.listar_categorias(usuario_teste.id_usuario, tipo="Despesa")

        assert all(c.tipo == "Despesa" for c in despesas)
    
    def test_listar_categorias_por_grupo(self, db, usuario_teste):
        """Testa listagem de categorias agrupadas por 50/30/20"""
        service = CategoriaService()
        
        # Criar categorias de diferentes grupos
        service.criar_categoria(usuario_teste.id_usuario, CategoriaCreate(
            nome="Essencial 1",
            tipo="Despesa",
            grupo_50_30_20="Essencial"
        ))
        
        service.criar_categoria(usuario_teste.id_usuario, CategoriaCreate(
            nome="Desejável 1",
            tipo="Despesa",
            grupo_50_30_20="Desejável"
        ))
        
        grupos = service.listar_categorias_por_grupo(usuario_teste.id_usuario)
        
        assert "Essencial" in grupos
        assert "Desejável" in grupos
        assert len(grupos["Essencial"]) >= 1
        assert len(grupos["Desejável"]) >= 1

