import { state } from '../app.js';
import { dbService } from '../supabase-service.js';

export function renderDashboardView() {
  const deptFilter = state.selectedDepartmentId;

  // Filter transactions by selected department if needed
  let filteredTx = state.transactions;
  if (deptFilter !== 'all') {
    filteredTx = filteredTx.filter(t => t.department_id === deptFilter);
  }

  // Calculate Metrics
  const totalLossExp = filteredTx
    .filter(t => t.transaction_type === 'BAIXA_PERDA_VENCIMENTO')
    .reduce((acc, t) => acc + (Number(t.total_cost) || (Number(t.quantity) * Number(t.unit_cost)) || 0), 0);

  const totalLossMissing = filteredTx
    .filter(t => t.transaction_type === 'BAIXA_EXTRAVIO_SUMIÇO')
    .reduce((acc, t) => acc + (Number(t.total_cost) || (Number(t.quantity) * Number(t.unit_cost)) || 0), 0);

  const totalLoss = totalLossExp + totalLossMissing;

  // Filter batches for critical expiry (<30 days)
  const today = new Date();
  let filteredBatches = state.batches;
  if (deptFilter !== 'all') {
    filteredBatches = filteredBatches.filter(b => b.department_id === deptFilter);
  }

  const criticalBatches = filteredBatches.filter(b => {
    if (!b.expiry_date || b.quantity <= 0) return false;
    const exp = new Date(b.expiry_date);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // 30 days or less
  }).map(b => {
    const exp = new Date(b.expiry_date);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return { ...b, daysToExpiry: diffDays };
  });

  // Department Loss Ranking
  const deptLossMap = {};
  state.departments.forEach(d => { deptLossMap[d.id] = { name: d.name, amount: 0 }; });

  state.transactions
    .filter(t => t.transaction_type === 'BAIXA_PERDA_VENCIMENTO' || t.transaction_type === 'BAIXA_EXTRAVIO_SUMIÇO')
    .forEach(t => {
      const cost = Number(t.total_cost) || (Number(t.quantity) * Number(t.unit_cost)) || 0;
      if (deptLossMap[t.department_id]) {
        deptLossMap[t.department_id].amount += cost;
      }
    });

  const deptRanking = Object.values(deptLossMap)
    .sort((a, b) => b.amount - a.amount);

  const maxDeptLoss = Math.max(...deptRanking.map(d => d.amount), 1);

  return `
    <div class="flex flex-col gap-6">
      <!-- Top Executive Header & Action Ribbon -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col gap-1">
          <h1 class="font-headline-lg text-2xl font-bold text-brand-navy tracking-tight">Painel de Perdas & Governança Executiva</h1>
          <p class="text-xs text-on-surface-variant">Visão em tempo real de desvios financeiros, itens expirados e ranking de departamentos.</p>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-export-dash" class="flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-lg font-semibold text-xs hover:bg-brand-navy/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar Relatório Consolidado</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Scorecards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <!-- Metric 1: Total Loss -->
        <div class="flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-brand-alert-red"></div>
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Perdido no Mês</span>
              <span class="font-code-mono text-[10px] font-bold text-brand-burgundy uppercase mt-0.5">PERDAS + EXTRAVIOS</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-surface-cream flex items-center justify-center text-brand-alert-red">
              <span class="material-symbols-outlined text-[22px]">trending_down</span>
            </div>
          </div>
          <div class="my-4">
            <span class="font-code-mono text-3xl font-bold text-brand-burgundy">R$ ${totalLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span class="text-brand-alert-red font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">warning</span> RLS Rastreado
            </span>
            <span class="text-slate-400">Controladoria Auditada</span>
          </div>
        </div>

        <!-- Metric 2: Expiration Loss -->
        <div class="flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-brand-navy"></div>
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Perda por Vencimento</span>
              <span class="font-code-mono text-[10px] font-bold text-brand-navy uppercase mt-0.5">DESCARTE DE PRATELEIRA</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-brand-navy">
              <span class="material-symbols-outlined text-[22px]">event_busy</span>
            </div>
          </div>
          <div class="my-4">
            <span class="font-code-mono text-3xl font-bold text-brand-navy">R$ ${totalLossExp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span class="text-brand-navy font-semibold">Prevenção ativa</span>
            <span class="text-slate-400">Lotes < 30d</span>
          </div>
        </div>

        <!-- Metric 3: Missing/Loss -->
        <div class="flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sumiço / Extravio</span>
              <span class="font-code-mono text-[10px] font-bold text-amber-700 uppercase mt-0.5">AVARIAS E DESVIOS</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <span class="material-symbols-outlined text-[22px]">remove_moderator</span>
            </div>
          </div>
          <div class="my-4">
            <span class="font-code-mono text-3xl font-bold text-amber-800">R$ ${totalLossMissing.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span class="text-amber-700 font-semibold">Justificativa obrigatória</span>
            <span class="text-slate-400">RF03 Regra</span>
          </div>
        </div>

        <!-- Metric 4: Batches at Risk -->
        <div class="flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue-active"></div>
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Insumos em Risco</span>
              <span class="font-code-mono text-[10px] font-bold text-brand-blue-active uppercase mt-0.5">VALIDADE &lt; 30 DIAS</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-brand-blue-active">
              <span class="material-symbols-outlined text-[22px]">alarm</span>
            </div>
          </div>
          <div class="my-4">
            <span class="font-code-mono text-3xl font-bold text-brand-blue-active">${criticalBatches.length} <span class="text-sm font-sans font-normal text-slate-500">lotes críticos</span></span>
          </div>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span class="text-brand-blue-active font-semibold">Remanejamento</span>
            <span class="text-slate-400">Ação preventiva</span>
          </div>
        </div>
      </div>

      <!-- Main Section Grid: Department Ranking & Critical Batches Table -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Department Loss Ranking Column (5 Cols) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-brand-navy text-[20px]">leaderboard</span>
              <h2 class="text-base font-semibold text-brand-navy">Ranking de Perdas por Departamento</h2>
            </div>
            <span class="text-[11px] font-semibold text-slate-400 uppercase">Impacto R$</span>
          </div>

          <div class="flex flex-col gap-4">
            ${deptRanking.map((d, idx) => {
              const pct = Math.round((d.amount / maxDeptLoss) * 100);
              return `
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full ${idx === 0 ? 'bg-brand-alert-red text-white' : 'bg-slate-100 text-slate-600'} text-[11px] font-bold flex items-center justify-center font-code-mono">${idx + 1}</span>
                      ${d.name}
                    </span>
                    <span class="font-code-mono font-bold text-brand-burgundy">R$ ${d.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div class="h-full bg-brand-navy rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Critical Batches Expiry Table (7 Cols) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-brand-alert-red text-[20px]">notification_important</span>
              <h2 class="text-base font-semibold text-brand-navy">Insumos Próximos ao Vencimento (&lt; 30 Dias)</h2>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">${criticalBatches.length} Lotes em Alerta</span>
          </div>

          <div class="overflow-x-auto w-full">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/80">
                  <th class="py-2.5 px-3">Lote • Insumo</th>
                  <th class="py-2.5 px-3">Depto</th>
                  <th class="py-2.5 px-3 text-right">Qtd</th>
                  <th class="py-2.5 px-3">Validade</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${criticalBatches.length === 0 ? `
                  <tr>
                    <td colspan="5" class="py-8 text-center text-slate-400">Nenhum lote crítico próximo do vencimento.</td>
                  </tr>
                ` : criticalBatches.map(b => {
                  const itemName = b.items?.name || 'Insumo Sem Nome';
                  const deptName = b.departments?.name || 'Almoxarifado';
                  const isExpired = b.daysToExpiry <= 0;
                  return `
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3 px-3">
                        <div class="flex flex-col">
                          <span class="font-semibold text-on-surface">${itemName}</span>
                          <span class="font-code-mono text-[11px] text-slate-500">Nº Lote: ${b.batch_number}</span>
                        </div>
                      </td>
                      <td class="py-3 px-3 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded-full bg-surface-cream text-brand-burgundy font-semibold text-[11px]">${deptName}</span>
                      </td>
                      <td class="py-3 px-3 text-right font-code-mono font-bold text-on-surface whitespace-nowrap">
                        ${b.quantity} ${b.items?.unit_of_measure || 'un'}
                      </td>
                      <td class="py-3 px-3 font-code-mono whitespace-nowrap">
                        ${new Date(b.expiry_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td class="py-3 px-3 text-center whitespace-nowrap">
                        ${isExpired ? `
                          <span class="px-2.5 py-1 rounded-full bg-red-100 text-brand-alert-red font-bold text-[10px] inline-flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-alert-red"></span> VENCIDO
                          </span>
                        ` : `
                          <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span> ${b.daysToExpiry} DIAS RESTANTES
                          </span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function setupDashboardEvents() {
  const btnExport = document.getElementById('btn-export-dash');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      // Export Dashboard summary as CSV
      let csv = 'Departamento,Perdas por Vencimento,Sumiço e Extravio,Total Perdido\n';
      state.departments.forEach(d => {
        const txs = state.transactions.filter(t => t.department_id === d.id);
        const exp = txs.filter(t => t.transaction_type === 'BAIXA_PERDA_VENCIMENTO').reduce((acc, t) => acc + (Number(t.total_cost) || 0), 0);
        const missing = txs.filter(t => t.transaction_type === 'BAIXA_EXTRAVIO_SUMIÇO').reduce((acc, t) => acc + (Number(t.total_cost) || 0), 0);
        csv += `"${d.name}",${exp.toFixed(2)},${missing.toFixed(2)},${(exp + missing).toFixed(2)}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Perdas_Governança_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
