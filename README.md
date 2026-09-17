# 🏝️ Arquiteto da Cultura Digital

Trilha gamificada de capacitação docente em HTML estático — Saberes Digitais Docentes, BNCC da Computação, Metodologias Ativas e uso ético da IA Generativa, com Cornell Notes, videoteca YouTube e atividades H5P.

## Estrutura

```
├── index.html          → Home: hero, mentoras, mapa das ilhas (SVG), badges
├── videoteca.html      → Grade de vídeos com filtro por ilha
├── aula.html           → Sala de aula: player + Cornell Notes (PDF) + H5P
├── CNAME               → trilha.descomplicandoadocencia.com.br
├── data/videos.json    → Videoteca (19 vídeos, XP, ordem, ilha, H5P)
├── assets/css/style.css, assets/js/app.js
├── assets/img/         → Avatares das mentoras
└── h5p/player.html     → Player standalone (h5p-standalone via CDN)
```

## Deploy (GitHub Pages + subdomínio)

1. Crie o repositório `descomplicandoadocencia/trilha-docente` e suba estes arquivos na branch `main`.
2. Em **Settings → Pages**, ative o deploy a partir de `main / (root)`.
3. No DNS de `descomplicandoadocencia.com.br`, crie o registro:
   `trilha CNAME descomplicandoadocencia.github.io`
4. O arquivo `CNAME` na raiz já aponta para `trilha.descomplicandoadocencia.com.br` (HTTPS é ativado automaticamente após o DNS propagar).

## Adicionando atividades H5P

1. Crie o recurso no [Lumi](https://lumi.education) (desktop, gratuito) e exporte como `.h5p`.
2. Extraia o pacote (é um ZIP) em `h5p/<nome>/` — deve conter `h5p.json` e `content/content.json`.
3. No `data/videos.json`, aponte o campo `h5p` para `/h5p/<nome>/`. O `h5p/player.html` faz o resto.

## Gamificação

- Cada vídeo concluído soma XP (total da trilha: **790 XP**), persistido em `localStorage`.
- Ilhas desbloqueiam por XP: I1 = 0 · I2 = 130 · I3 = 340 · I4 = 520.
- Badges por ilha concluída + badge final "Arquiteto da Cultura Digital".
- Cornell Notes salvam por vídeo (autosave) e exportam PDF (html2pdf.js).

## Aviso legal

Personas são ilustrações **inspiradas** nas obras das pesquisadoras citadas (homenagem acadêmica), sem reprodução de imagem real. Recomenda-se obter autorização de uso de nome junto às homenageadas/instituições.
