/**
 * build_catalog – regenera por completo o catálogo de lojas da visão do
 * cliente (SPA) a partir do CSV real dos parceiros dine-in.
 *
 * Entrada: `Dados_Merch_Atualizado - Página1.csv` (raiz) – os 50 parceiros reais.
 * Saída: reescreve `src/data/merchants.ts` (dados, sem fotos) e
 *        `src/data/photos.ts` (mapa slug → fotos próprias).
 *
 * Regras de negócio aplicadas (decisões coletadas com o usuário):
 *   - 50 lojas = 25 "Comer Fora" + 25 "Reservas (Get In)", todas no catálogo;
 *   - 1 tag por loja (`cardTags`): Reservas alternam `oferta-local`/`bobs-fa` e
 *     Comer Fora faz round-robin pelas outras 8 (cobre os 10 `TagsVariant`);
 *   - `featured` = as 4 Comer Fora + as 4 Reservas mais próximas do ponto-ref
 *     (Paulista); cada destaque ganha `announceTag = cardTags`;
 *   - `cardBadge`: heurística determinística pequena cobrindo os 4 `BadgeVariant`;
 *   - galeria = fotos do salão do CSV; quando < 3, completa com a própria capa.
 *
 * Realidade da mídia (verificada por probes HTTP em 2026-09-02):
 *   - host novo `dine-in-consumer-media-uploads.ifood.com.br` (34 capas, 20
 *     logos e as 240 fotos de salão) entrega a imagem original (HTTP 200) →
 *     URL verbatim;
 *   - host antigo `static.ifood-static.com.br`: capas vêm em `t_thumbnail`
 *     (150×38, pequeno demais) → remove `/t_thumbnail/` para pegar o original
 *     (200); logos em `t_thumbnail/logosgde/` (150×150, suficiente p/ avatar) →
 *     mantém como está;
 *   - única exceção: a capa do Rinconcito Peruano Moema dá 403 mesmo no
 *     original (asset removido do Cloudinary) → `image` usa uma foto de salão.
 *
 * O script é determinístico (PRNG semeado pelo slug) e não baixa nada – os
 * probes acima só calibraram as regras de URL embutidas abaixo.
 *
 * Roda com: `node scripts/build_catalog.mjs`
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSV = join(root, 'Dados_Merch_Atualizado - Página1.csv')
const MERCHANTS_PATH = join(root, 'src/data/merchants.ts')
const PHOTOS_PATH = join(root, 'src/data/photos.ts')

/* ============================================================ utils ========= */

/** PRNG determinístico (mulberry32) a partir de uma semente. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash FNV-1a simples (para semear o PRNG por slug). */
function fnv(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

const cleanName = (s) => s.replace(/\s+/g, ' ').trim()

/** Haversine em km (R = 6371) para ordenar / exibir distância. */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/**
 * Normaliza coordenada do CSV: mantém só dígitos e sinal e põe a vírgula
 * decimal depois dos 2 dígitos inteiros (todas as lojas são São Paulo,
 * lat ~23 / lon ~46). "-23.573.569", "-23,573569" e "-23.573569" caem todos
 * no mesmo -23.573569.
 */
function normalizeCoord(raw) {
  const s = String(raw).trim()
  const neg = s.startsWith('-')
  const digits = s.replace(/\D/g, '')
  if (digits.length <= 2) return null
  const val = parseFloat(digits.slice(0, 2) + '.' + digits.slice(2))
  return neg ? -val : val
}

/** Nº compacto PT-BR: <1000 → "345"; senão "4,9 mil" (1 decimal, sem ,0). */
function compactCount(n) {
  if (!Number.isFinite(n) || n < 1000) return String(Math.round(n) || 0)
  const d = (n / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',')
  return `${d} mil`
}
const compactParen = (n) => `(${compactCount(n)})`

/** "4,0 km" → "4 km"; "13,3 km" fica com 1 decimal; nunca metros. */
function kmLabel(km) {
  const d = km.toFixed(1)
  return (d.endsWith('.0') ? d.slice(0, -2) : d).replace('.', ',') + ' km'
}

/* ================================================== parser CSV (RFC 4180) === */

function parseCsv(text) {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else if (c !== '\r') field += c
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/* =========================================================== conteúdo ======= */

/** Vocabulário por culinária (noun = prato/menu no singular, sem artigo). */
const CUISINE_NOUNS = {
  Brasileira: ['feijoada', 'picanha', 'moqueca', 'prato executivo', 'baião de dois', 'costela', 'galinhada', 'escondidinho', 'virado à paulista', 'dobradinha', 'peixada', 'frango com polenta'],
  Italiana: ['massa fresca', 'risoto', 'nhoque', 'tagliatelle', 'lasanha', 'carbonara', 'pizza napoletana', 'bruschetta', 'ossobuco', 'pappardelle', 'ravioli de ricota', 'porcini'],
  Carnes: ['picanha', 'costela', 'chorizo', 'entrecot', 'bife ancho', 'baby beef', 'filé mignon', 'churrasco misto', 'fraldinha', 'prime rib', 'bife de chorizo', 'maminha'],
  'Frutos Do Mar': ['camarão', 'moqueca de peixe', 'polvo grelhado', 'ceviche', 'paella', 'lagosta', 'pescado do dia', 'mariscos', 'lula à dorê', 'risoto de camarão', 'casquinha de siri', 'peixe na brasa'],
  Cafeteria: ['café especial', 'cappuccino', 'pão de queijo', 'torta da casa', 'sanduíche artesanal', 'brunch', 'cookie', 'cheesecake', 'expresso', 'muffin', 'brownie', 'croissant'],
  Variada: ['prato executivo', 'salada da casa', 'combo do dia', 'burger artesanal', 'prato do dia', 'wrap', 'tábua de frios', 'picanha', 'frango grelhado', 'peixe grelhado', 'salada de folhas', 'risoto'],
  Lanches: ['burger', 'batata frita', 'sanduíche', 'milkshake', 'combo de lanche', 'hot dog', 'porção de fritas', 'smash burger', 'onion rings', 'nuggets', 'burger duplo', 'fritas com cheddar'],
  Pizza: ['pizza napoletana', 'pizza de pepperoni', 'pizza margherita', 'pizza artesanal', 'calzone', 'pizza de mussarela', 'massa de longa fermentação', 'pizza de quatro queijos', 'pizza de cogumelos', 'pizza do chef', 'fatia da casa', 'pizza de calabresa'],
  Mexicana: ['tacos', 'burrito', 'quesadilla', 'nachos', 'guacamole', 'fajitas', 'churros', 'tostadas', 'taco al pastor', 'carnitas', 'tortilla', 'chilaquiles'],
  'Doces & Bolos': ['torta', 'bolo', 'sorvete', 'cookie', 'torta de morango', 'pavê', 'mousse de chocolate', 'fatia de bolo', 'café', 'açaí', 'cheesecake de frutas vermelhas', 'petit gâteau'],
  Hambúrguer: ['burger artesanal', 'smash burger', 'batata rústica', 'combo', 'burger duplo', 'milkshake', 'onion rings', 'cheddar burger', 'burger de costela', 'fritas', 'burger veggie', 'combo com bebida'],
  Saudável: ['salada', 'bowl', 'poke', 'prato leve', 'suco natural', 'wrap integral', 'salada de frutas', 'grão-de-bico', 'legumes grelhados', 'açaí', 'bowl de quinoa', 'smoothie'],
  Japonesa: ['combinado', 'temaki', 'sashimi', 'uramaki', 'hot roll', 'yakisoba', 'sunomono', 'sushi de salmão', 'harumaki', 'sashimi de peixe branco', 'roll de camarão', 'missoshiru'],
  Francesa: ['steak frites', 'crème brûlée', 'confit de pato', 'ratatouille', 'croque-monsieur', 'tarte tatin', 'escargot', 'peixe do dia', 'vinho da casa', 'magret de pato', 'sopa de cebola', 'tartare'],
  Mercado: ['frutos do mar', 'camarão', 'peixes', 'polvo', 'paella', 'moqueca', 'carpaccio', 'seleção da adega', 'peixe grelhado', 'camarão na moranga', 'ostras', 'risoto de frutos do mar'],
}

/** Resumo de avaliações: o que costuma ser elogiado, por categoria. */
const CUISINE_HIGHLIGHT = {
  Brasileira: 'a cozinha caseira e os pratos bem servidos',
  Italiana: 'as massas frescas e o capricho da casa',
  Carnes: 'o ponto da carne e o preparo na brasa',
  'Frutos Do Mar': 'o peixe fresco e os frutos do mar',
  Cafeteria: 'o café e a seleção de doces',
  Variada: 'a variedade do cardápio',
  Lanches: 'os lanches suculentos',
  Pizza: 'a massa leve e os ingredientes de qualidade',
  Mexicana: 'os sabores da cozinha mexicana',
  'Doces & Bolos': 'as sobremesas e os bolos artesanais',
  Hambúrguer: 'os burgers artesanais',
  Saudável: 'as opções leves e saudáveis',
  Japonesa: 'o peixe fresquíssimo',
  Francesa: 'o refinamento da cozinha francesa',
  Mercado: 'os frutos do mar e a carta de vinhos',
}

/** Ocasiões do CSV → frase curta pra usar no resumo de avaliações. */
const OCCASION_PHRASE = {
  'Pra Curtir em Família': 'levar a família',
  'Momento a Dois': 'um programa a dois',
  'Ambiente ao Ar Livre': 'aproveitar o espaço ao ar livre',
  'Para esquentar': 'esquentar num dia mais frio',
  'Brindar com Amigos': 'um brinde com amigos',
  'Copa do Mundo': 'assistir aos jogos num telão',
  'Adoçar o Dia': 'uma pausa doce no meio do dia',
  'Tomar um Café': 'um bom café com calma',
  'Comer Saudável': 'uma refeição leve e equilibrada',
}

/**
 * Tags (TagsVariant) → a oferta primária que espelha a pill da home.
 * `avail` = pills de disponibilidade coerentes com o mecanismo da tag.
 */
const TAG_BENEFIT = {
  'cupom-r20': { tpl: (n) => `R$ 20 off em ${n}`, sub: 'Desconto de R$ 20 no consumo feito no local', avail: ['Cupom', 'No local'] },
  'oferta-local': { tpl: (n) => `R$ 20 off em ${n}`, sub: 'No local, ao fazer a reserva pelo app', avail: ['Reserva', 'No local'] },
  'bobs-fa': { tpl: (n) => `2 por 1 em ${n}`, sub: 'No local, para quem reservar a mesa pelo app', avail: ['Reserva', '2 por 1'] },
  leve2pague1: { tpl: (n) => `Leve 2, pague 1 em ${n}`, sub: 'Na compra de 2 unidades no local', avail: ['2 por 1', 'No local'] },
  cortesia: { tpl: (n) => `${n[0].toUpperCase()}${n.slice(1)} de cortesia`, sub: 'A casa oferece uma cortesia por mesa', avail: ['Cortesia', 'Cadastro'] },
  cashback: { tpl: (n) => `10% de cashback em ${n}`, sub: '10% de volta em créditos no próximo pedido', avail: ['Cashback', 'Cadastro'] },
  indica: { tpl: (n) => `2x1 em ${n}`, sub: 'Peça dois, pague um – válido no local', avail: ['2 por 1', 'No local'] },
  'o3o-clube': { tpl: () => 'R$ 20 no delivery via Clube', sub: 'Bônus no seu pedido de delivery pelo Clube', avail: ['Delivery', 'Clube'] },
  'o3o-merchant': { tpl: () => 'R$ 20 de volta no delivery', sub: 'Crédito no seu pedido de delivery', avail: ['Delivery', 'Cadastro'] },
  fidelidade: { tpl: () => 'Pontos em dobro no cadastro', sub: 'Acumule pontos em dobro no programa de fidelidade', avail: ['Fidelidade', 'Cadastro'] },
}

/** Palavras de período p/ variar títulos (fallback de unicidade). */
const DAYPARTS = ['no almoço', 'no jantar', 'aos fins de semana', 'no horário do almoço']

/** Alternativas extras únicas para ofertas primárias "sem prato" (o3o/fidelidade). */
const BONUS_TITLES = {
  'o3o-clube': ['R$ 20 de volta no pedido', 'R$ 20 em cupom de delivery', 'Bônus de R$ 20 no delivery'],
  'o3o-merchant': ['R$ 20 em crédito no delivery', 'Desconto de R$ 20 no delivery'],
  fidelidade: ['Dobro de pontos na primeira visita', 'Pontos extras em dias de semana', 'Acumule o dobro de pontos'],
}

/**
 * Conceitos de oferta SECUNDÁRIA. Cada um devolve um objeto de oferta dado o
 * prato (noun). `noun: false` ignora o prato (título fixo). O gerador monta,
 * por loja, um espaço grande de candidatos (vários nouns × conceitos) e escolhe
 * o primeiro título globalmente livre – por isso os fixos não saturam.
 */
const SECONDARY_CONCEPTS = [
  // Com prato
  { noun: true, mk: (n) => ({ title: `Combo ${n} com bebida`, sub: 'Combo com bebida não alcoólica inclusa', avail: ['Combo', 'No local'], valid: 'Válido todos os dias, no período do almoço' }) },
  { noun: true, mk: (n) => ({ title: `2 por 1 em ${n}`, sub: 'Peça dois, pague um – válido no local', avail: ['2 por 1', 'Sáb'], valid: 'Válido aos sábados' }) },
  { noun: true, mk: (n) => ({ title: `Degustação de ${n}`, sub: 'Menu degustação com porções reduzidas', avail: ['Cadastro', 'Jantar'], valid: 'Válido todos os dias' }) },
  { noun: true, mk: (n) => ({ title: `Entrada pra dividir: ${n}`, sub: 'Porção de entrada para dividir na mesa', avail: ['No local'], valid: 'Válido todos os dias' }) },
  { noun: true, mk: (n) => ({ title: `15% off no ${n}`, sub: 'Desconto no prato, para quem pedir no local', avail: ['Cupom', 'No local'], valid: 'Válido todos os dias, no período do jantar' }) },
  { noun: true, mk: (n) => ({ title: `${n[0].toUpperCase()}${n.slice(1)} de cortesia`, sub: 'A casa oferece uma cortesia por mesa', avail: ['Cortesia'], valid: 'Válido todos os dias' }) },
  // Fixos (sem prato)
  { noun: false, mk: () => ({ title: 'Sobremesa de cortesia', sub: 'A casa encerra a conta com uma sobremesa por mesa', avail: ['Cortesia', 'Cadastro'], valid: 'Válido todos os dias' }) },
  { noun: false, mk: () => ({ title: 'Couvert de cortesia', sub: 'Couvert cortesia na reserva da mesa', avail: ['Reserva'], valid: 'Válido todos os dias' }) },
  { noun: false, mk: () => ({ title: 'Pratos do dia em dose dupla', sub: 'Dois pratos por um, no cardápio do dia', avail: ['No local'], valid: 'Válido todos os dias, no período do almoço' }) },
  { noun: false, mk: () => ({ title: 'Refil de bebida incluso', sub: 'Refil de refrigerante ou suco no almoço', avail: ['No local', 'Almoço'], valid: 'Válido no horário do almoço (até 16h)' }) },
  { noun: false, mk: () => ({ title: 'Brinde do chef', sub: 'A casa recebe a mesa com um brinde do chef', avail: ['Cortesia', 'Cadastro'], valid: 'Válido todos os dias' }) },
]

/** Nomes/avatares e tempos para momentos compartilhados. */
const AUTHORS = [
  ['Marina S.', 'MS'], ['Caio R.', 'CR'], ['Beatriz L.', 'BL'], ['Paulo M.', 'PM'],
  ['Cláudia T.', 'CT'], ['Renato F.', 'RF'], ['Juliana C.', 'JC'], ['Fábio A.', 'FA'],
  ['Ana Paula', 'AP'], ['Lucas M.', 'LM'], ['Fernanda G.', 'FG'], ['Rafael D.', 'RD'],
  ['Camila V.', 'CV'], ['Thiago N.', 'TN'], ['Larissa P.', 'LP'], ['Gustavo H.', 'GH'],
  ['Patrícia R.', 'PR'], ['Diego S.', 'DS'], ['Vanessa O.', 'VO'], ['Bruno A.', 'BA'],
]
const TIME_AGO = ['Há 1 dia', 'Há 2 dias', 'Há 3 dias', 'Há 4 dias', 'Há 6 dias', 'Há 1 semana', 'Há 2 semanas', 'Há 3 semanas']
const MOMENT_TEXTS = [
  (n) => `Pedimos o ${n} e não decepcionou!`,
  (n) => `O ${n} estava no ponto certo.`,
  () => 'Atendimento atencioso do começo ao fim.',
  () => 'Ambiente agradável, deu pra conversar com calma.',
  () => 'A casa estava cheia, mas valeu cada minuto.',
  (n) => `Recomendo o ${n} pra quem vai pela primeira vez.`,
  () => 'Porção generosa e preço justo.',
  () => 'Bom lugar pra comemorar data especial.',
  (n) => `Voltei só pelo ${n}, estava delicioso.`,
  () => 'Reserva pelo app funcionou super bem.',
  () => 'Espaço bonito e bem cuidado.',
  (n) => `O pedido do ${n} demorou um pouco, mas veio caprichado.`,
]

/** Títulos/notas do bloco do Clube. */
const CLUB_TITLES = [
  '10% off na conta', '1 cortesia no seu aniversário', 'Brinde do chef no check-in',
  'Sobremesa da casa no 5º check-in', '20% off em rolê a dois', 'Bebida em dobro no check-in',
  'Pratos do dia com 15% off', 'Kit de boas-vindas no cadastro',
]
const CLUB_NOTES = [
  'Válido com cupom Clube no app', 'Para quem faz check-in pelo Move',
  'No check-in com o cupom do Clube', 'A cada visita com o Clube Move',
]

/* ======================================================== carregar CSV ===== */

const parsed = parseCsv(readFileSync(CSV, 'utf8'))
const headers = parsed[0]
const col = Object.fromEntries(headers.map((h, i) => [h, i]))
const dataRows = parsed.slice(1).filter((r) => r.some((c) => c.trim() !== ''))

const cell = (row, name) => {
  const i = col[name]
  return i === undefined ? '' : (row[i] ?? '').trim()
}
const parseJson = (s, fallback) => {
  try {
    return JSON.parse(s)
  } catch {
    return fallback
  }
}

/* =================================================== ponto de referência === */

// Ponto-ref ~ Paulista (mesmo centro usado pela home "Próximos a você").
const REF = { lat: -23.5614, lon: -46.6559 }

const stores = dataRows.map((row) => {
  const lat = normalizeCoord(cell(row, 'latitude'))
  const lon = normalizeCoord(cell(row, 'longitude'))
  const name = cleanName(cell(row, 'name'))
  const nota = parseFloat(cell(row, 'nota_google'))
  const aval = parseInt(cell(row, 'avaliacoes_google'), 10)
  return {
    mid: cell(row, 'merchant_id'),
    tipo: cell(row, 'tipo'),
    name,
    slug: slugify(name),
    category: cell(row, 'culinaria_amigavel'),
    nota: Number.isFinite(nota) ? nota : 4.5,
    aval: Number.isFinite(aval) ? aval : 250,
    faixa: cell(row, 'faixa_preco'),
    hoursRaw: parseJson(cell(row, 'horario_funcionamento'), []),
    address: cleanName(cell(row, 'endereco_completo')),
    descricao: cell(row, 'descricao'),
    lat,
    lon,
    km: lat == null || lon == null ? 999 : haversineKm(REF.lat, REF.lon, lat, lon),
    logoUrl: cell(row, 'logo_full_url'),
    capaUrl: cell(row, 'capa_full_url'),
    galeria: parseJson(cell(row, 'fotos_galeria_full_urls'), []).map((u) => String(u).trim()),
    occ: parseJson(cell(row, 'occasions'), []),
    flags: Object.fromEntries(
      ['acessibilidade', 'wifi', 'estacionamento', 'area_externa', 'pet_friendly', 'musica_ao_vivo'].map(
        (k) => [k, cell(row, k) === 'TRUE'],
      ),
    ),
  }
})

// Sanidade: 50 linhas, coordenadas no box de SP e nomes/slugs únicos.
if (stores.length < 50) throw new Error(`CSV com ${stores.length} lojas (< 50)`)
const dup = (list) => list.filter((x, i) => list.indexOf(x) !== i)
if (dup(stores.map((s) => s.slug)).length) throw new Error('slugs duplicados no CSV')
if (dup(stores.map((s) => s.mid)).length) throw new Error('merchant_id duplicado no CSV')
const oob = stores.filter((s) => !(s.lat >= -24.2 && s.lat <= -23.3 && s.lon >= -47.0 && s.lon <= -46.3))
if (oob.length) throw new Error(`coordenadas fora do box de SP: ${oob.map((s) => s.name).join(', ')}`)

// Ordena do mais perto ao mais distante (ordem do RAW + featured).
stores.sort((a, b) => a.km - b.km || a.name.localeCompare(b.name, 'pt'))

/* ============================================================ mídia ========= */

const NEW_HOST = 'dine-in-consumer-media-uploads.ifood.com.br'
// A única capa do CSV que não abre (403 mesmo no original): asset antigo morto
// no Cloudinary. Nessas, `image` usa uma foto pública de salão.
const DEAD_CAPAS = new Set([
  'https://static.ifood-static.com.br/image/upload/t_thumbnail/capa/201808161628_9ee0395b-6308-4acd-b584-65ee99f6e1af_capa1.jpg',
])

/** Resolve image/logo/gallery de uma loja a partir das URLs do CSV. */
function mediaFor(s) {
  // Logo: verbatim (ambos os hosts respondem 200; static já vem em t_thumbnail).
  const logo = s.logoUrl
  // Capa: host novo já é original; host antigo remove o t_thumbnail (150×38).
  let image
  if (s.capaUrl.includes(NEW_HOST)) {
    image = s.capaUrl
  } else if (!DEAD_CAPAS.has(s.capaUrl)) {
    image = s.capaUrl.includes('/upload/t_thumbnail/')
      ? s.capaUrl.replace('/upload/t_thumbnail/', '/upload/')
      : s.capaUrl
  }
  // Galeria: fotos de salão públicas (host novo). Hero emprestado da galeria
  // sai dela pra não repetir a foto no bento.
  let gallery = s.galeria.slice()
  if (!image) {
    image = gallery[0]
    gallery = gallery.slice(1)
  }
  // Toda loja precisa de galeria ≥ 3 (aceitação). Completa com a própria capa.
  while (gallery.length < 3) gallery.push(image)
  return { image, logo, gallery }
}

/* ================================================= tags / badges / featured = */

// 1 pill por loja: Reservas alternam as 2 tags "ao reservar"; Comer Fora faz
// round-robin pelas outras 8 (cobre os 10 TagsVariant).
const RESERVA_TAGS = ['oferta-local', 'bobs-fa']
const CF_TAGS = ['cupom-r20', 'leve2pague1', 'cortesia', 'cashback', 'indica', 'o3o-clube', 'o3o-merchant', 'fidelidade']

function assignTags(list) {
  let ri = 0
  let ci = 0
  for (const s of list) {
    const isReserva = s.tipo === 'Reservas (Get In)'
    const pool = isReserva ? RESERVA_TAGS : CF_TAGS
    s.cardTags = pool[isReserva ? ri++ % pool.length : ci++ % pool.length]
  }
}

/** cardBadge – heurística pequena e determinística cobrindo os 4 BadgeVariant. */
function assignBadges(list) {
  const used = new Set()
  const by = (key) => (a, b) => (b[key] - a[key] || a.name.localeCompare(b.name, 'pt'))
  const free = (cands) => cands.filter((s) => !used.has(s.mid))
  const take = (cands, n, variant) => {
    for (const s of cands) {
      if (used.has(s.mid)) continue
      s.cardBadge = variant
      used.add(s.mid)
      if (--n === 0) break
    }
  }
  // popular = os mais avaliados no Google (redes conhecidas).
  take(free(list).sort(by('aval')), 6, 'popular')
  // gourmet = maior nota entre as culinárias de apelo gourmet.
  const gourmetCat = ['Francesa', 'Japonesa', 'Italiana', 'Pizza', 'Frutos Do Mar', 'Hambúrguer']
  take(free(list.filter((s) => gourmetCat.includes(s.category))).sort(by('nota')), 3, 'gourmet')
  // premium = maior nota entre as demais casas de alto padrão (fallback: qualquer).
  let premium = free(list.filter((s) => s.nota >= 4.6))
  if (!premium.length) premium = free(list)
  take(premium.sort(by('nota')), 3, 'premium')
  // exclusivo = maior nota entre as lojas de Reservas ainda sem selo.
  take(free(list.filter((s) => s.tipo === 'Reservas (Get In)')).sort(by('nota')), 2, 'exclusivo')
  const variants = new Set(list.filter((s) => s.cardBadge).map((s) => s.cardBadge))
  if (variants.size !== 4) throw new Error(`badges não cobrem as 4 variantes: ${[...variants].join(',')}`)
}

/** featured = as 4 Comer Fora + as 4 Reservas mais próximas do ponto-ref. */
function assignFeatured(list) {
  const counts = { 'Comer Fora': 0, 'Reservas (Get In)': 0 }
  let total = 0
  for (const s of list) {
    const c = counts[s.tipo]
    if (c < 4) {
      s.featured = true
      s.announceTag = s.cardTags
      counts[s.tipo] = c + 1
      total++
    }
  }
  if (total < 8) throw new Error(`featured com ${total} lojas (< 8)`)
}

assignTags(stores)
assignFeatured(stores)
assignBadges(stores)

/* ======================================================== síntese por loja = */

// Prato (noun) por categoria em round-robin, na ordem de distância: lojas da
// mesma culinária nunca recebem o mesmo prato na 1ª posição (títulos únicos).
const catCounter = {}
for (const s of stores) {
  const nouns = CUISINE_NOUNS[s.category] ?? ['prato do dia']
  const i = (catCounter[s.category] = (catCounter[s.category] ?? 0) + 1)
  s.nouns = [0, 1, 2, 3].map((o) => nouns[(i - 1 + o) % nouns.length])
}

/** Horário de um dia-referência fixo (qua→ter→qui→…), faixas unidas por " / ". */
function hoursFor(s) {
  const by = {}
  for (const e of s.hoursRaw) {
    if (!e || typeof e !== 'object' || !e.dayOfWeek) continue
    ;(by[e.dayOfWeek] ??= []).push({ start: e.start, end: e.end })
  }
  for (const day of ['WEDNESDAY', 'TUESDAY', 'THURSDAY', 'FRIDAY', 'MONDAY', 'SATURDAY', 'SUNDAY']) {
    const segs = (by[day] ?? []).sort((a, b) => a.start.localeCompare(b.start))
    if (segs.length) return segs.map((g) => `${g.start} - ${g.end}`).join(' / ')
  }
  const first = Object.values(by).flat().sort((a, b) => a.start.localeCompare(b.start))
  return first.length ? `${first[0].start} - ${first[0].end}` : ''
}

// Títulos de oferta globalmente únicos (exigência de aceitação).
const usedTitles = new Set()
function pickObject(cands, storeName) {
  const hit = cands.find((c) => !usedTitles.has(c.title))
  if (!hit) throw new Error(`sem título único pra oferta de ${storeName}`)
  usedTitles.add(hit.title)
  return hit
}

const VALIDITIES = [
  'Válido todos os dias',
  'Válido de segunda a domingo',
  'Válido todos os dias, no período do jantar',
  'Válido todos os dias, no período do almoço',
]
const MINIMUMS = ['R$ 40', 'R$ 50', 'R$ 60', 'R$ 80', 'R$ 100']

/** Oferta primária: espelha a tag da loja; título único com variações de prato. */
function makePrimaryOffer(s) {
  const b = TAG_BENEFIT[s.cardTags]
  const cands = []
  const base = (n) => ({ title: b.tpl(n), sub: b.sub, avail: b.avail.slice() })
  for (const n of s.nouns) cands.push(base(n))
  for (const bonus of BONUS_TITLES[s.cardTags] ?? []) cands.push({ title: bonus, sub: b.sub, avail: b.avail.slice() })
  for (const part of DAYPARTS) cands.push({ ...base(s.nouns[0]), title: `${b.tpl(s.nouns[0])} ${part}` })
  return pickObject(cands, s.name)
}

/** Oferta secundária: outro benefício genérico da casa; título único. */
function makeSecondaryOffer(s) {
  const cands = []
  for (const c of SECONDARY_CONCEPTS) {
    if (c.noun) {
      for (const n of s.nouns) cands.push(c.mk(n))
    } else {
      cands.push(c.mk())
    }
  }
  return pickObject(cands, s.name)
}

function makeReviewScores(nota, rng) {
  const clamp = (v) => Math.min(5, Math.max(0, Math.round(v * 10) / 10))
  const j = () => (rng() - 0.45) * 0.6
  return { food: clamp(nota + j()), service: clamp(nota + j()), atmosphere: clamp(nota + j()) }
}

function makeSummary(s, nota, rng) {
  const highlight = CUISINE_HIGHLIGHT[s.category] ?? 'a comida'
  const occ = s.occ.map((o) => OCCASION_PHRASE[o]).filter(Boolean)
  // Cláusula de ocasião só quando o CSV traz uma ocasião reconhecida – assim o
  // resumo nunca soa genérico nem repete "visita" duas vezes no fallback.
  const occClause = occ.length
    ? ` Dá pra curtir a visita e ${occ[Math.floor(rng() * occ.length)]}.`
    : ''
  const tone =
    nota >= 4.6
      ? `Nota alta – clientes destacam ${highlight}.`
      : nota >= 4.2
        ? `O que mais aparece nas avaliações: ${highlight}.`
        : `Bem avaliado principalmente por ${highlight}, embora alguns citem espera nos horários de pico.`
  return tone + occClause
}

function makeMoments(s, rng) {
  const start = Math.floor(rng() * AUTHORS.length)
  const out = []
  for (let i = 0; i < 3; i++) {
    const [author, initials] = AUTHORS[(start + i) % AUTHORS.length]
    const textFn = MOMENT_TEXTS[Math.floor(rng() * MOMENT_TEXTS.length)]
    const rating = rng() < 0.55 ? '5,0' : rng() < 0.8 ? '4,5' : '4,0'
    out.push({
      author,
      initials,
      rating,
      timeAgo: TIME_AGO[(start + i) % TIME_AGO.length],
      photoCount: [1, 2, 3][Math.floor(rng() * 3)],
      text: textFn(s.nouns[0]),
    })
  }
  return out
}

/** About a partir da descrição real (remove \n literais e hashtags). */
function aboutFor(descricao) {
  return String(descricao)
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)#\S+/g, '')
    .trim()
}

const AMENITY_MAP = [
  ['acessibilidade', 'Acessível', 'accessible'],
  ['wifi', 'Wi-Fi grátis', 'wifi'],
  ['estacionamento', 'Estacionamento', 'parking'],
  ['area_externa', 'Área externa', 'park'],
  ['pet_friendly', 'Pet friendly', 'pet'],
  ['musica_ao_vivo', 'Música ao vivo', 'music'],
]
const AC_FALLBACK = { label: 'Ar-condicionado', icon: 'ac' }

function amenitiesFor(s) {
  const out = AMENITY_MAP.filter(([flag]) => s.flags[flag]).map(([, label, icon]) => ({ label, icon }))
  if (out.length === 0) out.push(AC_FALLBACK) // algumas lojas sem flag mapeável
  return out
}

/** Converte um objeto de oferta no formato emitido no RAW (regras = chamada). */
function toRawOffer(o, rng) {
  // Conceitos usam `sub`/`avail`/`valid`; o RAW usa `subtitle`/`availability`.
  const out = { title: o.title, subtitle: o.sub, availability: o.avail.slice() }
  if (rng() < 0.45) {
    out.expires = ['Expira hoje', 'Expira amanhã', 'Expira em 2 dias'][Math.floor(rng() * 3)]
  }
  const validity = o.valid ?? VALIDITIES[Math.floor(rng() * VALIDITIES.length)]
  const min = MINIMUMS[Math.floor(rng() * MINIMUMS.length)]
  out.regras = `offerRegras(${JSON.stringify(validity)}, ${JSON.stringify(min)})`
  return out
}

function buildEntry(s) {
  const rng = mulberry32(fnv(s.slug))
  const nota = s.nota
  const offers = [toRawOffer(makePrimaryOffer(s), rng), toRawOffer(makeSecondaryOffer(s), rng)]
  return {
    id: s.mid,
    slug: s.slug,
    name: s.name,
    category: s.category,
    ratingValue: nota.toFixed(1),
    ratingCount: compactParen(s.aval),
    period: 'open',
    distance: kmLabel(s.km),
    cardBadge: s.cardBadge,
    cardTags: s.cardTags,
    announceTag: s.announceTag,
    featured: s.featured,
    priceTier: s.faixa === 'EXPENSIVE' ? '$$' : '$$$',
    hours: hoursFor(s),
    reviewTotal: compactCount(s.aval),
    offers,
    clubOffer: {
      title: CLUB_TITLES[Math.floor(rng() * CLUB_TITLES.length)],
      note: CLUB_NOTES[Math.floor(rng() * CLUB_NOTES.length)],
    },
    reviewScores: makeReviewScores(nota, rng),
    reviewSummary: makeSummary(s, nota, rng),
    sharedMoments: makeMoments(s, rng),
    about:
      aboutFor(s.descricao) ||
      `Restaurante de cozinha ${(s.category || 'variada').toLowerCase()} em ${s.address.split('–')[0]?.trim() || 'São Paulo'}.`,
    amenities: amenitiesFor(s),
    address: s.address,
  }
}

const entries = stores.map(buildEntry)

// Sanidade pós-síntese (as mesmas garantias que o check:coverage exige).
{
  const titles = entries.flatMap((e) => e.offers.map((o) => o.title))
  const dupTitles = [...new Set(titles.filter((t, i) => titles.indexOf(t) !== i))]
  if (dupTitles.length) throw new Error(`títulos de oferta duplicados: ${dupTitles.join(' | ')}`)
  const dupHeroes = dup(stores.map((s) => mediaFor(s).image))
  if (dupHeroes.length) throw new Error(`hero duplicado: ${dupHeroes.join(' | ')}`)
  const broken = entries.flatMap((e) => e.offers.filter((o) => !o.title || !o.subtitle || !o.regras))
  if (broken.length) throw new Error('oferta com título/subtítulo/regras vazio')
  const tagCover = new Set(entries.flatMap((e) => [e.cardTags, e.announceTag].filter(Boolean)))
  if (tagCover.size !== 10) throw new Error(`TagsVariant cobertos: ${[...tagCover].join(',')} (esperado 10)`)
  const badgeCover = new Set(entries.map((e) => e.cardBadge).filter(Boolean))
  if (badgeCover.size !== 4) throw new Error(`BadgeVariant cobertos: ${[...badgeCover].join(',')} (esperado 4)`)
}

/* ======================================================== emissores TS ===== */

function emitRawEntry(e) {
  const lines = []
  const push = (k, v) => lines.push(`    ${k}: ${v},`)
  push('id', JSON.stringify(e.id))
  push('slug', JSON.stringify(e.slug))
  push('name', JSON.stringify(e.name))
  push('category', JSON.stringify(e.category))
  push('ratingValue', JSON.stringify(e.ratingValue))
  push('ratingCount', JSON.stringify(e.ratingCount))
  push('period', JSON.stringify(e.period))
  push('distance', JSON.stringify(e.distance))
  if (e.cardBadge) push('cardBadge', JSON.stringify(e.cardBadge))
  push('cardTags', JSON.stringify(e.cardTags))
  if (e.announceTag) push('announceTag', JSON.stringify(e.announceTag))
  if (e.featured) push('featured', 'true')
  push('priceTier', JSON.stringify(e.priceTier))
  push('hours', JSON.stringify(e.hours))
  push('reviewTotal', JSON.stringify(e.reviewTotal))
  lines.push('    offers: [')
  for (const o of e.offers) {
    lines.push('      {')
    lines.push(`        title: ${JSON.stringify(o.title)},`)
    lines.push(`        subtitle: ${JSON.stringify(o.subtitle)},`)
    lines.push(`        availability: ${JSON.stringify(o.availability)},`)
    if (o.expires) lines.push(`        expires: ${JSON.stringify(o.expires)},`)
    lines.push(`        regras: ${o.regras},`)
    lines.push('      },')
  }
  lines.push('    ],')
  lines.push('    clubOffer: {')
  lines.push(`      title: ${JSON.stringify(e.clubOffer.title)},`)
  lines.push(`      note: ${JSON.stringify(e.clubOffer.note)},`)
  lines.push('    },')
  lines.push(
    `    reviewScores: { food: ${e.reviewScores.food}, service: ${e.reviewScores.service}, atmosphere: ${e.reviewScores.atmosphere} },`,
  )
  lines.push(`    reviewSummary: ${JSON.stringify(e.reviewSummary)},`)
  lines.push('    sharedMoments: [')
  for (const m of e.sharedMoments) {
    lines.push('      {')
    lines.push(`        author: ${JSON.stringify(m.author)},`)
    lines.push(`        initials: ${JSON.stringify(m.initials)},`)
    lines.push(`        rating: ${JSON.stringify(m.rating)},`)
    lines.push(`        timeAgo: ${JSON.stringify(m.timeAgo)},`)
    if (m.photoCount) lines.push(`        photoCount: ${m.photoCount},`)
    lines.push(`        text: ${JSON.stringify(m.text)},`)
    lines.push('      },')
  }
  lines.push('    ],')
  lines.push(`    about: ${JSON.stringify(e.about)},`)
  lines.push('    amenities: [')
  for (const a of e.amenities) lines.push(`      { label: ${JSON.stringify(a.label)}, icon: ${JSON.stringify(a.icon)} },`)
  lines.push('    ],')
  lines.push(`    address: ${JSON.stringify(e.address)},`)
  return lines.join('\n')
}

function buildMerchantsTs(existing) {
  const headAnchor = '/**\n * Fonte única de dados das lojas ("Comer Fora").'
  const typesAnchor = '/** Faixa de preço exibida no header da página (design 68:3750). */'
  const rawAnchor = 'const RAW: MerchantRaw[] = ['
  const tailAnchor = '/** Catálogo final: dados de conteúdo + fotos próprias de cada slug. */'

  const headStart = existing.indexOf(headAnchor)
  const typesStart = existing.indexOf(typesAnchor)
  const rawStart = existing.indexOf(rawAnchor)
  const tailStart = existing.indexOf(tailAnchor)
  if (headStart < 0 || typesStart < 0 || rawStart < 0 || tailStart < 0) {
    throw new Error('âncoras do merchants.ts não encontradas – arquivo mudou de estrutura?')
  }
  const head = existing.slice(0, headStart) // imports + blank até o docstring antigo
  const types = existing.slice(typesStart, rawStart) // tipos/helpers + blank
  const tail = existing.slice(tailStart)

  const doc = `/**
 * Fonte única de dados das lojas ("Comer Fora"). Regenerado por
 * \`scripts/build_catalog.mjs\` a partir de \`Dados_Merch_Atualizado - Página1.csv\`
 * (50 parceiros dine-in reais de São Paulo: 25 "Comer Fora" + 25 "Reservas (Get
 * In)"). As fotos próprias de cada loja ficam no mapa \`PHOTOS\` (photos.ts); aqui
 * mora só o conteúdo (nome, nota, ofertas, comodidades…), na ordem do mais perto
 * ao mais distante do ponto de referência usado pela home.
 *
 * A home deriva o carrossel (\`featured\`) e a grade (ordem do array) deste
 * catálogo, eliminando listas fixas de slug.
 */

`

  const body = entries.map((e) => `  {\n${emitRawEntry(e)}\n  }`).join(',\n\n')

  return `${head}${doc}${types}${rawAnchor}\n${body}\n]\n\n${tail}`
}

function buildPhotosTs() {
  const parts = [
    '/**',
    ' * Fotos do catálogo – mapa puro \`slug → { image, logo, gallery }\` com as URLs',
    ' * de mídia REAIS dos parceiros (CSV \`Dados_Merch_Atualizado - Página1.csv\`),',
    ' * verificadas com HTTP 200. Regenerado por \`scripts/build_catalog.mjs\`.',
    ' *',
    ' * POR QUE NÃO \`import.meta.glob\`: esta camada é importada pela serverless',
    ' * function \`/api/merchants\` (Vercel), que roda fora do bundle do Vite. O macro',
    ' * \`import.meta.glob\` só existe no build do Vite e quebraria o empacotamento da',
    ' * função. Mantemos aqui só dados JSON-serializáveis (strings de URL).',
    ' *',
    ' * Regra de unicidade: nenhuma loja compartilha o HERO com outra (exigência de',
    ' * aceitação). A galeria são as fotos reais de salão; quando uma loja tem menos',
    ' * de 3, a própria capa completa o bento.',
    ' */',
    '',
    '/** Fotos da loja – \`image\` = hero do card/header, \`logo\` = avatar, \`gallery\` =',
    ' * bento de fotos reais do salão. */',
    'export interface MerchantPhotos {',
    '  image: string',
    '  logo: string',
    '  gallery: string[]',
    '}',
    '',
    '/** Fotos reais por slug (usado pelo merchants.ts). */',
    'export const PHOTOS: Record<string, MerchantPhotos> = {',
  ]
  for (const s of stores) {
    const m = mediaFor(s)
    parts.push(
      `  ${JSON.stringify(s.slug)}: {\n` +
        `    image: ${JSON.stringify(m.image)},\n` +
        `    logo: ${JSON.stringify(m.logo)},\n` +
        `    gallery: ${JSON.stringify(m.gallery)},\n` +
        `  },`,
    )
  }
  parts.push('}', '')
  return parts.join('\n')
}

const existingMerchants = readFileSync(MERCHANTS_PATH, 'utf8')
const merchantsTs = buildMerchantsTs(existingMerchants)
const photosTs = buildPhotosTs()

writeFileSync(MERCHANTS_PATH, merchantsTs)
writeFileSync(PHOTOS_PATH, photosTs)

console.log(`Regenerados ${entries.length} parceiros:`)
console.log(`  - ${MERCHANTS_PATH} (${merchantsTs.length.toLocaleString()} bytes)`)
console.log(`  - ${PHOTOS_PATH} (${photosTs.length.toLocaleString()} bytes)`)
console.log(`  - ofertas totais: ${entries.reduce((a, e) => a + e.offers.length, 0)}`)
console.log(`  - lojas em destaque (featured): ${entries.filter((e) => e.featured).length}`)
