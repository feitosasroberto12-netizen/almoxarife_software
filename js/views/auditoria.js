import { state, loadData, navigate } from '../app.js';
import { dbService } from '../supabase-service.js';

export function renderAuditoriaView() {
  const deptFilter = state.selectedDepartmentId;

  let auditList = state.audits;
  if (deptFilter !== 'all') {
    auditList = auditList.filter(a => a.department_id === deptFilter);
  }

  // Calculate audit statistics
  const totalAudits = auditList.length;
  const completedAudits = auditList.filter(a => a.status === 'CONCLUIDA').length;

  let totalDiscrepancies = 0;
  auditList.forEach(a => {
    (a.audit_items || []).forEach(ai => {
      if (ai.discrepancy_quantity && ai.discrepancy_quantity !== 0) {
        totalDiscrepancies += Math.abs(ai.discrepancy_quantity);
      }
    });
  });

  return `
    <div class="flex flex-col gap-6">
      <!-- Header Action Ribbon -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col gap-1">
          <h1 class="font-headline-lg text-2xl font-bold text-brand-navy tracking-tight">Auditoria & Controle de Inventário</h1>
          <p class="text-xs text-on-surface-variant">Conferência física de insumos, auditoria de desvios por setor e log histórico para a Controladoria.</p>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-open-modal-audit" class="flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-lg font-semibold text-xs hover:bg-brand-navy/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            <span>+ Nova Auditoria de Inventário</span>
          </button>
        </div>
      </div>

      <!-- Audit KPI Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div class="absolute top-0 left-0 right-0 h-1 bg-brand-navy"></div>
          <div>
            <span class="text-xs font-semibold text-on-surface-variant uppercase">Auditorias Realizadas</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-code-mono text-2xl font-bold text-brand-navy">${completedAudits} / ${totalAudits}</span>
              <span class="text-xs text-slate-500">concluídas</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-brand-navy">
            <span class="material-symbols-outlined text-[22px]">assignment_turned_in</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div class="absolute top-0 left-0 right-0 h-1 bg-brand-alert-red"></div>
          <div>
            <span class="text-xs font-semibold text-on-surface-variant uppercase">Divergências Físicas</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-code-mono text-2xl font-bold text-brand-alert-red">${totalDiscrepancies}</span>
              <span class="text-xs text-slate-500">itens com desvio</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-brand-alert-red">
            <span class="material-symbols-outlined text-[22px]">find_replace</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div class="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
          <div>
            <span class="text-xs font-semibold text-on-surface-variant uppercase">Nível de Governança</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-code-mono text-2xl font-bold text-emerald-700">100%</span>
              <span class="text-xs text-slate-500">conformidade RLS</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span class="material-symbols-outlined text-[22px]">security</span>
          </div>
        </div>
      </div>

      <!-- Audit Check-ins List Table -->
      <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-navy text-[20px]">history_edu</span>
            <h2 class="text-base font-semibold text-brand-navy">Histórico de Sessões de Auditoria</h2>
          </div>
          <button id="btn-export-audits" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar Relatório em CSV</span>
          </button>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <th class="py-2.5 px-3">Data • Código</th>
                <th class="py-2.5 px-3">Departamento</th>
                <th class="py-2.5 px-3">Auditor Responsável</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3">Itens Auditados & Divergências</th>
                <th class="py-2.5 px-3">Observações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${renderAuditRows(auditList)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Nova Auditoria -->
    <div id="modal-audit" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-semibold text-brand-navy">Lançar Nova Auditoria de Inventário</h3>
          <button id="btn-close-modal-audit" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="form-new-audit" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Departamento *</label>
              <select id="audit-dept-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
                ${state.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Nome do Auditor / Controlador *</label>
              <input type="text" id="audit-auditor-name" required value="Carlos Mendes (Controladoria)" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-on-surface">Observações da Sessão</label>
            <input type="text" id="audit-obs" placeholder="Ex: Inventário de rotina mensal..." class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
          </div>

          <!-- Items Check-in List -->
          <div class="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <span class="text-xs font-bold text-brand-navy uppercase tracking-wider">Conferência Física de Itens</span>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-3" id="audit-items-container">
              ${renderAuditFormItems()}
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" id="btn-cancel-audit" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navy/90 rounded-lg shadow-sm">Concluir Auditoria</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAuditRows(audits) {
  if (!audits || audits.length === 0) {
    return `<tr><td colspan="6" class="py-8 text-center text-slate-400">Nenhuma sessão de auditoria registrada.</td></tr>`;
  }

  return audits.map(a => {
    const deptName = a.departments?.name || 'Geral';
    const dateStr = new Date(a.created_at).toLocaleDateString('pt-BR');
    const itemsCount = (a.audit_items || []).length;

    let hasDiscrepancy = false;
    const itemsDetails = (a.audit_items || []).map(ai => {
      const diff = ai.discrepancy_quantity || 0;
      if (diff !== 0) hasDiscrepancy = true;
      const itemName = ai.items?.name || 'Item';
      return `
        <div class="flex items-center justify-between text-[11px] py-0.5 font-code-mono">
          <span>${itemName}:</span>
          <span>Esperado: ${ai.expected_quantity} | Contado: ${ai.counted_quantity} (${diff > 0 ? '+' : ''}${diff})</span>
        </div>
      `;
    }).join('');

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3 whitespace-nowrap">
          <div class="flex flex-col">
            <span class="font-code-mono font-bold text-on-surface">#AUD-${a.id.slice(0, 6)}</span>
            <span class="font-code-mono text-[10px] text-slate-400">${dateStr}</span>
          </div>
        </td>
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded-full bg-surface-cream text-brand-burgundy font-semibold text-[10px]">${deptName}</span>
        </td>
        <td class="py-3 px-3 font-semibold text-on-surface whitespace-nowrap">
          ${a.auditor_name || 'Auditor'}
        </td>
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">CONCLUÍDA</span>
        </td>
        <td class="py-3 px-3">
          <div class="flex flex-col gap-0.5 max-w-sm">
            <span class="text-xs font-semibold ${hasDiscrepancy ? 'text-brand-alert-red' : 'text-emerald-700'}">${itemsCount} itens auditados ${hasDiscrepancy ? '(Com divergência)' : '(100% OK)'}</span>
            <div class="bg-slate-50 p-2 rounded border border-slate-200 mt-1">
              ${itemsDetails || '<span class="text-slate-400">Sem itens gravados</span>'}
            </div>
          </div>
        </td>
        <td class="py-3 px-3 text-slate-600 text-[11px]">
          ${a.observations || 'Nenhuma observação.'}
        </td>
      </tr>
    `;
  }).join('');
}

function renderAuditFormItems() {
  if (!state.items || state.items.length === 0) {
    return `<span class="text-xs text-slate-400">Cadastre insumos primeiro para auditá-los.</span>`;
  }

  return state.items.slice(0, 5).map(item => {
    // Calculate expected total from active batches
    const itemBatches = state.batches.filter(b => b.item_id === item.id);
    const expectedQty = itemBatches.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);

    return `
      <div class="audit-item-row flex items-center justify-between gap-3 bg-white p-2.5 rounded border border-slate-200" data-item-id="${item.id}" data-expected="${expectedQty}">
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-xs font-semibold text-on-surface truncate">${item.name}</span>
          <span class="text-[10px] text-slate-400 font-code-mono">Esperado no Sistema: ${expectedQty} ${item.unit_of_measure}</span>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-[11px] font-semibold text-slate-500">Contado:</label>
          <input type="number" value="${expectedQty}" min="0" class="audit-counted-input w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-code-mono font-bold text-center outline-none focus:border-brand-blue-active">
        </div>
      </div>
    `;
  }).join('');
}

export function setupAuditoriaEvents() {
  // Modal Audit Controls
  const modalAudit = document.getElementById('modal-audit');
  const btnOpenAudit = document.getElementById('btn-open-modal-audit');
  const btnCloseAudit = document.getElementById('btn-close-modal-audit');
  const btnCancelAudit = document.getElementById('btn-cancel-audit');
  const formAudit = document.getElementById('form-new-audit');

  if (btnOpenAudit) btnOpenAudit.addEventListener('click', () => modalAudit.classList.remove('hidden'));
  if (btnCloseAudit) btnCloseAudit.addEventListener('click', () => modalAudit.classList.add('hidden'));
  if (btnCancelAudit) btnCancelAudit.addEventListener('click', () => modalAudit.classList.add('hidden'));

  if (formAudit) {
    formAudit.addEventListener('submit', async (e) => {
      e.preventDefault();

      const deptId = document.getElementById('audit-dept-id').value;
      const auditorName = document.getElementById('audit-auditor-name').value.trim();
      const obs = document.getElementById('audit-obs').value.trim();

      const auditItemsList = [];
      document.querySelectorAll('.audit-item-row').forEach(row => {
        const itemId = row.dataset.itemId;
        const expectedQty = parseInt(row.dataset.expected, 10) || 0;
        const input = row.querySelector('.audit-counted-input');
        const countedQty = parseInt(input.value, 10) || 0;

        auditItemsList.push({
          item_id: itemId,
          expected_quantity: expectedQty,
          counted_quantity: countedQty,
          notes: countedQty !== expectedQty ? 'Divergência detectada no check-in físico' : '100% Ok'
        });
      });

      const auditData = {
        department_id: deptId,
        auditor_name: auditorName,
        observations: obs,
        status: 'CONCLUIDA'
      };

      await dbService.createAudit(auditData, auditItemsList);
      modalAudit.classList.add('hidden');
      formAudit.reset();
      await loadData();
      navigate('auditoria');
    });
  }

  // Export Audits CSV
  const btnExportAudits = document.getElementById('btn-export-audits');
  if (btnExportAudits) {
    btnExportAudits.addEventListener('click', () => {
      let csv = 'Codigo,Data,Departamento,Auditor,Status,Observacoes\n';
      state.audits.forEach(a => {
        csv += `"#AUD-${a.id.slice(0,6)}","${a.created_at}","${a.departments?.name || ''}","${a.auditor_name || ''}","${a.status}","${(a.observations || '').replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Auditorias_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
