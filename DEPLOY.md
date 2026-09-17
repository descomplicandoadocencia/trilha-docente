# 🚀 Guia de Deploy — Sprint 5

## 1. Repositório GitHub

```bash
git init
git add .
git commit -m "Trilha Arquiteto da Cultura Digital — v1.0 (Sprints 0-5)"
git branch -M main
git remote add origin https://github.com/descomplicandoadocencia/trilha-docente.git
git push -u origin main
```

## 2. GitHub Pages

1. `Settings → Pages → Source: Deploy from a branch → main / (root)`;
2. Aguardar build (≈1 min) e verificar `https://descomplicandoadocencia.github.io/trilha-docente/`.

## 3. Subdomínio personalizado

No provedor DNS de `descomplicandoadocencia.com.br`:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| CNAME | `trilha` | `descomplicandoadocencia.github.io` | 3600 |

O arquivo `CNAME` na raiz do repo já contém `trilha.descomplicandoadocencia.com.br`. Após propagação (5 min–24 h), ative **Enforce HTTPS** em Settings → Pages.

## 4. Checklist de QA (Sprint 5)

### Acessibilidade (WCAG 2.1 AA)
- [x] Skip link "Pular para o conteúdo" nas 3 páginas
- [x] Landmarks: `header`, `main#conteudo`, `footer`, `aside` (Cornell)
- [x] Navegação por teclado: mentoras (Enter/Espaço, `role="button"`, `aria-pressed`), ilhas SVG (`tabindex`, `aria-label`)
- [x] `:focus-visible` com contorno dourado de 3px (contraste sobre fundo escuro)
- [x] `prefers-reduced-motion: reduce` zera transições/animações
- [x] Ícones emoji decorativos com `aria-hidden="true"`
- [x] Iframes com `title` descritivo
- [x] Estilos de impressão (Cornell Notes legível em PDF nativo do navegador)
- [ ] Teste com leitor de tela (NVDA/VoiceOver) — executar após deploy
- [ ] Verificação final de contraste com axe DevTools — executar após deploy

### Contraste (pares calculados no design system)
| Par | Razão | AA (texto) | AA Large |
|---|---|---|---|
| `#233038` sobre `#f7f4ec` (texto/papel) | 13,1:1 | ✅ | ✅ |
| `#f7f4ec` sobre `#0f5257` (hero) | 8,9:1 | ✅ | ✅ |
| `#c9a24b` sobre `#0f5257` (gold/deep) | 3,9:1 | ⚠️ só large | ✅ |
| `#1d7a80` sobre `#f7f4ec` (links) | 4,7:1 | ✅ | ✅ |
| `#3e9c6b` sobre `#ffffff` (sucesso) | 3,1:1 | ⚠️ só large | ✅ |

> Ação: manter textos em gold/green sempre em negrito ≥18px (large) ou reforçar para tons mais escuros em textos miúdos.

### SEO / Compartilhamento
- [x] Open Graph + `og:locale=pt_BR` + `theme-color`
- [x] `robots.txt` e `sitemap.xml`
- [x] Favicon SVG
- [ ] Submeter ao Google Search Console após deploy

### Performance
- [x] Zero dependências de framework (HTML/CSS/JS puro)
- [x] html2pdf.js via CDN apenas na página que usa (aula.html)
- [x] YouTube via `youtube-nocookie.com` (LGPD-friendly, sem cookies pré-consentimento)
- [ ] Rodar Lighthouse após deploy (meta: ≥ 90 em todas as categorias)

### H5P
- [x] 9 bibliotecas oficiais em `h5p/libraries/`
- [x] Player standalone (`h5p/player.html`) com fallback amigável
- [ ] Teste E2E de cada pacote após primeiro deploy

## 5. Arquivos de ambiente

- Sem variáveis de ambiente nem build — projeto 100% estático.
- `videos.json` é a única fonte de dados; edite-o para trocar vídeos.
