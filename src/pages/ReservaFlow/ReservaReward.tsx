import type { Merchant, Offer } from '../../data/merchants'
import './ReservaReward.css'

interface ReservaRewardProps {
  merchant: Merchant
  reward: Offer
}

/**
 * ReservaReward – o voucher da recompensa do fluxo de confirmação (Figma
 * cMhyOvWvhsuRtOjTLvFvDH: revisão 125:12186 / sucesso 125:12089, Componente
 * "Presente da casa"). Mesmo card branco do `ReservaSection`, mas aqui é
 * INFORMATIVO (sem `<Link>`): sair do fluxo no meio da confirmação perderia o
 * estado da reserva; a regra do benefício já está no widget da loja.
 */
export default function ReservaReward({ merchant, reward }: ReservaRewardProps) {
  return (
    <div className="reserva-voucher">
      <img className="reserva-voucher__logo" src={merchant.logo} alt="" />

      <div className="reserva-voucher__content">
        <h3 className="reserva-voucher__title">{reward.title}</h3>
        <p className="reserva-voucher__subtitle">{reward.subtitle}</p>
        <span className="reserva-voucher__more">Saiba mais</span>
      </div>
    </div>
  )
}
