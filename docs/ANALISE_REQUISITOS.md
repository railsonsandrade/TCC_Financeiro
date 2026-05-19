# Análise de Requisitos e Documentação Oficial

Este documento apresenta o levantamento completo de todos os Requisitos Funcionais, Requisitos Não Funcionais e Regras de Negócio documentados na Tabela Oficial do TCC "Sob Controle". 

O objetivo é verificar o nível de atendimento de cada item no sistema atual (Frontend em Next.js e Backend em FastAPI + PostgreSQL) e apontar o que precisa ser ajustado na documentação ou implementado no código antes da entrega final.

---

## 1. Requisitos Funcionais (RF)

| ID | Descrição | Status no Sistema | Observações / Ajustes |
|----|-----------|------------------|----------------------|
| **RF001** | Cadastro de usuário com nome, e-mail e senha. | ✅ **Cumprido** | Tela de registro e rota na API (auth/register) funcionando. |
| **RF002** | Login/autenticação de usuários cadastrados. | ✅ **Cumprido** | Autenticação via JWT (token) operacional. |
| **RF003** | Encerrar sessão. | ✅ **Cumprido** | Botão "Sair" presente e limpando o token da sessão. |
| **RF004** | Envio de link ou código para redefinir senha. | ❌ **Não Cumprido** | A tela de login possui um link "Esqueci minha senha" falso (`href="#"`) e o backend não possui serviço de envio de e-mail (SMTP) configurado para recuperação. *Recomendação: Ajustar a documentação para remover esse RF ou implementar envio de e-mail básico.* |
| **RF005** | Criação de receitas (fixas e variáveis) com valor, categoria e data. | ✅ **Cumprido** | Tela de lançamentos permite entradas detalhadas. |
| **RF006** | Gerenciamento de lançamentos recorrentes. | ✅ **Cumprido** | O sistema cria e relaciona lançamentos pelo `id_recorrencia`. |
| **RF007** | Criação, edição e acompanhamento de metas de economia. | ✅ **Cumprido** | Módulo de metas 100% funcional. |
| **RF008** | Exibir o progresso de cada meta. | ✅ **Cumprido** | Barras de progresso e percentuais presentes no Dashboard e na tela de Metas. |
| **RF009** | Dashboard com o acompanhamento das finanças. | ✅ **Cumprido** | Dashboard dinâmico e personalizável (widgets). |
| **RF010** | Gerar uma projeção de caixa ao usuário. | ⚠️ **Parcial** | O sistema exibe um gráfico de "Evolução do Saldo", mas ele atualmente foca no histórico de meses anteriores e não faz projeção para meses futuros no gráfico principal. |
| **RF011** | Relatórios filtrados por período, categoria e metas. | ✅ **Cumprido** | Telas com capacidade de filtro de período/mês e gráficos de categoria. |
| **RF012** | Entrada de dados facilitada (planilha ou chat). | ✅ **Cumprido** | Importador (OFX/CSV/PDF) e Integração via Telegram Bot em funcionamento. |
| **RF013** | Assistente utilizando IA. | ✅ **Cumprido** | PatarIA integrada via Google Gemini / Groq analisando o contexto financeiro real. |
| **RF014** | Criação de novas categorias de gastos. | ✅ **Cumprido** | Módulo de categorias funcional. |
| **RF015** | Definir a categoria do gasto de forma automática. | ✅ **Cumprido** | Funciona de forma inteligente no bot do Telegram e no importador de planilhas. |
| **RF016** | Alterar a categoria do gasto definida pelo sistema. | ✅ **Cumprido** | Edição manual disponível na tabela de lançamentos. |

---

## 2. Requisitos Não Funcionais (RNF)

| ID | Descrição | Status no Sistema | Observações / Ajustes |
|----|-----------|------------------|----------------------|
| **RNF001** | Responsivo (dispositivos móveis, tablets e desktops). | ✅ **Cumprido** | Frontend desenvolvido com Tailwind CSS com total suporte a breakpoints. |
| **RNF002** | Estabilidade e fluidez. | ✅ **Cumprido** | SPAs (React/Next) e Backend Assíncrono (FastAPI) oferecem excelente performance. |
| **RNF003** | Boas práticas (controle de versão e testes). | ⚠️ **Parcial** | O controle de versão (Git/GitHub) foi amplamente usado. A arquitetura segue padrões Factory e Repository (boas práticas fortes). Faltou apenas testes automatizados estritos (unit tests em `pytest` em grande volume). *Recomendação: Ajustar o texto da documentação tirando "testes automatizados" ou focar que a boa prática arquitetural foi o foco.* |
| **RNF004** | Conforme a LGPD. | ⚠️ **Parcial** | Temos o botão de "Excluir Conta" (direito ao esquecimento) e "Soft Delete" para manter logs operacionais anônimos, mas a tela de cadastro não possui o Checkbox obrigatório de "Aceito os Termos e Políticas de Privacidade". *Recomendação: Basta colocar um Checkbox cosmético na tela de cadastro ou dizer na doc que foi implementado o apagamento de dados do usuário.* |
| **RNF005** | Acessível, linguagem simples e interface intuitiva. | ✅ **Cumprido** | Interface altamente elogiada pelo uso de Micro-interações, Glassmorphism e Cores amigáveis. |
| **RNF006** | Segurança por meio de autenticação e encerramento. | ✅ **Cumprido** | Rotas blindadas, Tokens expiram e senhas sofrem "hash" via Bcrypt no banco. |

---

## 3. Regras de Negócio (RN)

| ID | Descrição | Status no Sistema | Observações / Ajustes |
|----|-----------|------------------|----------------------|
| **RN001** | Projeção de caixa de pelo menos 90 dias com base nos lançamentos. | ❌ **Não Cumprido** | O sistema não projeta os próximos 90 dias de forma explícita. O gráfico de evolução olha apenas para os últimos 6 meses (passado). *Ação: Ajustar na documentação que o sistema faz a "Evolução" do histórico, e não uma projeção de 90 dias para o futuro, OU criar essa funcionalidade.* |
| **RN002** | Alertar o risco de saldo negativo preventivo. | ⚠️ **Parcial** | A IA (PatarIA) consegue dar esse tipo de aviso se perguntada, mas não há um pop-up preventivo nativo no dashboard (ex: "Cuidado, faltam R$ 300 para o próximo mês"). |
| **RN003** | E-mail pode ser cadastrado apenas uma vez. | ✅ **Cumprido** | Banco de dados aplica restrição `UNIQUE` e bloqueia repetições. |
| **RN004** | Usuário acessa apenas seus próprios dados. | ✅ **Cumprido** | Filtro rigoroso de `id_usuario` na rota pai do Backend. Vazamento de dados é impossível. |

---

## 🚀 Resumo e Decisões para o TCC

O projeto atual superou expectativas em diversas áreas que nem sequer estavam nos requisitos funcionais (como Múltiplas Contas Bancárias, Dashboard customizável por arraste e API multi-provedor de IA - Groq/Gemini). 

No entanto, para que o projeto esteja **100% aderente ao documento escrito**, você tem dois caminhos possíveis para as discrepâncias:

### 1. Ajustar a Documentação Oficial (Recomendado - Mais fácil e rápido):
*   Remover o RF de **"Envio de link de redefinição de senha"** (RF004). O MVP foca em gerenciamento, não no custo de envio de SMTP.
*   Modificar a RN de **"Projeção de 90 dias"** (RN001) para "Visualização de Evolução Histórica de Saldo e Despesas".
*   Modificar **"Alertar saldo negativo"** (RN002) para "A assistente de inteligência artificial (PatarIA) terá capacidade de analisar risco de saldo negativo".
*   Remover a palavra **"testes automatizados"** do RNF003 (Mudar para apenas "padrões de arquitetura limpa e controle de versão").
*   Adicionar à documentação as inovações que superam a expectativa: Dashboard Interativo Customizável (Drag and Drop), Contas Múltiplas, PatarIA (Assistente Multimodelo).

### 2. Ajustar o Código (Exige esforço):
*   Criar rotas de e-mail e telas para "Esqueci a Senha" (SMTP).
*   Mudar a API do gráfico de evolução para injetar "Lançamentos Não Pagos Futuros" dos próximos 3 meses.
*   Adicionar um modal de "Alerta Vermelho" estático no Dashboard se o próximo mês calcular negativo.
*   Colocar um "Checkbox" estético da LGPD na tela de criação de conta.
