# H5P · Ilha 4 (parte 1) · Dialog Cards

**Biblioteca:** H5P.Dialogcards 1.9
**Localização:** `/h5p/ilha4-dialog-cards/`

## Conteúdo programático

10 pares de cartões (frente × verso) cobrindo:

1. Imigração venezuelana
2. Questões BNCC
3. Resumo científico
4. Queimadas na Amazônia
5. Imagem de cientista brasileira
6. Tradução para Libras
7. Quiz de bullying
8. Código Python
9. História da computação no Brasil
10. E-mail a pais

Cada cartão traz **risco + mitigação + pergunta reflexiva**.

## Como gerar o `.h5p` definitivo

1. No **Lumi**, escolha Dialogcards;
2. Importe o array `dialogs` de `content.json` — cada par é `[frente, verso]`;
3. Ative randomização (`randomCards: true`);
4. Exporte o `.h5p` e extraia sobre esta pasta.
