# Requisitos do Sistema - TCC Financeira

## 📌 Requisitos Funcionais (RFs)

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF001 | O sistema deve permitir o cadastro de usuário com nome, e-mail e senha | Alta | 🔴 Pendente |
| RF002 | O sistema deve permitir login/autenticação de usuários cadastrados | Alta | 🔴 Pendente |
| RF003 | O sistema deve permitir o cadastro, edição e exclusão de contas financeiras | Alta | 🔴 Pendente |
| RF004 | O sistema deve permitir o cadastro de categorias de receitas e despesas | Alta | 🔴 Pendente |
| RF005 | O sistema deve permitir o lançamento de receitas | Alta | 🔴 Pendente |
| RF006 | O sistema deve permitir o lançamento de despesas | Alta | 🔴 Pendente |
| RF007 | O sistema deve permitir configurar lançamentos recorrentes | Alta | 🔴 Pendente |
| RF008 | O sistema deve permitir o cadastro de metas financeiras | Alta | 🔴 Pendente |
| RF009 | O sistema deve exibir um dashboard consolidado | Alta | 🔴 Pendente |
| RF010 | O sistema deve disponibilizar visão de orçamento 50/30/20 | Média | 🔴 Pendente |
| RF011 | O sistema deve gerar projeção de fluxo de caixa (6 semanas a 90 dias) | Alta | 🔴 Pendente |
| RF012 | O sistema deve permitir filtrar lançamentos | Média | 🔴 Pendente |
| RF013 | O sistema deve enviar notificações/alertas | Média | 🔴 Pendente |
| RF014 | O sistema deve permitir configurar preferências de notificação | Média | 🔴 Pendente |
| RF015 | O sistema deve permitir visualizar relatórios | Média | 🔴 Pendente |
| RF016 | O sistema deve permitir alterar senha e atualizar perfil | Alta | 🔴 Pendente |
| RF017 | O sistema deve registrar data/hora de criação e atualização | Média | 🔴 Pendente |
| RF018 | O sistema deve disponibilizar exportação em CSV | Baixa | 🔴 Pendente |
| RF019 | O sistema deve bloquear acesso para usuários não autenticados | Alta | 🔴 Pendente |

---

## 🔒 Requisitos Não Funcionais (RNFs)

| ID | Categoria | Descrição | Status |
|---|---|---|---|
| RNF001 | Segurança | Senhas armazenadas com hash seguro (bcrypt/Argon2) | 🔴 Pendente |
| RNF002 | Segurança | Comunicação via HTTPS/TLS | 🔴 Pendente |
| RNF003 | Segurança | Controle de acesso a dados sensíveis | 🔴 Pendente |
| RNF004 | Performance | Carregamento da tela principal < 2 segundos | 🔴 Pendente |
| RNF005 | Usabilidade | Interface responsiva (mobile, tablet, desktop) | 🔴 Pendente |
| RNF006 | Usabilidade | Navegação com padrões de UX | 🔴 Pendente |
| RNF007 | Compatibilidade | Suporte a Chrome, Firefox e navegadores mobile | 🔴 Pendente |
| RNF008 | Disponibilidade | Sistema disponível 24/7 | 🔴 Pendente |
| RNF009 | Manutenibilidade | Código seguindo boas práticas | 🔴 Pendente |
| RNF010 | Escalabilidade | Escalonamento horizontal do backend | 🔴 Pendente |
| RNF011 | Confiabilidade | Tratamento gracioso de erros | 🔴 Pendente |

---

## 📐 Regras de Negócio (RNs)

| ID | Descrição | Implementado |
|---|---|---|
| RN001 | Usuário não pode cadastrar lançamento com valor zero ou negativo | ❌ |
| RN002 | Meta financeira deve ter status: Em andamento, Concluída ou Cancelada | ❌ |
| RN003 | Projeção de caixa considera receitas/despesas fixas e recorrentes | ❌ |
| RN004 | Exclusão de recorrência não remove lançamentos já gerados | ❌ |
| RN005 | Não permitir contas duplicadas (mesmo nome e tipo) por usuário | ❌ |
| RN006 | Classificação automática 50/30/20 com ajuste manual | ❌ |
| RN007 | Notificação de risco quando projeção indicar saldo negativo | ❌ |
| RN008 | Apenas o próprio usuário pode acessar seus dados | ❌ |

---

## 🎯 Resultados Esperados (Metas Mensuráveis)

| ID | Descrição | Meta | Status |
|---|---|---|---|
| RE001 | Adoção e engajamento | 20+ lançamentos/mês por usuário | 🔴 |
| RE002 | Organização financeira | Visão consolidada até 90 dias | 🔴 |
| RE003 | Prevenção de endividamento | Alertas de saldo negativo | 🔴 |
| RE004 | Experiência do usuário | 80% classificam como "fácil" | 🔴 |
| RE005 | Desempenho técnico | Carregamento < 2 segundos | 🔴 |
| RE006 | Segurança da informação | 100% senhas com hash + HTTPS | 🔴 |

---

## 🚫 Fora do Escopo (MVP)

- ❌ Integração com bancos, Open Finance ou PIX
- ❌ Funcionalidades de investimentos (bolsa, CDB, fundos, cripto)
- ❌ Controle de múltiplas moedas
- ❌ Módulo de educação financeira estruturado
- ❌ Sistema multiusuário corporativo

---

## 📊 Casos de Uso Principais

### UC01 - Cadastrar-se no sistema
**Ator:** Usuário  
**Fluxo:**
1. Usuário acessa tela de registro
2. Informa nome, e-mail e senha
3. Sistema valida dados
4. Sistema cria conta e envia confirmação

### UC02 - Autenticar-se (Login)
**Ator:** Usuário  
**Fluxo:**
1. Usuário informa e-mail e senha
2. Sistema valida credenciais
3. Sistema gera token JWT
4. Usuário é redirecionado ao dashboard

### UC05 - Registrar Lançamento
**Ator:** Usuário  
**Fluxo:**
1. Usuário seleciona "Novo Lançamento"
2. Informa tipo, valor, data, conta, categoria, descrição
3. Opcionalmente marca como recorrente
4. Sistema valida (RN001)
5. Sistema grava e atualiza dashboards

### UC09 - Consultar Projeção de Caixa
**Ator:** Usuário  
**Fluxo:**
1. Usuário escolhe horizonte (6 semanas, 60 ou 90 dias)
2. Sistema calcula saldo futuro (RN003)
3. Sistema apresenta gráfico com períodos de risco (RN007)

---

## 🔄 Status de Implementação

**Legenda:**
- 🔴 Pendente
- 🟡 Em Desenvolvimento
- 🟢 Concluído
- ✅ Testado e Validado

**Última atualização:** 2025-11-18

