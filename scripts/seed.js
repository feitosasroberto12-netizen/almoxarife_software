import { SUPABASE_URL, SUPABASE_KEY } from '../js/config.js';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function restFetch(table, options = {}) {
  const method = options.method || 'GET';
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (options.query) url += `?${options.query}`;
  const config = { method, headers: { ...headers, ...options.headers } };
  if (options.body) config.body = JSON.stringify(options.body);
  const res = await fetch(url, config);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro REST ${table}: ${res.statusText} (${errText})`);
  }
  if (res.status === 204) return null;
  return await res.json();
}

async function seed() {
  console.log('Verificando departamentos...');
  const depts = await restFetch('departments', { query: 'select=*' });
  if (depts && depts.length > 0) {
    console.log(`Banco de dados já possui ${depts.length} departamentos.`);
  } else {
    console.log('Semeando dados iniciais...');
    // 1. Departamentos
    const defaultDepts = [
      { name: 'Engenharia de Software', cost_center_code: 'CC-ENG-01', description: 'Desenvolvimento e Inovação' },
      { name: 'Operações & Infraestrutura', cost_center_code: 'CC-OPS-02', description: 'Infraestrutura e Suporte de Campo' },
      { name: 'Diretoria & Controladoria', cost_center_code: 'CC-FIN-03', description: 'Gestão Financeira e Governança' },
      { name: 'Almoxarifado Central', cost_center_code: 'CC-ALM-00', description: 'Armazenamento Central de Insumos' }
    ];
    const insertedDepts = await restFetch('departments', { method: 'POST', body: defaultDepts });
    const deptMap = {};
    insertedDepts.forEach(d => { deptMap[d.name] = d.id; });

    // 2. Categorias
    const defaultCategories = [
      { name: 'Insumos Industriais & Químicos', description: 'Resinas, solventes e reagentes' },
      { name: 'Eletrônicos & Conectividade', description: 'Kits, cabos e conectores' },
      { name: 'Filamentos & Impressão 3D', description: 'Carretéis e filamentos técnicos' },
      { name: 'Embalagens & Logística', description: 'Fitas, Caixas e filmes' }
    ];
    const insertedCats = await restFetch('categories', { method: 'POST', body: defaultCategories });
    const catMap = {};
    insertedCats.forEach(c => { catMap[c.name] = c.id; });

    // 3. Insumos
    const defaultItems = [
      { name: 'Resina Polimérica UV Pro 1000ml', sku: 'INS-401', category_id: catMap['Insumos Industriais & Químicos'], unit_of_measure: 'unidade', min_stock_level: 10, unit_cost: 180.00, has_expiry: true },
      { name: 'Fita Filamentos 50mm Industrial', sku: 'INS-402', category_id: catMap['Embalagens & Logística'], unit_of_measure: 'rolo', min_stock_level: 20, unit_cost: 45.00, has_expiry: false },
      { name: 'Solvente Isopropanol 99.8% 5L', sku: 'INS-403', category_id: catMap['Insumos Industriais & Químicos'], unit_of_measure: 'galão', min_stock_level: 5, unit_cost: 120.00, has_expiry: true },
      { name: 'Filamento PLA Tough Navy 1kg', sku: 'INS-404', category_id: catMap['Filamentos & Impressão 3D'], unit_of_measure: 'unidade', min_stock_level: 15, unit_cost: 142.50, has_expiry: true },
      { name: 'Kit Conectores Ouro RJ45 Blindado', sku: 'INS-405', category_id: catMap['Eletrônicos & Conectividade'], unit_of_measure: 'unidade', min_stock_level: 50, unit_cost: 12.00, has_expiry: false }
    ];
    const insertedItems = await restFetch('items', { method: 'POST', body: defaultItems });
    const itemMap = {};
    insertedItems.forEach(i => { itemMap[i.sku] = i.id; });

    // 4. Lotes
    const today = new Date();
    const in15Days = new Date(today.valueOf() + 15 * 86400000).toISOString().split('T')[0];
    const in120Days = new Date(today.valueOf() + 120 * 86400000).toISOString().split('T')[0];
    const in360Days = new Date(today.valueOf() + 360 * 86400000).toISOString().split('T')[0];

    const defaultBatches = [
      { item_id: itemMap['INS-401'], department_id: deptMap['Almoxarifado Central'], batch_number: 'LT-88401', quantity: 48, expiry_date: in120Days },
      { item_id: itemMap['INS-403'], department_id: deptMap['Operações & Infraestrutura'], batch_number: 'LT-88910', quantity: 12, expiry_date: in15Days },
      { item_id: itemMap['INS-405'], department_id: deptMap['Almoxarifado Central'], batch_number: 'LT-90112', quantity: 450, expiry_date: in360Days },
      { item_id: itemMap['INS-404'], department_id: deptMap['Engenharia de Software'], batch_number: 'LT-88220', quantity: 82, expiry_date: in360Days },
      { item_id: itemMap['INS-402'], department_id: deptMap['Almoxarifado Central'], batch_number: 'LT-77102', quantity: 180, expiry_date: null }
    ];
    await restFetch('item_batches', { method: 'POST', body: defaultBatches });

    // 5. Transações
    const defaultTx = [
      { item_id: itemMap['INS-403'], department_id: deptMap['Operações & Infraestrutura'], transaction_type: 'BAIXA_PERDA_VENCIMENTO', quantity: 2, unit_cost: 120.00, reason: 'Galão apresentou fissura na válvula durante transporte; descarte preventivo.' },
      { item_id: itemMap['INS-401'], department_id: deptMap['Engenharia de Software'], transaction_type: 'SAIDA_CONSUMO', quantity: 4, unit_cost: 180.00, reason: 'Prototipagem de carcaças IoT para sensor de telemetria.' },
      { item_id: itemMap['INS-405'], department_id: deptMap['Almoxarifado Central'], transaction_type: 'ENTRADA', quantity: 200, unit_cost: 12.00, reason: 'Recebimento Fornecedor FastNet Brasil • NF-e 44921.' },
      { item_id: itemMap['INS-404'], department_id: deptMap['Engenharia de Software'], transaction_type: 'BAIXA_EXTRAVIO_SUMIÇO', quantity: 1, unit_cost: 142.50, reason: 'Queda durante empilhamento na gaveta modular 3B; carretel quebrado.' }
    ];
    await restFetch('inventory_transactions', { method: 'POST', body: defaultTx });

    console.log('Seeding concluído com sucesso!');
  }

  // Confirm data counts
  const finalDepts = await restFetch('departments', { query: 'select=*' });
  const finalItems = await restFetch('items', { query: 'select=*' });
  const finalBatches = await restFetch('item_batches', { query: 'select=*' });
  const finalTx = await restFetch('inventory_transactions', { query: 'select=*' });

  console.log('Status do Banco no Supabase:');
  console.log(`- Departamentos: ${finalDepts.length}`);
  console.log(`- Insumos: ${finalItems.length}`);
  console.log(`- Lotes: ${finalBatches.length}`);
  console.log(`- Transações: ${finalTx.length}`);
}

seed().catch(err => console.error('Erro na execução do seed:', err));
