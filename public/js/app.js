let products = [];
let editingId = null;
let pendingDeleteId = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add('hidden'), 2600);
}

function showPage(pageId) {
  $$('.page').forEach(page => page.classList.toggle('hidden', page.id !== pageId));
  $$('[data-page]').forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageId));
  if (pageId === 'dashboard') renderDashboard();
  if (pageId === 'produtos') renderProducts();
  if (pageId === 'auditoria') renderAudit();
  if (pageId === 'cadastro' && editingId === null) resetForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initSelects() {
  $('#categoria').innerHTML = '<option value="">Selecione</option>' + StockData.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  $('#category-filter').innerHTML = '<option value="">Todas as categorias</option>' + StockData.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderDashboard() {
  products = StockData.loadProducts();
  const totalQty = products.reduce((sum, p) => sum + Number(p.quantidade), 0);
  const low = products.filter(p => Number(p.quantidade) <= 5).length;
  $('#metrics').innerHTML = `
    <article class="metric"><span>PRODUTOS CADASTRADOS</span><strong>${products.length}</strong></article>
    <article class="metric"><span>UNIDADES EM ESTOQUE</span><strong>${totalQty}</strong></article>
    <article class="metric"><span>ESTOQUE BAIXO (≤ 5)</span><strong>${low}</strong></article>`;
  $('#recent-table').innerHTML = productsTable(products.slice(0, 4), false);
}

function productsTable(list, withActions = true) {
  if (!list.length) return '<div class="p-8 text-center text-slate-500">Nenhum produto encontrado.</div>';
  return `<table><thead><tr>
    <th>Categoria</th><th>Marca</th><th>Nome</th><th>SKU</th><th>Quantidade</th>${withActions ? '<th>Ações</th>' : ''}
  </tr></thead><tbody>${list.map(p => `<tr>
    <td><span class="tag">${esc(p.categoria)}</span></td>
    <td>${esc(p.marca)}</td>
    <td><strong>${esc(p.nome)}</strong></td>
    <td>${esc(p.sku)}</td>
    <td class="${Number(p.quantidade) <= 5 ? 'qty-low' : 'qty-ok'}">${Number(p.quantidade)}</td>
    ${withActions ? `<td class="actions"><button class="action-btn" data-edit="${p.id}">Editar</button><button class="action-btn action-delete" data-delete="${p.id}">Excluir</button></td>` : ''}
  </tr>`).join('')}</tbody></table>`;
}

function renderProducts() {
  products = StockData.loadProducts();
  const search = $('#search').value.trim().toLowerCase();
  const category = $('#category-filter').value;
  const filtered = products.filter(p => {
    const searchable = `${p.categoria} ${p.marca} ${p.nome} ${p.sku}`.toLowerCase();
    return (!search || searchable.includes(search)) && (!category || p.categoria === category);
  });
  $('#results-count').textContent = `${filtered.length} produto(s) encontrado(s)`;
  $('#products-table').innerHTML = productsTable(filtered, true);
}

function resetForm() {
  editingId = null;
  $('#product-form').reset();
  $('#descricao-count').textContent = '0';
  $('#form-title').textContent = 'Cadastrar produto';
  $('#form-subtitle').textContent = 'Preencha os dados obrigatórios do item.';
  $('#save-product').textContent = 'Cadastrar produto';
  $('#form-error').textContent = '';
}

function editProduct(id) {
  const p = StockData.loadProducts().find(item => item.id === id);
  if (!p) return;
  editingId = id;
  $('#categoria').value = p.categoria;
  $('#marca').value = p.marca;
  $('#nome').value = p.nome;
  $('#sku').value = p.sku;
  $('#quantidade').value = p.quantidade;
  $('#gtin').value = p.gtin;
  $('#unidade').value = p.unidade;
  $('#descricao').value = p.descricao;
  $('#descricao-count').textContent = p.descricao.length;
  $('#form-title').textContent = 'Editar produto';
  $('#form-subtitle').textContent = 'Atualize os dados necessários.';
  $('#save-product').textContent = 'Salvar alterações';
  showPage('cadastro');
}

function validateProductForm(form) {
  const error = $('#form-error');
  error.textContent = '';
  if (!form.checkValidity()) {
    const invalid = form.querySelector(':invalid');
    invalid?.focus();
    error.textContent = 'Revise os campos obrigatórios e os formatos informados.';
    return false;
  }
  const sku = $('#sku').value.trim().toUpperCase();
  const gtin = $('#gtin').value.trim();
  const duplicateSku = StockData.loadProducts().some(p => p.sku.toUpperCase() === sku && p.id !== editingId);
  const duplicateGtin = StockData.loadProducts().some(p => p.gtin === gtin && p.id !== editingId);
  if (duplicateSku) { error.textContent = 'Já existe um produto com este SKU.'; $('#sku').focus(); return false; }
  if (duplicateGtin) { error.textContent = 'Já existe um produto com este GTIN/EAN.'; $('#gtin').focus(); return false; }
  return true;
}

async function handleProductSubmit(event) {

  event.preventDefault();

  const form = event.currentTarget;

  // Primeiro valida no frontend
  if (!validateProductForm(form)) {
    return;
  }

  const btn = $('#save-product');

  btn.disabled = true;
  btn.textContent = editingId
    ? 'Salvando...'
    : 'Cadastrando...';

  const item = {
    id:
      editingId ||
      (
        crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now())
      ),

    categoria: $('#categoria').value,
    marca: $('#marca').value.trim(),
    nome: $('#nome').value.trim(),
    sku: $('#sku').value.trim().toUpperCase(),
    quantidade: Number($('#quantidade').value),
    gtin: $('#gtin').value.trim(),
    unidade: $('#unidade').value,
    descricao: $('#descricao').value.trim()
  };

  try {

    // Agora o backend também valida o produto
    const response = await fetch(
      '/api/produtos/validar',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(item)
      }
    );

    const data = await response.json();

    // Se o backend rejeitar
    if (!response.ok) {

      $('#form-error').textContent =
        data.erro ||
        'O servidor rejeitou os dados do produto.';

      return;
    }

    // Só salva depois da aprovação do backend
    let current = StockData.loadProducts();

    if (editingId) {

      const old =
        current.find(
          p => p.id === editingId
        );

      current =
        current.map(
          p =>
            p.id === editingId
              ? item
              : p
        );

      StockData.addAudit(
        'ALTERAÇÃO',
        item,
        old
          ? `Quantidade: ${old.quantidade} → ${item.quantidade}`
          : 'Dados atualizados'
      );

      toast(
        'Produto atualizado com sucesso!'
      );

    } else {

      current.unshift(item);

      StockData.addAudit(
        'CADASTRO',
        item,
        `Quantidade inicial: ${item.quantidade}`
      );

      toast(
        'Produto cadastrado com sucesso!'
      );
    }

    StockData.saveProducts(current);

    editingId = null;

    showPage('produtos');

  } catch (erro) {

    console.error(erro);

    $('#form-error').textContent =
      'Não foi possível validar o produto no servidor.';

  } finally {

    btn.disabled = false;
    btn.textContent =
      'Cadastrar produto';

  }
}

function requestDelete(id) {
  const p = StockData.loadProducts().find(item => item.id === id);
  if (!p) return;
  pendingDeleteId = id;
  $('#delete-name').textContent = `${p.sku} — ${p.nome}`;
  $('#delete-dialog').showModal();
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  const btn = $('#confirm-delete');
  btn.disabled = true;
  btn.textContent = 'Excluindo...';
  setTimeout(() => {
    const current = StockData.loadProducts();
    const removed = current.find(p => p.id === pendingDeleteId);
    StockData.saveProducts(current.filter(p => p.id !== pendingDeleteId));
    if (removed) StockData.addAudit('EXCLUSÃO', removed, `Quantidade removida: ${removed.quantidade}`);
    pendingDeleteId = null;
    btn.disabled = false;
    btn.textContent = 'Excluir produto';
    renderProducts();
    toast('Produto excluído e ação registrada.');
  }, 350);
}

function renderAudit() {
  const logs = StockData.loadAudit();
  if (!logs.length) {
    $('#audit-table').innerHTML = '<div class="p-8 text-center text-slate-500">Nenhuma movimentação registrada ainda.</div>';
    return;
  }
  $('#audit-table').innerHTML = `<table><thead><tr><th>Data e hora</th><th>Usuário</th><th>Ação</th><th>Produto</th><th>Detalhes</th></tr></thead><tbody>${logs.map(log => {
    const actionClass = log.action === 'CADASTRO' ? 'audit-create' : log.action === 'ALTERAÇÃO' ? 'audit-update' : 'audit-delete';
    return `<tr><td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td><td>${esc(log.user)}</td><td class="audit-action ${actionClass}">${esc(log.action)}</td><td>${esc(log.product)}</td><td>${esc(log.details)}</td></tr>`;
  }).join('')}</tbody></table>`;
}

async function handleLogin(event) {

  event.preventDefault();

  const form = event.currentTarget;
  const error = $('#login-error');

  error.textContent = '';

  // Validação do próprio formulário HTML
  if (!form.checkValidity()) {

    form.querySelector(':invalid')?.focus();

    error.textContent =
      'Favor inserir o e-mail e a senha no formato solicitado.';

    return;
  }

  const btn = $('#login-button');

  btn.disabled = true;
  btn.textContent = 'Validando...';

  const user = $('#usuario').value.trim().toLowerCase();
  const pass = $('#senha').value;

  try {

    const response = await fetch('/api/auth/login', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        email: user,
        senha: pass
      })

    });

    const data = await response.json();

    if (!response.ok) {

      error.textContent =
        data.erro || 'E-mail ou senha inválidos.';

      return;
    }

    // Mantemos o sessionStorage apenas
    // para controlar a interface do usuário
    Auth.setAuthenticated(data.usuario);

    $('#current-user').textContent = data.usuario;

    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');

    $('#senha').value = '';

    showPage('dashboard');

    Auth.resetInactivityTimer();

    toast('Login realizado com sucesso!');

  } catch (erro) {

    console.error(erro);

    error.textContent =
      'Não foi possível conectar ao servidor.';

  } finally {

    btn.disabled = false;
    btn.textContent = 'Entrar →';

  }
}

async function logoutNow() {

  try {

    await fetch('/api/auth/logout', {
      method: 'POST'
    });

  } catch (erro) {

    console.error(
      'Erro ao encerrar sessão no servidor:',
      erro
    );

  }

  Auth.clearAuthenticated();

  $('#app').classList.add('hidden');
  $('#login').classList.remove('hidden');

  $('#login-form').reset();

  toast('Sessão encerrada.');
}

function bindEvents() {
  $('#login-form').addEventListener('submit', handleLogin);
  $('#product-form').addEventListener('submit', handleProductSubmit);
  $('#search').addEventListener('input', renderProducts);
  $('#category-filter').addEventListener('change', renderProducts);

  $('#toggle-password').addEventListener('click', () => {
    const input = $('#senha');
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    $('#toggle-password').textContent = showing ? 'Mostrar' : 'Ocultar';
    $('#toggle-password').setAttribute('aria-label', showing ? 'Mostrar senha' : 'Ocultar senha');
  });

  $('#sku').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 20);
  });
  $('#gtin').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 14);
  });
  $('#quantidade').addEventListener('input', (e) => {
    if (e.target.value !== '') e.target.value = Math.max(0, Math.min(99999, Number(e.target.value))).toString();
  });
  $('#descricao').addEventListener('input', e => $('#descricao-count').textContent = e.target.value.length);

  document.addEventListener('click', e => {
    const pageButton = e.target.closest('[data-page]');
    if (pageButton) showPage(pageButton.dataset.page);
    const edit = e.target.closest('[data-edit]');
    if (edit) editProduct(edit.dataset.edit);
    const del = e.target.closest('[data-delete]');
    if (del) requestDelete(del.dataset.delete);
  });

  $('#delete-dialog').addEventListener('close', () => {
    if ($('#delete-dialog').returnValue === 'confirm') confirmDelete();
    else pendingDeleteId = null;
  });

  $('#logout').addEventListener('click', () => $('#logout-dialog').showModal());
  $('#logout-dialog').addEventListener('close', () => {
    if ($('#logout-dialog').returnValue === 'confirm') logoutNow();
  });

  $('#clear-logs').addEventListener('click', () => {
  if (confirm('Deseja realmente apagar os logs de auditoria desta demonstração?')) {
    StockData.saveAudit([]);
    renderAudit();
    toast('Logs locais apagados.');
  }
});

/* EVENTO DO BOTÃO DE DESBLOQUEIO */
$('#unlock-button').addEventListener('click', () => {
  desbloquearSistema();
});

/* DESBLOQUEAR PRESSIONANDO ENTER */
$('#unlock-password').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    desbloquearSistema();
  }
});

} // fechamento da função bindEvents
            
function init() {
  products = StockData.loadProducts();
  initSelects();
  bindEvents();
  Auth.bindActivityMonitor();
  if (Auth.isAuthenticated()) {
    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');
    $('#current-user').textContent = sessionStorage.getItem('estocai_user') || 'func01@gmail.com';
    showPage('dashboard');
    Auth.resetInactivityTimer();
  }
}
/* ============================================
   BLOQUEIO AUTOMÁTICO DE SEGURANÇA
============================================ */

let sistemaBloqueado = false;

function bloquearSistema() {

  // Só bloqueia se existir funcionário logado
  if (!Auth.isAuthenticated()) return;

  // Evita executar o bloqueio duas vezes
  if (sistemaBloqueado) return;

  sistemaBloqueado = true;

  const telaBloqueio = $('#security-lock');
  const campoSenha = $('#unlock-password');
  const erro = $('#unlock-error');
  const usuario = $('#lock-user');

  usuario.textContent =
    sessionStorage.getItem('estocai_user') ||
    'func01@gmail.com';

  campoSenha.value = '';
  erro.textContent = '';

  telaBloqueio.classList.remove('hidden');
}


async function desbloquearSistema() {

  const campoSenha = $('#unlock-password');
  const erro = $('#unlock-error');

  erro.textContent = '';

  const senha = campoSenha.value;

  if (!senha) {

    erro.textContent =
      'Digite a senha para continuar.';

    campoSenha.focus();

    return;
  }

  try {

    const response = await fetch('/api/auth/unlock', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        senha: senha
      })

    });

    const data = await response.json();

    if (!response.ok) {

      erro.textContent =
        data.erro || 'Senha incorreta.';

      campoSenha.value = '';
      campoSenha.focus();

      return;
    }

    sistemaBloqueado = false;

    $('#security-lock').classList.add('hidden');

    campoSenha.value = '';
    erro.textContent = '';

    Auth.resetInactivityTimer();

  } catch (erroServidor) {

    console.error(erroServidor);

    erro.textContent =
      'Não foi possível conectar ao servidor.';

  }
}


/* Detecta quando o funcionário troca de aba
   ou minimiza o navegador */

document.addEventListener('visibilitychange', () => {

  if (
    document.visibilityState === 'hidden' &&
    Auth.isAuthenticated()
  ) {

    bloquearSistema();

  }

});
document.addEventListener('DOMContentLoaded', init);


