# H5P · Ilha 1 · Interactive Video (pacote finalizado)

**Status:** ✅ Pacote H5P completo e autoexecutável — **não depende mais do Lumi**.

## O que mudou em relação à versão anterior

A versão anterior desta pasta continha apenas `h5p.json` + `content/content.json` como
"conteúdo de entrada editável" — faltavam as bibliotecas de código (JS/CSS) que renderizam
o player. Esta versão foi **completada com as 15 bibliotecas oficiais do H5P** (baixadas
do repositório open-source [github.com/h5p](https://github.com/h5p) e, quando necessário,
recompiladas via `webpack`), montadas na estrutura padrão de um pacote `.h5p`:

```
ilha1-interactive-video/
├── h5p.json                       ← metadados + lista completa de dependências
├── content/
│   └── content.json                ← conteúdo real, no schema oficial do H5P.InteractiveVideo
└── libraries/
    ├── H5P.InteractiveVideo-1.28/  ← player principal (compilado via webpack)
    ├── H5P.Video-1.6/              ← handler de vídeo (YouTube)
    ├── H5P.MultiChoice-1.16/       ← as 4 perguntas de múltipla escolha
    ├── H5P.Text-1.1/               ← bloco de síntese textual
    ├── H5P.Summary-1.10/           ← tela de resumo final
    ├── H5P.Question-1.5/           ← base das perguntas (Question type)
    ├── H5P.JoubelUI-1.3/           ← componentes visuais (botões, score bar…)
    ├── H5P.DragNBar-1.5/, H5P.DragNDrop-1.1/, H5P.DragNResize-1.2/, H5P.FontIcons-1.0/
    ├── H5P.Components-1.0/         ← componentes compartilhados (compilado via webpack)
    ├── H5P.Transition-1.0/
    ├── FontAwesome-4.5/
    └── jQuery.ui-1.10/
```

Todas as bibliotecas vêm do código-fonte oficial mantido pela Joubel/H5P (licença MIT),
sem nenhuma dependência de serviços externos além do próprio vídeo do YouTube.

## Conteúdo pedagógico embutido

- **Vídeo-âncora:** "2 competências digitais essenciais para professores" (Nova Escola)
- **4 interações** nos tempos 15s, 70s, 150s e 230s, cobrindo as 3 dimensões dos Saberes
  Digitais Docentes (Pedagógica, Cidadania Digital, Desenvolvimento Profissional) + síntese;
- **Tela de resumo final** (H5P.Summary) com autoavaliação reflexiva.

## Como usar

### Opção A — Player standalone (já integrado à trilha)
Nenhuma ação extra é necessária: `aula.html` no projeto principal já aponta para
`/h5p/ilha1-interactive-video/` via `data/videos.json`, e `h5p/player.html` (usando a
biblioteca `h5p-standalone`, via CDN) renderiza o pacote diretamente.

Teste isolado: abra `h5p/player.html?dir=ilha1-interactive-video` em um navegador servido
por HTTP (não `file://`, pois o H5P precisa buscar os arquivos via fetch).

### Opção B — Reimportar em outra plataforma (Moodle, WordPress, H5P.com, Lumi)
1. Gere o `.h5p` a partir desta pasta: comprima o **conteúdo** desta pasta (não a pasta em
   si) em um `.zip` e renomeie a extensão para `.h5p`;
   ```bash
   cd h5p/ilha1-interactive-video && zip -r ../ilha1-interactive-video.h5p . -x ".*"
   ```
2. Faça upload/import do arquivo `.h5p` normalmente.

## Licenciamento

Bibliotecas H5P: MIT (Joubel AS). Conteúdo pedagógico (perguntas, textos): uso educacional
não comercial, conforme licença geral do projeto (CC-BY-NC).
