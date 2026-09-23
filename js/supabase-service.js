import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Default Initial Mock / Seed State
const defaultSeedData = {
  departments: [
    { id: 'dept-eng', name: 'Engenharia de Software', cost_center_code: 'CC-ENG-01', description: 'Desenvolvimento e Inovação' },
    { id: 'dept-ops', name: 'Operações & Infraestrutura', cost_center_code: 'CC-OPS-02', description: 'Infraestrutura e Suporte de Campo' },
    { id: 'dept-fin', name: 'Diretoria & Controladoria', cost_center_code: 'CC-FIN-03', description: 'Gestão Financeira e Governança' },
    { id: 'dept-alm', name: 'Almoxarifado Central', cost_center_code: 'CC-ALM-00', description: 'Armazenamento Central de Insumos' }
  ],
  categories: [
    { id: 'cat-chem', name: 'Insumos Industriais & Químicos', description: 'Resinas, solventes e reagentes' },
    { id: 'cat-elec', name: 'Eletrônicos & Conectividade', description: 'Kits, cabos e conectores' },
    { id: 'cat-3d', name: 'Filamentos & Impressão 3D', description: 'Carretéis e filamentos técnicos' },
    { id: 'cat-pack', name: 'Embalagens & Logística', description: 'Fitas, Caixas e filmes' }
  ],
  items: [
    { id: 'item-401', name: 'Resina Polimérica UV Pro 1000ml', sku: 'INS-401', category_id: 'cat-chem', categories: { name: 'Insumos Industriais & Químicos' }, unit_of_measure: 'unidade', min_stock_level: 10, unit_cost: 180.00, has_expiry: true, created_at: new Date().toISOString() },
    { id: 'item-402', name: 'Fita Filamentos 50mm Industrial', sku: 'INS-402', category_id: 'cat-pack', categories: { name: 'Embalagens & Logística' }, unit_of_measure: 'rolo', min_stock_level: 20, unit_cost: 45.00, has_expiry: false, created_at: new Date().toISOString() },
    { id: 'item-403', name: 'Solvente Isopropanol 99.8% 5L', sku: 'INS-403', category_id: 'cat-chem', categories: { name: 'Insumos Industriais & Químicos' }, unit_of_measure: 'galão', min_stock_level: 5, unit_cost: 120.00, has_expiry: true, created_at: new Date().toISOString() },
    { id: 'item-404', name: 'Filamento PLA Tough Navy 1kg', sku: 'INS-404', category_id: 'cat-3d', categories: { name: 'Filamentos & Impressão 3D' }, unit_of_measure: 'unidade', min_stock_level: 15, unit_cost: 142.50, has_expiry: true, created_at: new Date().toISOString() },
    { id: 'item-405', name: 'Kit Conectores Ouro RJ45 Blindado', sku: 'INS-405', category_id: 'cat-elec', categories: { name: 'Eletrônicos & Conectividade' }, unit_of_measure: 'unidade', min_stock_level: 50, unit_cost: 12.00, has_expiry: false, created_at: new Date().toISOString() }
  ],
  item_batches: [
    { id: 'batch-88401', item_id: 'item-401', department_id: 'dept-alm', batch_number: 'LT-88401', quantity: 48, expiry_date: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0], items: { name: 'Resina Polimérica UV Pro 1000ml', unit_cost: 180.00, unit_of_measure: 'unidade' }, departments: { name: 'Almoxarifado Central' } },
    { id: 'batch-88910', item_id: 'item-403', department_id: 'dept-ops', batch_number: 'LT-88910', quantity: 12, expiry_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], items: { name: 'Solvente Isopropanol 99.8% 5L', unit_cost: 120.00, unit_of_measure: 'galão' }, departments: { name: 'Operações & Infraestrutura' } }, // Crítico <30 dias
    { id: 'batch-90112', item_id: 'item-405', department_id: 'dept-alm', batch_number: 'LT-90112', quantity: 450, expiry_date: new Date(Date.now() + 360 * 86400000).toISOString().split('T')[0], items: { name: 'Kit Conectores Ouro RJ45 Blindado', unit_cost: 12.00, unit_of_measure: 'unidade' }, departments: { name: 'Almoxarifado Central' } },
    { id: 'batch-88220', item_id: 'item-404', department_id: 'dept-eng', batch_number: 'LT-88220', quantity: 82, expiry_date: new Date(Date.now() + 360 * 86400000).toISOString().split('T')[0], items: { name: 'Filamento PLA Tough Navy 1kg', unit_cost: 142.50, unit_of_measure: 'unidade' }, departments: { name: 'Engenharia de Software' } },
    { id: 'batch-77102', item_id: 'item-402', department_id: 'dept-alm', batch_number: 'LT-77102', quantity: 180, expiry_date: null, items: { name: 'Fita Filamentos 50mm Industrial', unit_cost: 45.00, unit_of_measure: 'rolo' }, departments: { name: 'Almoxarifado Central' } }
  ],
  inventory_transactions: [
    { id: 'tx-9982', protocol: '#MOV-2024-9982', created_at: new Date().toISOString(), user_name: 'Marcio Leite', item_id: 'item-403', department_id: 'dept-ops', transaction_type: 'BAIXA_PERDA_VENCIMENTO', quantity: 2, unit_cost: 120.00, total_cost: 240.00, reason: 'Galão apresentou fissura na válvula durante transporte interno; descarte preventivo protocolado.', items: { name: 'Solvente Isopropanol 99.8% 5L', unit_of_measure: 'galão', sku: 'INS-403' }, departments: { name: 'Operações & Infraestrutura' } },
    { id: 'tx-9981', protocol: '#MOV-2024-9981', created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Ana Clara Rios', item_id: 'item-401', department_id: 'dept-eng', transaction_type: 'SAIDA_CONSUMO', quantity: 4, unit_cost: 180.00, total_cost: 720.00, reason: 'Prototipagem de carcaças IoT para sensor de telemetria externa v2.', items: { name: 'Resina Polimérica UV Pro 1000ml', unit_of_measure: 'unidade', sku: 'INS-401' }, departments: { name: 'Engenharia de Software' } },
    { id: 'tx-9980', protocol: '#MOV-2024-9980', created_at: new Date(Date.now() - 7200000).toISOString(), user_name: 'Carlos Mendes', item_id: 'item-405', department_id: 'dept-alm', transaction_type: 'ENTRADA', quantity: 200, unit_cost: 12.00, total_cost: 2400.00, reason: 'Recebimento Fornecedor FastNet Brasil • NF-e 44921 • Conferência 100% OK.', items: { name: 'Kit Conectores Ouro RJ45', unit_of_measure: 'unidade', sku: 'INS-405' }, departments: { name: 'Almoxarifado Central' } },
    { id: 'tx-9979', protocol: '#MOV-2024-9979', created_at: new Date(Date.now() - 14400000).toISOString(), user_name: 'Marcio Leite', item_id: 'item-404', department_id: 'dept-eng', transaction_type: 'BAIXA_EXTRAVIO_SUMIÇO', quantity: 1, unit_cost: 142.50, total_cost: 142.50, reason: 'Queda durante empilhamento na gaveta modular 3B; carretel quebrado impossibilitando giro.', items: { name: 'Filamento PLA Tough Navy 1kg', unit_of_measure: 'unidade', sku: 'INS-404' }, departments: { name: 'Engenharia de Software' } }
  ],
  audits: [
    { id: 'audit-01', created_at: new Date(Date.now() - 86400000).toISOString(), department_id: 'dept-eng', auditor_name: 'Carlos Mendes', status: 'CONCLUIDA', observations: 'Conferência mensal de insumos de prototipagem.', departments: { name: 'Engenharia de Software' }, audit_items: [
      { id: 'ai-01', item_id: 'item-404', expected_quantity: 83, counted_quantity: 82, discrepancy_quantity: -1, notes: 'Avaria registrada em transporte', items: { name: 'Filamento PLA Tough Navy 1kg', unit_of_measure: 'unidade' } }
    ]}
  ]
};

// Local storage cache helper
function getLocalStore(key) {
  try {
    const data = localStorage.getItem(`insumos_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function setLocalStore(key, value) {
  try {
    localStorage.setItem(`insumos_${key}`, JSON.stringify(value));
  } catch (e) {}
}

function initLocalStore() {
  Object.keys(defaultSeedData).forEach(key => {
    if (!getLocalStore(key)) {
      setLocalStore(key, defaultSeedData[key]);
    }
  });
}

// REST call helper
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export async function restFetch(table, options = {}) {
  const method = options.method || 'GET';
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (options.query) url += `?${options.query}`;
  const config = { method, headers: { ...headers, ...options.headers } };
  if (options.body) config.body = JSON.stringify(options.body);

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      throw new Error(`REST error ${res.status}`);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.warn(`Supabase ${method} ${table} fallbacked to Local Storage:`, err.message);
    throw err;
  }
}

initLocalStore();

export const dbService = {
  // Departments
  async getDepartments() {
    try {
      const data = await restFetch('departments', { query: 'select=*&order=name.asc' });
      if (data && data.length > 0) {
        setLocalStore('departments', data);
        return data;
      }
    } catch (e) {}
    return getLocalStore('departments') || defaultSeedData.departments;
  },

  async createDepartment(dept) {
    const newObj = { id: `dept-${Date.now()}`, created_at: new Date().toISOString(), ...dept };
    try {
      const res = await restFetch('departments', { method: 'POST', body: dept });
      if (res && res.length > 0) return res[0];
    } catch (e) {}
    const list = getLocalStore('departments') || [];
    list.push(newObj);
    setLocalStore('departments', list);
    return newObj;
  },

  // Categories
  async getCategories() {
    try {
      const data = await restFetch('categories', { query: 'select=*&order=name.asc' });
      if (data && data.length > 0) {
        setLocalStore('categories', data);
        return data;
      }
    } catch (e) {}
    return getLocalStore('categories') || defaultSeedData.categories;
  },

  async createCategory(cat) {
    const newObj = { id: `cat-${Date.now()}`, created_at: new Date().toISOString(), ...cat };
    try {
      const res = await restFetch('categories', { method: 'POST', body: cat });
      if (res && res.length > 0) return res[0];
    } catch (e) {}
    const list = getLocalStore('categories') || [];
    list.push(newObj);
    setLocalStore('categories', list);
    return newObj;
  },

  // Items
  async getItems() {
    try {
      const data = await restFetch('items', { query: 'select=*,categories(name)&order=created_at.desc' });
      if (data && data.length > 0) {
        setLocalStore('items', data);
        return data;
      }
    } catch (e) {}
    return getLocalStore('items') || defaultSeedData.items;
  },

  async createItem(item) {
    const newObj = { id: `item-${Date.now()}`, created_at: new Date().toISOString(), ...item };
    const cats = getLocalStore('categories') || [];
    const catObj = cats.find(c => c.id === item.category_id);
    if (catObj) newObj.categories = { name: catObj.name };

    try {
      const res = await restFetch('items', { method: 'POST', body: item });
      if (res && res.length > 0) return res[0];
    } catch (e) {}

    const list = getLocalStore('items') || [];
    list.unshift(newObj);
    setLocalStore('items', list);
    return newObj;
  },

  // Item Batches
  async getBatches() {
    try {
      const data = await restFetch('item_batches', { query: 'select=*,items(name,unit_cost,unit_of_measure,category_id),departments(name)&order=expiry_date.asc.nullslast' });
      if (data && data.length > 0) {
        setLocalStore('item_batches', data);
        return data;
      }
    } catch (e) {}
    return getLocalStore('item_batches') || defaultSeedData.item_batches;
  },

  async createBatch(batch) {
    const items = getLocalStore('items') || [];
    const depts = getLocalStore('departments') || [];
    const itemObj = items.find(i => i.id === batch.item_id);
    const deptObj = depts.find(d => d.id === batch.department_id);

    const newObj = {
      id: `batch-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...batch,
      items: itemObj ? { name: itemObj.name, unit_cost: itemObj.unit_cost, unit_of_measure: itemObj.unit_of_measure } : { name: 'Item' },
      departments: deptObj ? { name: deptObj.name } : { name: 'Departamento' }
    };

    try {
      const res = await restFetch('item_batches', { method: 'POST', body: batch });
      if (res && res.length > 0) return res[0];
    } catch (e) {}

    const list = getLocalStore('item_batches') || [];
    list.unshift(newObj);
    setLocalStore('item_batches', list);
    return newObj;
  },

  async updateBatchQuantity(batchId, deltaQty) {
    try {
      const batchList = await this.getBatches();
      const b = batchList.find(x => x.id === batchId);
      if (b) {
        const newQty = Math.max(0, (b.quantity || 0) + deltaQty);
        b.quantity = newQty;
        try {
          await restFetch('item_batches', { method: 'PATCH', query: `id=eq.${batchId}`, body: { quantity: newQty } });
        } catch (e) {}
        setLocalStore('item_batches', batchList);
        return b;
      }
    } catch (e) {}
  },

  // Transactions (Immutable)
  async getTransactions() {
    try {
      const data = await restFetch('inventory_transactions', { query: 'select=*,items(name,unit_of_measure,sku),departments(name)&order=created_at.desc' });
      if (data && data.length > 0) {
        setLocalStore('inventory_transactions', data);
        return data;
      }
    } catch (e) {}
    return getLocalStore('inventory_transactions') || defaultSeedData.inventory_transactions;
  },

  async createTransaction(tx) {
    const items = getLocalStore('items') || [];
    const depts = getLocalStore('departments') || [];
    const itemObj = items.find(i => i.id === tx.item_id);
    const deptObj = depts.find(d => d.id === tx.department_id);

    const protocolNum = Math.floor(1000 + Math.random() * 9000);
    const newObj = {
      id: `tx-${Date.now()}`,
      protocol: `#MOV-2024-${protocolNum}`,
      created_at: new Date().toISOString(),
      user_name: tx.user_name || 'Operador Responsável',
      total_cost: tx.quantity * tx.unit_cost,
      ...tx,
      items: itemObj ? { name: itemObj.name, unit_of_measure: itemObj.unit_of_measure, sku: itemObj.sku } : { name: 'Item', unit_of_measure: 'un', sku: 'INS-000' },
      departments: deptObj ? { name: deptObj.name } : { name: 'Departamento' }
    };

    // Immutability: transactions are ONLY added, never modified or deleted!
    try {
      const res = await restFetch('inventory_transactions', { method: 'POST', body: tx });
      if (res && res.length > 0) newObj.id = res[0].id;
    } catch (e) {}

    const list = getLocalStore('inventory_transactions') || [];
    list.unshift(newObj);
    setLocalStore('inventory_transactions', list);

    // Update batch quantity automatically
    if (tx.batch_id) {
      const qtyChange = (tx.transaction_type === 'ENTRADA') ? tx.quantity : -tx.quantity;
      await this.updateBatchQuantity(tx.batch_id, qtyChange);
    }

    return newObj;
  },

  // Audits & Audit Items
  async getAudits() {
    try {
      const data = await restFetch('audits', { query: 'select=*,departments(name),audit_items(*,items(name,unit_of_measure))&order=created_at.desc' });
      if (data && data.length > 0) {
        setLocalStore('audits', data);
        return data;
      }
    } catch (e) {}
    return getLocalStore('audits') || defaultSeedData.audits;
  },

  async createAudit(auditData, auditItemsList) {
    const depts = getLocalStore('departments') || [];
    const deptObj = depts.find(d => d.id === auditData.department_id);
    const items = getLocalStore('items') || [];

    const formattedAuditItems = (auditItemsList || []).map((ai, idx) => {
      const itemObj = items.find(i => i.id === ai.item_id);
      return {
        id: `ai-${Date.now()}-${idx}`,
        item_id: ai.item_id,
        expected_quantity: ai.expected_quantity,
        counted_quantity: ai.counted_quantity,
        discrepancy_quantity: ai.counted_quantity - ai.expected_quantity,
        notes: ai.notes || '',
        items: itemObj ? { name: itemObj.name, unit_of_measure: itemObj.unit_of_measure } : { name: 'Item' }
      };
    });

    const newAudit = {
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: auditData.status || 'EM_ANDAMENTO',
      auditor_name: auditData.auditor_name || 'Controlador / Auditor',
      observations: auditData.observations || '',
      department_id: auditData.department_id,
      departments: deptObj ? { name: deptObj.name } : { name: 'Departamento' },
      audit_items: formattedAuditItems
    };

    try {
      await restFetch('audits', { method: 'POST', body: auditData });
    } catch (e) {}

    const list = getLocalStore('audits') || [];
    list.unshift(newAudit);
    setLocalStore('audits', list);
    return newAudit;
  }
};
