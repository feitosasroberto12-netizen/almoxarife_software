import { dbService } from './supabase-service.js';
import { renderDashboardView, setupDashboardEvents } from './views/dashboard.js';
import { renderInsumosView, setupInsumosEvents } from './views/insumos.js';
import { renderMovimentacoesView, setupMovimentacoesEvents } from './views/movimentacoes.js';
import { renderAuditoriaView, setupAuditoriaEvents } from './views/auditoria.js';

// Application State
export const state = {
  currentRoute: 'dashboard',
  selectedDepartmentId: 'all',
  departments: [],
  categories: [],
  items: [],
  batches: [],
  transactions: [],
  audits: []
};

// Populate global state from Supabase / Data Service
export async function loadData() {
  try {
    const [depts, cats, items, batches, txs, audits] = await Promise.all([
      dbService.getDepartments(),
      dbService.getCategories(),
      dbService.getItems(),
      dbService.getBatches(),
      dbService.getTransactions(),
      dbService.getAudits()
    ]);

    state.departments = depts || [];
    state.categories = cats || [];
    state.items = items || [];
    state.batches = batches || [];
    state.transactions = txs || [];
    state.audits = audits || [];

    updateDepartmentDropdown();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

// Populate the top header department selector
function updateDepartmentDropdown() {
  const select = document.getElementById('global-dept-filter');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="all">Todos os Departamentos</option>';

  state.departments.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name;
    if (d.id === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

// Navigation router
export async function navigate(route) {
  state.currentRoute = route || 'dashboard';

  // Update URL hash
  window.location.hash = state.currentRoute;

  // Update navigation styling
  document.querySelectorAll('.nav-item').forEach(link => {
    const isCurrent = link.dataset.route === state.currentRoute;
    if (isCurrent) {
      link.classList.add('bg-brand-navy', 'text-white', 'font-semibold');
      link.classList.remove('text-on-surface-variant', 'hover:bg-surface-container');
    } else {
      link.classList.remove('bg-brand-navy', 'text-white', 'font-semibold');
      link.classList.add('text-on-surface-variant', 'hover:bg-surface-container');
    }
  });

  const container = document.getElementById('app-view-container');
  if (!container) return;

  // Render view template
  switch (state.currentRoute) {
    case 'dashboard':
      container.innerHTML = renderDashboardView();
      setupDashboardEvents();
      break;

    case 'insumos':
      container.innerHTML = renderInsumosView();
      setupInsumosEvents();
      break;

    case 'movimentacoes':
      container.innerHTML = renderMovimentacoesView();
      setupMovimentacoesEvents();
      break;

    case 'auditoria':
      container.innerHTML = renderAuditoriaView();
      setupAuditoriaEvents();
      break;

    default:
      container.innerHTML = renderDashboardView();
      setupDashboardEvents();
      break;
  }
}

// Event Listeners Initialization
function initEvents() {
  // Hash change
  window.addEventListener('hashchange', () => {
    const route = window.location.hash.replace('#', '');
    navigate(route);
  });

  // Global Department Filter change
  const deptFilter = document.getElementById('global-dept-filter');
  if (deptFilter) {
    deptFilter.addEventListener('change', (e) => {
      state.selectedDepartmentId = e.target.value;
      navigate(state.currentRoute);
    });
  }

  // Refresh Button
  const btnRefresh = document.getElementById('btn-refresh-data');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      btnRefresh.classList.add('animate-spin');
      await loadData();
      await navigate(state.currentRoute);
      setTimeout(() => btnRefresh.classList.remove('animate-spin'), 600);
    });
  }
}

// Application Entry Point
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initEvents();
  const initialRoute = window.location.hash.replace('#', '') || 'dashboard';
  navigate(initialRoute);
});
