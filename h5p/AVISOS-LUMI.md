# ⚠️ Observação técnica importante sobre os pacotes H5P fornecidos

Cada subpasta desta trilha (`h5p/ilha1-interactive-video/`, `h5p/ilha2-branching-scenario/`, `h5p/ilha3-course-presentation/`, `h5p/ilha4-dialog-cards/`, `h5p/ilha4-documentation-tool/`) contém:

- **`h5p.json`** — metadados do pacote (título, idioma, dependências de bibliotecas, licença, embedTypes);
- **`content/content.json`** — payload completo do recurso (cenas de diálogo, nós do cenário, slides, drag zones, campos do formulário etc.);
- **`README.md`** — instrução de fechamento do pacote no Lumi.

O que **ainda falta para o pacote `.h5p` se tornar executável**:

1. As **bibliotecas H5P reais** (JavaScript + CSS), que ficam em `libraries/H5P.<Lib>-<Versão>/` dentro do `.h5p`. Por terem centenas de arquivos binários, não são versionadas em texto no projeto;
2. O **empacotamento** final em um arquivo `.h5p` (formato ZIP com extensão personalizada).

## Como executar este passo final (simples, 2–5 min por pacote)

1. Abra o **[Lumi Education](https://lumi.education)** (software de mesa, gratuito) ou **h5p.org**;
2. Crie o **novo conteúdo** do tipo correspondente (Interactive Video, Branching Scenario, Course Presentation, Dialog Cards, Documentation Tool);
3. **Importe o conteúdo** desta trilha:
   - Para a maioria dos tipos, basta abrir `content/content.json` e copiar os blocos relevantes;
   - No Lumi, há opções *“Importar H5P”* (paste JSON) que reconhecem o formato automaticamente;
4. **Exporte o `.h5p`** gerado pelo editor;
5. **Extraia** o conteúdo do `.h5p` (que é um ZIP) **sobre** a subpasta correspondente do projeto. Isso traz as bibliotecas Lumi;
6. Confirme o caminho: `h5p/ilha1-interactive-video/h5p.json`, `h5p/ilha1-interactive-video/content/content.json` e novas pastas `libraries/H5P.InteractiveVideo-1.7/` etc.;
7. Recarregue `aula.html?video=ilha1-autodiagnostico` (ou o vídeo que aponta para aquele `h5p`) no navegador. O iframe em `aula.html` invocará `h5p/player.html`, que carrega o pacote via [h5p-standalone 3.6.0](https://cdn.jsdelivr.net/npm/h5p-standalone@3.6.0/dist/main.bundle.js).

## Status atual do projeto

✅ Toda a pedagogia, roteiro, vídeos e conteúdo interativo já estão **autorais**.
🟡 As bibliotecas JS/CSS foram entregues via CDN (`h5p-standalone@3.6.0`), o que **dispensa** versionar as bibliotecas do Lumi no GitHub Pages.
⚪ Quando o usuário final quiser baixar e hospedar o `.h5p` offline, basta seguir o procedimento acima — depois disso, os 5 arquivos `.h5p` passam a caber diretamente no repositório.
