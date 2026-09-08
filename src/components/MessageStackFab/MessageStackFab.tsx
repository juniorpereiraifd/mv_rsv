import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Merchant } from '../../data/merchants'
import { getMerchantUI } from '../../data/merchants.ui'
import { listThreads } from '../../data/messages'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import './MessageStackFab.css'

/** Índice de rotação por ciclo (configurável; o design mostra 5 avatares). */
const CYCLE = 5

/** Milissegundos entre cada troca de avatar da pilha (carrossel vertical). */
const TICK_MS = 2600

/** Guarda os 5 restaurantes reais (threads mais recentes) da caixa de entrada. */
function topMerchants(): Merchant[] {
  const out: Merchant[] = []
  for (const thread of listThreads()) {
    const merchant = getMerchantUI(thread.slug)
    if (merchant) out.push(merchant)
    if (out.length >= CYCLE) break
  }
  return out
}

/**
 * MessageStackFab – FAB flutuante de mensagens 1:1 (Figma cMhyOvWvhsuRtOjTLvFvDH,
 * nó 163:4420 "Motion"). Fixado no canto inferior direito da página de Perfil,
 * sobreposto a todo o conteúdo (position: absolute sobre o `.perfil-page`
 * relative; se fosse `fixed` quebraria no mockup de TV que rola dentro do
 * viewport). Uma PILHA de avatares (logos dos restaurantes) com profundidade e
 * um ciclo que troca o avatar da FRENTE a cada `TICK_MS` (o de trás vem pra
 * frente, carrossel vertical), via rotação de um array em estado local.
 *
 * O clique num avatar roteia DIRETO pro chat 1:1 daquele restaurante
 * (`/mensagens/:slug`) – ao contrário do entrypoint do topo do Perfil, que abre
 * a lista geral (`/mensagens`).
 *
 * Sem biblioteca de animação no projeto: a transição da troca é CSS `transition`
 * (opacity/scale) e o giro do ciclo usa `setInterval`. Respeita
 * `prefers-reduced-motion`: sem timer, a pilha fica estática (o avatar da frente
 * é sempre o primeiro) – só a sobreposição de profundidade permanece.
 *
 * Acessibilidade: cada avatar é um `<Link>` com `aria-label` do nome da loja
 * (o alvo de toque é o avatar da frente). Os de trás têm `pointer-events: none`
 * (só o da frente é clicável – decisão: o clique aciona o chat mais recente).
 */
export default function MessageStackFab() {
  const merchants = topMerchants()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Frente da pilha = índice no array de `merchants`; gira quando `reduceMotion`.
  const [front, setFront] = useState(0)

  useEffect(() => {
    if (reduceMotion || merchants.length < 2) return
    const id = window.setInterval(() => {
      setFront((i) => (i + 1) % merchants.length)
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion, merchants.length])

  if (merchants.length === 0) return null

  // Sempre a partir da frente atual, percorre os avatares em ordem; o último da
  // lista volta a ser o primeiro (wrap) – a pilha gira contínua.
  const stack = Array.from({ length: merchants.length }, (_, k) => {
    const merchant = merchants[(front + k) % merchants.length]
    const layer = stackDepth(k, merchants.length)
    return { merchant, layer }
  })

  return (
    <div className="msg-fab" aria-label="Mensagens dos restaurantes">
      {stack.map(({ merchant, layer }) => (
        <Link
          key={merchant.slug}
          to={`/mensagens/${merchant.slug}`}
          className={`msg-fab__avatar msg-fab__avatar--l${layer}`}
          style={{ zIndex: 10 - layer }}
          aria-label={`Conversar com ${merchant.name}`}
          tabIndex={layer === 0 ? 0 : -1}
        >
          <img className="msg-fab__img" src={merchant.logo} alt="" />
        </Link>
      ))}
    </div>
  )
}

/** Profundidade da camada a partir da posição na pilha (0 = frente). Camadas
 * intermediárias escalam/deslocam; as últimas colapsam no mesmo spot do fundo
 * (profundidade falsa com largura fixa). */
function stackDepth(position: number, total: number): number {
  // pos 0 → 0 (frente), pos 1 → 1, pos 2 → 2 … até as 3 últimas espremidas.
  if (total <= 4) return position
  if (position <= 2) return position
  // A partir da 3ª, encosta no fundo (limita a pilha a ~4 níveis visíveis).
  return 2
}
