# Especificação Funcional e Técnica: Sistema de Controle de Insumos Corporativos

## 1. Visão Geral do Projeto
O objetivo deste documento é estabelecer os requisitos funcionais e técnicos para o desenvolvimento do **Sistema de Controle de Insumos Corporativos**, uma aplicação web leve e segura destinada a estancar perdas financeiras decorrentes do sumiço de itens por departamento e do descarte de insumos vencidos.

### 1.1 Stakeholders e Alinhamento Executivo
* **Diretor (Patrocinador Executivo):** Focado no ROI, redução de perdas financeiras e auditoria de desvios.
* **Controladoria / Finanças:** Exige métricas de impacto financeiro (dashboard de perdas e quebras).
* **Operações / Logística:** Precisa de agilidade no registro de entradas, saídas e controle de lotes/validade.
* **TI / Desenvolvedor:** Responsável pela arquitetura enxuta, integração via API e manutenibilidade.

---

## 2. Stack Tecnológica
Para garantir baixo custo de infraestrutura, facilidade de implantação e alta disponibilidade, a seguinte stack foi definida:
* **Frontend:** HTML5, CSS3 (com Tailwind CSS via CDN para agilidade visual), JavaScript (ES6+ nativo).
* **Hospedagem:** GitHub Pages (estático, CI/CD integrado via GitHub Actions).
* **Banco de Dados & Backend-as-a-Service (BaaS):** Supabase (PostgreSQL gerenciado, autenticação nativa, Row Level Security e APIs REST/Realtime automáticas).

---

## 3. Requisitos Funcionais

### RF01: Autenticação e Controle de Acesso por Papéis (RBAC)
* O sistema deve permitir o login de usuários utilizando Supabase Auth (E-mail/Senha).
* Devem existir três níveis de acesso fundamentais baseados na persona:
  * **Administrador / Diretor / Finanças:** Acesso total aos relatórios financeiros, auditoria de desvios e visão global de todos os departamentos.
  * **Gestor de Departamento:** Acesso para requisitar insumos, dar baixa e visualizar o estoque do seu próprio setor.
  * **Almoxarife / Operacional:** Cadastro de entradas de novos lotes e conferência física.

### RF02: Cadastro e Gestão de Insumos
* Cadastro de itens contendo: Nome, Categoria, Unidade de Medida, Quantidade Mínima de Alerta e Departamento Responsável.
* Controle de Lotes e Validade: Cada entrada de insumo deve registrar obrigatoriamente a data de fabricação, **data de validade** e número do lote.

### RF03: Movimentações de Estoque (Entrada, Saída e Baixa)
* **Entrada:** Registro de novas compras/recebimentos com vínculo de fornecedor e lote.
* **Saída / Requisição:** Baixa de itens direcionada a um departamento específico.
* **Descarte / Perda:** Registro obrigatório de justificativa para itens vencidos ou "sumidos" (ex: *vencimento na prateleira*, *quebra acidental*, *desvio/falta injustificada*).

### RF04: Alertas e Notificações de Vencimento
* O sistema deve exibir alertas visuais no dashboard para itens cuja data de validade esteja a menos de 30 dias (ou configurável por categoria).
* Doutrina financeira: Itens próximos ao vencimento devem ser destacados para remanejamento entre departamentos.

### RF05: Relatórios e Indicadores Financeiros (Dashboard do Diretor)
* Gráficos e tabelas consolidadas indicando:
  * Valor financeiro total perdido por mês (itens vencidos + sumidos).
  * Ranking dos departamentos com maior índice de perdas.
  * Consumo médio por setor.

---

## 4. Requisitos Não Funcionais

### RNF01: Desempenho e Compatibilidade
* A aplicação frontend deve ser totalmente responsiva (Mobile e Desktop) para ser acessada via tablets no almoxarifado ou computadores nos escritórios.
* Tempo de carregamento inicial inferior a 2 segundos.

### RNF02: Segurança e Integridade dos Dados
* O banco de dados no Supabase deve implementar **Row Level Security (RLS)** para garantir que um departamento visualize apenas os dados permitidos (com exceção da Diretoria/Controladoria).
* Credenciais de API do Supabase (URL e Anon Key) devem ser tratadas de forma segura no ambiente estático.

### RNF03: Deploy Contínuo
* O código fonte hospedado no repositório GitHub deve realizar deploy automático para o GitHub Pages a cada commit na branch `main`.

---

## 5. Arquitetura de Dados Preliminar (Supabase PostgreSQL)

* **Tabela `departments`**: `id`, `name`, `created_at`
* **Tabela `profiles`**: `id` (uuid, FK auth.users), `full_name`, `role` (admin, manager, operator), `department_id` (FK)
* **Tabela `items`**: `id`, `name`, `category`, `min_threshold`, `unit`, `created_at`
* **Tabela `inventory_batches`**: `id`, `item_id` (FK), `department_id` (FK), `quantity`, `batch_number`, `expiration_date`, `cost_price`, `created_at`
* **Tabela `movements`**: `id`, `batch_id` (FK), `user_id` (FK), `type` (IN, OUT, LOSS_EXPIRED, LOSS_MISSING), `quantity`, `reason`, `created_at`

---

## 6. Próximos Passos
1. Configuração do projeto no Supabase e criação das tabelas via SQL Editor.
2. Estruturação do repositório no GitHub com a interface HTML/JS básica.
3. Conexão do SDK do Supabase no Frontend para testes de autenticação e listagem de insumos.