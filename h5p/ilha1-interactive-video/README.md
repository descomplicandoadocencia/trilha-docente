# H5P · Ilha 1 · Interactive Video

**Biblioteca:** H5P.InteractiveVideo 1.7 + H5P.MultiChoice 1.16 + H5P.Text 1.1
**Localização final no projeto:** `/h5p/ilha1-interactive-video/` (configurado em `data/videos.json`).

## Conteúdo

- `h5p.json` — metadados do pacote (título, idioma, dependências de bibliotecas);
- `content/content.json` — script do vídeo com 4 interações em 15s, 70s, 150s e 230s.

## Como gerar o `.h5p` definitivo

1. Abra o [Lumi](https://lumi.education) (desktop, gratuito) **ou** o [h5p.org](https://h5p.org);
2. Crie um novo **Interactive Video**;
3. Cole o vídeo do YouTube: `https://www.youtube.com/watch?v=zPuQFqU1E2Y` (ou o da Ilha 1 definido em `data/videos.json`);
4. Insira as interações lendo os 4 blocos JSON contidos em `content/content.json` (cada `interactions[i].params`);
5. Exporte como `.h5p`;
6. Extraia o `.h5p` (que é um ZIP) sobre esta pasta — deve aparecer `libraries/H5P.InteractiveVideo-1.7/`, `libraries/H5P.MultiChoice-1.16/`, `libraries/H5P.Text-1.1/` etc.;
7. Recarregue `aula.html?video=ilha1-autodiagnostico` no navegador; o pacote será renderizado dentro do iframe de `h5p/player.html`.

> **Aviso:** os arquivos `h5p.json` + `content/content.json` sozinhos **não** formam um pacote H5P executável — faltam as bibliotecas de código (JS/CSS) que o Lumi inclui automaticamente. Use este material como **conteúdo de entrada editável no editor**.
