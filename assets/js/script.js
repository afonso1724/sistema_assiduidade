/*
  script.js - Interactivity for Sistema de Assiduidade (Português)
  - Toggle sidebar (offcanvas handled by Bootstrap)
  - Active menu highlighting
  - Modal open/close helpers
  - Show success alerts on save
  - Fake dynamic status updates for badges
  - Animate progress bars on load
  - Auto-fill current date in inputs with class .auto-date
*/

document.addEventListener('DOMContentLoaded', function () {
  displayUserInfo();
  setActiveMenu();
  animateProgressBars();
  fillCurrentDate();
  bindLoginForm();
  bindSaveButtons();
  bindActionButtons();
  bindModalTriggers();
  bindLogoutButtons();
});

// Highlight active sidebar link using data-page attribute on body
function setActiveMenu() {
  try {
    const page = document.body.getAttribute('data-page');
    if (!page) return;
    document.querySelectorAll('.sidebar-desktop .nav-link, .offcanvas .nav-link').forEach(a => {
      if (a.textContent.trim().toLowerCase() === page.toLowerCase()) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  } catch (e) { console.warn(e); }
}

// Animate any progress bars with .progress-animated and data-percent
function animateProgressBars() {
  document.querySelectorAll('.progress-animated .progress-bar').forEach(bar => {
    const percent = bar.getAttribute('data-percent') || '0';
    // wait a tick for smooth CSS transition
    setTimeout(() => { bar.style.width = percent + '%'; bar.setAttribute('aria-valuenow', percent); }, 150);
  });
}

// Auto-fill inputs with the current date (YYYY-MM-DD) when .auto-date present
function fillCurrentDate() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,'0');
  const d = String(today.getDate()).padStart(2,'0');
  const iso = `${y}-${m}-${d}`;
  document.querySelectorAll('.auto-date').forEach(inp => { inp.value = iso; });
}

// Show Bootstrap alert on save buttons (class .btn-save)
function bindSaveButtons() {
  // Don't bind generic save on the login page (handled separately)
  const page = document.body.getAttribute('data-page') || '';
  if (page.toLowerCase() === 'entrar') return;

  document.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const msg = this.getAttribute('data-message') || 'Salvo com sucesso.';
      showAlert(msg, 'success');
    });
  });
}

// Show Toastify notification
function showAlert(message, type='success'){
  if (typeof Toastify === 'undefined') {
    // Fallback if Toastify not loaded
    console.log(`[${type}] ${message}`);
    return;
  }
  
  const bgColor = {
    'success': '#198754',
    'danger': '#dc3545',
    'warning': '#ffc107',
    'info': '#0d6efd'
  }[type] || '#0d6efd';

  const textColor = type === 'warning' ? '#212529' : '#fff';

  Toastify({
    text: message,
    duration: 4500,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor,
    className: "toast-custom",
    stopOnFocus: true,
    close: true,
    style: {
      color: textColor,
      fontWeight: '500'
    }
  }).showToast();
}

// Fake dynamic update: when action buttons are clicked in tables, update badge
function bindActionButtons(){
  document.querySelectorAll('.action-group button').forEach(btn => {
    btn.addEventListener('click', function(){
      const row = this.closest('tr');
      if(!row) return;
      const badgeCell = row.querySelector('td:nth-child(3)');
      if(!badgeCell) return;
      const text = this.textContent.trim().toLowerCase();
      if(text.includes('presente')){
        badgeCell.innerHTML = '<span class="badge badge-presente">Presente</span>';
        showAlert('Status atualizado para Presente', 'success');
      } else if(text.includes('falta')){
        badgeCell.innerHTML = '<span class="badge badge-falta">Falta</span>';
        showAlert('Status atualizado para Falta', 'warning');
      } else if(text.includes('justificado')){
        badgeCell.innerHTML = '<span class="badge badge-justificado">Justificado</span>';
        showAlert('Status atualizado para Justificado', 'info');
      }
    });
  });
}

// Modal triggers: add click listeners to elements with data-bs-toggle="modal" (Bootstrap handles showing)
function bindModalTriggers(){
  // Example: when modal form is submitted, close modal and show success
  document.querySelectorAll('.modal').forEach(modalEl => {
    modalEl.addEventListener('submit', function(e){
      // nothing by default; handled per form
    });
  });
  document.querySelectorAll('.modal .btn-save-modal').forEach(btn=>{
    btn.addEventListener('click', function(){
      const modal = this.closest('.modal');
      const bsModal = bootstrap.Modal.getInstance(modal);
      if(bsModal) bsModal.hide();
      showAlert('Operação realizada com sucesso.', 'success');
    });
  });
}

/*
  Validação e comportamento do formulário de login (apenas frontend).
  - Valida campos obrigatórios e formato de email
  - Mostra alertas de erro/sucesso com estilos profissionais
  - Simula redirecionamento para o painel correspondente ao perfil selecionado
*/
function bindLoginForm(){
  const page = document.body.getAttribute('data-page') || '';
  if (page.toLowerCase() !== 'entrar') return; // só executa na página de login

  const loginBtn = document.querySelector('.btn-save');
  const form = document.querySelector('main form');
  if (!loginBtn || !form) return;

  const inputEmail = form.querySelector('input[type="email"]');
  const inputPass = form.querySelector('input[type="password"]');
  const selectRole = form.querySelector('select');

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Remove validation on input focus
  [inputEmail, inputPass, selectRole].forEach(el => {
    if (!el) return;
    el.addEventListener('focus', function(){
      this.classList.remove('is-invalid');
    });
  });

  loginBtn.addEventListener('click', function(e){
    // Clear previous invalid states
    [inputEmail, inputPass, selectRole].forEach(i => { if(i) i.classList.remove('is-invalid'); });

    const email = inputEmail ? inputEmail.value.trim() : '';
    const pass = inputPass ? inputPass.value.trim() : '';
    const role = selectRole ? selectRole.value.trim() : '';

    let hasError = false;

    if (!email) {
      if (inputEmail) inputEmail.classList.add('is-invalid');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      if (inputEmail) inputEmail.classList.add('is-invalid');
      hasError = true;
    }

    if (!pass) {
      if (inputPass) inputPass.classList.add('is-invalid');
      hasError = true;
    }

    if (!role) {
      if (selectRole) selectRole.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) {
      showAlert('Verifique os campos marcados em vermelho.', 'danger');
      return;
    }

    // Disable button during redirect
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Aguarde...';

    // Store user session (localStorage persists; sessionStorage ends on browser close)
    const userName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('userRole', role);

    // Simulate authentication (frontend only)
    showAlert('✓ Login bem-sucedido. Redirecionando...', 'success');

    // Determine target based on role (case-insensitive)
    const r = role.toLowerCase();
    let target = 'login.html';
    if (r.includes('admin')) target = 'admin/dashboard.html';
    else if (r.includes('professor')) target = 'professor/dashboard.html';
    else if (r.includes('aluno')) target = 'aluno/dashboard.html';

    // Small delay to show alert, then redirect relative to current page
    setTimeout(() => {
      window.location.href = target;
    }, 1200);
  });
}

// Utility: format number (not used now but handy)
function formatNumber(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

/*
  Exibir informações do usuário logado no navbar e header.
  Verifica sessionStorage para usuário e papel.
*/
function displayUserInfo(){
  const isLoggedIn = sessionStorage.getItem('loggedIn');
  const userName = sessionStorage.getItem('userName') || 'Usuário';
  const userRole = sessionStorage.getItem('userRole') || '';
  
  // Se não está logado e não está na página de login, redireciona
  const page = document.body.getAttribute('data-page') || '';
  if (!isLoggedIn && page.toLowerCase() !== 'entrar') {
    // Redireciona apenas se souber que não está logado
    // (comentado para não redirecionar em teste estático)
    // window.location.href = '../login.html';
  }
  
  // Atualiza o texto do usuário e papel em headers/dropdowns
  const userElements = document.querySelectorAll('[data-user-display]');
  userElements.forEach(el => {
    if (el.tagName === 'STRONG' || el.classList.contains('user-name')) {
      el.textContent = userName;
    }
  });
  
  const roleElements = document.querySelectorAll('[data-role-display]');
  roleElements.forEach(el => {
    if (userRole) {
      const roleText = userRole.charAt(0).toUpperCase() + userRole.slice(1);
      el.textContent = roleText;
    }
  });
}

/*
  Bind logout buttons / links
  Todos elementos com data-logout ou classe .logout-btn disparam logout
*/
function bindLogoutButtons(){
  document.querySelectorAll('[data-logout], .logout-btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      
      // Confirm logout
      if (!confirm('Tem a certeza que deseja sair?')) return;
      
      // Clear session
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userRole');
      
      // Show toast and redirect
      showAlert('Até logo! Redirecionando...', 'info');
      setTimeout(() => {
        window.location.href = '../login.html';
      }, 1500);
    });
  });
}
