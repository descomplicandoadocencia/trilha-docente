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

/* ---------- Tela final: score, badges, autoavaliação, certificado ---------- */
const LIKERT_PERGUNTAS = {
  q1: 'Planejar aulas com tecnologia de forma intencional',
  q2: 'Aplicar os 3 eixos da BNCC Computação',
  q3: 'Desenhar rotação por estações equilibrada',
  q4: 'Usar IAG com verificação ética',
  q5: 'Aplicar o OAD do Desafio Final com meus alunos'
};

/* Persistência da autoavaliação Likert — chave localStorage 'acd_likert'
   (o helper LS já prefixa 'acd_', então LS.set('likert', ...) grava 'acd_likert').
   LGPD: sem PII aqui — a identificação fica apenas na chave 'acd_ident'. */
function saveLikert(field, value) {
  const l = LS.get('likert', {});
  l[field] = Number(value);
  LS.set('likert', l);
  return l;
}
function restoreLikert() {
  return LS.get('likert', {});
}

async function initFinal() {
  try {
    await loadVideos();

    const ident = LS.get('ident', null); // mesma chave 'acd_ident' escrita na tela inicial
    if (!ident && confirm('Você ainda não se identificou. Ir à tela inicial para preencher seus dados?')) {
      location.href = 'index.html';
      return;
    }

    const xp = getXP(), done = getDone();
    const totalMissoes = VIDEOS.length || 19;
    const xpFeito = VIDEOS.filter(v => done.includes(v.id)).reduce((s, v) => s + (Number(v.xp) || 0), 0);

    /* 1–3) Score hero (aria-live="polite" já presente no .score-hero de final.html) */
    const elXP = document.getElementById('scoreXP');
    const elDet = document.getElementById('scoreDetalhe');
    const elNiv = document.getElementById('scoreNivel');
    if (elXP) elXP.textContent = xpFeito + ' XP';
    if (elDet) elDet.textContent = 'Você completou ' + done.length + ' de ' + totalMissoes + ' atividades · ' + Math.min(100, Math.round(xpFeito / TOTAL_XP * 100)) + '% da trilha';

    /* 4) Nível — Bronze <200 · Prata 200–499 · Ouro ≥500 */
    const nivel = xpFeito >= 500 ? '🏆 Ouro — Arquiteto da Cultura Digital'
      : xpFeito >= 200 ? '🥈 Prata — Docência em transformação'
      : '🥉 Bronze — Jornada em andamento';
    if (elNiv) elNiv.textContent = 'Nível alcançado: ' + nivel;

    /* 5) Badges: 4 ilhas + final, com texto acessível (não só emoji) */
    const fb = document.getElementById('finalBadges');
    if (fb) {
      let html = '';
      ISLANDS.forEach(i => {
        const totais = VIDEOS.filter(v => v.ilha === i.n);
        const feitos = totais.filter(v => done.includes(v.id)).length;
        const ok = totais.length > 0 && feitos === totais.length;
        html += '<div class="badge ' + (ok ? '' : 'locked') + '" role="listitem">' +
          '<div class="ico" aria-hidden="true">' + i.badge + '</div>' +
          '<h3>' + i.badgeNome + (ok ? ' — conquistado' : '') + '</h3>' +
          '<p>' + i.nome + ' · ' + feitos + '/' + totais.length + ' missões concluídas</p></div>';
      });
      const fin = totalMissoes > 0 && done.length >= totalMissoes;
      html += '<div class="badge ' + (fin ? '' : 'locked') + '" role="listitem">' +
        '<div class="ico" aria-hidden="true">' + FINAL_BADGE.badge + '</div>' +
        '<h3>' + FINAL_BADGE.badgeNome + (fin ? ' — conquistado' : '') + '</h3>' +
        '<p>Concluir toda a trilha (' + done.length + '/' + totalMissoes + ' atividades)</p></div>';
      fb.innerHTML = html;
    }

    /* 6) Autoavaliação Likert 1–5 — persistida em localStorage 'acd_likert' */
    const likert = restoreLikert();
    document.querySelectorAll('.likert .opts').forEach(box => {
      const name = box.dataset.q;
      const salvo = likert[name];
      box.innerHTML = [1, 2, 3, 4, 5].map(v =>
        '<label><input type="radio" name="' + name + '" value="' + v + '"' + (Number(salvo) === v ? ' checked' : '') + '> ' + v + '</label>').join('');
    });
    const pintaIconesLikert = () => {
      document.querySelectorAll('.likert .q').forEach(q => {
        const marcado = q.querySelector('input:checked');
        let icon = q.querySelector('.likert-icone');
        if (!icon) {
          icon = document.createElement('span');
          icon.className = 'likert-icone';
          q.querySelector('.opts').insertAdjacentElement('afterend', icon);
        }
        icon.setAttribute('aria-live', 'polite');
        icon.textContent = marcado ? '✅ Respondido: ' + marcado.value + '/5' : '⬜ Sem resposta';
      });
    };
    pintaIconesLikert();

    /* 7) mailto — assunto/corpo com encodeURIComponent no botão #sendMailBtn */
    const btnMail = document.getElementById('sendMailBtn');
    function montarMailto() {
      if (!btnMail) return;
      const l = restoreLikert();
      const nome = ident ? ident.nome : 'Participante';
      const linhas = Object.keys(LIKERT_PERGUNTAS).map(q =>
        '• ' + LIKERT_PERGUNTAS[q] + ': ' + (l[q] ? l[q] + '/5' : '—')).join('\n');
      const assunto = encodeURIComponent('Certificado — Arquiteto da Cultura Digital — ' + nome);
      const corpo = encodeURIComponent(
        'Olá, equipe Descomplicando a Docência!\n\n' +
        'Segue em anexo o meu certificado e autoavaliação da trilha "Arquiteto da Cultura Digital".\n\n' +
        'Nome: ' + (ident ? ident.nome : '—') + '\n' +
        'E-mail institucional: ' + (ident ? ident.email : '—') + '\n' +
        'Área de atuação: ' + (ident ? ident.area : '—') + '\n' +
        'Rede de ensino: ' + (ident ? ident.rede : '—') + '\n' +
        'XP final: ' + xpFeito + '/' + TOTAL_XP + ' · Missões: ' + done.length + '/' + totalMissoes + '\n' +
        'Nível alcançado: ' + nivel + '\n\n' +
        'Autoavaliação (1–5):\n' + linhas + '\n\n' +
        'IMPORTANTE: anexe a este e-mail o arquivo "certificado-arquiteto-cultura-digital.pdf" gerado pelo botão "1. Gerar meu PDF".\n\n' +
        'Autorizo o tratamento destes dados para fins educacionais e de pesquisa, conforme LGPD (Lei 13.709/2018).\n\n' +
        'Atenciosamente,\n' + nome);
      btnMail.href = 'mailto:descomplicandoadocencia@gmail.com?subject=' + assunto + '&body=' + corpo;
    }
    montarMailto();

    const formAuto = document.getElementById('formAuto');
    if (formAuto) {
      formAuto.addEventListener('change', (e) => {
        if (!e.target.matches('input[type="radio"]')) return;
        saveLikert(e.target.name, e.target.value); // salva imediatamente em acd_likert
        const fs = e.target.closest('fieldset');
        if (fs) fs.removeAttribute('aria-invalid');
        pintaIconesLikert();
        montarMailto();
      });
    }

    /* Resumo da identificação */
    const resumo = document.getElementById('identResumo');
    if (resumo) resumo.innerHTML = ident
      ? '<strong>' + ident.nome + '</strong><br>📧 ' + ident.email + '<br>📚 ' + ident.area + '<br>🏫 Rede: ' + ident.rede +
        '<br>✅ LGPD aceito em ' + (ident.timestamp ? new Date(ident.timestamp).toLocaleDateString('pt-BR') : '—')
      : '⚠️ Não identificado(a). <a href="index.html">Preencher agora</a>.';

    /* PDF — certificado + autoavaliação (html2pdf.js carregado no <head> de final.html) */
    const btnPDF = document.getElementById('btnGerar');
    if (btnPDF) btnPDF.addEventListener('click', () => {
      const l = restoreLikert();
      /* validação: se algum Likert estiver em branco, marca aria-invalid e foca o 1º em falta */
      document.querySelectorAll('#formAuto fieldset').forEach(fs => fs.removeAttribute('aria-invalid'));
      const faltando = Object.keys(LIKERT_PERGUNTAS).filter(q => !l[q]);
      if (faltando.length > 0) {
        faltando.forEach(q => {
          const fs = document.querySelector('#formAuto fieldset[data-q="' + q + '"]');
          if (fs) fs.setAttribute('aria-invalid', 'true');
        });
        const primeiro = document.querySelector('#formAuto fieldset[aria-invalid="true"] input');
        if (primeiro) primeiro.focus();
        const st = document.getElementById('pdfStatus');
        if (st) st.textContent = '⚠️ Responda as ' + faltando.length + ' questão(ões) marcadas antes de gerar o PDF.';
        return;
      }
      const d = new Date().toLocaleDateString('pt-BR');
      const linhas = Object.keys(LIKERT_PERGUNTAS).map(q =>
        '<tr><td style="padding:6px;border:1px solid #ccc">' + LIKERT_PERGUNTAS[q] +
        '</td><td style="padding:6px;border:1px solid #ccc;text-align:center"><strong>' + (l[q] || '—') + '</strong>/5</td></tr>').join('');
      const html = '<div style="font-family:Arial,sans-serif;padding:26px;color:#233038">' +
        '<h1 style="font-size:20px;color:#0f5257;margin:0">🏆 Arquiteto da Cultura Digital</h1>' +
        '<p style="font-size:12px;color:#666;margin:4px 0 16px">Certificado de jornada + autoavaliação · Trilha Gamificada de Capacitação Docente · ' + d + '</p>' +
        '<h2 style="font-size:14px;color:#1d7a80;border-bottom:2px solid #c9a24b;padding-bottom:4px">Identificação</h2>' +
        '<p style="font-size:12px;line-height:1.7"><strong>' + (ident ? ident.nome : '—') + '</strong><br>E-mail: ' + (ident ? ident.email : '—') + '<br>Área: ' + (ident ? ident.area : '—') + '<br>Rede: ' + (ident ? ident.rede : '—') + '</p>' +
        '<h2 style="font-size:14px;color:#1d7a80;border-bottom:2px solid #c9a24b;padding-bottom:4px">Resultado</h2>' +
        '<p style="font-size:12px">XP: <strong>' + xpFeito + '/' + TOTAL_XP + '</strong> · Missões: <strong>' + done.length + '/' + totalMissoes + '</strong> · Nível: <strong>' + nivel + '</strong></p>' +
        '<h2 style="font-size:14px;color:#1d7a80;border-bottom:2px solid #c9a24b;padding-bottom:4px">Autoavaliação (1–5)</h2>' +
        '<table style="border-collapse:collapse;width:100%;font-size:11px">' + linhas + '</table>' +
        '<p style="font-size:10px;color:#666;margin-top:16px">Documento gerado pelo próprio participante. Dados tratados conforme LGPD (Lei 13.709/2018) exclusivamente para fins educacionais e de pesquisa do projeto Descomplicando a Docência.</p></div>';
      const holder = document.createElement('div');
      holder.innerHTML = html;
      document.body.appendChild(holder);
      html2pdf().set({ margin: 10, filename: 'certificado-arquiteto-cultura-digital.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } })
        .from(holder).save()
        .then(() => { holder.remove(); const st = document.getElementById('pdfStatus'); if (st) st.textContent = '✔ PDF gerado e baixado. Agora clique em "2. Enviar".'; });
    });

    renderStats();
  } catch (error) {
    console.error(error);
    const elXP = document.getElementById('scoreXP');
    if (elXP) elXP.textContent = 'Erro ao carregar o resultado.';
  }
}
