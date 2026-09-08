import cashbackUrl from '../../assets/card/icon-cashback.svg'
import exclusiveUrl from '../../assets/card/icon-exclusive.svg'
import leve2pague1Url from '../../assets/card/icon-leve2pague1.svg'
import gourmetUrl from '../../assets/card/icon-tag.svg'
import top50LeftUrl from '../../assets/card/top50-l1.svg'
import top50RightUrl from '../../assets/card/top50-l2.svg'
import giftUrl from '../../assets/card/icon-gift.svg'
import cameraUrl from '../../assets/icon/icon-camera.svg'
import parkUrl from '../../assets/icon/amenity-park.svg'
import musicUrl from '../../assets/icon/amenity-music.svg'
import accessibleUrl from '../../assets/icon/amenity-accessible.svg'
import wifiUrl from '../../assets/icon/amenity-wifi.svg'
import parkingUrl from '../../assets/icon/amenity-parking.svg'
import acUrl from '../../assets/icon/amenity-ac.svg'
import petUrl from '../../assets/icon/amenity-pet.svg'
import checkUrl from '../../assets/card/icon-check.svg'
import closeUrl from '../../assets/icon/icon-close.svg'
import './Icon.css'

/**
 * Glifos da fonte de ícones da marca (`pomodoro-icon-filled` – a família que o
 * design referencia como `<Icon style="Filled"/>`). Os codepoints abaixo vêm da
 * fonte da verdade: os nós de TEXTO do design carregam o nome semântico
 * (`icon-fire`, `icon-reward`, `icon-loyalty`, …) e o próprio caractere do
 * glifo. Renderizados em `<span>` com `font-size` = tamanho do ícone e
 * `color: inherit` – a cor vem do tom do container via CSS.
 */
const FONT_ICONS = {
  coupon: '', // icon-dine-in-coupon – cupom/ingresso com canto recortado
  cortesia: '', // icon-reward – caixa de presente com laço
  fire: '', // icon-fire – chama
  filter: '', // icon-filter – funil de filtros
  loyalty: '', // icon-loyalty – cupom/ingresso com estrela
  'restaurant-lounge': '', // icon-restaurant-lounge – poltrona
  star: '', // estrela de 5 pontas
  'star-disabled': '', // mesma estrela, acinzentada via `.rating--closed`
  profile: '', // icon-profile – perfil de usuário, botão à direita do toolbar
  // (design 64:2651). Atenção: U+E86B é a CARTEIRA (wallet), shape errado aqui.
  clube: '', // icon-clube-ifood – losango SÓLIDO do Clube (design 68:3833).
  // Códepoint correto na fonte local; o código antigo usava U+E881, que é o
  // losango VAZADO (shape errado para o bloco "Ganhe também").
  clock: '', // relógio – badge "Expira" das ofertas e horas (design 68:3825)
  pin: 'ຎ', // pin de localização – overlay no tile do mapa (design 68:4065)
  // chevron de avançar (design 112:8373/112:8457) – mesma pontaria da família
  // Line: as duas famílias compartilham o índice por glifo (ex.: `clock`
  // U+E861 existe nas duas); verificado por IoU do raster contra o Line U+E88E.
  'chevron-right': '',
} as const

/** Glifos da variante `Line` (fonte `pomodoro-icon-line`) – ícones de contorno,
 * usados com `<Icon style="Line"/>`. */
const LINE_ICONS = {
  back: '', // seta/chevron de voltar – botão à esquerda do toolbar (design 64:2636)
  chat: '', // icon-chat (U+E812, unicode-mapv2.54) – balão de conversa. Botão de
  // mensagens do toolbar do Perfil (design 163:3457 "icon", mesmo desenho do nó
  // 112:8181 chat/chat-default). O nó de texto do Figma está rotulado "icon-alert",
  // mas o caractere dele é U+E812 = chat (o sino/alert é U+E804) – balão é o certo
  // pro entrypoint de mensagens 1:1.
  route: '', // icon-directions – botão "Como chegar" e linha de endereço (design 68:3789)
  'chevron-right': '', // chevron de "ver mais" (design 68:4058)
  'chevron-down': '', // chevron apontando para BAIXO – cabeçalhos expansíveis da
  // sheet de filtros (design 133:2758). No design a linha gira 180° (chevron
  // para CIMA) quando o grupo está expandido – o CSS aplica a rotação.
  clock: '', // relógio – mesmo glifo da família Filled (design 68:3780)
  share: '', // icon-share – compartilhar, toolbar do restaurante (design 68:4084)
  'image-gallery': '', // icon-image-gallery – fotos, overlay "+N" da galeria (design 68:3864)
  order: '', // smartphone com carrinho de compras – card "Visão do restaurante" (design 103:8014)
  user: '', // perfil de usuário – card "Visão do cliente" (design 103:8019)
  search: '', // icon-search – lupa (pílula 2 do hub e campo de busca)
  location: '', // icon-location – pin (pílula 1 do hub, campo "Buscar endereço")
  'locate-me': '', // localização atual (linha "Usar minha localização")
  home: '', // casa (linha "Casa")
  work: '', // trabalho (linha "Trabalho")
  calendar: '', // icon-calendar (U+E80D) – calendário/agendamento – card "Visão de reservas"
} as const

/** Assets vetoriais com forma fixa da marca – não existem na fonte com o mesmo
 * desenho (%, "1+1", selo Gourmet, laço de exclusividade, coroas Top50) ou usam
 * uma versão mais nova da fonte do que a local (icon-exclusive), então seguem
 * como SVG. */
const IMG_ICON_SOURCES = {
  cashback: cashbackUrl,
  exclusive: exclusiveUrl,
  leve2pague1: leve2pague1Url,
  gourmet: gourmetUrl,
  'top50-left': top50LeftUrl,
  'top50-right': top50RightUrl,
  gift: giftUrl, // presente – botão de ação da pílula de busca (design 64:2644)
  camera: cameraUrl, // câmera – tile de foto da galeria (design 68:3851)
  park: parkUrl, // árvore – comodidade "área externa"
  music: musicUrl, // nota musical – comodidade "música ao vivo"
  accessible: accessibleUrl, // cadeirante – comodidade "acessível"
  wifi: wifiUrl, // sinal wi-fi – comodidade
  parking: parkingUrl, // "P" – comodidade "estacionamento"
  ac: acUrl, // floco de neve – comodidade "ar-condicionado"
  pet: petUrl, // pata – comodidade "pet friendly"
  check: checkUrl, // check verde de sucesso – botão "Check-in realizado" (design 100:7846)
  close: closeUrl, // X de fechar – toolbar "Filtros" da bottom sheet (design 133:2758).
  // Não há glifo de X na fonte local (E800–E8CF escaneado), então vira asset.
} as const

export type IconName = keyof typeof FONT_ICONS | keyof typeof LINE_ICONS | keyof typeof IMG_ICON_SOURCES

/** Família da fonte de ícones – `Filled` (sólida, padrão) ou `Line` (contorno). */
export type IconStyle = 'Filled' | 'Line'

export interface IconProps {
  /** Identificador do glifo. Os da fonte são tintáveis via `color`; o resto, asset. */
  name: IconName
  /** Tamanho único (width = height). Ignorado se `width`/`height` forem passados. */
  size?: number
  width?: number
  height?: number
  className?: string
  /** Variante da fonte de ícones (só afeta glifos de fonte). Padrão: `Filled`. */
  style?: IconStyle
}

/**
 * Icon – glifo da marca. Usa a fonte `pomodoro-icon-filled` quando o desenho
 * existe nela; os demais vêm de assets vetoriais. Sempre decorativo
 * (`aria-hidden`, `alt=""`).
 */
/** Type guard – true quando `name` é um glifo da fonte (tintável via `color`),
 * na família correspondente a `style`. */
function isFontIcon(name: IconName, style: IconStyle): name is keyof typeof FONT_ICONS | keyof typeof LINE_ICONS {
  return style === 'Line' ? name in LINE_ICONS : name in FONT_ICONS
}

export default function Icon({ name, size, width, height, className, style = 'Filled' }: IconProps) {
  const cls = `icon${className ? ` ${className}` : ''}`
  const line = style === 'Line'
  const fontMap = line ? LINE_ICONS : FONT_ICONS

  if (isFontIcon(name, style)) {
    const dim = width ?? height ?? size ?? 12
    return (
      <span
        className={`${cls} icon--font${line ? ' icon--font-line' : ''}`}
        style={{ fontSize: dim, width: dim, height: dim }}
        aria-hidden="true"
      >
        {fontMap[name as keyof typeof fontMap]}
      </span>
    )
  }

  const src = IMG_ICON_SOURCES[name as keyof typeof IMG_ICON_SOURCES]
  const imgStyle = width || height ? { width, height } : size ? { width: size, height: size } : undefined
  return <img className={cls} src={src} alt="" style={imgStyle} />
}
