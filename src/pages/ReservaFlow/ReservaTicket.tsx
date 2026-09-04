import type { Merchant } from '../../data/merchants'
import type { ReservaSnapshot } from '../../data/reserva'
import { reservaDateLabel } from '../../data/reserva'
import './ReservaTicket.css'

/** "2" → "2 pessoas" / "1" → "1 pessoa". */
function peopleLabel(n: number): string {
  return n === 1 ? '1 pessoa' : `${n} pessoas`
}

interface ReservaTicketProps {
  merchant: Merchant
  snapshot: ReservaSnapshot
}

/**
 * ReservaTicket – o ticket do fluxo de confirmação (Figma cMhyOvWvhsuRtOjTLvFvDH:
 * revisão 125:12134 "Background+Shadow", sucesso 125:12037). Superfície #f5f5f5
 * radius 20 com a foto do restaurante (158px, 30% menor que os 226px do
 * design) e o corpo empilhado logo abaixo
 * dela (sem sobreposição – o texto nunca cai sobre a imagem); no corpo: nome da
 * loja 24px, linha Data/Horário/Convidados e o Endereço. Compartilhado entre as
 * duas telas (só a página muda o que vai ao redor).
 */
export default function ReservaTicket({ merchant, snapshot }: ReservaTicketProps) {
  return (
    <article className="reserva-ticket">
      <img className="reserva-ticket__photo" src={merchant.image} alt="" />

      <div className="reserva-ticket__body">
        <h2 className="reserva-ticket__name">{merchant.name}</h2>

        <dl className="reserva-ticket__facts">
          <div className="reserva-ticket__fact">
            <dt className="reserva-ticket__label">Data</dt>
            <dd className="reserva-ticket__value">{reservaDateLabel(snapshot.dateISO)}</dd>
          </div>
          <div className="reserva-ticket__fact">
            <dt className="reserva-ticket__label">Horário</dt>
            <dd className="reserva-ticket__value">{snapshot.timeLabel}</dd>
          </div>
          <div className="reserva-ticket__fact">
            <dt className="reserva-ticket__label">Convidados</dt>
            <dd className="reserva-ticket__value">{peopleLabel(snapshot.people)}</dd>
          </div>
        </dl>

        <div className="reserva-ticket__address">
          <span className="reserva-ticket__label">Endereço</span>
          <p className="reserva-ticket__address-value">{merchant.address}</p>
        </div>
      </div>
    </article>
  )
}
