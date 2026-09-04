import { useState } from 'react'
import type { Merchant } from '../../data/merchants'
import './StampCard.css'

/**
 * StampCard – cartela de selos do programa de fidelidade (Figma
 * "-Move--Comer-Fora": estado vazio 123:9266, em progresso/completa 124:10513 e
 * recompensa 123:9785).
 *
 * Substitui o ticket de cupom (`beneficio-card`) na BeneficioPage SOMENTE para
 * lojas com `cardTags: "fidelidade"` (ex. Ofner – Pinheiros). O card tem duas
 * faces alternadas por botões-pill dentro do próprio elemento:
 *  - "cartela": grade 3×2 de selos – cada check-in acumulado (prop `stamps`)
 *    preenche um selo com a logo da loja, até o limite `STAMP_CARD_LIMIT`.
 *  - "recompensa": foto da loja, título da recompensa (com a pill de expiração
 *    quando a cartela está completa) e o recado + bullets do que vale a pena.
 *
 * O nº de selos vem do provider de check-ins (check-ins acumulados por loja), a
 * página não calcula nada aqui.
 *
 * Desvios documentados: sem dados de validade/recompensa por loja no catálogo,
 * a copy é genérica e fica centralizada nas constantes abaixo – as props
 * `validityLabel` e `rewardLabel` permitem plugar copy real no futuro sem mudar
 * o modelo de dados. Os overlays flutuantes dos frames do Figma (ícones de 20px
 * e o "skeleton" sobre a grade) parecem artefatos de anotação do mock e não
 * foram reproduzidos.
 */

/** Limite de selos da cartela (grade 3×2) – fixo no design. */
export const STAMP_CARD_LIMIT = 6

/** Texto da pill de expiração da recompensa (mesma regra do ticket de cupom). */
const EXPIRES_LABEL = 'Expira em 3h 59min'

/** Copy genérica da recompensa (ver desvio no cabeçalho do componente). */
const REWARD_SUBTITLE = 'Ao completar a cartela'
const REWARD_BULLETS = [
  'Apresente esta tela ao atendente pra validar a recompensa e aproveite no seu próximo pedido no local.',
]

export interface StampCardProps {
  /** Loja dona da cartela (nome, logo e foto vêm daqui). */
  merchant: Merchant
  /** Nº de selos preenchidos (check-ins acumulados) – 0..STAMP_CARD_LIMIT. */
  stamps: number
  /** Override da linha de status da cartela (ex. validade real da cartela). */
  validityLabel?: string
  /** Override do título da face de recompensa (nome da recompensa real). */
  rewardLabel?: string
}

/** Linha de status da cartela a partir dos selos preenchidos (copy genérica). */
function cartelaStatus(filled: number): string {
  if (filled >= STAMP_CARD_LIMIT) {
    return 'Cartela completa! Apresente a recompensa ao atendente'
  }
  if (filled > 0) {
    const left = STAMP_CARD_LIMIT - filled
    const falta = left === 1 ? 'Falta' : 'Faltam'
    const checkin = left === 1 ? 'check-in' : 'check-ins'
    return `${falta} ${left} ${checkin} para ganhar a recompensa`
  }
  return `Complete ${STAMP_CARD_LIMIT} check-ins para ganhar uma recompensa`
}

export default function StampCard({
  merchant,
  stamps,
  validityLabel,
  rewardLabel,
}: StampCardProps) {
  const [face, setFace] = useState<'cartela' | 'recompensa'>('cartela')
  const reward = face === 'recompensa'
  // Limita ao tamanho físico da grade (defensivo contra `count` acima do limite).
  const filled = Math.min(Math.max(stamps, 0), STAMP_CARD_LIMIT)
  const status = validityLabel ?? cartelaStatus(filled)

  return (
    <article className={reward ? 'stamp-card stamp-card--reward' : 'stamp-card'}>
      {reward ? (
        <>
          <div
            className="stamp-card__photo"
            style={{ backgroundImage: `url(${merchant.image})` }}
            aria-hidden="true"
          />

          <div className="stamp-card__reward-body">
            <header className="stamp-card__reward-head">
              <h2 className="stamp-card__reward-title">{rewardLabel ?? 'Recompensa'}</h2>
              {filled >= STAMP_CARD_LIMIT && (
                <span className="stamp-card__expires">{EXPIRES_LABEL}</span>
              )}
            </header>

            <p className="stamp-card__reward-sub">{REWARD_SUBTITLE}</p>

            <div className="stamp-card__note">
              <p className="stamp-card__note-title">{`Recado de ${merchant.name}`}</p>
              <ul className="stamp-card__bullets">
                {REWARD_BULLETS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="stamp-card__row stamp-card__row--reward">
            <span className="stamp-card__avatar">
              <img className="stamp-card__avatar-logo" src={merchant.logo} alt="" />
            </span>
            <p className="stamp-card__name">{merchant.name}</p>
            <button
              type="button"
              className="stamp-card__pill stamp-card__pill--back"
              onClick={() => setFace('cartela')}
            >
              Ver cartela
            </button>
          </div>
        </>
      ) : (
        <>
          <ol
            className="stamp-card__grid"
            aria-label={`Cartela de fidelidade — ${filled} de ${STAMP_CARD_LIMIT} selos`}
          >
            {Array.from({ length: STAMP_CARD_LIMIT }, (_, index) => (
              <li key={index} className="stamp-card__slot">
                {index < filled ? (
                  <img
                    className="stamp-card__stamp stamp-card__stamp--filled"
                    src={merchant.logo}
                    alt=""
                  />
                ) : (
                  <span className="stamp-card__stamp stamp-card__stamp--empty" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>

          <div className="stamp-card__row">
            <div className="stamp-card__info">
              <p className="stamp-card__name">{merchant.name}</p>
              <p className="stamp-card__status" aria-live="polite">
                {status}
              </p>
            </div>
            <button
              type="button"
              className="stamp-card__pill stamp-card__pill--rewards"
              onClick={() => setFace('recompensa')}
            >
              Ver recompensas
            </button>
          </div>
        </>
      )}
    </article>
  )
}
