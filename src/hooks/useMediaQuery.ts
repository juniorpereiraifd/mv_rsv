import { useEffect, useState } from 'react'

/**
 * Reage a uma media query do viewport (ex.: `(min-width: 1025px)`).
 *
 * O valor inicial é lido de forma síncrona (`window.matchMedia`) para o primeiro
 * render já decidir o modo correto — sem "flash" do estado errado. No modo TV o
 * mockup de celular depende desta decisão, então o hook atualiza via `change`
 * quando a janela cruza o breakpoint.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange() // sincroniza caso o estado inicial já tenha mudado desde o render
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
