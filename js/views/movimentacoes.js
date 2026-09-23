import { state, loadData, navigate } from '../app.js';
import { dbService } from '../supabase-service.js';

export function renderMovimentacoesView() {
  const deptFilter = state.selectedDepartmentId;

  let txList = state.transactions;
  if (deptFilter !== 'all') {
    txList = txList.filter(t => t.department_id === deptFilter);
  }

  // Calculate daily flow summary metrics
  const entriesCount = txList.filter(t => t.transaction_type === 'ENTRADA').reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);
  const reqsCount = txList.filter(t => t.transaction_type === 'SAIDA_CONSUMO').reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);
  const lossesCount = txList.filter(t => t.transaction_type === 'BAIXA_PERDA_VENCIMENTO' || t.transaction_type === 'BAIXA_EXTRAVIO_SUMIÇO').length;

  return `
    <div class="flex flex-col gap-6">
      <!-- Top Action Banner -->
      <div class="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col gap-1">
          <h1 class="font-headline-lg text-2xl font-bold text-brand-navy tracking-tight">Movimentações & Requisições de Estoque</h1>
          <p class="text-xs text-on-surface-variant">Lançamento de entradas, baixas por departamento e registro obrigatório de perdas com justificativa.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button id="btn-quick-entry" class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-brand-navy text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-navy/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">add_box</span>
            <span>+ Nova Entrada</span>
          </button>
          <button id="btn-quick-req" class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-brand-blue-active text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-blue-active/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">call_made</span>
            <span>↗ Nova Saída / Requisição</span>
          </button>
          <button id="btn-quick-loss" class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-brand-alert-red text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-alert-red/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">warning</span>
            <span>Registrar Descarte / Perda</span>
          </button>
        </div>
      </div>

      <!-- Flow Scorecards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Card: Entradas -->
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div class="absolute top-0 left-0 right-0 h-1 bg-brand-navy"></div>
          <div>
            <span class="text-xs font-semibold text-on-surface-variant uppercase">Entradas Registradas</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-code-mono text-2xl font-bold text-brand-navy">${entriesCount}</span>
              <span class="text-xs text-slate-500">unidades recebidas</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-brand-navy">
            <span class="material-symbols-outlined text-[22px]">archive</span>
          </div>
        </div>

        <!-- Card: Requisições -->
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div class="absolute top-0 left-0 right-0 h-1 bg-brand-blue-active"></div>
          <div>
            <span class="text-xs font-semibold text-on-surface-variant uppercase">Requisições Atendidas</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-code-mono text-2xl font-bold text-brand-blue-active">${reqsCount}</span>
              <span class="text-xs text-slate-500">saídas físicas</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-brand-blue-active">
            <span class="material-symbols-outlined text-[22px]">local_shipping</span>
          </div>
        </div>

        <!-- Card: Perdas/Descartes -->
        <div class="bg-surface-cream p-5 rounded-xl border border-brand-burgundy/10 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div class="absolute top-0 left-0 right-0 h-1 bg-brand-alert-red"></div>
          <div>
            <span class="text-xs font-semibold text-brand-burgundy uppercase">Ocorrências de Perda</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-code-mono text-2xl font-bold text-brand-alert-red">${lossesCount}</span>
              <span class="text-xs text-brand-burgundy/80">descartes / extravios</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-brand-alert-red">
            <span class="material-symbols-outlined text-[22px]">crisis_alert</span>
          </div>
        </div>
      </div>

      <!-- Transaction Form & Live Preview Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Form Column (8 cols) -->
        <div class="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-brand-navy text-[20px]">edit_note</span>
              <h2 class="text-base font-semibold text-brand-navy">Registro Rápido de Movimentação</h2>
            </div>
            <span class="text-[11px] font-code-mono text-slate-400">IMUTABILIDADE RLS ATIVA</span>
          </div>

          <form id="form-movement" class="flex flex-col gap-4">
            <!-- Movement Type Selector -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-on-surface">Tipo de Movimento *</label>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button type="button" data-type="ENTRADA" class="mov-type-btn px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-brand-navy text-white shadow-xs">
                  Entrada
                </button>
                <button type="button" data-type="SAIDA_CONSUMO" class="mov-type-btn px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100">
                  Saída / Depto
                </button>
                <button type="button" data-type="BAIXA_PERDA_VENCIMENTO" class="mov-type-btn px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100">
                  Vencimento
                </button>
                <button type="button" data-type="BAIXA_EXTRAVIO_SUMIÇO" class="mov-type-btn px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100">
                  Sumiço / Avaria
                </button>
                <button type="button" data-type="AJUSTE_INVENTARIO" class="mov-type-btn px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100">
                  Ajuste
                </button>
              </div>
            </div>

            <!-- Item and Batch Selector -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface">Insumo / Item *</label>
                <select id="mov-item-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
                  ${state.items.map(i => `<option value="${i.id}">${i.name} (${i.sku})</option>`).join('')}
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface">Lote Vinculado *</label>
                <select id="mov-batch-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono outline-none focus:border-brand-blue-active">
                  <!-- Populated dynamically via JS -->
                </select>
              </div>
            </div>

            <!-- Quantity & Department -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface">Quantidade *</label>
                <input type="number" id="mov-quantity" required value="1" min="1" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono outline-none focus:border-brand-blue-active">
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface">Centro de Custo / Solicitante *</label>
                <select id="mov-dept-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
                  ${state.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Mandatory Justification Textarea -->
            <div id="justificativa-box" class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label id="justificativa-label" class="text-xs font-bold text-brand-navy flex items-center gap-1.5" for="mov-reason">
                <span class="material-symbols-outlined text-[16px]">gavel</span>
                <span>Justificativa & Motivo *</span>
              </label>
              <textarea id="mov-reason" rows="2" placeholder="Descreva o motivo, nº da NF ou laudo de avaria..." class="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active resize-none"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="reset" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Limpar</button>
              <button type="submit" id="btn-submit-mov" class="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navy/90 shadow-sm transition-all">
                <span class="material-symbols-outlined text-[18px]">verified</span>
                <span>Processar Movimento</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Info / Context Column (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div class="flex items-center gap-2 text-brand-navy border-b border-slate-100 pb-2">
              <span class="material-symbols-outlined text-[20px]">info</span>
              <h3 class="text-sm font-semibold">Política de Audibilidade</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Conforme o manual <strong>Agents.md</strong> e <strong>RF03</strong>, toda baixa por descarte, vencimento ou falta injustificada exige justificativa legível.
            </p>
            <div class="p-3 bg-surface-cream rounded-lg border border-brand-burgundy/10 flex flex-col gap-1 text-[11px] text-brand-burgundy">
              <span class="font-bold">Aviso da Controladoria:</span>
              <span>Registros efetuados na tabela <code class="font-code-mono">inventory_transactions</code> são imutáveis e auditados continuamente.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-Time Transaction Ledger Table -->
      <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-navy text-[20px]">receipt_long</span>
            <h2 class="text-base font-semibold text-brand-navy">Histórico de Movimentações Recentes</h2>
          </div>

          <div class="flex items-center gap-2">
            <select id="ledger-type-filter" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-on-surface outline-none cursor-pointer">
              <option value="all">Todas as Movimentações</option>
              <option value="ENTRADA">Somente Entradas</option>
              <option value="SAIDA_CONSUMO">Somente Saídas</option>
              <option value="BAIXA_PERDA_VENCIMENTO">Somente Vencimentos</option>
              <option value="BAIXA_EXTRAVIO_SUMIÇO">Somente Extravios/Sumiço</option>
            </select>
            <button id="btn-export-ledger" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>CSV / Audit</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <th class="py-2.5 px-3">Protocolo • Data</th>
                <th class="py-2.5 px-3">Tipo</th>
                <th class="py-2.5 px-3">Insumo</th>
                <th class="py-2.5 px-3 text-right">Qtd</th>
                <th class="py-2.5 px-3">Centro de Custo</th>
                <th class="py-2.5 px-3">Justificativa / Observação</th>
              </tr>
            </thead>
            <tbody id="ledger-tbody" class="divide-y divide-slate-100">
              ${renderLedgerRows(txList)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderLedgerRows(transactions) {
  if (!transactions || transactions.length === 0) {
    return `<tr><td colspan="6" class="py-8 text-center text-slate-400">Nenhuma movimentação registrada.</td></tr>`;
  }

  return transactions.map(t => {
    const itemName = t.items?.name || 'Insumo';
    const deptName = t.departments?.name || 'Geral';
    const protocol = t.protocol || `#MOV-${t.id.slice(0, 6)}`;
    const dateStr = new Date(t.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let typeTag = '';
    let qtySign = '';
    let qtyClass = '';

    if (t.transaction_type === 'ENTRADA') {
      typeTag = '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">ENTRADA</span>';
      qtySign = '+';
      qtyClass = 'text-status-success';
    } else if (t.transaction_type === 'SAIDA_CONSUMO') {
      typeTag = '<span class="px-2 py-0.5 rounded-full bg-sky-100 text-brand-blue-active font-bold text-[10px]">SAÍDA / DEPT</span>';
      qtySign = '-';
      qtyClass = 'text-brand-blue-active';
    } else if (t.transaction_type === 'BAIXA_PERDA_VENCIMENTO') {
      typeTag = '<span class="px-2 py-0.5 rounded-full bg-red-100 text-brand-alert-red font-bold text-[10px]">PERDA / VENCIMENTO</span>';
      qtySign = '-';
      qtyClass = 'text-brand-alert-red';
    } else if (t.transaction_type === 'BAIXA_EXTRAVIO_SUMIÇO') {
      typeTag = '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">EXTRAVIO / SUMIÇO</span>';
      qtySign = '-';
      qtyClass = 'text-amber-800';
    } else {
      typeTag = '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">AJUSTE</span>';
      qtySign = '';
      qtyClass = 'text-slate-700';
    }

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3 whitespace-nowrap">
          <div class="flex flex-col">
            <span class="font-code-mono font-bold text-on-surface">${protocol}</span>
            <span class="font-code-mono text-[10px] text-slate-400">${dateStr}</span>
          </div>
        </td>
        <td class="py-3 px-3 whitespace-nowrap">${typeTag}</td>
        <td class="py-3 px-3">
          <div class="flex flex-col">
            <span class="font-semibold text-on-surface">${itemName}</span>
          </div>
        </td>
        <td class="py-3 px-3 text-right font-code-mono font-bold ${qtyClass} whitespace-nowrap">
          ${qtySign}${t.quantity} ${t.items?.unit_of_measure || 'un'}
        </td>
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded-full bg-surface-cream text-brand-burgundy font-semibold text-[10px]">${deptName}</span>
        </td>
        <td class="py-3 px-3">
          <p class="text-slate-600 text-[11px] leading-tight max-w-xs truncate" title="${t.reason || 'Sem justificativa'}">
            ${t.reason || 'Sem justificativa'}
          </p>
        </td>
      </tr>
    `;
  }).join('');
}

export function setupMovimentacoesEvents() {
  let activeMovType = 'ENTRADA';

  const itemSelect = document.getElementById('mov-item-id');
  const batchSelect = document.getElementById('mov-batch-id');
  const typeBtns = document.querySelectorAll('.mov-type-btn');
  const justBox = document.getElementById('justificativa-box');
  const reasonInput = document.getElementById('mov-reason');

  // Populate batch select based on selected item
  function updateBatchOptions() {
    if (!itemSelect || !batchSelect) return;
    const selectedItemId = itemSelect.value;
    const batches = state.batches.filter(b => b.item_id === selectedItemId);

    batchSelect.innerHTML = '';
    if (batches.length === 0) {
      batchSelect.innerHTML = '<option value="">Sem lote ativo (Crie um lote primeiro)</option>';
    } else {
      batches.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.batch_number} (Disp: ${b.quantity}un • Exp: ${b.expiry_date || 'N/A'})`;
        batchSelect.appendChild(opt);
      });
    }
  }

  if (itemSelect) {
    itemSelect.addEventListener('change', updateBatchOptions);
    updateBatchOptions();
  }

  // Handle Type Button Switching
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeMovType = btn.dataset.type;
      typeBtns.forEach(b => {
        b.classList.remove('bg-brand-navy', 'text-white', 'bg-brand-alert-red');
        b.classList.add('bg-slate-50', 'text-slate-700');
      });

      btn.classList.remove('bg-slate-50', 'text-slate-700');
      if (activeMovType.startsWith('BAIXA')) {
        btn.classList.add('bg-brand-alert-red', 'text-white');
        justBox.classList.add('bg-red-50', 'border-red-200');
        reasonInput.setAttribute('required', 'true');
        reasonInput.focus();
      } else {
        btn.classList.add('bg-brand-navy', 'text-white');
        justBox.classList.remove('bg-red-50', 'border-red-200');
        reasonInput.removeAttribute('required');
      }
    });
  });

  // Form Submission
  const formMov = document.getElementById('form-movement');
  if (formMov) {
    formMov.addEventListener('submit', async (e) => {
      e.preventDefault();

      const itemId = itemSelect.value;
      const batchId = batchSelect.value;
      const qty = parseInt(document.getElementById('mov-quantity').value, 10);
      const deptId = document.getElementById('mov-dept-id').value;
      const reason = reasonInput.value.trim();

      // Enforce business rule RF03 & Agents.md: mandatory justification for losses
      if (activeMovType.startsWith('BAIXA') && !reason) {
        alert('Atenção: A justificativa é estritamente obrigatória para registro de perdas ou extravios!');
        reasonInput.focus();
        return;
      }

      const itemObj = state.items.find(i => i.id === itemId);
      const unitCost = itemObj ? Number(itemObj.unit_cost || 0) : 0;

      const txObj = {
        item_id: itemId,
        batch_id: batchId,
        department_id: deptId,
        transaction_type: activeMovType,
        quantity: qty,
        unit_cost: unitCost,
        reason: reason || 'Movimentação realizada via painel.'
      };

      await dbService.createTransaction(txObj);
      await loadData();
      navigate('movimentacoes');
    });
  }

  // Ledger Filter
  const ledgerFilter = document.getElementById('ledger-type-filter');
  if (ledgerFilter) {
    ledgerFilter.addEventListener('change', () => {
      const val = ledgerFilter.value;
      let filtered = state.transactions;
      if (val !== 'all') {
        filtered = filtered.filter(t => t.transaction_type === val);
      }
      const tbody = document.getElementById('ledger-tbody');
      if (tbody) tbody.innerHTML = renderLedgerRows(filtered);
    });
  }

  // Export Ledger CSV
  const btnExportLedger = document.getElementById('btn-export-ledger');
  if (btnExportLedger) {
    btnExportLedger.addEventListener('click', () => {
      let csv = 'Protocolo,Data,Tipo,Insumo,Quantidade,Departamento,Justificativa\n';
      state.transactions.forEach(t => {
        csv += `"${t.protocol || t.id}","${t.created_at}","${t.transaction_type}","${t.items?.name || ''}",${t.quantity},"${t.departments?.name || ''}","${(t.reason || '').replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Log_Movimentacoes_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
