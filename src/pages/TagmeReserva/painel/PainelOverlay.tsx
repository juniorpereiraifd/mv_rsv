import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from '../../../components/Icon/Icon'
import './PainelOverlay.css'

/** Duração da animação de saída – casa com a transição do CSS. */
const EXIT_MS = 220

interface PainelOverlayProps {
  open: boolean
  onClose: () => void
  title: string
  /** Título do botão X (aria-label). Padrão "Fechar". */
  closeLabel?: string
  children: ReactNode
}

/**
 * PainelOverlay – diálogo central do Painel Hostess (ações sobre um card de
 * reserva). Mesmo ciclo de vida do NovaReservaDrawer/BottomSheet: foco no
 * painel ao abrir (e devolução ao fechar), trava de scroll no body, Escape
 * fecha, animação de entrada/saída. Painel estreito centralizado sobre o
 * conteúdo da página (scrim escuro).
 */
export default function PainelOverlay({
  open,
  onClose,
  title,
  closeLabel = 'Fechar',
  children,
}: PainelOverlayProps) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setClosing(false)
      setVisible(true)
      return
    }
    if (visible) {
      setClosing(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setClosing(false)
      }, EXIT_MS)
      return () => clearTimeout(timer)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible) return
    const anterior = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => anterior?.focus()
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="painel-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`painel-overlay__panel${closing ? ' painel-overlay__panel--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="painel-overlay__head">
          <h2 className="painel-overlay__title">{title}</h2>
          <button
            type="button"
            className="painel-overlay__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
