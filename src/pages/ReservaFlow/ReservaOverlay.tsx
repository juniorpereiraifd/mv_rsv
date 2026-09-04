import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './ReservaOverlay.css'

/**
 * Durações das fases (ms). Soma = tempo até `onDone` (≈2,9 s), o que a página
 * de confirmação usa para navegar ao sucesso. Timers só em `useEffect` com
 * `clearTimeout` no cleanup (seguro para `StrictMode`).
 */
const LOADING_MS = 1200
const BURST_MS = 1700

/** Nº de partículas de confete do estouro (design: ~25). */
const CONFETTI_COUNT = 25
const CONFETTI_COLORS = ['#eb0033', '#1fad68', '#666666']

/** Config determinística de cada partícula (derivada só do índice – sem
 * `Math.random()`, para o render nunca mudar de frame a frame). */
interface Confetto {
  left: number // % horizontal
  width: number
  height: number
  color: string
  delayMs: number
  durMs: number
  driftPx: number // deslocamento X do translate3d (var --x)
  rotateDeg: number // rotação final (var --rot)
}

function buildConfetti(): Confetto[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    width: 6 + (i % 3) * 2,
    height: 10 + (i % 4) * 2,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delayMs: (i % 5) * 90,
    durMs: 1000 + (i % 4) * 140,
    driftPx: ((i % 7) - 3) * 20,
    rotateDeg: (i * 47) % 360,
  }))
}

const CONFETTI = buildConfetti()

interface ReservaOverlayProps {
  /** Chamado ao fim do estouro – a página então navega ao sucesso. */
  onDone: () => void
}

/**
 * ReservaOverlay – animação transiente de confirmação (CSS puro, sem lib), no
 * modelo dos quadros do Figma cMhyOvWvhsuRtOjTLvFvDH (125:12224/13416/12808).
 * Montado pela página de confirmação sobre todo o conteúdo:
 *   loading (~1,2 s): só o spinner 80px + "Confirmando sua reserva…" (versão
 *                      minimalista – o card esqueleto foi removido);
 *   burst  (~1,7 s):  loading colapsa (fade) e entra o final: check verde +
 *                      "Reserva confirmada!" + ~25 confetes caindo do topo;
 *   fim    → `onDone()`.
 *
 * `prefers-reduced-motion` NÃO é tratado aqui: quem decide é a página (no caso
 * reduzido ela navega direto ao sucesso sem montar este overlay), então este
 * componente sempre roda a sequência completa quando montado.
 *
 * Acessibilidade: `role="status"`/`aria-live` anunciam a fase corrente; o
 * fundo da página ganha `inert` pela página (não aqui); o scroll do body é
 * travado enquanto montado e restaurado no cleanup.
 */
export default function ReservaOverlay({ onDone }: ReservaOverlayProps) {
  const [phase, setPhase] = useState<'loading' | 'burst'>('loading')

  /* Guarda o onDone num ref: a página pode trocar a identidade do callback a
     cada render e isso não pode resetar o timer do burst. */
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  /* Trava o scroll do body enquanto o overlay está no ar; restaura no cleanup
     (o valor original pode já ter sido sobrescrito por outro overlay). */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  /* loading → burst depois de LOADING_MS. */
  useEffect(() => {
    const t = setTimeout(() => setPhase('burst'), LOADING_MS)
    return () => clearTimeout(t)
  }, [])

  /* fim do burst → onDone. Depende só de `phase` (não de `onDone`, via ref). */
  useEffect(() => {
    if (phase !== 'burst') return
    const t = setTimeout(() => onDoneRef.current(), BURST_MS)
    return () => clearTimeout(t)
  }, [phase])

  const isBurst = phase === 'burst'

  return (
    <div className={`reserva-overlay${isBurst ? ' reserva-overlay--burst' : ''}`}>
      {/* Estouro – confetes caem do topo cobrindo a tela toda (só no burst). */}
      {isBurst && (
        <div className="reserva-overlay__confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="reserva-overlay__confetto"
              style={
                {
                  '--i': i,
                  '--x': `${c.driftPx}px`,
                  '--rot': `${c.rotateDeg}deg`,
                  '--delay': `${c.delayMs}ms`,
                  '--dur': `${c.durMs}ms`,
                  left: `${c.left}%`,
                  width: c.width,
                  height: c.height,
                  background: c.color,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="reserva-overlay__stage">
        {/* Loading – colapsa (fade) quando o burst começa; fica montado para a
            transição de saída ser em CSS puro (sem timer extra). */}
        <div
          className={`reserva-overlay__loading${isBurst ? ' reserva-overlay__loading--done' : ''}`}
          aria-hidden={isBurst}
        >
          <span className="reserva-overlay__spinner" aria-hidden="true" />
          <p className="reserva-overlay__status">Confirmando sua reserva…</p>
        </div>

        {/* Done – entra no burst com pop. */}
        <div className="reserva-overlay__done">
          <span className="reserva-overlay__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
              <path
                d="M4.5 12.6l4.6 4.6 10.4-10.8"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="reserva-overlay__done-text">Reserva confirmada!</p>
        </div>
      </div>

      {/* Região viva: anuncia a fase corrente (texto troca no burst). */}
      <p className="reserva-overlay__live" role="status" aria-live="polite">
        {isBurst ? 'Reserva confirmada' : 'Confirmando sua reserva'}
      </p>
    </div>
  )
}
