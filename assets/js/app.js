/* Arquiteto da Cultura Digital — engine de gamificação + videoteca + Cornell Notes */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('acd_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('acd_' + k, JSON.stringify(v)); } catch (e) {} }
};
const MAP_PROGRESS_KEY = 'arquiteto_game_map_progress';
const ISLANDS = [
  { n: 1, nome: 'Ilha 1 · O Despertar dos Saberes', min: 0,   badge: '🌱', badgeNome: 'Navegante dos Saberes' },
  { n: 2, nome: 'Ilha 2 · O Cidadão Computacional', min: 130, badge: '🤖', badgeNome: 'Cidadão Computacional' },
  { n: 3, nome: 'Ilha 3 · Arquitetura de Experiências', min: 340, badge: '🧭', badgeNome: 'Arquiteto de Experiências' },
  { n: 4, nome: 'Ilha 4 · O Criador Cibercultural', min: 520, badge: '🤖✨', badgeNome: 'Criador Cibercultural' }
];
const TOTAL_XP = 790, FINAL_BADGE = { badge: '🏆', badgeNome: 'Arquiteto da Cultura Digital' };

function normalizeH5PDir(value) {
  if (!value) return '';
  let dir = String(value).trim();
  dir = dir.replace(/^\/+/, '').replace(/^\.\//, '').replace(/\/+$/, '');
  if (dir.startsWith('h5p/')) dir = dir.replace(/^h5p\//, '');
  return dir;
}

let VIDEOS = [];
async function loadVideos() {
  if (VIDEOS.length) return VIDEOS;
  const r = await fetch('data/videos.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('Não foi possível carregar o catálogo de vídeos.');
  VIDEOS = await r.json();
  return VIDEOS;
}

function syncMapProgressFromMain() {
  try {
    const completed = new Set();
    for (const video of getDone()) {
      const match = VIDEOS.find(v => v.id === video);
      if (match && match.ilha) completed.add(match.ilha);
    }
    const payload = {
      completed: [...completed].sort((a, b) => a - b),
      xp: Number(getXP() || 0)
    };
    localStorage.setItem(MAP_PROGRESS_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Não foi possível sincronizar o progresso do mapa.', e);
  }
}

/* ---------- Gamificação ---------- */
function getXP() { return LS.get('xp', 0); }
function getDone() { return LS.get('done', []); }
function isDone(id) { return getDone().includes(id); }
function completeVideo(id) {
  const done = getDone();
  if (done.includes(id)) return false;
  done.push(id); LS.set('done', done);
  const v = VIDEOS.find(x => x.id === id);
  LS.set('xp', getXP() + (v ? v.xp : 0));
  syncMapProgressFromMain();
  return true;
}
function uncompleteVideo(id) {
  const done = getDone().filter(x => x !== id);
  LS.set('done', done);
  const v = VIDEOS.find(x => x.id === id);
  LS.set('xp', Math.max(0, getXP() - (v ? v.xp : 0)));
  syncMapProgressFromMain();
}
function islandUnlocked(n) { return getXP() >= ISLANDS.find(i => i.n === n).min; }
function islandDone(n) {
  const vs = VIDEOS.filter(v => v.ilha === n);
  return vs.length > 0 && vs.every(v => isDone(v.id));
}
function renderStats() {
  const xp = getXP(), done = getDone();
  document.querySelectorAll('[data-xp]').forEach(e => e.textContent = xp);
  document.querySelectorAll('[data-hearts]').forEach(e => e.textContent = '❤️❤️❤️');
  document.querySelectorAll('.pbar span').forEach(e => e.style.width = Math.min(100, Math.round(xp / TOTAL_XP * 100)) + '%');
  document.querySelectorAll('[data-progress]').forEach(e => e.textContent = done.length + '/' + (VIDEOS.length || 0));
}

/* ---------- Página inicial ---------- */
async function initHome() {
  try {
    await loadVideos();
    const sel = LS.get('mentora', null);
    document.querySelectorAll('.mentor').forEach(m => {
      if (m.dataset.m === sel) { m.classList.add('sel'); m.setAttribute('aria-pressed', 'true'); }
      const pick = () => {
        LS.set('mentora', m.dataset.m);
        document.querySelectorAll('.mentor').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
        m.classList.add('sel');
        m.setAttribute('aria-pressed', 'true');
      };
      m.addEventListener('click', pick);
      m.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
      });
    });
    document.querySelectorAll('.isl').forEach(g => {
      const n = +g.dataset.island;
      const refresh = () => {
        g.classList.toggle('locked', !islandUnlocked(n));
        g.classList.toggle('done', islandDone(n));
        g.querySelector('.lockicon').textContent = islandUnlocked(n) ? (islandDone(n) ? '✅' : '🏝️') : '🔒';
      };
      refresh();
      const go = () => {
        if (!islandUnlocked(n)) { alert('Esta ilha ainda está bloqueada. Acumule ' + ISLANDS[n-1].min + ' XP concluindo as missões das ilhas anteriores!'); return; }
        location.href = 'videoteca.html?ilha=' + n;
      };
      g.addEventListener('click', go);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', ISLANDS[n-1].nome);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
    const bg = document.getElementById('badgeGallery');
    if (bg) {
      let html = '';
      ISLANDS.forEach(i => {
        const ok = islandDone(i.n);
        html += `<div class="badge ${ok ? '' : 'locked'}"><div class="ico">${i.badge}</div><h3>${i.badgeNome}</h3><p>${i.nome}</p></div>`;
      });
      const fin = getDone().length >= VIDEOS.length;
      html += `<div class="badge ${fin ? '' : 'locked'}"><div class="ico">${FINAL_BADGE.badge}</div><h3>${FINAL_BADGE.badgeNome}</h3><p>Concluir toda a trilha</p></div>`;
      bg.innerHTML = html;
    }
    renderStats();
  } catch (error) {
    console.error(error);
    const bg = document.getElementById('badgeGallery');
    if (bg) bg.innerHTML = '<div class="badge locked"><div class="ico">⚠️</div><h3>Erro ao carregar</h3><p>Não foi possível carregar o catálogo da trilha.</p></div>';
  }
}

/* ---------- Videoteca ---------- */
async function initVideoteca() {
  try {
    await loadVideos();
    const params = new URLSearchParams(location.search);
    let filtro = params.get('ilha') ? +params.get('ilha') : 0;
    const grid = document.getElementById('cards');
    function draw() {
      document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', +c.dataset.f === filtro));
      const list = VIDEOS.filter(v => filtro === 0 || v.ilha === filtro);
      grid.innerHTML = list.map(v => `
        <a class="vcard i${v.ilha}" href="aula.html?video=${v.id}">
          <div class="thumb">▶️</div>
          <div class="body">
            <h3>${v.titulo}</h3>
            <div class="meta">${v.fonte} · ⏱️ ${v.duracao}</div>
            <div class="tags"><span>${v.tag}</span><span>${v.ilha_nome}</span>${v.h5p ? '<span>🧪 H5P</span>' : ''}</div>
            <div class="foot">
              <span class="xpval">+${v.xp} XP</span>
              ${isDone(v.id) ? '<span class="done-flag">✅ Concluído</span>' : ''}
            </div>
          </div>
        </a>`).join('');
    }
    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { filtro = +c.dataset.f; draw(); }));
    draw();
    renderStats();
  } catch (error) {
    console.error(error);
    const grid = document.getElementById('cards');
    if (grid) grid.innerHTML = '<div class="empty-state">Não foi possível carregar a videoteca no momento.</div>';
  }
}

/* ---------- Sala de aula (vídeo + Cornell Notes) ---------- */
async function initAula() {
  try {
    await loadVideos();
    const id = new URLSearchParams(location.search).get('video') || VIDEOS[0].id;
    const v = VIDEOS.find(x => x.id === id) || VIDEOS[0];
    const idx = VIDEOS.indexOf(v);
    const prev = VIDEOS[idx - 1], next = VIDEOS[idx + 1];

    document.title = v.titulo + ' · Arquiteto da Cultura Digital';
    document.getElementById('vTitle').textContent = v.titulo;
    document.getElementById('vMeta').innerHTML = `Fonte: <strong>${v.fonte}</strong> · ⏱️ ${v.duracao} · <span class="tags"><span>🏷️ ${v.tag}</span></span> · ${v.ilha_nome} · <strong style="color:var(--gold)">+${v.xp} XP</strong>`;
    document.getElementById('vFrame').src = v.embed + '?rel=0';
    document.getElementById('vFrame').title = v.titulo;

    const hb = document.getElementById('h5pBlock');
    if (v.h5p) {
      const h5pDir = normalizeH5PDir(v.h5p);
      hb.style.display = 'block';
      hb.innerHTML = `<h2 style="font-size:1.05rem;margin-bottom:8px">🧪 Atividade interativa H5P</h2>
        <iframe src="h5p/player.html?dir=${encodeURIComponent(h5pDir)}" title="Atividade H5P" loading="lazy" allowfullscreen="allowfullscreen"></iframe>`;
    }

    const notes = LS.get('notes_' + v.id, { p: '', a: '', s: '' });
    const P = document.getElementById('cPistas'), A = document.getElementById('cAnot'), S = document.getElementById('cSint');
    P.value = notes.p; A.value = notes.a; S.value = notes.s;
    let t;
    const save = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        LS.set('notes_' + v.id, { p: P.value, a: A.value, s: S.value });
        document.getElementById('autosave').textContent = '✔ Salvo automaticamente às ' + new Date().toLocaleTimeString('pt-BR');
      }, 600);
    };
    [P, A, S].forEach(el => el.addEventListener('input', save));

    document.getElementById('btnLimpar').addEventListener('click', () => {
      if (!confirm('Limpar todas as anotações Cornell deste vídeo?')) return;
      P.value = A.value = S.value = '';
      LS.set('notes_' + v.id, { p: '', a: '', s: '' });
      document.getElementById('autosave').textContent = 'Anotações limpas.';
    });

    document.getElementById('btnPDF').addEventListener('click', () => {
      const d = new Date().toLocaleDateString('pt-BR');
      const html = `<div style="font-family:Arial,sans-serif;padding:24px;color:#233038">
        <h1 style="font-size:18px;color:#0f5257;margin-bottom:2px">📝 Cornell Notes — ${v.titulo}</h1>
        <p style="font-size:11px;color:#666;margin-bottom:14px">Arquiteto da Cultura Digital · ${v.ilha_nome} · Fonte: ${v.fonte} · ${d}</p>
        <h2 style="font-size:13px;color:#1d7a80;border-bottom:2px solid #c9a24b;padding-bottom:3px">🔑 Pistas / Palavras-chave</h2>
        <p style="font-size:12px;white-space:pre-wrap;min-height:60px">${(P.value || '—').replace(/</g,'&lt;')}</p>
        <h2 style="font-size:13px;color:#1d7a80;border-bottom:2px solid #c9a24b;padding-bottom:3px">📒 Anotações</h2>
        <p style="font-size:12px;white-space:pre-wrap;min-height:120px">${(A.value || '—').replace(/</g,'&lt;')}</p>
        <h2 style="font-size:13px;color:#1d7a80;border-bottom:2px solid #c9a24b;padding-bottom:3px">💡 Síntese</h2>
        <p style="font-size:12px;white-space:pre-wrap;min-height:50px">${(S.value || '—').replace(/</g,'&lt;')}</p></div>`;
      const holder = document.createElement('div');
      holder.innerHTML = html;
      document.body.appendChild(holder);
      html2pdf().set({ margin: 10, filename: 'cornell-' + v.id + '.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } })
        .from(holder).save().then(() => holder.remove());
    });

    const btnC = document.getElementById('btnConcluir');
    const paint = () => {
      const d = isDone(v.id);
      btnC.classList.toggle('did', d);
      btnC.textContent = d ? `✅ Missão concluída (+${v.xp} XP)` : `✔ Marcar como concluído (+${v.xp} XP)`;
    };
    btnC.addEventListener('click', () => {
      if (isDone(v.id)) { uncompleteVideo(v.id); } else { completeVideo(v.id); }
      paint(); renderStats();
    });
    paint();

    const nf = document.getElementById('navfoot');
    nf.innerHTML = `
      ${prev ? `<a class="btn ghost sm" href="aula.html?video=${prev.id}">← Anterior</a>` : '<span></span>'}
      <div class="next-info">${next ? 'A seguir: <strong>' + next.titulo + '</strong>' : '🏆 Última missão da trilha!'}</div>
      ${next ? `<a class="btn sm" href="aula.html?video=${next.id}">Próximo →</a>` : '<a class="btn sm" href="final.html">🏆 Ir à tela final · Certificado</a>'}`;
    renderStats();
  } catch (error) {
    console.error(error);
    const title = document.getElementById('vTitle');
    if (title) title.textContent = 'Não foi possível carregar esta aula.';
  }
}
