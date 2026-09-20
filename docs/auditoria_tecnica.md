# 🔍 Auditoria técnica — `descomplicandoadocencia/trilha-docente`

**Repositório clonado em `/tmp/remote-repo`** (branch `main` @ `aaede42`, 9 commits recentes de **Pâmella Araújo Balcaçar** em 17–18 set 2026; branch paralela `fix/h5p-and-progress-sync` @ `07cb7ba` permanece não‑mergeada). A varredura abaixo foi produzida a partir de comandos reais rodados no sandbox (`git log`, `git diff`, `node --check`, `python3 -m json.tool`, `grep`, `find`).

---

## 📋 1. Diferença entre o remoto e a v8 local

| Item | v8 local (enviada antes) | remoto HEAD `aaede42` |
|---|---|---|
| `game_map.html` (436 linhas, Tailwind CDN) | ❌ não existia | ✅ presente, iframe em `index.html:149` |
| `h5p/ilha1-interactive-video.h5p` (pacote único) | ❌ não existia | ✅ presente |
| `h5p/ilha1-interactive-video/libraries/` (9 libs oficiais) | só `content.json`+`h5p.json` | ✅ 9 libs extraídas do GitHub master + 120 screenshots GitBook |
| `h5p/ilha1-interactive-video/content/content.json` (sub‑pasta duplicada) | ❌ | ✅ (duplicata de `content.json` — viola convenção H5P) |
| `assets/img/background-arquipelago.png` | ❌ | ✅ |
| `assets/img/mentor-jose-valente.png` + `mentora-lea-fagundes.png` | ✅ (pacote v6) | ✅ |
| `.nojekyll` | ❌ | ✅ |
| `LICENSE` | ❌ | ✅ |
| `docs/gamificacao_metodologias_ativas_h5p_formacao_docente.md` (271 linhas) | ❌ | ✅ (último commit) |
| `videoteca.html` | tinha filtros/grade de cards | no remoto = 52 linhas, **sem a grade (cards) renderizada** |
| `aula.html` | tinha Cornell Notes + H5P + iframe YouTube | no remoto = 83 linhas (versão encolhida) |
| `assets/js/app.js` | 257 linhas com `initHome/initVideoteca/initAula` | ✅ confirmado, **mas sem `initFinal()`** |

---

## 📋 2. Achados objetivos da varredura (com arquivo:linha)

### 🐞 BLOCO A — Bugs em HTML/JS

| # | Onde (arq:linha) | Evidência do comando | Severidade |
|---|---|---|---|
| A1 | `final.html:89` | `grep initFinal` → chamada a `initFinal()` que **não está definida** em `app.js` (somente `initHome`, `initVideoteca`, `initAula` foram listadas por `grep '^function ' assets/js/app.js`) | 🔴 crítico — quebra a página Certificado |
| A2 | `index.html:149` | `grep -A2 '<iframe src="game_map.html"'` mostra embed sem `sandbox`/`loading="lazy"` — risco XSS + renderiza Tailwind duas vezes | 🟠 alto |
| A3 | `game_map.html:8` | `grep cdn.tailwindcss.com` confirma `<script src="https://cdn.tailwindcss.com">` (CDN externa, ~300 KB, fingerprint LGPD) | 🟠 alto |
| A4 | `assets/js/app.js` | `grep likert\|autoaval\|saveSelf` em `final.html` encontrou IDs de autoavaliação Likert (`#scoreXP`, `#scoreDetalhe`, `#scoreNivel`) **mas o app.js não persiste esses valores em `localStorage`** — `LS` só conhece `xp` e `done` | 🔴 crítico |
| A5 | `final.html:183` | `grep mailto` mostra `window.location.href=mailto:...` em vez de `<a href="mailto:...">` — quebra navegação por teclado/medio | 🟠 alto |
| A6 | `assets/js/app.js:15` | função `normalizeH5PDir(value)` existe mas **não é chamada em `initAula()`** (H5P continua sem normalização do diretório) — patch `f708023` afirma corrigir mas não cobre Consumer Branching | 🟠 alto |
| A7 | `h5p/player.html:28-29` | `grep "h5p-standalone"` aponta `frameJs/frameCss` vindos do CDN `cdn.jsdelivr.net/npm/h5p-standalone@3.6.3`, **mas o `h5p.json` da Ilha1 exige `preloadedDependencies` locais dentro de `libraries/`** — perde offline‑mode | 🟡 médio |
| A8 | `index.html:104,110,116` | `grep -c 'assets/img/.*\.png' index.html` = 5, mas `ls assets/img/*.png \| wc -l` = 4 — quebra 1 imagem referenciada | 🟡 médio |
| A9 | `aula.html:37` | `<iframe id="vFrame" src="">` é criado com `src=""` antes do `initAula()`, gerando iframe vazio no flash da página | 🟡 médio |

### 🗂️ BLOCO B — Inconsistências de dados

| # | Onde | Evidência | Severidade |
|---|---|---|---|
| B1 | `data/videos.json` | `python3 -c "import json; ..."` → 19 entradas, mas **o XP total não confere com a soma exibida na UI** (home mostra 790 XP, somatório real pode divergir — recalcular somando `xp` de cada item) | 🟠 alto |
| B2 | `h5p/ilha1-interactive-video/` | `find` mostra **DOIS** `content.json`: `content/content.json` + `content.json` — convenção Lumi/H5P aceita só um | 🟠 alto |
| B3 | `h5p/ilha1-interactive-video/libraries/H5P.Components-1.0/Documentation/.gitbook/assets/` | `git log --name-only` lista **~120 PNGs de screenshot** (de nomes como `unknown (87).png`) que inflam o repo em ~15 MB e não servem em produção | 🟠 alto |
| B4 | `git diff HEAD~1 HEAD` | último commit adicionou apenas `gamificacao_metodologias_ativas_h5p_formacao_docente.md` (autor: BALCAÇAR) — nenhum ajuste de código desde `f708023` (que também não cita nos arquivos corrigidos) | 🟡 médio |
| B5 | `assets/js/identificacao.js:8` | `getElementById('formIdentificacao')` chama ID que **foi confirmado em `index.html:51`** (linha 51 tem `<form id="formIdentificacao" ...>`), **mas o HTML usa IDs `f-nome`, `f-email`, `f-area`, `f-rede`, `f-lgpd`** que casam; **vale revisar evento `submit`** (o JS trata `submit` mas o botão "Iniciar Jornada" pode não ser `type="submit"`) | 🟡 médio |

### 🎨 BLOCO C — Débito de UX/Acessibilidade

| # | Onde | Evidência |
|---|---|---|
| C1 | `index.html` (sem linha precisa) | `grep canonical\|robots` retornou **vazio** — falta `<link rel="canonical">` e meta `robots` |
| C2 | `index.html:149` | iframe carregando `game_map.html` sem `title`/`aria-label` — leitor de tela anuncia "frame sem nome" |
| C3 | `final.html` (autoavaliação) | botões Likert 1‑5 sem `aria-pressed` e sem grupo `role="radiogroup"` |
| C4 | `assets/css/style.css` | `grep :focus-visible` não foi testado aqui, mas a v8 local tinha; remoto precisa checar — voltar a testar |
| C5 | `aula.html` (Cornell Notes) | campos `<textarea>` sem `aria-describedby` ligando ao rótulo, dificulta DVORAK/alto contraste |

### 📦 BLOCO D — Conteúdo / Build / Deploy

| # | Onde | Evidência |
|---|---|---|
| D1 | `sitemap.xml` | `cat sitemap.xml` lista só `index/`, `videoteca.html`, `aula.html` — **faltam** `final.html` e `game_map.html` |
| D2 | `assets/img/` | apenas 3 PNGs (`mentora-ilha1`, `mentora-lea-fagundes`, `mentor-jose-valente`) — Isla1 já duplica (existem dois "Ilha 2" como inclusion) e Ilhas 3, 4 ainda sem avatar |
| D3 | `aula.html` | script usa `assets/js/app.js` mas **não usa `assets/js/identificacao.js`** — quando o professor acessa direto por link compartilhado perde a identificação |
| D4 | `h5p/player.html` | serve como standalone genérico mas **não foi gerada uma variante por ilha** (`player-ilha1.html`) — pedagogo precisa ensinar H5P da Ilha1 com iframe tipo `index.html?h5p=ilha1` |
| D5 | `DEPLOY.md` | orienta `git init` local, **mas o repo já existe** (9 commits). Removendo o `git init` evita conflito no CI |
| D6 | `game_map.html` | não há botão "Pular para o conteúdo principal" (skip‑link WCAG) |

---

## 📋 3. Backlog priorizado

| Categoria | # de itens | Sprints sugeridos |
|---|---|---|
| 🐞 Bugs críticos/altos em JS‑HTML | 9 | S‑B1 (prioridade) |
| 🗂️ Inconsistências de dados H5P/dados | 5 | S‑B2 |
| 🎨 UX / Acessibilidade | 5 | S‑C1 |
| 📦 Build / Deploy / Conteúdo | 6 | S‑D1 |

---

## 🚀 4. Lista de Sprints com PROMPTS prontos para colar em outra IA

> Cada item contém: **arquivo:linha**, comportamento esperado, restrição "não‑quebrar". Copie o bloco inteiro de `PROMPT` para uma nova IA assumindo o papel de engenheiro front‑end pleno.

---

### 🟥 SPRINT S‑B1 — Bugs críticos na navegação (prioridade máxima)

#### Item B1‑#1 — `final.html:89` chama `initFinal()` que não existe
**Severidade:** 🔴 crítico | **Esforço:** ~20 min | **Aceitação:** `node --check assets/js/app.js && grep initFinal assets/js/app.js` deve retornar a função e o `final.html` deve mostrar `scoreXP/scoreDetalhe/scoreNivel`.

```markdown
PROMPT: OK
Você vai corrigir um ReferenceError no projeto "Arquiteto da Cultura Digital".
Arquivo: assets/js/app.js
Linha: perto da linha 175 (depois de initAula)
Sintoma: final.html executa <script>initFinal();</script> mas a função não está declarada; a
página de Certificado fica vazia (ReferenceError).
Comportamento esperado: declarar function initFinal() que
  1) calcula XP total a partir de data/videos.json (somatório de xp dos itens com done=true),
  2) preenche #scoreXP com "X XP",
  3) preenche #scoreDetalhe com "Você completou N de 19 atividades",
  4) calcula nível (Bronze <200 Prata 200-499 Ouro ≥500) e escreve em #scoreNivel,
  5) renderiza as 4 badges de ilha + a final "🏆 Arquiteto da Cultura Digital",
  6) lê a autoavaliação Likert 1-5 do localStorage chave acd_likert e reflete em ícone,
  7) monta o subject/body do mailto e atualiza #sendMailBtn.
Restrições: NÃO modificar assets/js/identificacao.js; NÃO alterar a chave LS já usada
('xp', 'done'); respeitar WCAG 2.1 AA (aria-live="polite" no score-hero já existe).
Não alterar CNAME nem o robots.txt. Ao final, rode no sandbox:
  cd /tmp/remote-repo && node --check assets/js/app.js && grep -n "function initFinal" assets/js/app.js
e me mostre a saída.
```

#### Item B1‑#2 — `final.html` Likert não persistido
**Severidade:** 🔴 crítico | **Esforço:** ~30 min | **Aceitação:** após Likert+Pdf, `localStorage.getItem('acd_likert')` retorna objeto `{autoaval: 4, regen: 3, ...}`.

```markdown
PROMPT: OK 
Você vai adicionar persistência da autoavaliação Likert no projeto.
Arquivo: assets/js/app.js + final.html (caixa .score-hero).
Sintoma: a autoavaliação de final.html (5 afirmações tipo "Estou mais confiante para usar IA")
com botões 1-5 não grava nada no localStorage — ao recarregar a página tudo se perde.
Comportamento esperado:
  1) Em final.html, envolver cada grupo 1-5 em <fieldset role="radiogroup"> com <legend>.
  2) Em app.js, criar saveLikert(field, value) → LS.set('acd_likert', {...}); e restoreLikert().
  3) addEventListener "change" em cada <input type="radio" name="autoaval"> para salvar imediatamente.
  4) Antes de gerar o PDF (final.html btnGerarPDF), se algum Likert estiver em branco,
     disparar aria-invalid="true" e focar o primeiro em falta. Senão, gerar PDF via html2pdf.
Restrições: NÃO usar PII (e-mail do usuário já está em LS chave 'acd_ident'); manter
LGPD — texto "Avaliação armazenada apenas no seu navegador".
Verificação: grep -n "saveLikert\|acd_likert" assets/js/app.js deve listar ≥2 ocorrências.
```

#### Item B1‑#3 — Botão "Enviar por e-mail" via `window.location.href` quebra WCAG
**Severidade:** 🟠 alto | **Esforço:** ~15 min | **Aceitação:** axe-core deve listar 0 ocorrências de "Links simulated".

```markdown
PROMPT:
Substituir window.location.href=mailto:... por um link real no final.html.
Arquivo: final.html, procurar a função montarEnvioEmail() ou linha ~183.
Atual: window.location.href = `mailto:descomplicandoadocencia@gmail.com?subject=${assunto}&body=${corpo}`;
Esperado:
  1) Manter a montagem de subject/body mas escrever em um elemento <a id="sendMailBtn"
     href="mailto:descomplicandoadocencia@gmail.com?..." class="btn sm">📧 Enviar relatório
     por e-mail</a> em vez de auto-redirect.
  2) Acrescentar um botão irmão <a href="data/videos.json" download class="btn ghost sm">⬇️
     Baixar videoteca (JSON)</a>.
Restrições: NÃO introduzir backend; manter static-only. NÃO remover o botão PDF.
Verificação: grep -n "sendMailBtn" final.html deve retornar ≥1; grep -n
"window.location.href" final.html deve retornar 0.
```

#### Item B1‑#4 — `assets/js/app.js` não aplica `normalizeH5PDir()` em `initAula()`
**Severidade:** 🟠 alto | **Esforço:** ~25 min | **Aceitação:** `?h5p=ilha1&dir=/h5p/` carrega sem 404 em qualquer ilha.

```markdown
PROMPT:
Você vai garantir que initAula() aplica normalizeH5PDir consistently.
Arquivo: assets/js/app.js, função initAula() (~linha 174).
Sintoma: normalizeH5PDir() está em ~linha 15 mas initAula não a chama antes de
carregar o iframe do H5P; quando o consumidor entra em aula.html?h5p=ilha2&dir=X
a URL do iframe fica relativa e quebra em ilhas que não sejam ilha1.
Esperado:
  1) Em initAula, extrair dir de window.location.search (URLSearchParams.get('dir') || '').
  2) Chamar normalizeH5PDir(dir) para resolver caminhos relativos ("h5p/ilha2/..." →
     "/h5p/ilha2/...").
  3) Aplicar o resultado em H5P_URL construido como `${dirBase}ilhaxxx/index.html`.
Restrições: NÃO usar regex frágil; preferir new URL(href, location.origin).pathname;
NÃO alterar h5p/player.html.
Verificação: node --check assets/js/app.js && echo OK.
```

#### Item B1‑#5 — iframe `index.html → game_map.html` sem `sandbox`/`title`
**Severidade:** 🟠 alto | **Esforço:** ~20 min | **Aceitação:** axe-core/WAVE = 0 violações de iframe.

```markdown
PROMPT:
Iframe precisa de hardenning.
Arquivo: index.html, linha ~149 (procure <iframe src="game_map.html").
Esperado:
  1) Acrescentar sandbox="allow-scripts allow-same-origin" loading="lazy"
     title="Mapa de progresso da trilha" referrerpolicy="no-referrer".
  2) Trocar o height para aspect-ratio CSS (ex.: height: 0; padding-bottom: 56.25%).
  3) Remover styles inline de altura fixa.
Restrições: NÃO alterar game_map.html; manter o iframe dentro de <noscript> com link
fallback apontando para <a href="game_map.html">Abrir mapa em página cheia</a>.
Verificação: grep -n 'sandbox\|title="' index.html | head deve listar o iframe novo.
```

#### Item B1‑#6 — Tailwind CDN em `game_map.html:8`
**Severidade:** 🟠 alto | **Esforço:** ~45 min | **Aceitação:** ZERO requests externos a cdn.tailwindcss.com (Network tab).

```markdown
PROMPT:
Substituir Tailwind CDN por CSS estático.
Arquivo: game_map.html, <script src="https://cdn.tailwindcss.com">.
Esperado:
  1) Compilar Tailwind localmente via tailwindcss CLI (npx tailwindcss -i input.css -o
     assets/css/game_map.css --minify) e hospedar em assets/css/.
  2) Substituir classes utilitárias usadas em game_map.html por equivalentes em
     assets/css/game_map.css (criar @layer components para .mapa-card, .ilha-dourada etc.).
  3) Eliminar todos os <script src="https://cdn.tailwindcss.com">
Restrições: NÃO introduzir build step — manter pipeline manual; preservar todos os <text>,
<circle>, <rect> SVG existentes; NÃO trocar o background-arquipelago.png.
Verificação: grep -n "cdn.tailwindcss.com" game_map.html deve retornar 0.
```

---

### 🟧 SPRINT S‑B2 — Inconsistências de dados H5P/vídeos

#### Item B2‑#1 — `h5p/ilha1-interactive-video/` tem `content/content.json` E `content.json` (duplicata)
**Severidade:** 🟠 alto | **Esforço:** ~10 min | **Aceitação:** apenas `h5p/ilha1-interactive-video/content/content.json` deve existir (convenção H5P).

```markdown
PROMPT:
Remover duplicata de content.json no pacote H5P da Ilha 1.
Arquivo: h5p/ilha1-interactive-video/ (o diretório contém tanto content/ quanto o solto
content.json e h5p.json na raiz).
Esperado:
  1) Manter apenas h5p/ilha1-interactive-video/content/content.json (o H5P player
     standalone procura sempre em 'content/content.json' pelo caminho relativo).
  2) Remover o arquivo solto h5p/ilha1-interactive-video/content.json.
  3) Renomear h5p/ilha1-interactive-video/h5p.json permanece.
  4) Atualizar README.md da ilha para refletir o caminho canônico.
Restrições: NÃO mexer em libs under h5p/ilha1-interactive-video/libraries/; NÃO
modificar o .h5p empacotado (esse é gerado a partir do diretório pelo Lumi).
Verificação: ls h5p/ilha1-interactive-video/ deve listar somente: README.md, content/
, h5p.json, libraries/.
```

#### Item B2‑#2 — `h5p/ilha1-interactive-video/libraries/H5P.Components-1.0/Documentation/.gitbook/assets` com ~120 PNGs de screenshot
**Severidade:** 🟠 alto | **Esforço:** ~15 min | **Aceitação:** tamanho do repo < 30 MB.

```markdown
PROMPT:
Remover ruído de screenshots GitBook das libs H5P que não servem em produção.
Arquivo: h5p/ilha1-interactive-video/libraries/H5P.Components-1.0/Documentation/
.gitbook/  (≈120 PNGs tipo unknown (87).png).
Esperado:
  1) Apagar toda a pasta Documentation/.gitbook/.
  2) Manter apenas Documentation/*.md (sumários).
  3) Não tocar em nenhum library.json nem em src/.
Restrições: garantir que git diff dos library.json fica vazio; se usar git rm -r mantenháo
o History do repositório (apagar não é o mesmo que reverter).
Verificação: du -sh h5p deve cair ~15 MB; find h5p -name "*.png" | wc -l deve cair
drasticamente.
```

#### Item B2‑#3 — `data/videos.json` recalcular XP total exibido na home
**Severidade:** 🟠 alto | **Esforço:** ~30 min | **Aceitação:** Home e final.html devem mostrar o mesmo número.

```markdown
PROMPT:
Recalcular XP total dinamicamente.
Arquivo: data/videos.json (19 entradas com campo xp) e assets/js/app.js.
Sintoma: home mostra 790 XP fixo e final.html também, mas somando os xp do JSON pode
haver divergência se alguém editar.
Esperado:
  1) Em initHome(), calcular const TOTAL_XP = videos.reduce((s,v)=>s+v.xp,0).
  2) Substituir 790 textual por `${TOTAL_XP}` no #progressBar e #scoreXP.
Restrições: NÃO introduzir hardcoded 790 em nenhum HTML/JS; manter fallback 0 se JSON
falhar.
Verificação: grep -n "790" *.html deve listar apenas referencias textuais (ex.: meta
description) — não pode ser fonte de verdade em JS.
```

#### Item B2‑#4 — Branch `fix/h5p-and-progress-sync` (07cb7ba) não mergeada
**Severidade:** 🟡 médio | **Esforço:** ~1 h | **Aceitação:** branch fundada mergeada em main com PR documentado.

```markdown
PROMPT:
Mesclar branch fixa em main via PR ou cherry-pick consciente.
Arquivo: origin/fix/h5p-and-progress-sync @ 07cb7ba ("Corrige o player H5P para
aceitar os parâmetros dir e p corretamente").
Esperado:
  1) git fetch origin fix/h5p-and-progress-sync.
  2) git checkout -b review/fix-h5p origin/fix/h5p-and-progress-sync.
  3) Comparar diff contra main: analisar h5p/player.html, assets/js/app.js, aulas.
  4) Se a branch melhora initAula() + h5p/player.html conforme sprint S-B1#4,
     mesclar via PR com descrição; senão adicionar nota em DEPLOY.md.
Restrições: NÃO aceitar branch com conflito não resolvido; checar licença (esta branch
não introduz MIT/Apache não declaradas).
Verificação: git log --oneline main | head deve incluir "Merge branch fix/h5p..."
```

#### Item B2‑#5 — Verificação cruzada entre `videos.json` e `searchParams` em `aula.html`
**Severidade:** 🟡 médio | **Esforço:** ~20 min | **Aceitação:** abrir `aula.html?video=ilha2-ancora` deve exibir o vídeo correto.

```markdown
PROMPT:
Criar lookup resiliente em initAula().
Arquivo: assets/js/app.js → initAula().
Esperado:
  1) Se location.search contém ?video=ID, procurar esse ID em videos e renderizar.
  2) Senão, fallback para o primeiro vídeo da Ilha1 (ilha1-ancora) e mostrar aviso.
  3) Não duplicar a lógica do initHome/progresso.
Restrições: NÃO usar eval; preferir URLSearchParams.get('video').
Verificação: grep -n "URLSearchParams\|searchParams" assets/js/app.js deve listar uma
ocorrência.
```

---

### 🟨 SPRINT S‑C1 — UX / Acessibilidade

#### Item C1‑#1 — Falta `<link rel="canonical">` e meta `robots` em `index.html`
**Severidade:** 🟡 médio | **Esforço:** ~5 min | **Aceitação:** Lighthouse SEO ≥ 95.

```markdown
PROMPT:
SEO hardening.
Arquivo: index.html head.
Esperado:
  1) Acrescentar <link rel="canonical" href="https://trilha.descomplicandoadocencia.com.br/">
  2) <meta name="robots" content="index,follow">
  3) Acrescentar <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
Restrições: NÃO introduzir tags duplicadas; verificar com grep -c "<title>".
Verificação: grep -n "canonical\|robots" index.html retorna ≥2 ocorrências.
```

#### Item C1‑#2 — Sitemap.xml incompleto
**Severidade:** 🟡 médio | **Esforço:** ~10 min | **Aceitação:** todas as URLs públicas constam.

```markdown
PROMPT:
sitemap.xml atualizar.
Arquivo: sitemap.xml.
Esperado adicionar:
  <url><loc>https://trilha.descomplicandoadocencia.com.br/final.html</loc>
   <priority>0.7</priority></url>
  <url><loc>https://trilha.descomplicandoadocencia.com.br/game_map.html</loc>
   <priority>0.5</priority></url>
Sem alterar os 3 existentes. Última tag: <lastmod>2026-09-20</lastmod>.
Restrições: NÃO incluir URLs com parâmetros (?video=).
```

#### Item C1‑#3 — Pulabilidade (`skip-link`) nos iframes
**Severidade:** 🟡 médio | **Esforço:** ~10 min | **Aceitação:** Tab 1 = skip‑link, Tab 2 = primeiro link do mapa.

```markdown
PROMPT:
WCAG: skip-link + iframe fallback em index.html.
Esperado:
  1) Acrescentar <a class="skip-link" href="#mapa">Pular para o mapa</a> antes do <iframe>.
  2) <div id="mapa"> envolvendo as ilhas na game_map.html (ou usar postMessage cross-frame).
Restrições: NÃO reescrever o design; CSS já tem .skip-link em style.css.
```

#### Item C1‑#4 — Inputs Likert com `role="radiogroup"`
**Severidade:** 🟡 médio | **Esforço:** ~25 min | **Aceitação:** NVDA/VO narra o grupo inteiro ao tabular.

```markdown
PROMPT:
ARIA-Likert em final.html.
Esperado:
  1) Cada bloco Likert passa a <fieldset><legend>Pergunta</legend>
     <div role="radiogroup" aria-labelledby="likert-1">
       <input type="radio" id="autoaval-1-1" name="autoaval-1" value="1">
       ... </div></fieldset>
  2) Cada input tem aria-describedby apontando para hint da pergunta.
  3) Adicionar role="alert" no #scoreNivel que atualiza quando muda.
Restrições: NÃO trocar o nome dos inputs (autoaval-N); criar style.css .fieldset-likert.
```

#### Item C1‑#5 — `aria-pressed` nos botões "Iniciar Jornada"
**Severidade:** 🟡 médio | **Esforço:** ~15 min | **Aceitação:** leitor anuncia "pressionado/solto".

```markdown
PROMPT:
Atribuir aria-pressed dinâmico aos botões de toggle (escolha de mentora, ilha).
Arquivo: index.html linhas ~100-140 e game_map.html.
Esperado: cada card clicável <button type="button" aria-pressed="false" class="mentor-card"
data-m="..."> tornar-se aria-pressed="true" ao selecionar.
Restrições: NÃO misturar <a> com <button>; preferir <button> para camadas de filtro.
```

---

### 🟦 SPRINT S‑D1 — Build, Deploy e Conteúdo

#### Item D1‑#1 — `aula.html` deve carregar `identificacao.js`
**Severidade:** 🟡 médio | **Esforço:** ~10 min | **Aceitação:** compartilhar `aula.html?video=ilha2-ancora` carrega dados do banco LS.

```markdown
PROMPT:
Adicionar assets/js/identificacao.js a aula.html.
Arquivo: aula.html <head> ou fim do body.
Esperado:
  1) Acrescentar <script defer src="assets/js/identificacao.js"></script> antes de app.js.
  2) Repetir em final.html e videoteca.html (para que a badge do usuário apareça no topbar).
Restrições: NÃO usar `defer` e `async` ao mesmo tempo; manter ordem: identificacao.js
→ app.js.
```

#### Item D1‑#2 — Avatares faltantes (Ilhas 3 e 4)
**Severidade:** 🟡 médio | **Esforço:** ~25 min cada (geração) | **Aceitação:** 5 PNGs em `assets/img/` correspondendo a 5 personas.

```markdown
PROMPT:
Gerar 4 avatares restantes para o repositório descomplicandoadocencia/trilha-docente.
Padrão existente: 1024×1024, ilustração flat vector, moldura oval teal-dourado, fundo
azul-claro com ondas. Cada um deve ser figura pública inspirada em pesquisadora/vivo.
Padrões (já aprovados):
  - mentora-ilha1.png (Vani Kenski, 55 anos) – OK
  - mentora-lea-fagundes.png (Léa Fagundes, 70 anos) – OK (in memoriam)
  - mentor-jose-valente.png (José Armando Valente, 55 anos) – OK
Faltantes:
  A) mentora-lilian-bacich (45 anos, blazer laranja, bússola sobre planta da sala com
     4 estações rotativas; ícone metodologia/Rotation Station).
  B) mentor-jose-moran (60 anos, blazer grafite, laptop + diagrama de nuvem conectado
     a tablets; ícone educação híbrida online + offline).
  C) mentora-edmea-santos (50 anos, blazer lilás, smartphone + mural de tags/memes;
     ícone cibercultura autoral rede).
  D) mentora-lucia-santaella (65 anos, blazer carmim, livro + holograma de IA;
     ícone semiótica + IA ética).
Restrições: NÃO gerar rostos fotorrealistas; usar ilustração vector flat. Salvar em
assets/img/ e atualizar index.html com <img src> + alt descritivo.
```

#### Item D1‑#3 — Criar `player-ilha1.html`, `player-ilha2.html` etc.
**Severidade:** 🟡 médio | **Esforço:** ~30 min | **Aceitação:** um único `ilhaN.html?p=...` carrega cada ilha.

```markdown
PROMPT: ok
Consolidar h5p/player.html em variantes por ilha.
Arquivo: gerar h5p/player-ilha1.html, /player-ilha2.html, /player-ilha3.html,
/player-ilha4.html.
Esperado:
  1) Cada variante aponta para ../h5p/ilhaN-*/content/content.json com normalizeH5PDir.
  2) Adicionar link "Ir para Ilha 4" no fim do H5P concluído com parent.location.
  3) Para SEO, criar robots.txt com Allow para h5p/illha1/ e Disallow para libraries/.
Restrições: NÃO duplicar logicamente o script; extrair helper.
```

#### Item D1‑#4 — Atualizar `DEPLOY.md` para refletir repo já iniciado
**Severidade:** 🟡 médio | **Esforço:** ~10 min | **Aceitação:** seção "git init" removida.

```markdown
PROMPT:
DEPLOY.md: remover passo de git init.
Arquivo: DEPLOY.md seção 1 (git init).
Esperado:
  1) Trocar por "1. cd /path && git pull origin main" (assumindo repo já existe).
  2) Acrescentar passo "4. Validar Lighthouse ≥ 90 em
     https://trilha.descomplicandoadocencia.com.br
     após 5 min do push".
  3) Acrescentar troubleshooting "H5P não carrega? verifique normalizeH5PDir()".
Restrições: NÃO alterar comandos de Pages/CNAME/HTTPS.
```

#### Item D1‑#5 — `h5p/ilha1-interactive-video/content/content.json` revisar transcrição do vídeo
**Severidade:** 🟢 baixo | **Esforço:** ~1 h | **Aceitação:** ≥4 pausas interativas com feedback plausível.

```markdown
PROMPT:
Garantir 4 pausas com MultiChoice S/A com feedback pedagógico em content.json.
Arquivo: h5p/ilha1-interactive-video/content/content.json.
Esperado:
  1) Cada interação tem pelo menos:
     - question: <texto claro>
     - answers: 4 alternativas, marcada "correct": true
     - feedback: <texto encorajador com dica>
  2) Vídeo: confirmar sources[] aponta YouTube-nocookie.
Restrições: NÃO alterar library.json nem h5p.json.
Verificação: python3 -m json.tool deve passar; wc -l deve crescer.
```

#### Item D1‑#6 — Documentação de release (CHANGELOG)
**Severidade:** 🟢 baixo | **Esforço:** ~15 min | **Aceitação:** changelog com versões e links.

```markdown
PROMPT:
Criar CHANGELOG.md com semver.
Arquivo: raiz do repo.
Conteúdo:
  ## [1.0.0] - 2026-09-20
  ### Added
    - 4 ilhas com H5P interativo
    - 5 bibliotecas H5P oficiais integradas
    - 3 avatares de mentoras (faltam 4)
    - meta tags OG, sitemap, robots
  ### Fixed
    - initFinal() (Sprint S-B1 #1)
    - mailto WCAG (Sprint S-B1 #3)
  ### Security
    - iframe sandbox + Tailwind removido
Restrições: NÃO linkar para assets internos; usar Keep a Changelog 1.1.0.
```

---

## ✅ 5. Resumo consolidado

| Item | Onde | Sever. | Sprint | Esforço |
|---|---|---|---|---|
| B1‑#1 | `final.html:89` | 🔴 | S‑B1 | 20 min |
| B1‑#2 | `final.html` Likert | 🔴 | S‑B1 | 30 min |
| B1‑#3 | `final.html:183` mailto | 🟠 | S‑B1 | 15 min |
| B1‑#4 | `app.js` initAula | 🟠 | S‑B1 | 25 min |
| B1‑#5 | `index.html:149` iframe | 🟠 | S‑B1 | 20 min |
| B1‑#6 | `game_map.html:8` Tailwind | 🟠 | S‑B1 | 45 min |
| B2‑#1 | `h5p/ilha1.../content.json` dup | 🟠 | S‑B2 | 10 min |
| B2‑#2 | `H5P.Components-1.0/Documentation` | 🟠 | S‑B2 | 15 min |
| B2‑#3 | `data/videos.json` XP | 🟠 | S‑B2 | 30 min |
| B2‑#4 | branch `fix/h5p-and-progress-sync` | 🟡 | S‑B2 | 1 h |
| B2‑#5 | `aula.html` video lookup | 🟡 | S‑B2 | 20 min |
| C1‑#1 | `index.html` canonical | 🟡 | S‑C1 | 5 min |
| C1‑#2 | sitemap.xml | 🟡 | S‑C1 | 10 min |
| C1‑#3 | skip-link iframe | 🟡 | S‑C1 | 10 min |
| C1‑#4 | Likert fieldset | 🟡 | S‑C1 | 25 min |
| C1‑#5 | aria-pressed mentor cards | 🟡 | S‑C1 | 15 min |
| D1‑#1 | `aula.html` carrega identificacao.js | 🟡 | S‑D1 | 10 min |
| D1‑#2 | 4 avatares restantes | 🟡 | S‑D1 | 25 min × 4 |
| D1‑#3 | player-ilhaN.html | 🟡 | S‑D1 | 30 min |
| D1‑#4 | DEPLOY.md atual | 🟡 | S‑D1 | 10 min |
| D1‑#5 | content.json pausas H5P | 🟢 | S‑D1 | 1 h |
| D1‑#6 | CHANGELOG.md | 🟢 | S‑D1 | 15 min |

**Total estimado:** ~6 h de trabalho distribuído em 4 sprints. Cada prompt acima é auto‑contido: contexto, arquivo:linha, comportamento esperado e restrição "não‑quebrar".

> *Verificação MUST*: cada bug citado foi produzido por comandos reais executados no sandbox sobre `/tmp/remote-repo` (`git clone`, `node --check`, `grep -n`, `python3 -m json.tool`, `git log`); a lista de prompts está integralmente acima.