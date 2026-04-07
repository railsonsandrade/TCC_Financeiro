# Guia de Integração OpenClaw + WhatsApp

## Visão Geral

Este guia descreve como integrar o sistema **Sob Controle** com o **OpenClaw** para permitir controle financeiro via WhatsApp. Com essa integração, o usuário poderá:

- Registrar lançamentos (receitas/despesas) via mensagem
- Consultar saldo e extrato
- Ver progresso das metas financeiras
- Receber alertas e relatórios

---

## Arquitetura da Integração

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ WhatsApp │────▶│  OpenClaw    │────▶│  Webhook Backend │────▶│  Sob Controle│
│  Usuário │◀────│  (Mediador)  │◀────│   /api/v1/webhook │◀────│   Services   │
└──────────┘     └──────────────┘     └──────────────────┘     └──────────────┘
```

### Fluxo de Mensagem

1. Usuário envia mensagem no WhatsApp
2. OpenClaw recebe e faz parse da mensagem
3. OpenClaw chama o webhook do Sob Controle
4. Backend processa o comando e retorna resposta
5. OpenClaw envia a resposta ao usuário no WhatsApp

---

## Pré-requisitos

1. **Conta no OpenClaw**: Crie uma conta em [openclaw.io](https://openclaw.io)
2. **Número WhatsApp Business**: Necessário para o bot
3. **Backend Sob Controle rodando**: Com URL pública (use ngrok para desenvolvimento)

---

## Passo 1: Configurar OpenClaw

### 1.1 Criar projeto no OpenClaw

```bash
# Instalar CLI do OpenClaw
npm install -g @openclaw/cli

# Criar novo projeto
openclaw init sob-controle-whatsapp
cd sob-controle-whatsapp
```

### 1.2 Configurar webhook

No painel do OpenClaw, configure o webhook apontando para seu backend:

```
URL: https://seu-dominio.com/api/v1/webhook/whatsapp
Método: POST
Headers:
  Content-Type: application/json
  X-Webhook-Secret: sua_chave_secreta
```

### 1.3 Configurar número WhatsApp

1. Acesse o painel do OpenClaw
2. Vá em **Canais** → **WhatsApp**
3. Conecte seu número WhatsApp Business
4. Configure a mensagem de boas-vindas

---

## Passo 2: Configurar Backend Sob Controle

### 2.1 Variáveis de Ambiente

Adicione ao `.env` do backend:

```env
# OpenClaw / WhatsApp
OPENCLAW_WEBHOOK_SECRET=sua_chave_secreta_aqui
OPENCLAW_API_KEY=chave_api_openclaw
OPENCLAW_API_URL=https://api.openclaw.io
```

### 2.2 Adicionar configurações

No arquivo `backend/app/config.py`, adicione:

```python
# OpenClaw / WhatsApp
OPENCLAW_WEBHOOK_SECRET: str = ""
OPENCLAW_API_KEY: str = ""
OPENCLAW_API_URL: str = "https://api.openclaw.io"
```

### 2.3 Registrar rota do webhook

No arquivo `backend/app/api/__init__.py`, adicione:

```python
from app.api.routes import webhook
api_router.include_router(webhook.router)
```

---

## Passo 3: Comandos Suportados

### Comandos de Lançamento

| Comando | Exemplo | Ação |
|---------|---------|------|
| `gasto` ou `despesa` | `gasto 50 almoço` | Registra despesa de R$50 com descrição "almoço" |
| `receita` ou `entrada` | `receita 3000 salário` | Registra receita de R$3.000 |
| `pagar` | `pagar aluguel 1200` | Registra pagamento de aluguel |

### Comandos de Consulta

| Comando | Exemplo | Ação |
|---------|---------|------|
| `saldo` | `saldo` | Mostra saldo de todas as contas |
| `extrato` | `extrato` | Mostra últimos 10 lançamentos |
| `resumo` | `resumo` | Resumo do mês (receitas, despesas, saldo) |

### Comandos de Meta

| Comando | Exemplo | Ação |
|---------|---------|------|
| `metas` | `metas` | Lista todas as metas ativas |
| `guardar` | `guardar 200 viagem` | Adiciona R$200 à meta "viagem" |

### Comandos de IA

| Comando | Exemplo | Ação |
|---------|---------|------|
| `copilot` | `copilot em que gastei mais?` | Pergunta à IA Copilot |
| `dica` | `dica` | Recebe dica financeira personalizada |

---

## Passo 4: Autenticação de Usuários WhatsApp

### 4.1 Vinculação de conta

O usuário precisa vincular seu número WhatsApp à conta do Sob Controle:

1. Na tela de perfil do app web, gere um **código de vinculação**
2. No WhatsApp, envie: `vincular CODIGO123`
3. O sistema valida e associa o número à conta

### 4.2 Schema de vinculação

```python
# Tabela: whatsapp_vinculos
# id_vinculo: int (PK)
# id_usuario: int (FK -> usuarios)
# telefone: str (número WhatsApp, formato +5511999999999)
# codigo_vinculo: str (código temporário)
# ativo: bool
# data_vinculo: datetime
```

### SQL para criação da tabela:

```sql
CREATE TABLE IF NOT EXISTS whatsapp_vinculos (
    id_vinculo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    codigo_vinculo VARCHAR(10),
    ativo BOOLEAN DEFAULT 1,
    data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
```

---

## Passo 5: Formato de Mensagens

### Mensagem recebida do OpenClaw (webhook):

```json
{
  "event": "message",
  "from": "+5511999999999",
  "message": "gasto 50 almoço",
  "timestamp": "2026-04-07T12:00:00Z",
  "metadata": {
    "channel": "whatsapp",
    "message_id": "abc123"
  }
}
```

### Resposta do webhook:

```json
{
  "reply": "✅ Despesa registrada!\n\n📝 Almoço\n💰 R$ 50,00\n📅 07/04/2026\n\nSaldo atual: R$ 2.450,00",
  "status": "success"
}
```

---

## Passo 6: Testes

### Teste local com ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Expor backend local
ngrok http 8000

# Use a URL gerada (ex: https://abc123.ngrok.io) como webhook no OpenClaw
```

### Teste manual do webhook

```bash
curl -X POST http://localhost:8000/api/v1/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sua_chave_secreta" \
  -d '{
    "event": "message",
    "from": "+5511999999999",
    "message": "saldo",
    "timestamp": "2026-04-07T12:00:00Z",
    "metadata": {"channel": "whatsapp"}
  }'
```

---

## Checklist de Implementação

- [ ] Criar conta no OpenClaw
- [ ] Configurar número WhatsApp Business
- [ ] Adicionar variáveis de ambiente ao `.env`
- [ ] Registrar rota webhook no router
- [ ] Implementar parser de comandos
- [ ] Criar tabela `whatsapp_vinculos`
- [ ] Implementar fluxo de vinculação
- [ ] Implementar comandos de lançamento
- [ ] Implementar comandos de consulta
- [ ] Implementar comandos de meta
- [ ] Integrar com Copilot IA
- [ ] Testar com ngrok
- [ ] Deploy em produção

---

## Recursos

- [OpenClaw Docs](https://docs.openclaw.io)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [ngrok](https://ngrok.com)
