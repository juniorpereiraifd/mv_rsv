# Tagme — Protótipo navegável: Gestão de Reservas

Protótipo clicável do módulo **Gestão de Reservas**, construído a partir do arquivo Figma
`Tagme — Fluxo de reserva e protótipo` (telas) e do FigJam `01 — Jornada completa da reserva` (lógica do fluxo).

## Jornadas cobertas

- **Nova reserva**: lista de reservas → identificar cliente (buscar por telefone/nome, ou cadastrar novo) →
  dados da reserva (pessoas, prioridade, status, data, salão, origem, horário) → vincular mesa (existente,
  temporária ou pular) → informações opcionais (responsável, tag de evento, notas, observação interna) →
  salvar → reserva aparece na lista com o status correto (Novo / Aguardando aprovação).
- **RSVP**: botão "RSVP" na linha da reserva abre o diálogo com os dados enviados por e-mail ao cliente,
  com opção de reenviar por Whatsapp ou e-mail.
- **Sentar cliente**: ícone de cadeira abre o diálogo "Sentar cliente" (mesa, observação) — ao confirmar, a
  reserva passa para o status **Sentado** (barra azul) e os botões de ação mudam para o padrão de check-out.
  Um item pode ser marcado como sentado apenas antes de sofrer check-out ou cancelamento.
- **Check-out**: no status Sentado, o botão largo azul finaliza o atendimento e muda o status para
  **Check-out** (barra cinza-escura).
- **Cancelar reserva**: ícone "X" abre o diálogo de cancelamento, que exige selecionar um motivo antes de
  liberar o botão "Excluir"; ao confirmar, a reserva passa para o status **Cancelado** (barra cinza) e perde
  as ações de linha.
- **Editar reserva**: clicar no nome do cliente na linha reabre o mesmo drawer de "Nova reserva", agora como
  "Editar reserva", pré-preenchido com os dados existentes — salvar atualiza a reserva em vez de criar uma nova.
- **Aba Salão (mapa de mesa)**: alterna a lista de reservas por uma grade de mesas agrupada por capacidade
  (1 a 2 / 3 a 5 / 6 a 8 pessoas), com mesas ocupadas coloridas conforme o status da reserva vinculada e um
  contador quando há mais de uma reserva na mesma mesa. Clicar em uma mesa vazia abre o fluxo de nova reserva
  com a mesa já pré-selecionada; clicar em uma mesa ocupada mostra quem está nela, com atalho para editar a
  reserva.
- **Filtros rápidos**: os chips "Todos" / "Pendentes" / "Em aberto" filtram a lista por status
  (Pendentes = aguardando aprovação; Em aberto = Novo + Sentado).

## Stack

HTML + CSS + JavaScript puro — **sem build step e sem dependências**. Só `index.html`, `styles.css` e `app.js`.
Isso torna o deploy na Vercel praticamente instantâneo (hospedagem estática, zero configuração).

## Fidelidade visual

Cores, tipografia, espaçamentos, raios de borda e sombras foram extraídos diretamente do Figma via
`get_design_context` (valores hexadecimais exatos — ver o topo de `styles.css`). A fonte usada no design é a
SF Pro (fonte de sistema da Apple); o CSS usa `-apple-system`/`BlinkMacSystemFont` como primeira opção, que
resolve para a SF Pro real em dispositivos Apple, com fallback para Segoe UI/Roboto em outros sistemas.

**Único ponto de atenção:** o ambiente onde este protótipo foi gerado não tinha acesso de rede para baixar os
SVGs exatos dos ícones do Figma. Os ícones foram recriados à mão em estilo outline (mesma família visual:
traço fino, cantos arredondados) — a forma pode não ser 100% idêntica à original, mas a linguagem visual é a
mesma. Se quiser os ícones exatos, dá para substituir o sprite SVG no topo do `index.html` pelos assets
originais exportados do Figma.

## Como publicar na Vercel

**Opção A — Vercel CLI (mais rápido):**

```bash
npm i -g vercel
cd tagme-nova-reserva
vercel        # segue o assistente (primeira vez cria o projeto)
vercel --prod # publica em produção
```

**Opção B — Importar via Git:**

1. Crie um repositório novo (GitHub/GitLab/Bitbucket) e suba esta pasta.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Framework preset: **Other** (ou deixe em branco). Não há build command nem output directory —
   os arquivos já são estáticos na raiz.
4. Deploy.

**Opção C — Arrastar a pasta:** no dashboard da Vercel, novo projeto → "Deploy" aceita o upload direto da
pasta com os 3 arquivos.

## Estrutura

```
index.html    — marcação de todas as telas/estados (lista, mapa de mesa, diálogos de busca/RSVP/sentar/
                cancelar, drawer de nova/editar reserva, seletor de mesa)
styles.css    — tokens de design (cores, tipografia, sombras) + estilos de todos os componentes
app.js        — estado do fluxo, validação e interações (sem dependências externas)
```

## O que é só protótipo (não é dado real)

- Os clientes de exemplo e as 3 reservas iniciais são fictícios, copiados dos valores de amostra do Figma.
- A busca de cliente filtra uma lista fixa de 5 nomes de exemplo (ver `SAMPLE_CLIENTS` em `app.js`).
- O mapa de mesa usa uma lista fixa de números de mesa dividida em 3 grupos de capacidade (ver
  `TABLE_GROUPS` em `app.js`) — não representa a planta real do salão, pois o arquivo Figma não contém
  um layout espacial das mesas, apenas a grade agrupada por capacidade.
- Os chips de filtro "Todos os status", "Origem", "Salão" e "Pessoas", além do widget de data flutuante,
  são majoritariamente visuais (não filtram a lista) — o foco da interatividade foi nas jornadas principais
  do fluxo de reservas.
- Não há persistência: ao recarregar a página, a lista volta ao estado inicial.
