# Roteiro de Apresentação - TCC: Sistema de Gestão Financeira

Este documento serve como guia para a sua fala durante a apresentação do seu Trabalho de Conclusão de Curso. Ele está estruturado para cobrir os aspectos técnicos e funcionais do seu projeto.

---

## 1. Introdução (Abertura)

**Objetivo:** Apresentar você e o tema do projeto.

*   "Bom dia/Boa noite a todos. Meu nome é [Seu Nome] e hoje vou apresentar meu Trabalho de Conclusão de Curso."
*   "O projeto desenvolvido é um **Sistema de Gestão Financeira Pessoal**."
*   "A motivação para este trabalho surgiu da necessidade facilitar o controle de receitas e despesas, permitindo que os usuários tenham uma visão clara de sua saúde financeira e possam planejar metas futuras de forma eficiente."

---

## 2. Visão Geral da Solução

**Objetivo:** Explicar o que o sistema faz em linhas gerais.

*   "A aplicação é uma plataforma web completa que permite ao usuário:"
    *   "Gerenciar suas contas bancárias e carteiras."
    *   "Registrar receitas e despesas (lançamentos)."
    *   "Categorizar esses lançamentos para melhor análise."
    *   "Criar e acompanhar o progresso de metas financeiras."
    *   "Visualizar gráficos e relatórios na dashboard principal."

---

## 3. Arquitetura do Sistema

**Objetivo:** Demonstrar conhecimento técnico sobre como o sistema foi desenhado.

*   "Para o desenvolvimento, adotei uma **Arquitetura Cliente-Servidor** moderna e desacoplada, garantindo escalabilidade e facilidade de manutenção."
*   "O sistema é dividido em duas grandes partes principais:"
    1.  **Backend (API Rest):** Responsável por toda a lógica de negócios, regras de validação e persistência dos dados.
    2.  **Frontend (Interface Web):** Responsável pela interação com o usuário e visualização dos dados."

---

## 4. Tecnologias Utilizadas

**Objetivo:** Detalhar a stack tecnológica. É importante mostrar que você domina as ferramentas escolhidas.

### 4.1. Backend (API)
*   "No servidor, utilizei a linguagem **Python**, escolhida pela sua robustez e legibilidade."
*   "O framework web utilizado foi o **FastAPI**. Ele foi escolhido por sua alta performance (assíncrono), facilidade de criação de documentação automática e suporte nativo a validação de dados."
*   "Para segurança, implementei autenticação via **JWT (JSON Web Tokens)** e criptografia de senhas com **Bcrypt**, garantindo que os dados sensíveis dos usuários estejam protegidos."
*   "Utilizei o **Pydantic** para validação robusta de dados de entrada e saída da API."

### 4.2. Banco de Dados e Persistência
*   "Para a persistência dos dados, utilizei o banco de dados **SQLite**."
*   "Um ponto importante da arquitetura é a utilização do **Padrão de Projeto Repository (Repository Pattern)**."
    *   *Nota para falar:* "Em vez de usar um ORM pesado, optei por escrever queries SQL otimizadas através de Repositories. Isso me dá total controle sobre as consultas ao banco e separa claramente a camada de acesso a dados da camada de negócios."

### 4.3. Frontend (Interface)
*   "No frontend, utilizei o **React** (versão 19) através do framework **Next.js** (versão 16)."
*   "O Next.js foi escolhido por prover recursos avançados como renderização do lado do servidor e otimização de rotas."
*   "Para a estilização, adotei o **Tailwind CSS**, que permite um desenvolvimento ágil e uma interface consistente e responsiva."
*   "Utilizei a biblioteca **Recharts** para a construção dos gráficos financeiros da dashboard, permitindo uma visualização clara dos dados."
*   "Para a comunicação com a API, utilizei o **Axios**."

---

## 5. Modelagem de Dados

**Objetivo:** Explicar como as informações estão organizadas.

*   "O modelo de dados foi estruturado em entidades principais:"
    *   **Usuário**: O centro da aplicação, garantindo que cada pessoa acesse apenas seus próprios dados.
    *   **Contas Financeiras**: Representam as fontes de recursos (ex: Carteira, Banco X, Banco Y).
    *   **Categorias**: Permitem classificar os gastos (ex: Alimentação, Transporte, Salário).
    *   **Lançamentos**: A entidade central que registra as movimentações financeiras, conectando Conta, Categoria e Usuário.
    *   **Metas**: Permite ao usuário definir objetivos de poupança com valor alvo e data limite."

---

## 6. Funcionalidades e Fluxos Principais

**Objetivo:** Descrever o que o sistema entrega de valor. (Se houver demonstração ao vivo, faça aqui).

*   "O sistema conta com fluxo completo de cadastro e login, protegendo as rotas privadas."
*   "Ao entrar, o usuário é recebido por uma Dashboard que resume o saldo atual, o total de receitas e despesas do mês, além de gráficos de evolução."
*   "É possível adicionar, editar e excluir lançamentos de forma rápida. O sistema recalcula automaticamente os saldos das contas envolvidas."
*   "O usuário também pode criar metas e o sistema calcula quanto falta para atingir o objetivo com base no progresso atual."

---

## 7. Conclusão e Aprendizados

**Objetivo:** Fechar a apresentação.

*   "O desenvolvimento deste sistema permitiu consolidar conhecimentos em desenvolvimento Full Stack."
*   "Destaco como principais desafios superados: a implementação da autenticação segura e a modelagem correta dos relacionamentos no banco de dados para garantir a integridade das transações financeiras."
*   "Como melhorias futuras, vislumbro a implementação de relatórios exportáveis (PDF/Excel) e integração automática com APIs bancárias (Open Finance)."
*   "Obrigado pela atenção de todos. Estou aberto a perguntas."
