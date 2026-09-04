import type { ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import ClientTvShell from './ClientTvShell'

/**
 * Breakpoint que liga o "modo TV". Acima dele (telas grandes / TV Touch) a
 * Visão Cliente TRAVA no layout mobile e aparece dentro do mockup de um iPhone
 * 17 Pro. Tablet comum fica abaixo deste valor (maior tablet portrait ≈ 1024px).
 */
export const TV_BREAKPOINT_PX = 1025

/**
 * ClientFrame – envolve CADA rota da Visão Cliente (ver main.tsx).
 *
 * Abaixo do breakpoint renderiza o filho normalmente: comportamento responsivo
 * atual, intacto. Acima do breakpoint renderiza o mockup de celular, cujo
 * iframe recarrega a MESMA rota num viewport estreito. Dentro do iframe a
 * largura é de celular (< breakpoint), então o próprio ClientFrame decide
 * "modo mobile" e monta a página pura — o mockup não se repete. Não há
 * recursão: a decisão é função apenas da largura do viewport.
 *
 * Convenção: rota nova da Visão Cliente entra SEMPRE dentro de um <ClientFrame>
 * em main.tsx (é o que faz ela ganhar o mockup na TV de graça).
 */
export default function ClientFrame({ children }: { children: ReactNode }) {
  const isTv = useMediaQuery(`(min-width: ${TV_BREAKPOINT_PX}px)`)

  if (isTv) return <ClientTvShell />
  return <>{children}</>
}
