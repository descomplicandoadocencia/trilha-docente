/* player-core.js — helper compartilhado dos players H5P por ilha
   Arquiteto da Cultura Digital — descomplicandoadocencia.com.br */
(function (global) {
  'use strict';

  var CDN = 'https://cdn.jsdelivr.net/npm/h5p-standalone@3.6.3/dist';

  /* Normaliza o diretório do pacote H5P:
     aceita 'ilha1-interactive-video', '/h5p/ilha1-interactive-video/',
     '?dir=...' e devolve sempre 'h5p/<slug>' relativo à raiz do site. */
  function normalizeH5PDir(value) {
    var dir = String(value || '').trim()
      .replace(/^\/+/, '')
      .replace(/^h5p\//, '')
      .replace(/\/+$/, '');
    if (!dir) dir = 'ilha1-interactive-video';
    return 'h5p/' + dir;
  }

  /* Caminho absoluto a partir da raiz do site, independente de a página
     estar em / ou em /h5p/. */
  function siteRoot() {
    var inH5pDir = /\/h5p\/[^/]*\.html$/.test(window.location.pathname);
    return inH5pDir ? '../' : '';
  }

  /* cfg = { dir, containerId, titulo, proximaIlhaUrl, proximaIlhaRotulo } */
  function initPlayer(cfg) {
    var el = document.getElementById(cfg.containerId || 'h5p-container');
    if (!el) return;

    var options = {
      h5pJsonPath: siteRoot() + normalizeH5PDir(cfg.dir),
      frameJs: CDN + '/frame.bundle.js',
      frameCss: CDN + '/styles/h5p.css'
    };

    new H5PStandalone.H5P(el, options).catch(function (err) {
      el.innerHTML = '<p role="alert" style="color:#fff;padding:20px">' +
        'Erro ao carregar o pacote H5P: ' + err + '</p>';
    });

    /* Barra de conclusão: link para a próxima ilha (navega o parent,
       pois o player normalmente roda dentro de um iframe da aula). */
    if (cfg.proximaIlhaUrl) {
      var bar = document.createElement('div');
      bar.className = 'h5p-next-bar';
      bar.setAttribute('style',
        'max-width:960px;margin:16px auto;padding:12px 16px;' +
        'background:#123;border-radius:10px;text-align:center');
      var a = document.createElement('a');
      a.href = cfg.proximaIlhaUrl;
      a.target = '_parent'; /* sai do iframe: parent.location */
      a.rel = 'noopener';
      a.textContent = cfg.proximaIlhaRotulo || 'Ir para a próxima ilha →';
      a.setAttribute('style',
        'display:inline-block;background:#d4af37;color:#0b1f22;' +
        'padding:10px 22px;border-radius:8px;font-weight:700;' +
        'text-decoration:none');
      bar.appendChild(a);
      el.parentNode.insertBefore(bar, el.nextSibling);
      /* se embutido via iframe sem script no parent, garante fallback */
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        try { window.parent.location.href = cfg.proximaIlhaUrl; }
        catch (e) { window.location.href = cfg.proximaIlhaUrl; }
      });
    }
  }

  global.H5PPlayer = { normalizeH5PDir: normalizeH5PDir, initPlayer: initPlayer };
})(window);
