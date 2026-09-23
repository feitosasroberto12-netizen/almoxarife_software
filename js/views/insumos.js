import { state, loadData, navigate } from '../app.js';
import { dbService } from '../supabase-service.js';

export function renderInsumosView() {
  const deptFilter = state.selectedDepartmentId;

  // Filter items/batches by global department filter if selected
  let itemsList = state.items;
  let batchesList = state.batches;

  if (deptFilter !== 'all') {
    batchesList = batchesList.filter(b => b.department_id === deptFilter);
  }

  return `
    <div class="flex flex-col gap-6">
      <!-- Header Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col gap-1">
          <h1 class="font-headline-lg text-2xl font-bold text-brand-navy tracking-tight">Gestão de Insumos & Lotes</h1>
          <p class="text-xs text-on-surface-variant">Catálogo unificado de itens, estoque mínimo, controle de lotes e datas de validade.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-open-modal-item" class="flex items-center gap-2 px-3.5 py-2 bg-brand-navy text-white rounded-lg font-semibold text-xs hover:bg-brand-navy/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">add_box</span>
            <span>+ Novo Insumo</span>
          </button>
          <button id="btn-open-modal-batch" class="flex items-center gap-2 px-3.5 py-2 bg-brand-blue-active text-white rounded-lg font-semibold text-xs hover:bg-brand-blue-active/90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">post_add</span>
            <span>+ Novo Lote</span>
          </button>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="relative w-full sm:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          <input type="text" id="insumo-search-input" placeholder="Buscar por nome, SKU ou lote..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active focus:bg-white transition-all">
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select id="insumo-cat-filter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-on-surface outline-none cursor-pointer">
            <option value="all">Todas as Categorias</option>
            ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Main Insumos Table -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <th class="py-3 px-4">Insumo / Categoria</th>
                <th class="py-3 px-4">SKU</th>
                <th class="py-3 px-4">Lotes Ativos</th>
                <th class="py-3 px-4 text-right">Estoque Total</th>
                <th class="py-3 px-4 text-right">Custo Unitário</th>
                <th class="py-3 px-4 text-center">Validade / Status</th>
              </tr>
            </thead>
            <tbody id="insumos-table-body" class="divide-y divide-slate-100">
              ${renderTableRows(itemsList, batchesList)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Novo Insumo -->
    <div id="modal-item" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-semibold text-brand-navy">Cadastrar Novo Insumo</h3>
          <button id="btn-close-modal-item" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="form-new-item" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-on-surface">Nome do Insumo *</label>
            <input type="text" id="item-name" required placeholder="Ex: Resina Polimérica UV 1L" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Código SKU *</label>
              <input type="text" id="item-sku" required placeholder="EX: INS-501" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono uppercase outline-none focus:border-brand-blue-active">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Categoria *</label>
              <select id="item-category-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
                ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Unidade *</label>
              <input type="text" id="item-unit" required placeholder="un, kg, gl, rolo" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Estoque Mín. *</label>
              <input type="number" id="item-min-stock" required value="10" min="0" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono outline-none focus:border-brand-blue-active">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Custo Unit. (R$) *</label>
              <input type="number" id="item-cost" required step="0.01" value="100.00" min="0" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono outline-none focus:border-brand-blue-active">
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input type="checkbox" id="item-has-expiry" checked class="w-4 h-4 text-brand-navy rounded">
            <label for="item-has-expiry" class="text-xs font-semibold text-on-surface cursor-pointer">Requer controle obrigatório de data de validade</label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" id="btn-cancel-item" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navy/90 rounded-lg shadow-sm">Salvar Insumo</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Novo Lote -->
    <div id="modal-batch" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-semibold text-brand-navy">Adicionar Novo Lote ao Estoque</h3>
          <button id="btn-close-modal-batch" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="form-new-batch" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-on-surface">Selecione o Insumo *</label>
            <select id="batch-item-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
              ${state.items.map(i => `<option value="${i.id}">${i.name} (${i.sku})</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Número do Lote *</label>
              <input type="text" id="batch-number" required placeholder="EX: LT-90800" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono uppercase outline-none focus:border-brand-blue-active">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Departamento Destino *</label>
              <select id="batch-dept-id" required class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-blue-active">
                ${state.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Quantidade *</label>
              <input type="number" id="batch-quantity" required value="50" min="1" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono outline-none focus:border-brand-blue-active">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-on-surface">Data de Validade</label>
              <input type="date" id="batch-expiry" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-code-mono outline-none focus:border-brand-blue-active">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" id="btn-cancel-batch" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-brand-blue-active hover:bg-brand-blue-active/90 rounded-lg shadow-sm">Registrar Lote</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderTableRows(items, batches) {
  if (!items || items.length === 0) {
    return `<tr><td colspan="6" class="py-8 text-center text-slate-400">Nenhum insumo cadastrado.</td></tr>`;
  }

  const today = new Date();

  return items.map(item => {
    const itemBatches = batches.filter(b => b.item_id === item.id);
    const totalQty = itemBatches.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);
    const catName = item.categories?.name || 'Insumo Geral';
    const isBelowMin = totalQty < item.min_stock_level;

    // Check nearest expiry batch
    let nearestExpiryText = item.has_expiry ? 'Sem lote c/ validade' : 'Não expira';
    let statusBadge = '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">OK</span>';

    if (itemBatches.length > 0 && item.has_expiry) {
      const expDates = itemBatches
        .filter(b => b.expiry_date)
        .map(b => new Date(b.expiry_date))
        .sort((a, b) => a - b);

      if (expDates.length > 0) {
        const nearest = expDates[0];
        const diffDays = Math.ceil((nearest - today) / (1000 * 60 * 60 * 24));
        nearestExpiryText = nearest.toLocaleDateString('pt-BR');

        if (diffDays <= 0) {
          statusBadge = '<span class="px-2 py-0.5 rounded-full bg-red-100 text-brand-alert-red font-bold text-[10px]">VENCIDO</span>';
        } else if (diffDays <= 30) {
          statusBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">${diffDays}d CRÍTICO</span>`;
        }
      }
    }

    if (isBelowMin) {
      statusBadge += ' <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px] ml-1">BAIXO</span>';
    }

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="font-semibold text-on-surface">${item.name}</span>
            <span class="text-[11px] text-slate-400">${catName}</span>
          </div>
        </td>
        <td class="py-3 px-4 font-code-mono text-slate-500 font-semibold uppercase">
          ${item.sku || 'N/A'}
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          <div class="flex flex-wrap gap-1">
            ${itemBatches.length === 0 ? '<span class="text-slate-400 font-code-mono text-[11px]">Nenhum lote</span>' : itemBatches.map(b => `
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-code-mono text-[11px]">
                ${b.batch_number} (${b.quantity}un)
              </span>
            `).join('')}
          </div>
        </td>
        <td class="py-3 px-4 text-right font-code-mono font-bold ${isBelowMin ? 'text-brand-alert-red' : 'text-on-surface'} whitespace-nowrap">
          ${totalQty} ${item.unit_of_measure}
          <div class="text-[10px] font-normal text-slate-400">Min: ${item.min_stock_level}</div>
        </td>
        <td class="py-3 px-4 text-right font-code-mono font-semibold text-on-surface whitespace-nowrap">
          R$ ${Number(item.unit_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <div class="flex flex-col items-center gap-0.5">
            ${statusBadge}
            <span class="text-[10px] text-slate-400 font-code-mono">${nearestExpiryText}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function setupInsumosEvents() {
  // Modal Item Controls
  const modalItem = document.getElementById('modal-item');
  const btnOpenItem = document.getElementById('btn-open-modal-item');
  const btnCloseItem = document.getElementById('btn-close-modal-item');
  const btnCancelItem = document.getElementById('btn-cancel-item');
  const formItem = document.getElementById('form-new-item');

  if (btnOpenItem) btnOpenItem.addEventListener('click', () => modalItem.classList.remove('hidden'));
  if (btnCloseItem) btnCloseItem.addEventListener('click', () => modalItem.classList.add('hidden'));
  if (btnCancelItem) btnCancelItem.addEventListener('click', () => modalItem.classList.add('hidden'));

  if (formItem) {
    formItem.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newItem = {
        name: document.getElementById('item-name').value.trim(),
        sku: document.getElementById('item-sku').value.trim().toUpperCase(),
        category_id: document.getElementById('item-category-id').value,
        unit_of_measure: document.getElementById('item-unit').value.trim(),
        min_stock_level: parseInt(document.getElementById('item-min-stock').value, 10),
        unit_cost: parseFloat(document.getElementById('item-cost').value),
        has_expiry: document.getElementById('item-has-expiry').checked
      };

      await dbService.createItem(newItem);
      modalItem.classList.add('hidden');
      formItem.reset();
      await loadData();
      navigate('insumos');
    });
  }

  // Modal Batch Controls
  const modalBatch = document.getElementById('modal-batch');
  const btnOpenBatch = document.getElementById('btn-open-modal-batch');
  const btnCloseBatch = document.getElementById('btn-close-modal-batch');
  const btnCancelBatch = document.getElementById('btn-cancel-batch');
  const formBatch = document.getElementById('form-new-batch');

  if (btnOpenBatch) btnOpenBatch.addEventListener('click', () => modalBatch.classList.remove('hidden'));
  if (btnCloseBatch) btnCloseBatch.addEventListener('click', () => modalBatch.classList.add('hidden'));
  if (btnCancelBatch) btnCancelBatch.addEventListener('click', () => modalBatch.classList.add('hidden'));

  if (formBatch) {
    formBatch.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newBatch = {
        item_id: document.getElementById('batch-item-id').value,
        department_id: document.getElementById('batch-dept-id').value,
        batch_number: document.getElementById('batch-number').value.trim().toUpperCase(),
        quantity: parseInt(document.getElementById('batch-quantity').value, 10),
        expiry_date: document.getElementById('batch-expiry').value || null
      };

      await dbService.createBatch(newBatch);
      modalBatch.classList.add('hidden');
      formBatch.reset();
      await loadData();
      navigate('insumos');
    });
  }

  // Filter & Search Controls
  const searchInput = document.getElementById('insumo-search-input');
  const catFilter = document.getElementById('insumo-cat-filter');

  function filterTable() {
    const searchVal = (searchInput.value || '').toLowerCase();
    const catVal = catFilter.value;

    let filtered = state.items;
    if (catVal !== 'all') {
      filtered = filtered.filter(i => i.category_id === catVal);
    }
    if (searchVal) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(searchVal) ||
        (i.sku && i.sku.toLowerCase().includes(searchVal))
      );
    }

    const tbody = document.getElementById('insumos-table-body');
    if (tbody) tbody.innerHTML = renderTableRows(filtered, state.batches);
  }

  if (searchInput) searchInput.addEventListener('input', filterTable);
  if (catFilter) catFilter.addEventListener('change', filterTable);
}
