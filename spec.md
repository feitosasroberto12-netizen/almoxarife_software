# SPEC — Sistema Interno de Captação e Controle de Clientes
## Escritório de Advocacia | SPEC-Driven Development

| Campo | Valor |
|---|---|
| Projeto | LegalLead CRM (interno) |
| Versão da spec | 1.0 |
| Data | 2026-09-22 |
| Dono do produto | Diretoria do escritório |
| Responsável técnico | Gestor de TI |
| Método | SPEC-Driven Development (spec → plan → tasks → implementação) |

---

## 1. Visão e contexto

### 1.1 Problema
O escritório perde receita por falta de controle na captação de clientes:
- Leads chegam por canais diversos (WhatsApp, telefone, indicação, site) sem registro.
- Clientes consomem consultoria gratuita sem limite, sem que nunca formalizem contratação.
- Leads que demonstram interesse não recebem follow-up e não retornam.
- A diretoria não tem visibilidade de funil, conversão nem receita perdida.

### 1.2 Objetivo
Software interno que force o registro de todo lead, delimite o atendimento gratuito, automatize follow-up e gere dados gerenciais de conversão por área, origem e responsável.

### 1.3 Não-objetivos (fora do escopo da v1)
- Processos judiciais / prazos processuais (não é um sistema processual).
- Financeiro/faturamento completo (apenas registro de honorários propostos/negociados).
- App mobile nativo (v1 é web responsivo).
- Portal do cliente externo.

### 1.4 Métricas de sucesso (KPIs)
| KPI | Linha de base | Meta (90 dias) |
|---|---|---|
| % de leads com registro no sistema | ~0% | 100% |
| Taxa de conversão lead → contratado | desconhecida | definir após 30 dias de dados |
| Tempo médio de follow-up após proposta | sem controle | ≤ 3 dias úteis |
| Consultas gratuitas por lead | ilimitado | máx. 1 (30 min) |
| Motivo de perda registrado | 0% | 100% dos perdidos |

---

## 2. Política de captação (regra de negócio obrigatória)

1. **Nenhum atendimento sem registro.** Todo lead entra no sistema antes de qualquer consulta.
2. **Consulta inicial limitada:** máx. 30 min, sem análise documental extensiva.
3. **Após a consulta:** proposta de honorários com validade de 7 dias é gerada no sistema.
4. **Follow-up obrigatório:** D+3 e D+7 após envio da proposta, com registro do contato.
5. **Motivo de perda obrigatório** ao mover lead para "Perdido".
6. **Score de qualificação** define prioridade de atendimento (ver 4.2).

---

## 3. Usuários e papéis

| Papel | Descrição | Permissões |
|---|---|---|
| Admin | Gestor de TI / diretoria | Tudo + gerenciar usuários + relatórios completos |
| Gestor | Sócio/gestor de área | Ver todos os leads da sua área, relatórios, reatribuir responsáveis |
| Advogado | Responsável pelo lead | CRUD dos seus leads, consultas, propostas, follow-ups |
| Secretaria/Recepção | Cadastro inicial de lead | Criar lead, agendar consulta, sem ver dados sensíveis |

**Regra de sigilo (LGPD + ética OAB):** advogado só visualiza leads de sua titularidade; gestor/admin veem todos. Dados sensíveis (documentos, detalhes do caso) ficam em campo restrito.

---

## 4. Requisitos funcionais

### 4.1 Cadastro e triagem de leads (MVP — Fase 1)
- **RF-01** Formulário de cadastro de lead com: nome, telefone, e-mail, origem (WhatsApp/telefone/indicação/site/outro), área do direito (cível, trabalhista, penal, família, empresarial, tributário, outros), resumo do caso (texto curto), urgência (baixa/média/alta), consentimento LGPD (checkbox com data/hora).
- **RF-02** Cadastro em no máximo 2 minutos (formulário curto; detalhes entram depois).
- **RF-03** Score automático de qualificação (0–100): potencial econômico (0–40) + urgência (0–30) + aderência à expertise do escritório (0–30). Exibido como cor (verde/âmbar/vermelho).
- **RF-04** Atribuição de responsável (advogado) por área do direito, com reatribuição pelo gestor.
- **RF-05** Duplicidade: alerta se telefone ou e-mail já existir na base.

### 4.2 Gestão de consultoria e propostas (Fase 2)
- **RF-06** Registro de consulta inicial: data, duração, advogado, resumo (máx. 30 min — o sistema alerta se houver 2+ consultas no mesmo lead sem proposta).
- **RF-07** Limite de consultoria gratuita: o sistema bloqueia a marcação de nova consulta após 1 consulta, exigindo proposta formal (desbloqueio apenas por gestor).
- **RF-08** Geração de proposta de honorários: valor/fees, escopo, validade (default 7 dias), PDF/versão imprimível com marca do escritório.
- **RF-09** Registro de resposta do cliente (aceita/recusou/sem retorno).

### 4.3 Funil de conversão e follow-up (MVP — Fase 1)
- **RF-10** Kanban com etapas: **Novo → Em contato → Consulta agendada → Consulta realizada → Proposta enviada → Negociação → Contratado** (ou **Perdido**). Etapas configuráveis pelo admin.
- **RF-11** Alertas automáticos:
  - Proposta enviada há 3 dias sem retorno → notificação ao responsável.
  - Proposta vencida (7 dias) → notificação + lead movido para "Negociação" com flag de risco.
  - Lead parado há 7 dias na mesma etapa → lembrete.
- **RF-12** Registro de cada follow-up (data, canal, resumo, próximo passo).
- **RF-13** Motivo de perda obrigatório com categorias: preço, desistiu, contratou concorrente, sem retorno, inadimplente/inviável, outro (com texto).

### 4.4 Relatórios (Fase 2)
- **RF-14** Funil por período: quantidade por etapa, taxa de conversão geral e por etapa.
- **RF-15** Conversão por área do direito, origem do lead e responsável.
- **RF-16** Receita perdida estimada: leads perdidos × ticket médio por área.
- **RF-17** Tempo médio por etapa e tempo de primeiro follow-up.

### 4.5 Administração (Fase 1)
- **RF-18** Autenticação por e-mail/senha (Supabase Auth), convite de usuários, papéis.
- **RF-19** CRUD de áreas do direito, origens, etapas do funil e tickets médios (admin).
- **RF-20** Auditoria: log de criação/alteração de leads e mudanças de etapa (quem, quando, o quê).

---

## 5. Requisitos não funcionais

| Categoria | Requisito |
|---|---|
| **Privacidade/LGPD** | Consentimento registrado com data/hora; exportação e exclusão de dados do titular; retenção definida (ex.: leads perdidos → anonimização após 2 anos); política de acesso por perfil. |
| **Segurança** | TLS (fornecido pelo GitHub Pages/Supabase); RLS (Row Level Security) no Supabase para isolar dados por responsável; senhas mín. 8 caracteres; sessão com expiração. |
| **Usabilidade** | Cadastro de lead ≤ 2 min; Kanban usável em desktop e tablet; sem treinamento formal além de 1 página-guia. |
| **Performance** | Carregamento inicial < 3s em 4G; listas com paginação. |
| **Disponibilidade** | Uso em horário comercial; tolerante a indisponibilidade do Supabase (mensagem amigável, sem perda de formulário preenchido — persistência local). |
| **Custo** | R$ 0 em infra (ver seção 8). |
| **Compatibilidade** | Navegadores: Chrome/Edge/Firefox/Safari nas 2 últimas versões. |

---

## 6. Arquitetura e stack

### 6.1 Stack definida
| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES Modules, sem framework — SPA leve) |
| Backend/BaaS | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| Hospedagem | GitHub Pages (estático) |
| Repositório | GitHub (GitHub Actions opcional para deploy) |
| Relatórios | Views SQL + gráficos em JS (Chart.js leve, via CDN) |

### 6.2 Justificativa da stack
- Sem backend próprio: Supabase entrega auth, banco, RLS e cron (pg_cron/Edge Functions) com custo zero no tier gratuito para o volume de um escritório.
- GitHub Pages: hospedagem estática gratuita, deploy por push na branch `main`.
- HTML/CSS/JS puro: time de TI pequeno, manutenção simples, sem build step.

### 6.3 Estrutura do repositório
```
/
├── index.html            # app SPA (ponto único de entrada)
├── assets/
│   ├── css/              # styles.css, tokens.css (design system mínimo)
│   └── js/
│       ├── app.js        # router/orquestrador
│       ├── config.js     # variáveis de ambiente (URL do Supabase)
│       ├── lib/
│       │   └── supabase.js  # cliente e helpers
│       ├── modules/
│       │   ├── auth.js       # login/logout/sessão
│       │   ├── leads.js      # cadastro, lista, kanban
│       │   ├── consultas.js  # consultas e limite gratuito
│       │   ├── propostas.js  # propostas e follow-ups
│       │   ├── relatorios.js # dashboards
│       │   └── admin.js      # usuários, catálogos, auditoria
│       └── components/   # modal, toast, kanban-card (JS puro)
├── docs/
│   └── spec.md           # este documento
└── .github/workflows/    # (opcional) deploy CI
```

### 6.4 Diagrama de fluxo (texto)
```
Lead entra (qualquer canal)
   → Secretaria/Advogado cadastra no sistema (≤2 min, consentimento LGPD)
   → Score automático + atribuição de responsável
   → Kanban: Novo → Em contato → Consulta agendada → Consulta realizada
        ↳ se >1 consulta sem proposta → bloqueio + alerta
   → Proposta gerada (validade 7 dias)
   → Follow-up D+3 / D+7 (alertas automáticos)
   → Contratado  |  Perdido (motivo obrigatório)
   → Relatórios: conversão, receita perdida, desempenho
```

---

## 7. Modelo de dados (Supabase/PostgreSQL)

### 7.1 Tabelas principais

```sql
-- Catálogos (admin)
areas_direito   (id, nome, ticket_medio_numérico, ativo)
origens         (id, nome, ativo)
etapas_funil    (id, nome, ordem, final (bool), ativo)  -- final: Contratado/Perdido
motivos_perda   (id, nome, ativo)
perfis          (user_id FK auth.users, papel: admin|gestor|advogado|secretaria, area_id FK?)

-- Núcleo
leads (
  id uuid pk default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text,
  origem_id int FK,
  area_id int FK not null,
  resumo_caso text,
  urgencia smallint check (urgencia between 1 and 3),   -- 1 baixa, 3 alta
  potencial smallint check (potencial between 1 and 5),
  score int generated/ calculado (potencial*8 + urgencia*10 + aderencia*6),
  etapa_id int FK not null default (primeira etapa),
  responsavel_id uuid FK auth.users,
  consentimento_lgpd bool not null default false,
  consentimento_em timestamptz,
  criado_por uuid FK auth.users,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unico: lower(telefone), lower(email)
)

consultas (
  id uuid pk, lead_id FK not null, data timestamptz not null,
  duracao_min int, advogado_id FK, resumo text,
  cobrada bool default false  -- consulta paga/isfree flag
)

propostas (
  id uuid pk, lead_id FK not null, valor numeric(12,2), escopo text,
  enviada_em timestamptz, validade_dias int default 7,
  status: enviada|aceita|recusada|vencida, criado_em timestamptz
)

follow_ups (
  id uuid pk, lead_id FK not null, data timestamptz default now(),
  canal: whatsapp|telefone|email|presencial, resumo text,
  proximo_passo text, registrado_por uuid FK
)

perdas (
  id uuid pk, lead_id FK unique, motivo_id FK not null, detalhe text, registrado_em timestamptz
)

contratacoes (
  id uuid pk, lead_id FK unique, valor_honorarios numeric(12,2),
  data_contrato date, registrado_por uuid FK
)

auditoria (
  id bigint pk, tabela text, registro_id uuid, acao text,
  alterado_por uuid FK, dados_antigos jsonb, dados_novos jsonb, em timestamptz
)
```

### 7.2 Views de relatório
- `v_funil` — contagem por etapa e por período.
- `v_conversao` — taxa por área, origem, responsável.
- `v_receita_perdida` — soma de ticket_medio × perdas por área/período.
- `v_leads_parados` — leads sem movimentação há 7 dias (alimenta alertas).

### 7.3 Row Level Security (regras essenciais)
```sql
-- advogado: vê apenas leads próprios
leads: select using (responsavel_id = auth.uid() or is_gestor_or_admin());
-- secretaria: cria e lê dados básicos, não edita campo sensível
-- TODAS as tabelas: insert/update apenas com auth.uid() válido
-- auditoria: insert via trigger, ninguém atualiza/deleta
```

### 7.4 Alertas (pg_cron ou Edge Function agendada)
- Diariamente 08h: job `alertar_propostas` → propostas com 3+ dias sem follow-up → notificação (tabela `notificacoes` + badge no app; e-mail opcional via Resend/Supabase).
- Diariamente: `alertar_vencidas` → validade expirada → status=vencida + flag no lead.
- Diariamente: `alertar_parados` → lead 7 dias na mesma etapa → lembrete.

---

## 8. Custos estimados

| Item | Custo |
|---|---|
| GitHub Pages | R$ 0 |
| Supabase (tier gratuito: 500 MB DB, 2 GB storage, auth ilimitado p/ projeto desse porte) | R$ 0 |
| Domínio (opcional, ex.: crm.escritorio.com.br) | ~R$ 40/ano |
| Envio de e-mail (Supabase Auth + opcional Resend free tier) | R$ 0 |
| **Total operacional v1** | **R$ 0/mês** (exceto domínio) |

Se o volume estourar o tier gratuito: Supabase Pro US$ 25/mês.

---

## 9. Roadmap e critérios de aceite

### Fase 1 — MVP (sem 4–6 semanas)
Escopo: RF-01 a RF-05, RF-10 a RF-13 (kanban + alertas), RF-18, RF-20.
**Critérios de aceite:**
- [ ] Secretaria cadastra um lead em < 2 min com consentimento LGPD registrado.
- [ ] Advogado vê apenas seus leads; gestor vê todos da sua área.
- [ ] Kanban move etapas com motivo de perda obrigatório.
- [ ] Alerta de proposta D+3 e D+7 aparece no app sem ação manual.
- [ ] Deploy funcionando em GitHub Pages com HTTPS e login real.

### Fase 2 — Propostas e relatórios (sem 7–10)
Escopo: RF-06 a RF-09, RF-14 a RF-17.
**Critérios de aceite:**
- [ ] Bloqueio de 2ª consulta gratuita com liberação por gestor.
- [ ] Proposta gera versão imprimível com validade de 7 dias.
- [ ] Dashboard exibe conversão por área/origem/responsável e receita perdida estimada.

### Fase 3 — Integrações (futuro)
WhatsApp (link direto wa.me com template), e-mail transacional, importação CSV de leads antigos, automação de cobrança.

---

## 10. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Advogados não usam o sistema | Alta | Cadastro ≤ 2 min; política da diretoria: "sem registro, sem atendimento"; secretaria como porta de entrada |
| Vazamento de dados de clientes | Média | RLS rigoroso, perfis de acesso, auditoria, treinamento de sigilo |
| Supabase fora do ar | Baixa | Mensagem amigável + rascunho local (localStorage) |
| Stack sem framework virar bagunça | Média | Estrutura de módulos por domínio, code review no GitHub, este documento como contrato |
| Escopo crescer (virar sistema processual) | Média | Não-objetivos explícitos (seção 1.3); mudanças de spec só via diretoria |

---

## 11. Definition of Done (geral)
1. Código no GitHub com README de setup (Supabase URL/anon key via variáveis).
2. Migrações SQL versionadas (supabase/migrations/).
3. RLS ativo e testado com 2 contas de perfis diferentes.
4. Deploy em produção no GitHub Pages acessível pela equipe.
5. 1 página-guia de uso (dentro do app) para secretaria e advogados.
6. Aprovação da diretoria nos critérios de aceite da fase correspondente.
