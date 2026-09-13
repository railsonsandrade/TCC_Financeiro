# 🛡️ Relatório de Auditoria Técnica e Plano de Melhorias
## Sistema de Gestão Financeira Pessoal (Sob Controle) - TCC

Este documento apresenta uma análise profunda e detalhada de todo o projeto **Sob Controle**, focando em **Segurança**, **Performance**, **Organização de Arquivos** e **Erros de Compilação TypeScript**, preparando a aplicação para deploy seguro em produção (Vercel + Render/Fly.io) e integração de mensageria (OpenClaw / WhatsApp / Telegram).

---

## 1. 🛡️ Segurança (Security)

Realizamos uma varredura completa por vulnerabilidades no backend e no frontend. Aqui estão os pontos críticos que precisam de correção imediata antes de subir o sistema para produção:

### ⚠️ A. Chaves de API e Segredos Hardcoded (Risco Crítico)
Encontramos chaves de API reais e ativas salvas diretamente no código-fonte, o que representa um grave risco de segurança (qualquer pessoa com acesso ao repositório ou caso o projeto seja público no GitHub poderá utilizá-las e gerar custos ou vazamento de dados):

1. **Chave do Groq API (Fallback)** em `backend/app/api/routes/copilot.py`:
   ```python
   groq_api_key = getattr(settings, 'GROQ_API_KEY', 'SUA_CHAVE_AQUI')
   ```
   *Correção:* A chave padrão deve ser removida e obtida exclusivamente através de `settings.GROQ_API_KEY`, que por sua vez deve ler do arquivo `.env` configurado na hospedagem.
   
2. **Chave do Gemini API (Principal)** em `backend/app/api/routes/copilot.py`:
   ```python
   fallback_key = os.getenv('GEMINI_API_KEY')
   ```
   *Correção:* Remova a string literal. A chave deve ser fornecida somente via variáveis de ambiente.

3. **Chave do Gemini API no Script de Teste** em `test_genai.py`:
   ```python
   genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
   ```
   *Correção:* Este script é de desenvolvimento e possui chaves expostas. Ele deve ser removido ou adicionado ao `.gitignore`.

4. **Secret Key do JWT** no arquivo `.env` do backend:
   ```env
   SECRET_KEY=sua_chave_secreta_aqui_gere_uma_chave_forte
   ```
   *Correção:* A chave padrão do JWT é fraca. Em produção, gere uma chave criptográfica forte de 32 bytes usando:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

### 🔒 B. Segurança do Banco de Dados (SQLite)
* O SQLite armazena todos os dados em um único arquivo local (`database/tcc_financeira.db`).
* **Deploy na Vercel:** A Vercel possui um sistema de arquivos **somente-leitura** e **efêmero** (stateless). Isso significa que se você tentar subir o SQLite na Vercel:
  1. A aplicação não conseguirá salvar novos dados (erro de `Read-only file system`).
  2. Qualquer dado salvo localmente será apagado sempre que a Vercel reiniciar o container da aplicação (o que acontece várias vezes ao dia).
* **Solução Recomendada para Produção:** 
  Para subir em produção na Vercel, o backend FastAPI deve rodar em um servidor persistente (como **Render**, **Railway** ou **Fly.io**) e utilizar um banco de dados hospedado em nuvem (como **PostgreSQL** gratuito no *Supabase* ou *NeonDB*). O SQLite deve ser usado estritamente para desenvolvimento local.

### 🌐 C. Configurações de CORS
No arquivo `backend/app/main.py`:
* O CORS permite conexões de `http://localhost:3000` e `http://localhost:8000`.
* Ao fazer o deploy da aplicação, certifique-se de atualizar a variável `ALLOWED_ORIGINS` no `.env` do servidor de produção para conter apenas a URL oficial da sua aplicação hospedada no Vercel (ex: `https://sob-controle.vercel.app`).

---

## 2. ⚡ Performance (Performance)

O sistema possui uma excelente arquitetura baseada em Repositories e Services, porém há gargalos de I/O de disco no banco de dados e renderização no frontend:

### 🗄️ A. Conexões Concorrentes com o Banco de Dados (Flask/FastAPI + SQLite)
No utilitário de banco de dados `backend/app/utils/database.py`:
```python
@contextmanager
def get_cursor(self):
    connection = self.connect() # Abre nova conexão sqlite3.connect()
    cursor = connection.cursor()
    try:
        yield cursor
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        self.disconnect() # Fecha a conexão
```
* **Gargalo:** Abrir e fechar uma conexão física com o arquivo SQLite a **cada consulta individual** consome muito processamento de I/O de disco. Sob acessos simultâneos (especialmente quando integrarmos com webhooks de WhatsApp), isso causará travamentos (`sqlite3.OperationalError: database is locked`).
* **Otimização (Sem alterar regras de negócio):**
  Implementar o modo **WAL (Write-Ahead Logging)** e habilitar o suporte a multithreading no SQLite adicionando pragmas de performance na conexão:
  ```python
  def connect(self) -> sqlite3.Connection:
      try:
          # Adicionar timeout para evitar travamentos sob concorrência
          self._connection = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
          self._connection.row_factory = sqlite3.Row
          
          # Habilitar Pragmas de Alta Performance
          self._connection.execute("PRAGMA journal_mode=WAL;")      # Permite leitura e escrita simultâneas
          self._connection.execute("PRAGMA synchronous=NORMAL;")    # Reduz escritas síncronas agressivas
          self._connection.execute("PRAGMA foreign_keys=ON;")       # Garante integridade referencial
          
          return self._connection
      except sqlite3.Error as e:
          raise Exception(f"Erro ao conectar ao banco de dados: {str(e)}")
  ```

### 💻 B. Renderização e Chamadas de API no Frontend
* Atualmente, páginas como `lancamentos/page.tsx`, `contas/page.tsx` e `categorias/page.tsx` buscam dados via chamadas de API diretas no `useEffect` tradicional.
* **Gargalo:** Se o usuário navegar de uma página para outra, o Next.js remonta o componente e dispara uma nova requisição HTTP do zero, gerando lag visual (o spinner amarelo de loading aparece constantemente).
* **Melhoria:** Integrar uma biblioteca de gerenciamento de cache de requisições como o **SWR** (do próprio time do Vercel) ou **React Query**. Isso trará uma experiência de usuário extremamente premium (instantânea), atualizando os dados em background sem travar a tela com loadings.

---

## 3. 📂 Organização e Estrutura (Organization)

O projeto possui alguns arquivos soltos de testes temporários e backups redundantes que poluem o repositório.

### 🗑️ Arquivos Redundantes / Desnecessários a Excluir:
1. **Pasta `temp/` no diretório principal (Crítico):**
   * *O que é:* Contém um clone idêntico completo e desatualizado de todo o projeto (com outro `.git`, `backend`, `frontend`, etc.).
   * *Ação:* **Excluir completamente a pasta `temp/`** para liberar espaço e evitar confusão de arquivos.
2. **Arquivo `backend/tcc_financeiro.db`:**
   * *O que é:* Cópia duplicada do banco de dados na raiz do backend. O banco ativo que a aplicação consome está na pasta `database/tcc_financeira.db`.
   * *Ação:* **Excluir `backend/tcc_financeiro.db`** para garantir que apenas um arquivo de banco exista no projeto.
3. **Arquivo `test_genai.py` na raiz:**
   * *O que é:* Script temporário usado para testar chaves do Gemini API com chaves expostas.
   * *Ação:* **Excluir `test_genai.py`**.
4. **Arquivo `backend/backend_output.log`:**
   * *O que é:* Arquivo de log gerado localmente.
   * *Ação:* **Excluir** e adicionar `*.log` ao arquivo `.gitignore` do backend.

### 📁 Reorganização dos Scripts do Backend:
A pasta `backend` está poluída com múltiplos scripts soltos de utilitários e migração. O correto é agrupá-los em uma subpasta dedicada:
* Criar a pasta: `backend/scripts/`
* Mover os seguintes arquivos para dentro dela:
  * `check_demo_account.py` ➔ `backend/scripts/check_demo_account.py`
  * `check_lancamentos.py` ➔ `backend/scripts/check_lancamentos.py`
  * `create_demo_data.py` ➔ `backend/scripts/create_demo_data.py`
  * `limpar_lancamentos_demo.py` ➔ `backend/scripts/limpar_lancamentos_demo.py`
  * `limpar_metas_duplicadas.py` ➔ `backend/scripts/limpar_metas_duplicadas.py`
  * `populate_presentation.py` ➔ `backend/scripts/populate_presentation.py`
  * `setup_demo_user.py` ➔ `backend/scripts/setup_demo_user.py`
  * `test_api_totais.py` ➔ `backend/scripts/test_api_totais.py`
  * `create_dashboard.sql` ➔ `backend/scripts/create_dashboard.sql`

*Nota:* Já realizamos a movimentação dos dois relatórios em formato `.docx` (`relatorio_casos_teste.docx` e `relatorio_casos_teste_final.docx`) para dentro da pasta `docs/`, organizando com sucesso o diretório principal da aplicação!

---

## 4. 🛠️ Correção Completa dos Erros de TypeScript

Para que a aplicação compile com sucesso no Vercel (onde o build falhará se houver qualquer erro do compilador TS), precisamos realizar estes pequenos ajustes pontuais:

### 🔴 Erro 1 & 2: `app/dashboard/contas/page.tsx` (linhas 43 e 45)
* **Erro:** O input de formulário armazena o saldo inicial como string (`formData.saldo_inicial = ""`), mas a API espera um número (`number`).
* **Solução:** Converter para número no momento do envio.
* **Código Atual:**
  ```typescript
  if (editingConta) {
    await contasAPI.atualizar(editingConta.id_conta, formData)
  } else {
    await contasAPI.criar(formData)
  }
  ```
* **Alteração Necessária:**
  ```typescript
  const payload = {
    ...formData,
    saldo_inicial: parseFloat(formData.saldo_inicial) || 0
  }
  if (editingConta) {
    await contasAPI.atualizar(editingConta.id_conta, payload)
  } else {
    await contasAPI.criar(payload)
  }
  ```

### 🔴 Erro 3 & 4: `app/dashboard/contas/page.tsx` (linhas 71 e 115)
* **Erro:** `Property 'cor' does not exist on type 'Conta'.`
* **Solução:** A interface `Conta` em `frontend/lib/api.ts` e a tabela `conta_financeira` do banco de dados não possuem o campo `cor`, embora o frontend tente usá-lo.
* **Alteração Necessária:**
  1. Adicionar o campo na interface em `frontend/lib/api.ts`:
     ```typescript
     export interface Conta {
         // ... campos existentes
         cor?: string | null; // Adicionar esta linha
     }
     ```
  2. Adicionar o campo na tabela `conta_financeira` no SQLite através de uma alteração no script do banco (`database/schema_sqlite.sql`) e rodar um comando de migração:
     ```sql
     ALTER TABLE conta_financeira ADD COLUMN cor VARCHAR(7) DEFAULT '#3B82F6';
     ```

### 🔴 Erro 5 & 6: `app/dashboard/lancamentos/page.tsx` (linhas 62 e 64)
* **Erro:** `valor` do input é string, mas a API de lançamentos espera `number`.
* **Solução:** Fazer o parse numérico de `formData.valor` antes de enviar.
* **Código Atual:**
  ```typescript
  const data = {
    ...formData,
    id_conta: parseInt(formData.id_conta),
    id_categoria: parseInt(formData.id_categoria),
    origem: 'Manual' as const
  }
  ```
* **Alteração Necessária:**
  ```typescript
  const data = {
    ...formData,
    id_conta: parseInt(formData.id_conta),
    id_categoria: parseInt(formData.id_categoria),
    valor: parseFloat(formData.valor) || 0, // Adicionar a conversão aqui
    origem: 'Manual' as const
  }
  ```

### 🔴 Erro 7: `app/dashboard/lancamentos/page.tsx` (linha 105)
* **Erro:** `Type 'string | null | undefined' is not assignable to type 'string'.`
* **Solução:** O campo `descricao` no formulário não aceita `undefined` ou `null`, mas o lançamento recebido do banco pode ter esse campo nulo.
* **Código Atual:**
  ```typescript
  descricao: lancamento.descricao,
  ```
* **Alteração Necessária (Fallback simples):**
  ```typescript
  descricao: lancamento.descricao || '',
  ```

### 🔴 Erro 8: `components/dashboard/DashboardGrid.tsx` (linha 157)
* **Erro:** O compilador reclama que a propriedade `cols` não existe no componente dinâmico `GridLayout` devido à perda de tipagem no empacotador `dynamic` do Next.js.
* **Solução:** Forçar a tipagem do componente dinâmico como `any` para ignorar a validação estrita exclusiva do wrapper SSR do Next.js.
* **Código Atual:**
  ```typescript
  const GridLayout = dynamic(() => import('react-grid-layout'), { ssr: false })
  ```
* **Alteração Necessária:**
  ```typescript
  const GridLayout = dynamic(() => import('react-grid-layout'), { ssr: false }) as any
  ```

---

## 5. 🔌 Integração OpenClaw + WhatsApp vs. Telegram

Você planeja expandir o sistema para operar via WhatsApp integrado com o **OpenClaw** ou via **Telegram**. Aqui está o comparativo arquitetural e nossa recomendação técnica:

### 🟢 Opção A: WhatsApp com OpenClaw (Recomendado se o foco for Experiência do Usuário)
* **Como Funciona:** O usuário envia uma mensagem natural (ex: *"gasto 50 almoço"*), o OpenClaw recebe, valida e encaminha via requisição POST para o webhook criado no seu backend FastAPI (`/api/v1/webhook/whatsapp`).
* **Vantagens:** O WhatsApp é o aplicativo mais utilizado pelos usuários no dia a dia, garantindo o maior engajamento.
* **Ajustes necessários no Backend:**
  1. **Banco de Dados:** A tabela `whatsapp_vinculos` descrita no guia do OpenClaw não existe no seu banco de dados atual. Precisamos rodar a SQL abaixo para criá-la:
     ```sql
     CREATE TABLE IF NOT EXISTS whatsapp_vinculos (
         id_vinculo INTEGER PRIMARY KEY AUTOINCREMENT,
         id_usuario INTEGER NOT NULL,
         telefone VARCHAR(20) NOT NULL UNIQUE,
         codigo_vinculo VARCHAR(10),
         ativo BOOLEAN DEFAULT 1,
         data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
     );
     ```
  2. **Webhook Parser:** Implementar a lógica real no arquivo `webhook.py` para interpretar as mensagens de texto usando regex simples ou chamando a própria **PatarIA (Gemini)** para converter a frase natural em dados estruturados (JSON) e inserir o registro no repositório correspondente.

### 🔵 Opção B: Telegram Bot (Recomendado se o foco for Simplicidade de Configuração e Custo Zero)
* **Como Funciona:** Você cria um Bot gratuito no Telegram via `@BotFather`, obtém um Token e roda um serviço de escuta de mensagens (polling ou webhook).
* **Vantagens:** 
  * Totalmente gratuito (não há tarifas por mensagem enviada/recebida).
  * API extremamente simples de usar (não precisa de mediador de terceiros como OpenClaw).
  * Biblioteca `python-telegram-bot` integrada de forma nativa e assíncrona no backend FastAPI.
* **Configuração:**
  Basta registrar um novo router no backend FastAPI `/api/v1/webhook/telegram` e configurar o bot no Telegram para apontar para essa URL. O fluxo de comandos seria idêntico ao do WhatsApp.

---

## 6. 📝 Resumo do Plano de Ação Recomendado (Próximos Passos)

1. **Limpeza Geral:** Excluir a pasta `temp/`, o banco de dados redundante `backend/tcc_financeiro.db`, o arquivo `test_genai.py` e os logs.
2. **Correção TypeScript:** Aplicar os 8 ajustes rápidos listados acima nos arquivos `.tsx` para desbloquear o build de produção.
3. **Refatoração de Performance (SQLite):** Habilitar o modo WAL e Pragmas de performance no `database.py`. Mover os segredos das APIs de IA para variáveis de ambiente `.env`.
4. **Deploy de Produção:**
   * Hospedar o frontend na **Vercel** (gratuito e otimizado para Next.js).
   * Hospedar o backend no **Render** ou **Railway** (gratuito/barato para rodar servidores FastAPI em Python).
   * Migrar o banco SQLite de produção para um **PostgreSQL** hospedado na nuvem (Supabase ou NeonDB) com apenas algumas linhas de mudança na URL de conexão.
5. **Integração Chatbot:** Criar a tabela de vínculos no banco de dados e implementar o parser do webhook (seja WhatsApp via OpenClaw ou Telegram) para registrar gastos por texto.
