# H5P · Ilha 4 (parte 2) · Documentation Tool + Declaração de Uso Ético

**Bibliotecas:** H5P.DocumentationTool 1.4 + H5P.Text 1.1
**Localização:** `/h5p/ilha4-documentation-tool/`

## Conteúdo programático

O professor preenche 11 campos estruturados:

1. Identificação
2. Habilidade BNCC
3. Objetivo de aprendizagem
4. Modelo H5P escolhido (select)
5. IAG e versão
6. Prompt completo (essencial para rastreabilidade)
7. Saída gerada (trecho)
8. Revisão humana (essencial)
9. Verificações éticas (checkbox-group com 5 itens)
10. Parecer pessoal (escala 0–5)
11. Exportação automática do plano + Declaração de Uso Ético

## Como gerar o `.h5p` definitivo

1. No Lumi, abra Documentation Tool;
2. Importe o array `fields` de `content.json`;
3. Configure `exportFormat: "html"` e o `postSaveTemplate` para que a Declaração de Uso Ético seja anexada;
4. Exporte `.h5p` e extraia nesta pasta.
