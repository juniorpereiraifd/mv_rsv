import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './ClientTvShell.css'

/**
 * Dimensões lógicas do iPhone 17 Pro (tela ~402×874 pt, proporção moderna).
 * Ajuste estas constantes se o mockup final do Figma trouxer outro frame.
 */
const SCREEN_W = 402
const SCREEN_H = 874
/** Espessura da moldura (bezel) em volta da tela. */
const BEZEL = 16
const OUTER_W = SCREEN_W + BEZEL * 2
const OUTER_H = SCREEN_H + BEZEL * 2
/** Respiro entre a moldura e as bordas da TV (fração da viewport). */
const MARGIN = 0.04

/**
 * ClientTvShell – a "Visão Cliente" numa TV/Tela grande: fundo vermelho com um
 * mockup de iPhone 17 Pro centralizado, gigante (escala calculada para caber no
 * viewport). A tela do celular é um <iframe> carregando a MESMA rota atual.
 *
 * Por que iframe (e não limitar max-width de uma div): o iframe cria um layout
 * viewport próprio de ~402px. Lá dentro media queries, `50vw`, `position:
 * fixed`/`sticky` e a rolagem enxergam a "tela do celular" — o layout mobile
 * surge sozinho e nada que a página usa hoje precisa de override. O documento
 * pai apenas centraliza a moldura; o iframe é quem roda o app mobile de verdade.
 *
 * Saída do mockup: o link "Menu principal" navega o documento PAI para /move
 * (Seleção de perfil), que fica fora do ClientFrame e segue fluido na TV.
 */
export default function ClientTvShell() {
  const { pathname, search } = useLocation()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  // URL da rota atual. O iframe abre este mesmo caminho; por ser um documento
  // estreito, a árvore interna renderiza a página mobile sem o shell. O query
  // param `mockup=1` marca o documento interno como "dentro do mockup" — sem
  // ele o conteúdo é idêntico ao de um celular real e não pode diferenciar os
  // dois casos só pela largura (402px ≈ largura de celular). main.tsx lê o
  // param e aplica o estilo escopado (ex.: gutter de 12px).
  const innerUrl = `${window.location.origin}${pathname}${search}${
    search ? '&' : '?'
  }mockup=1`

  // Escala do mockup: o maior fator que faz o celular (real, sem zoom de
  // layout) caber no viewport com folga. O texto/imagens ficam ampliados para
  // leitura a distância — imitando segurar um celular gigante.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const fit = () => {
      const { clientWidth, clientHeight } = el
      const s = Math.min(
        (clientWidth * (1 - 2 * MARGIN)) / OUTER_W,
        (clientHeight * (1 - 2 * MARGIN)) / OUTER_H,
      )
      setScale(Math.max(0.1, s))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="tv">
      <Link to="/move" className="tv__exit">
        ‹ Menu principal
      </Link>

      <div className="tv__phone" style={{ '--tv-scale': scale } as CSSProperties}>
        <div className="tv__bezel">
          <span className="tv__island" aria-hidden="true" />
          <iframe className="tv__screen" src={innerUrl} title="Visão do cliente" />
        </div>
      </div>
    </div>
  )
}
