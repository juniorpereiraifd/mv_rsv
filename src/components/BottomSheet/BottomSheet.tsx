import { useEffect, useRef, useState, type ReactNode } from 'react'
import './BottomSheet.css'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Rótulo acessível do diálogo (aria-label). */
  label: string
  /** false trava o sheet: tocar fora e o Escape não fecham (usado em fluxos
   * irreversíveis como a validação de localização do check-in). Padrão true. */
  dismissible?: boolean
  /** Classe extra no painel – variantes de tema do sheet (ex.: "Filtros",
   * Figma 133:2758, com canto/raio e paddings próprios). */
  panelClassName?: string
  /** Esconde a alça do drawer (a variante "Filtros" não tem alça). Padrão true. */
  showHandle?: boolean
  children: ReactNode
}

/** Duração da animação de saída – casa com a transição do CSS. */
const EXIT_MS = 280

/**
 * BottomSheet – painel que sobe da base da tela (padrão drawer, Figma
 * 97:6949 "cupom off only"). O overlay é transparente: o design não tem scrim,
 * o fundo da página (foto desfocada + overlay escuro) segue visível ao redor do
 * sheet. Fecha ao tocar fora do painel, no Escape ou devolvendo o foco a quem
 * abriu. A entrada usa `@keyframes` no CSS; a saída, a classe `--closing` com a
 * mesma duração, e o unmount espera a transição terminar.
 */
export default function BottomSheet({
  open,
  onClose,
  label,
  dismissible = true,
  panelClassName,
  showHandle = true,
  children,
}: BottomSheetProps) {
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

  // Trava a rolagem do body enquanto aberto
  useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  // Escape fecha (quando o sheet é descartável)
  useEffect(() => {
    if (!visible || !dismissible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visible, dismissible, onClose])

  if (!visible) return null

  return (
    <div className="bottom-sheet__overlay" onClick={dismissible ? onClose : undefined}>
      <div
        ref={panelRef}
        className={`bottom-sheet${closing ? ' bottom-sheet--closing' : ''}${panelClassName ? ` ${panelClassName}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {showHandle && <span className="bottom-sheet__handle" aria-hidden="true" />}
        {children}
      </div>
    </div>
  )
}
