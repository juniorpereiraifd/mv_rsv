import { useState } from 'react'
import Icon from '../../../components/Icon/Icon'
import type { Merchant } from '../../../data/merchants'
import './GallerySection.css'

/** Nº de fotos exibidas no bento (design 68:3864): 1 grande + 1 média + 2 mini. */
const SHOWN_PHOTOS = 4

interface GallerySectionProps {
  merchant: Merchant
}

/** Conteúdo de um tile do bento: foto real, placeholder de câmera ou "+N". */
function TileContent({ src, count }: { src?: string; count?: number }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span className="gallery-section__placeholder" aria-hidden="true">
        <Icon name="camera" size={24} />
      </span>
    )
  }
  return (
    <>
      {/* Fallback neutro em runtime: se a URL pública de salão falhar no
          navegador (CDN/geo), o tile vira o mesmo placeholder de câmera dos
          slots vazios – nunca quebra nem esconde o bento. */}
      <img
        className="gallery-section__photo"
        src={src}
        alt=""
        onError={() => setFailed(true)}
      />
      {typeof count === 'number' && count > 0 && (
        <span className="gallery-section__count" aria-label={`${count} foto${count === 1 ? '' : 's'} a mais`}>
          <Icon name="image-gallery" size={20} style="Line" />
          + {count}
        </span>
      )}
    </>
  )
}

/**
 * GallerySection – bloco "Fotos" (design 68:3864). Bento de 2 colunas (361px):
 * a esquerda tem a foto grande (235px), a direita uma média (155px) e duas
 * miniaturas (72px) — a última com overlay "+N" quando há mais fotos que as 4
 * exibidas. O frame de cada tile é fixo; a foto se adapta a ele via
 * `object-fit: cover`, nunca o contrário. Slots sem foto mostram o placeholder
 * neutro de câmera.
 */
export default function GallerySection({ merchant }: GallerySectionProps) {
  const { gallery } = merchant
  const remaining = Math.max(0, gallery.length - SHOWN_PHOTOS)

  return (
    <section id="fotos" className="gallery-section">
      <h2 className="gallery-section__title">Fotos</h2>

      <div className="gallery-section__grid">
        <div className="gallery-section__tile gallery-section__tile--large">
          <TileContent src={gallery[0]} />
        </div>

        <div className="gallery-section__col">
          <div className="gallery-section__tile gallery-section__tile--medium">
            <TileContent src={gallery[1]} />
          </div>

          <div className="gallery-section__row">
            <div className="gallery-section__tile gallery-section__tile--thumb">
              <TileContent src={gallery[2]} />
            </div>
            <div className="gallery-section__tile gallery-section__tile--thumb">
              <TileContent src={gallery[3]} count={remaining} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
