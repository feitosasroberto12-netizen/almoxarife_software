# tasks.md — LegalLead CRM v1.0
## Decomposição executável da spec (spec.md + schema.sql)
### Convenções: IDs por fase | cada tarefa tem critério de aceite verificável | dependências explícitas

---

## FASE 0 — Fundação (infraestrutura e acesso)

- [ ] **F0-T01 — Repositório GitHub**
  Criar repo privado `legal-lead-crm`, branch `main`, estrutura de pastas da spec (seção 6.3), README com visão do projeto.
  *Aceite:* clone do repo contém `index.html`, `assets/`, `docs/`; README descreve o problema e a stack.

- [ ] **F0-T02 — Projeto Supabase**
  Criar projeto no Supabase (região mais próxima do Brasil), habilitar extensões `pgcrypto` e `pg_cron`.
  *Aceite:* projeto acessível no painel; extensões listadas em Database → Extensions.

- [ ] **F0-T03 — Aplicar schema.sql**
  Executar o arquivo `schema.sql` no SQL Editor (ou via `supabase db push` com a pasta `supabase/migrations/`).
  *Aceite:* todas as tabelas, views, triggers, políticas RLS e seeds presentes (verificar com `\dt` / painel Table Editor); job `job-alertas-diario` listado em `select * from cron.job;`.

- [ ] **F0-T04 — Deploy inicial no GitHub Pages**
  Workflow de deploy (GitHub Actions ou branch `gh-pages`) servindo `index.html` estático em HTTPS.
  *Aceite:* URL pública acessível (ex.: `https://<org>.github.io/legal-lead-crm/`).

- [ ] **F0-T05 — Configuração do cliente Supabase no frontend**
  `assets/js/lib/supabase.js` lendo `SUPABASE_URL` e `SUPABASE_ANON_KEY` de `config.js` (não versionar chaves reais; usar `config.example.js` + instrução no README).
  *Aceite:* app carrega sem erro de console; chamada de teste `supabase.from('areas_direito').select()` retorna os seeds.

- [ ] **F0-T06 — Usuário admin inicial**
  Criar primeiro usuário via Supabase Auth e promover: `update perfis set papel='admin'`.
  *Aceite:* login retorna sessão; `my_role()` = `admin` para esse usuário.

---

## FASE 1 — MVP (spec: RF-01 a RF-05, RF-10 a RF-13, RF-18, RF-20)

### 1.1 Autenticação e perfis

- [ ] **F1-T01 — Tela de login** *(depende: F0-T05, F0-T06)*
  Form e-mail/senha via Supabase Auth; redireciona para o app; logout; expiração de sessão.
  *Aceite:* usuário válido entra; inválido recebe mensagem clara; refresh de página mantém sessão.

- [ ] **F1-T02 — Controle de visão por papel**
  Router bloqueia rotas por papel (`admin`, `gestor`, `advogado`, `secretaria`); menu lateral exibe apenas itens permitidos.
  *Aceite:* advogado não acessa rota `/admin` (redirecionado); gestor acessa; secretaria vê apenas cadastro e kanban.

- [ ] **F1-T03 — Gestão de usuários (admin)**
  Tela admin: convidar usuário (e-mail + papel), listar usuários, alterar papel, reatribuir área.
  *Aceite:* novo usuário convidado faz login e já nasce com o papel correto (trigger `handle_new_user`).

### 1.2 Cadastro e triagem de leads

- [ ] **F1-T04 — Formulário de cadastro de lead** *(depende: F0-T03, F1-T01)*
  Campos RF-01: nome, telefone (máscara), e-mail, origem (select de `origens`), área (select de `areas_direito`), resumo, urgência, potencial, aderência, checkbox de consentimento LGPD obrigatório para salvar.
  *Aceite:* cadastro completo em ≤ 2 min (testar com cronômetro com secretaria); `consentimento_em` gravado; score exibido na cor (≥70 verde, 40–69 âmbar, <40 vermelho).

- [ ] **F1-T05 — Alerta de duplicata (RF-05)**
  Capturar erro de unique violation (telefone/e-mail) e exibir "possível duplicata" com link para o lead existente.
  *Aceite:* cadastrar mesmo telefone em formato diferente (ex.: `(11) 9...` vs `119...`) é bloqueado com mensagem amigável.

- [ ] **F1-T06 — Atribuição automática de responsável (RF-04)**
  Ao salvar, `responsavel_id` = advogado da área (perfil com `area_id` correspondente); sem advogado na área → fila do gestor. Gestor pode reatribuir.
  *Aceite:* lead novo aparece imediatamente no kanban do responsável correto.

### 1.3 Kanban e movimentação

- [ ] **F1-T07 — Tela Kanban (RF-10)**
  Colunas dinâmicas de `etapas_funil` (ordem), cards com nome, score (cor), área, responsável, dias na etapa. Drag-and-drop ou botões "mover". Responsivo (tablet).
  *Aceite:* mover card atualiza `etapa_id` no banco e reflete para outros usuários (realtime ou refresh).

- [ ] **F1-T08 — Modal de motivo de perda (RF-13)**
  Ao mover para etapa tipo `perdido`, abrir modal exigindo motivo (select de `motivos_perda`) + detalhe opcional; inserir em `perdas` antes de atualizar o lead (ordem importa — trigger valida).
  *Aceite:* sem motivo, a movimentação falha com mensagem da regra de negócio.

- [ ] **F1-T09 — Registro de contratação**
  Ao mover para etapa tipo `contratado`, modal com valor de honorários + data; insere em `contratacoes` antes de atualizar o lead.
  *Aceite:* bloqueado sem registro; contratado aparece com valor no card.

### 1.4 Follow-up e alertas

- [ ] **F1-T10 — Registro de follow-up (RF-12)**
  Na ficha do lead: botão "Registrar contato" (canal, resumo, próximo passo). Timeline do lead com consultas, propostas e follow-ups.
  *Aceite:* registro salvo com `registrado_por` correto e aparece na timeline ordenada por data.

- [ ] **F1-T11 — Painel de notificações (RF-11)**
  Badge no topo com notificações não lidas de `notificacoes` do usuário; marcar como lida; link direto ao lead.
  *Aceite:* executar `select public.job_alertas();` manualmente gera notificações de teste visíveis no painel.

- [ ] **F1-T12 — Agendamento do job em produção**
  Confirmar `cron.schedule('job-alertas-diario', '0 8 * * *', ...)` ativo (schema.sql já cria; validar execução real no dia seguinte ou forçar run).
  *Aceite:* `select * from cron.job_run_details order by start_time desc limit 5;` mostra execução bem-sucedida.

### 1.5 Auditoria e administração de catálogos

- [ ] **F1-T13 — Auditoria operacional (RF-20)**
  Tela admin/gestor: busca de auditoria por lead, usuário, tabela e período (leitura da view/tabela `auditoria` com diff resumido).
  *Aceite:* editar um lead como advogado gera registro em `auditoria` com `alterado_por` e JSON antes/depois.

- [ ] **F1-T14 — CRUD de catálogos (RF-19)**
  Telas admin para áreas (com ticket médio), origens, motivos de perda e etapas do funil (nome, ordem, tipo).
  *Aceite:* nova etapa criada aparece como coluna no Kanban após refresh; desativar motivo remove do select sem apagar histórico.

### 1.6 Validação do MVP

- [ ] **F1-T15 — Testes de RLS com 2 contas**
  Cenários: advogado A não lê lead de advogado B (select vazio); secretaria cria lead mas não edita `detalhes_sensiveis` de terceiros; gestor lê tudo da sua visão; usuário anônimo não lê nada.
  *Aceite:* todos os cenários passam no Table Editor/SQL Editor com as duas sessões.

- [ ] **F1-T16 — Aceite da Fase 1 pela diretoria**
  Demo guiada: cadastro de lead, kanban, perda com motivo, notificações, auditoria. Checklist da spec seção 9 (Fase 1) assinado.
  *Aceite:* todos os checkboxes de aceite da Fase 1 marcados.

---

## FASE 2 — Consultas, propostas e relatórios (spec: RF-06 a RF-09, RF-14 a RF-17)

- [ ] **F2-T01 — Registro de consulta (RF-06)** *(depende: F1 aceito)*
  Ficha do lead: data, duração (default 30), resumo, flag cobrada. Validação duracao ≤ 240 min.
  *Aceite:* consulta salva aparece na timeline; `duracao_min` exibida no card.

- [ ] **F2-T02 — Bloqueio de consultoria gratuita (RF-07)**
  Ao tentar 2ª consulta com `cobrada=false`, exibir erro amigável do trigger e oferecer: gerar proposta ou "solicitar liberação ao gestor" (gestor/admin insere com bypass).
  *Aceite:* como advogado, 2ª consulta grátis é bloqueada; como gestor, passa.

- [ ] **F2-T03 — Geração de proposta (RF-08)**
  Ficha do lead: valor, escopo, validade (default 7 dias). Versão imprimível/PDF com identidade do escritório (CSS print) e botão "marcar como enviada".
  *Aceite:* PDF contém dados do lead, escopo, valor, data e validade; `enviada_em` gravado.

- [ ] **F2-T04 — Resposta do cliente (RF-09)**
  Botões na proposta: aceita / recusada / sem retorno; recusada abre motivo (reutiliza modal de perda se aplicável).
  *Aceite:* status da proposta atualizado; proposta aceita sugere mover lead para Contratado.

- [ ] **F2-T05 — Dashboard do funil (RF-14)**
  Gráfico de funil (`v_funil`): quantidade por etapa + leads no mês + honorários contratados. Filtro por período.
  *Aceite:* números batem com SQL direto na view.

- [ ] **F2-T06 — Conversão por área, origem e responsável (RF-15)**
  Tabelas/gráficos de barras a partir de `v_conversao`; filtros por período.
  *Aceite:* taxa de conversão exibida com 1 casa decimal; filtro altera dados.

- [ ] **F2-T07 — Receita perdida estimada (RF-16)**
  Gráfico mensal a partir de `v_receita_perdida` (perdas × ticket médio da área).
  *Aceite:* total geral visível na tela; detalhamento por área.

- [ ] **F2-T08 — Relatório de leads parados e tempo de follow-up (RF-17)**
  Tela/lista a partir de `v_leads_parados` com dias parado; métrica de tempo médio até primeiro follow-up após proposta.
  *Aceite:* lista corresponde à view; métrica calculada corretamente sobre `follow_ups` × `propostas`.

- [ ] **F2-T09 — Aceite da Fase 2 pela diretoria**
  Checklist da spec seção 9 (Fase 2) assinado com dados reais de 2 semanas de uso.

---

## FASE 3 — Integrações e endurecimento

- [ ] **F3-T01 — LGPD: exportação e exclusão do titular**
  Tela admin: buscar lead por telefone/e-mail → exportar JSON dos dados → anonimizar/excluir (com log em `auditoria`).
  *Aceite:* fluxo completo executado em lead de teste; dados pessoais removidos, histórico de agregados preservado.

- [ ] **F3-T02 — Link direto de WhatsApp**
  Botão "chamar no WhatsApp" (`wa.me/<telefone normalizado>`) no card do lead e na ficha.
  *Aceite:* telefone com máscara/DDI gera link válido.

- [ ] **F3-T03 — Importação CSV de leads antigos**
  Upload CSV (nome, telefone, origem, área) com validação de duplicatas por lote e relatório de erros.
  *Aceite:* CSV de 100 linhas importa com consentimento marcado em lote (conferir LGPD do uso) e duplicatas reportadas.

- [ ] **F3-T04 — E-mail transacional**
  Envio de e-mail ao responsável quando proposta vence (Edge Function + serviço de e-mail free tier).
  *Aceite:* vencer proposta de teste dispara e-mail recebido.

- [ ] **F3-T05 — Backup e monitoramento**
  PITR/backups agendados do Supabase (plano gratuito: backup diário via dump agendado para storage próprio); alerta de falha de login repetida.
  *Aceite:* restore testado em projeto de homologação.

- [ ] **F3-T06 — Guia de uso em 1 página (onboarding)**
  Página-guia dentro do app para secretaria e advogados (fluxo: cadastrar → consultar → propor → acompanhar).
  *Aceite:* nova pessoa consegue cadastrar um lead sem treinamento presencial.

---

## Regras de execução

1. **Ordem obrigatória:** F0 → F1 → F2 → F3. Nenhuma tarefa inicia sem suas dependências concluídas.
2. **Branch por tarefa:** `feat/F1-T07-kanban` → PR → merge em `main` → deploy automático.
3. **Definition of Done por tarefa:** código + critério de aceite verificado + migração (se houver) versionada em `supabase/migrations/`.
4. **Mudanças na spec:** só com aprovação da diretoria e atualização de `spec.md` antes do código.
5. **Risco principal (adoção):** tratar F1-T16 como gate — se a diretoria não aceitar o MVP, não avançar para Fase 2.

## Estimativa global

| Fase | Esforço estimado (1 dev) |
|---|---|
| Fase 0 | 2–3 dias |
| Fase 1 | 4–6 semanas |
| Fase 2 | 3–4 semanas |
| Fase 3 | 2–3 semanas (contínuo) |
