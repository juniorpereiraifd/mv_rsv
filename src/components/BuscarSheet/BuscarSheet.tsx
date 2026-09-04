import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon'
import './BuscarSheet.css'

export interface BuscarSheetProps {
  open: boolean
  onClose: () => void
}

/** Duração da animação de saída – casa com as transições do CSS. */
const EXIT_MS = 200

/**
 * BuscarSheet – overlay "Buscar em" da home (Figma cMhyOvWvhsuRtOjTLvFvDH,
 * frame 139:3692 "Proposta": o painel do hub 139:4526 flutua sobre a home,
 * atrás de um scrim 139:4487 de tela cheia com blur). Porta de entrada do fluxo
 * de busca (fake door), aberta pela pílula "Buscar em Cambuí, Campinas" do
 * toolbar do BrandHeader.
 *
 * Antes, o hub era a página da rota `/buscar`; passou a ser este MODAL montado
 * pela home (estado local em App), sobre o conteúdo VIVO da home com blur
 * (decisão do usuário). O overlay cobre a viewport com tint + backdrop blur e o
 * painel `#f5f5f5` flutua perto do topo, com os quatro cantos arredondados
 * (raio 40) e uma faixa de home borrada acima (eco do y66 do frame).
 *
 * Saídas do painel:
 *   - X/Escape/tocar fora → `onClose` (volta ao estado fechado; sem router);
 *   - pílula 1 → troca de endereço (`/buscar/endereco`);
 *   - pílula 2 → busca de restaurantes (`/buscar/restaurantes`).
 * As pílulas são `<Link>`: navegar desmonta o App (e o overlay junto),
 * o que já fecha o modal sem passar por `onClose`. O endereço atual é fixo do
 * design ("Perto de mim em Cambuí, Campinas") – não há geolocalização real.
 */
export default function BuscarSheet({ open, onClose }: BuscarSheetProps) {
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Monta/desmonta com a animação de saída
  useEffect(() => {
    if (open) {
      setClosing(false)
      setVisible(true)
      return
    }
    if (visible) {
      setClosing(true)
      const timer = setTimeout(() => setVisible(false), EXIT_MS)
      return () => clearTimeout(timer)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Foco no painel ao abrir; devolve o foco a quem abriu ao fechar
  useEffect(() => {
    if (!visible) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => previouslyFocused?.focus()
  }, [visible])

  // Trava a rolagem da home enquanto aberto. Diferente do BottomSheet (que trava
  // `document.body`), aqui o scroller real da home é o `<html>` – `global.css`
  // põe `overflow-y: auto` no `html` e `html/body/#root` têm `height:100%` –,
  // então mexer no `body` NÃO trava a home. Travar o `documentElement` inline
  // preserva o `overflow-x: clip` do CSS (mexer na shorthand apagaria o clip).
  useEffect(() => {
    if (!visible) return
    const docEl = document.documentElement
    const previousOverflowY = docEl.style.overflowY
    docEl.style.overflowY = 'hidden'
    return () => {
      docEl.style.overflowY = previousOverflowY
    }
  }, [visible])

  // Escape fecha
  useEffect(() => {
    if (!visible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      className={`buscar-overlay${closing ? ' buscar-overlay--closing' : ''}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={`buscar-sheet${closing ? ' buscar-sheet--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar em Cambuí, Campinas"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="buscar-sheet__header">
          <h1 className="buscar-sheet__title">Buscar em</h1>
          <button
            type="button"
            className="buscar-sheet__close"
            aria-label="Fechar busca"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        {/* Pílula 1 (design): pin + "Perto de mim em Cambuí, Campinas".
            O endereço atual é fixo do design – a pílula navega para a troca
            de endereço (/buscar/endereco). */}
        <Link to="/buscar/endereco" className="buscar-pill">
          <Icon className="buscar-pill__icon" name="location" size={16} style="Line" />
          <span className="buscar-pill__text">
            <span className="buscar-pill__text-muted">Perto de mim em </span>
            <strong>Cambuí, Campinas</strong>
          </span>
        </Link>

        {/* Pílula 2: lupa + "Busque por restaurantes" → busca. */}
        <Link to="/buscar/restaurantes" className="buscar-pill">
          <Icon className="buscar-pill__icon" name="search" size={16} style="Line" />
          <span className="buscar-pill__text">Busque por restaurantes</span>
        </Link>

      </div>
    </div>
  )
}
