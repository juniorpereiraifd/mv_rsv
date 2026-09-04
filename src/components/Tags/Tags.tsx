import Icon, { IconName } from '../Icon/Icon'
import './Tags.css'

export type TagsVariant =
  | 'cupom-r20'
  | 'oferta-local'
  | 'leve2pague1'
  | 'cortesia'
  | 'cashback'
  | 'indica'
  | 'o3o-clube'
  | 'o3o-merchant'
  | 'fidelidade'
  | 'bobs-fa'

type TagsTone = 'success' | 'clube' | 'informative'

interface TagsDefinition {
  label: string
  icon: IconName
  /** Non-square icons (e.g. "Leve 2, pague 1") get explicit dimensions. */
  iconWidth?: number
  iconHeight?: number
  tone: TagsTone
}

/** The offer-pill variants of the Card (design node 1:6147) and of the
 * announcement card rail (design node 2:8581 – oferta-local | cashback | indica). */
const TAGS: Record<TagsVariant, TagsDefinition> = {
  'cupom-r20': { label: 'R$ 20 no local', icon: 'coupon', tone: 'success' },
  'oferta-local': { label: 'R$ 20 ao reservar', icon: 'restaurant-lounge', tone: 'informative' },
  leve2pague1: { label: 'Leve 2, pague 1', icon: 'leve2pague1', iconWidth: 13, iconHeight: 10, tone: 'success' },
  cortesia: { label: 'Ganhe cortesia', icon: 'cortesia', tone: 'success' },
  cashback: { label: '10% de cashback', icon: 'cashback', tone: 'success' },
  indica: { label: 'Peça 2, pague 1', icon: 'leve2pague1', iconWidth: 13, iconHeight: 10, tone: 'success' },
  'o3o-clube': { label: 'R$ 20 no delivery', icon: 'coupon', tone: 'clube' },
  'o3o-merchant': { label: 'R$ 20 no delivery', icon: 'coupon', tone: 'success' },
  fidelidade: { label: 'Programa de fidelidade', icon: 'loyalty', tone: 'success' },
  'bobs-fa': { label: 'Leve 2, pague 1 ao reservar', icon: 'restaurant-lounge', tone: 'informative' },
}

export interface TagsProps {
  /** Offer pill variant – see TAGS for the label/icon/tone per variant. */
  variant?: TagsVariant
}

/**
 * Tags – the store's offer pill in the Card info block.
 * A 20px rounded capsule: 12px icon + 10px bold label, colored by tone
 * (success green, clube purple, informative blue).
 */
export default function Tags({ variant = 'cupom-r20' }: TagsProps) {
  const { label, icon, iconWidth, iconHeight, tone } = TAGS[variant]

  return (
    <span className={`tags tags--${tone}`}>
      <Icon name={icon} size={12} width={iconWidth} height={iconHeight} />
      <span className="tags__label">{label}</span>
    </span>
  )
}
