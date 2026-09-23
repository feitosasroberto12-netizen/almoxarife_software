# Manual Instrutivo de Agentes (Agents.md) - Diretrizes e Boas Práticas

Este documento estabelece o manual instrutivo e as políticas de governança para o comportamento, tomada de decisão e atuação de agentes de inteligência artificial durante o desenvolvimento e manutenção do **Sistema de Controle de Insumos Corporativos**.

---

## **1. Princípio Norteador: Alinhamento Estratégico com Stakeholders**
Os agentes devem atuar mantendo sempre viva a perspectiva dos stakeholders definidos no projeto (Diretor, Controladoria, TI e Operações). As decisões de arquitetura, código e validação não são puramente técnicas; elas precisam resolver dores reais de negócio:
*   Prevenção de perdas financeiras.
*   Combate ao extravio/sumiço de itens.
*   Mitigação de prejuízos por produtos vencidos.

---

## **2. Boas Práticas Obrigatórias**

### **2.1. Imutabilidade de Transações (Banco de Dados / Backend)**
*   **Diretriz:** Registros de movimentações de estoque, entradas, saídas, baixas por vencimento e perdas/extravios na tabela `inventory_transactions` **jamais devem ser deletados ou atualizados diretamente** após a sua consolidação.
*   **Justificativa:** Garantir a integridade absoluta para auditorias da Controladoria. Qualquer correção de erro de lançamento deve ser tratada exclusivamente por meio de uma nova transação de estorno ou ajuste compensatório documentado.

### **2.2. Responsividade Obrigatória (Frontend)**
*   **Diretriz:** Todo e qualquer componente de interface (telas, formulários, tabelas e gráficos do Dashboard) desenvolvido em HTML, CSS e JavaScript deve ser totalmente responsivo.
*   **Justificativa:** O sistema será utilizado tanto por diretores em computadores desktop quanto por operadores de almoxarifado em tablets ou coletores móveis no chão de fábrica e departamentos. Nenhuma tela pode apresentar quebra de layout ou exigir rolagem horizontal excessiva em dispositivos móveis.

### **2.3. Foco nas Dores do Diretor (Validação de Negócio)**
*   **Diretriz:** Em qualquer etapa de desenvolvimento ou testes, o agente deve priorizar e validar as funcionalidades que atacam diretamente as chagas operacionais da empresa:
    *   **Sumiço:** Rastreabilidade estrita de quem registrou a baixa por extravio e a qual departamento o item pertencia.
    *   **Vencimento:** Alertas visuais claros no topo do dashboard para lotes próximos à data de expiração, permitindo ação preventiva antes do descarte financeiro.

### **2.4. Monitoramento de Deploy (Operações & CI/CD)**
*   **Diretriz:** Ao preparar ou verificar entregas para o GitHub Pages, o agente deve assegurar que a aplicação estática não dependa de servidores backend complexos (respeitando a arquitetura Supabase Client-side) e que todas as dependências (como SDKs via CDN) estejam íntegras e sem links quebrados.
*   **Justificativa:** Garantir disponibilidade contínua e evitar indisponibilidade em produção decorrente de falhas de carregamento de scripts estáticos.

---

## **3. Diretrizes de Comportamento para a IA**
1. **Contexto Spec-Driven:** Siga rigorosamente o fluxo de especificações (`spec.md` e `tasks.md`). Não pule etapas sem cumprir os critérios de aceite.
2. **Defensividade no Código:** Trate erros de requisição de forma elegante para o usuário final, evitando telas travadas ou falhas silenciosas.
3. **Segurança de Credenciais:** Nunca exponha chaves sensíveis de banco de dados (`service_role` do Supabase) no código do frontend que será publicado no GitHub Pages. Utilize apenas chaves públicas seguras (`anon key`) combinadas com políticas rigorosas de RLS (*Row Level Security*).
