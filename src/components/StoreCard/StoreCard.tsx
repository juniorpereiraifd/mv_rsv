import './StoreCard.css'

export interface StoreCardProps {
  /** Card height in px (the wireframe uses 200 and 310). */
  height?: number
}

/**
 * StoreCard – a placeholder card in a content section. In the wireframe this is
 * a plain gray block; it becomes a restaurant/store card (image, rating, ETA,
 * etc.) as you build on this structure.
 */
export default function StoreCard({ height = 200 }: StoreCardProps) {
  return <div className="store-card" style={{ height }} aria-hidden="true" />
}
