# 🤖 Guia de Integração — Telegram Bot

## Visão Geral

O **Sob Controle** possui integração nativa com o **Telegram** para controle financeiro por mensagens de texto, sem custo e sem intermediários.

```
┌──────────────┐     ┌──────────────────────────────┐     ┌──────────────────┐
│   Telegram   │────▶│  Webhook FastAPI              │────▶│  Services/Repos  │
│   (usuário)  │◀────│  /api/v1/telegram/webhook     │◀────│  (banco SQLite)  │
└──────────────┘     └──────────────────────────────┘     └──────────────────┘
```

---

## Passo 1 — Criar o Bot

1. Abra o Telegram e busque `@BotFather`
2. Envie `/newbot`
3. Escolha um nome (ex: `Sob Controle`)
4. Escolha um username (ex: `sobcontrole_bot`)
5. Copie o **token** gerado (formato: `123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ`)

---

## Passo 2 — Configurar o Backend

### 2.1 Variáveis de Ambiente

Adicione ao arquivo `backend/.env`:

```env
# Token do bot gerado pelo @BotFather
TELEGRAM_BOT_TOKEN=123456789:SEU_TOKEN_AQUI

# (Opcional) Secret para validar updates — qualquer string aleatória segura
TELEGRAM_WEBHOOK_SECRET=gere_uma_string_aleatoria_forte
```

### 2.2 Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

---

## Passo 3 — Registrar o Webhook no Telegram

O Telegram precisa saber para onde enviar as mensagens. Use o comando abaixo após o deploy:

```bash
# Com secret token (recomendado para produção)
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-dominio.com/api/v1/telegram/webhook",
    "secret_token": "sua_string_aleatoria_forte"
  }'

# Sem secret (apenas para testes)
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -d "url=https://seu-dominio.com/api/v1/telegram/webhook"
```

### Verificar se o webhook está ativo:

```bash
curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
```

### Para desenvolvimento local com ngrok:

```bash
# Instalar ngrok: https://ngrok.com
ngrok http 8000

# Use a URL gerada (ex: https://abc123.ngrok.io) no setWebhook
```

---

## Passo 4 — Verificar Status

Acesse no navegador:
```
GET http://localhost:8000/api/v1/telegram/status
```

---

## Comandos Suportados

| Comando | Exemplo | Ação |
|---------|---------|------|
| `/start` | `/start` | Boas-vindas |
| `/ajuda` | `/ajuda` | Lista de comandos |
| `/saldo` | `/saldo` | Saldo de todas as contas |
| `/extrato` | `/extrato` | Últimos 10 lançamentos |
| `/resumo` | `/resumo` | Resumo do mês atual |
| `/metas` | `/metas` | Metas financeiras ativas |
| `/gasto` | `/gasto 50 Almoço` | Registrar despesa |
| `/receita` | `/receita 3000 Salário` | Registrar receita |
| `/copilot` | `/copilot em que gastei mais?` | Perguntar à PatarIA |
| `/vincular` | `/vincular ABC123` | Vincular conta ao Telegram |

---

## Passo 5 — Vincular Conta do Usuário

Para que o bot saiba qual usuário está enviando a mensagem, é necessário vincular o chat_id do Telegram ao cadastro no sistema:

### Fluxo de vinculação:

1. No app web → **Perfil** → clique em **"Gerar código de vinculação"**
2. Um código de 6 caracteres é gerado (ex: `ABC123`) e salvo na tabela `telegram_vinculos`
3. O usuário envia no Telegram: `/vincular ABC123`
4. O bot valida o código e registra o `telegram_chat_id` → conta vinculada!

### Schema da tabela:

```sql
CREATE TABLE IF NOT EXISTS telegram_vinculos (
    id_vinculo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    telegram_chat_id INTEGER NOT NULL UNIQUE,
    telegram_username VARCHAR(100),
    codigo_vinculo VARCHAR(10),
    ativo BOOLEAN NOT NULL DEFAULT 1,
    data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
```

---

## Checklist de Implementação

### ✅ Já implementado
- [x] Endpoint `/api/v1/telegram/webhook` (recebe updates do Telegram)
- [x] Endpoint `/api/v1/telegram/status` (verifica configuração)
- [x] Roteador de comandos (`/start`, `/ajuda`, `/saldo`, etc.)
- [x] Tabela `telegram_vinculos` no schema SQL
- [x] Variáveis `TELEGRAM_BOT_TOKEN` e `TELEGRAM_WEBHOOK_SECRET` no config
- [x] Envio de mensagens via `httpx` (assíncrono, sem bloquear a API)

### 🔧 Próximos passos (implementação completa)
- [ ] Criar bot no Telegram via @BotFather e configurar o token no `.env`
- [ ] Registrar o webhook com o URL de produção
- [ ] Implementar lógica de vinculação no app web (gerar código no perfil)
- [ ] Implementar `/vincular` — validar código e salvar `telegram_chat_id`
- [ ] Implementar `/saldo` — buscar dados reais do repositório pelo `chat_id`
- [ ] Implementar `/extrato` — últimos 10 lançamentos do usuário
- [ ] Implementar `/resumo` — totais do mês atual
- [ ] Implementar `/metas` — listar metas com barra de progresso em texto
- [ ] Implementar `/gasto` e `/receita` — criar lançamento via mensagem
- [ ] Integrar `/copilot` com a PatarIA (Groq/Gemini)

---

## Recursos

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [@BotFather](https://t.me/BotFather)
- [ngrok para desenvolvimento](https://ngrok.com)
- [Documentação do setWebhook](https://core.telegram.org/bots/api#setwebhook)
