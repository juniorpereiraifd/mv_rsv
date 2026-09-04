import { useState } from 'react'
import './RestaurantTabs.css'

interface TabDef {
  id: string
  label: string
  /** `id` da seção alvo (âncora de rolagem). */
  target: string
}

/** Tabs da página (design 68:3793): Benefícios | Fotos | Avaliações | Sobre. */
const TABS: TabDef[] = [
  { id: 'beneficios', label: 'Benefícios', target: 'ofertas' },
  { id: 'fotos', label: 'Fotos', target: 'fotos' },
  { id: 'avaliacoes', label: 'Avaliações', target: 'avaliacoes' },
  { id: 'sobre', label: 'Sobre', target: 'sobre' },
]

/**
 * RestaurantTabs – navegação de âncoras (design 68:3793): cada tab rola até a
 * seção correspondente (id no DOM) e marca a aba ativa com underline de 2px.
 * A barra de baixo (`border-bottom`) atravessa toda a largura do corpo.
 */
export default function RestaurantTabs() {
  const [active, setActive] = useState(TABS[0].id)

  const handleClick = (tab: TabDef) => {
    setActive(tab.id)
    document.getElementById(tab.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="restaurant-tabs" aria-label="Seções do restaurante">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`restaurant-tabs__tab${active === tab.id ? ' restaurant-tabs__tab--active' : ''}`}
          aria-current={active === tab.id ? 'true' : undefined}
          onClick={() => handleClick(tab)}
        >
          {tab.label}
          {active === tab.id && <span className="restaurant-tabs__line" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  )
}
