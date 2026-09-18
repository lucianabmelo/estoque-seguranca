const STORAGE_PRODUCTS = 'estocai_products_v3';
const STORAGE_AUDIT = 'estocai_audit_v3';

const CATEGORIES = ['Gabinete', 'Monitor', 'Mouse', 'Processador', 'Teclado'];

const DEFAULT_PRODUCTS = [
  { id: 'p1', categoria: 'Monitor', marca: 'LG', nome: 'UltraGear 24GN60R', sku: 'MON-LG-001', quantidade: 8, gtin: '7893299912345', unidade: 'UN', descricao: 'Monitor gamer de 24 polegadas com alta taxa de atualização.' },
  { id: 'p2', categoria: 'Mouse', marca: 'Logitech', nome: 'G203 Lightsync', sku: 'MOU-LOG-001', quantidade: 15, gtin: '9781234567897', unidade: 'UN', descricao: 'Mouse óptico USB com iluminação RGB e seis botões programáveis.' },
  { id: 'p3', categoria: 'Processador', marca: 'AMD', nome: 'Ryzen 5 5600G', sku: 'CPU-AMD-001', quantidade: 5, gtin: '7898765432106', unidade: 'UN', descricao: 'Processador de seis núcleos com gráficos integrados para desktops.' },
  { id: 'p4', categoria: 'Teclado', marca: 'Redragon', nome: 'Kumara K552', sku: 'TEC-RED-001', quantidade: 11, gtin: '7894561237894', unidade: 'UN', descricao: 'Teclado mecânico compacto com conexão USB.' }
];

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_PRODUCTS);
  if (!saved) {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
  }
  try { return JSON.parse(saved); } catch { return [...DEFAULT_PRODUCTS]; }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
}

function loadAudit() {
  try { return JSON.parse(localStorage.getItem(STORAGE_AUDIT) || '[]'); } catch { return []; }
}

function saveAudit(logs) {
  localStorage.setItem(STORAGE_AUDIT, JSON.stringify(logs));
}

function addAudit(action, product, details = '') {
  const logs = loadAudit();
  logs.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    user: sessionStorage.getItem('estocai_user') || 'func123',
    action,
    product: product ? `${product.sku} — ${product.nome}` : '-',
    details,
    timestamp: new Date().toISOString()
  });
  saveAudit(logs.slice(0, 200));
}

window.StockData = { CATEGORIES, loadProducts, saveProducts, loadAudit, saveAudit, addAudit };
