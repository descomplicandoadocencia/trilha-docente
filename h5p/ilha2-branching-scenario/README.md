# H5P · Ilha 2 · Branching Scenario (PBL Interdisciplinar)

**Biblioteca:** H5P.BranchingScenario 1.8 + H5P.Text 1.1
**Localização:** `/h5p/ilha2-branching-scenario/`

## Conteúdo programático

O cenário leva o professor a escolher entre 3 caminhos paralelos (4 nós de decisão + 4 desfechos):

- 📊 Técnico do Mundo Digital
- 🛠️ Maker Criativo
- 🪞 Professor Reflexivo
- 🏆 Arquiteto Cidadão (recomendado)

## Como gerar o `.h5p` definitivo

1. Abra o **Branching Scenario** no [Lumi](https://lumi.education);
2. Importe o `content.json` desta pasta — o conteúdo de cada nó já está estruturado em `params.text` para **H5P.Text 1.1**;
3. Revise visualmente os nós;
4. Exporte o `.h5p` e extraia o conteúdo aqui (o Lumi adiciona `libraries/H5P.BranchingScenario-1.8/` etc.);
5. O `h5p/player.html` da trilha identifica automaticamente o caminho pelo `data/videos.json` (`/h5p/ilha2-branching-scenario/`).

> **Aviso:** sem as bibliotecas Lumi, o conteúdo é só **payload JSON** válido para importação.
