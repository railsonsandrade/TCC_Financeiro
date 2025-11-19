# 🚀 Como Executar a Aplicação

## 📋 Pré-requisitos

Antes de executar a aplicação, certifique-se de que você tem:

- ✅ Python 3.13+ instalado
- ✅ Node.js 18+ instalado
- ✅ Ambiente virtual Python criado (`venv`)
- ✅ Dependências do backend instaladas
- ✅ Dependências do frontend instaladas
- ✅ Banco de dados criado (`database/tcc_financeira.db`)

---

## 🎯 Método Rápido (Recomendado)

### Iniciar a Aplicação

Basta dar **duplo clique** no arquivo:

```
iniciar_aplicacao.bat
```

Ou executar no terminal:

```bash
iniciar_aplicacao.bat
```

**O que acontece:**
1. ✅ Verifica se o banco de dados existe
2. ✅ Verifica se o ambiente virtual existe
3. ✅ Verifica se as dependências estão instaladas
4. 🚀 Inicia o Backend (porta 8000)
5. 🚀 Inicia o Frontend (porta 3000)
6. 🌐 Abre o navegador automaticamente

### Parar a Aplicação

Basta dar **duplo clique** no arquivo:

```
parar_aplicacao.bat
```

Ou executar no terminal:

```bash
parar_aplicacao.bat
```

---

## 🔧 Método Manual

Se preferir iniciar manualmente:

### 1. Iniciar Backend

Abra um terminal e execute:

```bash
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### 2. Iniciar Frontend

Abra **outro terminal** e execute:

```bash
cd frontend
npm run dev
```

### 3. Acessar a Aplicação

Abra o navegador em: http://localhost:3000

---

## 🌐 URLs da Aplicação

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface do usuário |
| **Backend** | http://localhost:8000 | API REST |
| **API Docs** | http://localhost:8000/docs | Documentação Swagger |
| **ReDoc** | http://localhost:8000/redoc | Documentação alternativa |

---

## 👤 Credenciais de Teste

Para fazer login na aplicação:

- **Email:** `teste@teste.com`
- **Senha:** `123456`

---

## 🐛 Solução de Problemas

### Erro: "Banco de dados não encontrado"

Execute o script de criação do banco:

```bash
cd database
sqlite3 tcc_financeira.db < schema_sqlite.sql
```

### Erro: "Ambiente virtual não encontrado"

Crie o ambiente virtual:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r backend\requirements.txt
```

### Erro: "Dependências do frontend não instaladas"

Instale as dependências:

```bash
cd frontend
npm install
```

### Porta já em uso

Se as portas 3000 ou 8000 já estiverem em uso:

**Backend (porta 8000):**
```bash
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

**Frontend (porta 3000):**
```bash
cd frontend
npm run dev -- -p 3001
```

---

## 📝 Notas Importantes

1. **Duas janelas serão abertas** quando você executar `iniciar_aplicacao.bat`:
   - Uma para o Backend (FastAPI)
   - Uma para o Frontend (Next.js)

2. **NÃO FECHE ESSAS JANELAS** enquanto estiver usando a aplicação

3. Para parar a aplicação, use `parar_aplicacao.bat` ou feche as janelas manualmente

4. O banco de dados SQLite está em `database/tcc_financeira.db`

5. Os logs de erro aparecem nas janelas do Backend e Frontend

---

## 🎓 Estrutura do Projeto

```
TCC_FINANCERA/
├── backend/              # API FastAPI
│   ├── app/             # Código da aplicação
│   └── requirements.txt # Dependências Python
├── frontend/            # Interface Next.js
│   ├── app/            # Páginas e componentes
│   └── package.json    # Dependências Node
├── database/           # Banco de dados SQLite
│   └── tcc_financeira.db
├── iniciar_aplicacao.bat   # ⭐ Script para iniciar
├── parar_aplicacao.bat     # ⭐ Script para parar
└── COMO_EXECUTAR.md        # Este arquivo
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs nas janelas do Backend e Frontend
2. Consulte a documentação da API em http://localhost:8000/docs
3. Verifique se todas as dependências estão instaladas
4. Certifique-se de que as portas 3000 e 8000 estão livres

---

**Desenvolvido como TCC - Sistema de Gestão Financeira Pessoal** 🎓

