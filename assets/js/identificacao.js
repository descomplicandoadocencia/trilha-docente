// Sistema de Identificação e Persistência do Estudante
const IDENT_LS = {
  get() { try { const v = localStorage.getItem('acd_ident'); return v ? JSON.parse(v) : null; } catch(e) { return null; } },
  set(data) { try { localStorage.setItem('acd_ident', JSON.stringify(data)); } catch(e) {} }
};

function initIdentificacao() {
  const form = document.getElementById('formIdentificacao');
  const panel = document.getElementById('identificacao');
  const conteudo = document.getElementById('conteudo-pos-identificacao');
  
  // Verifica se já identificado
  const saved = IDENT_LS.get();
  if (saved && saved.nome && saved.email) {
    panel.style.display = 'none';
    conteudo.style.display = 'block';
    // Preenche badge no topo se existir
    updateUserBadge(saved);
  }
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      area: document.getElementById('area').value,
      rede: document.getElementById('rede').value,
      lgpd: document.getElementById('lgpd').checked,
      timestamp: new Date().toISOString()
    };
    
    if (!data.lgpd) {
      alert('É necessário aceitar os termos da LGPD para prosseguir.');
      return;
    }
    
    IDENT_LS.set(data);
    panel.style.display = 'none';
    conteudo.style.display = 'block';
    updateUserBadge(data);
    
    // Salva backup no servidor (simulado via mailto posterior)
    console.log('Identificação registrada:', data);
  });
}

function updateUserBadge(data) {
  // Atualiza ou cria badge do usuário no header
  let badge = document.getElementById('user-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'user-badge';
    badge.style.cssText = 'background:var(--gold);color:var(--deep);padding:4px 12px;border-radius:99px;font-weight:700;font-size:0.85rem;margin-left:10px;';
    const stats = document.querySelector('.topbar .stats');
    if (stats) stats.appendChild(badge);
  }
  badge.textContent = `👤 ${data.nome.split(' ')[0]} • ${data.rede.split(' ')[1] || data.rede}`;
  badge.title = `${data.nome} (${data.email}) — ${data.area} — ${data.rede}`;
}

// Auto-init quando DOM pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIdentificacao);
} else {
  initIdentificacao();
}
