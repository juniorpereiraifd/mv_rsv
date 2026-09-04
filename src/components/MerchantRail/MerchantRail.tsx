import { Link } from 'react-router-dom'
import reservasUrl from '../../assets/categories/reservas.png'
import brindarUrl from '../../assets/categories/brindar.png'
import kidsUrl from '../../assets/categories/kids.png'
import romanticoUrl from '../../assets/categories/romantico.png'
import cafesUrl from '../../assets/categories/cafes.png'
import saudavelUrl from '../../assets/categories/saudavel.png'
import { CATEGORIAS } from '../../data/categorias'
import './MerchantRail.css'

/** Ilustração 40×40 de cada categoria (arquivos locais), casada por `slug`.
 * "Ao ar livre" reusa a ilustração de "Reservas", como no design. */
const CATEGORY_IMAGES: Record<string, string> = {
  reservas: reservasUrl,
  'pra-brindar': brindarUrl,
  'espaco-kids': kidsUrl,
  romantico: romanticoUrl,
  cafes: cafesUrl,
  'ao-ar-livre': reservasUrl,
  saudavel: saudavelUrl,
}

export interface CategoryItem {
  /** Segmento da rota da página da categoria (`/categorias/:slug`). */
  slug: string
  /** Rótulo da categoria, exibido sob o círculo. */
  label: string
  /** Ilustração 40×40 exibida dentro do círculo de 56px. */
  image: string
}

/** Categorias do rail "Categorias" (Figma node 2:8356) – ordem, slug e rótulo
 * vêm de `CATEGORIAS` (fonte única com a página de categoria); a imagem é o
 * PNG local casado por slug. "Reservas" fica de fora do carrossel (decisão de
 * produto), mas permanece no registro: a página /categorias/reservas continua
 * no ar para quem chega por deep-link. */
const CATEGORIES: CategoryItem[] = CATEGORIAS.filter(({ slug }) => slug !== 'reservas').map(
  ({ slug, label }) => ({ slug, label, image: CATEGORY_IMAGES[slug] }),
)

export interface MerchantRailProps {
  /** Categorias a exibir; usa o conjunto do design por padrão. */
  items?: CategoryItem[]
}

/**
 * MerchantRail – trilho horizontal de categorias ("Categorias", Figma 2:8356).
 * Cada item é um círculo de 56px com fundo neutro (#f5f5f5) contendo a
 * ilustração 40×40 da categoria e, abaixo, o rótulo de 10px em destaque.
 * Rola horizontalmente quando o trilho excede a largura do container.
 *
 * Cada item é um `<Link>` para a página da categoria (`/categorias/:slug`) –
 * a página reapresenta a seção alta da home (chips + grade) filtrada pela
 * categoria tocada. O nome acessível vem do rótulo visível; a thumb vira
 * decoração (`aria-hidden`).
 */
export default function MerchantRail({ items = CATEGORIES }: MerchantRailProps) {
  return (
    <div className="merchant-rail">
      {items.map((item) => (
        <Link
          key={item.slug}
          to={'/categorias/' + item.slug}
          className="merchant-rail__item"
        >
          <span className="merchant-rail__thumb" aria-hidden="true">
            <img className="merchant-rail__img" src={item.image} alt="" />
          </span>
          <span className="merchant-rail__label">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
