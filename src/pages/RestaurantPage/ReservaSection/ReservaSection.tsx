import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../../../components/Icon/Icon'
import type { Merchant } from '../../../data/merchants'
import { localDateISO } from '../../../data/reserva'
import './ReservaSection.css'

interface ReservaSectionProps {
  merchant: Merchant
}

/** Nomes dos dias da semana a partir de `getDay()` (0 = domingo). */
const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

/** Mini-rótulo "N ofertas" de cada célula de dia – fixo por posição como no
 * Figma (posições 1→4: 2/1/2/2, node 115:8587/115:8591/…), repetido nos dias
 * seguintes do carrossel, independente da loja. A tag diz quantos horários
 * daquele dia têm oferta (são os primeiros N chips da fileira de horários). */
const OFERTAS_PER_DAY = [2, 1, 2, 2, 1, 2, 2]

/** Deslocamentos (min) a partir da abertura do expediente → chips de horário:
 * abertura +60/+120/+210/+240 min (ver decisão de produto no plano). */
const OPEN_OFFSETS_MIN = [60, 120, 210, 240]

/** Fallback quando o `hours` da loja não puder ser parseado (mesmo resultado da
 * loja que abre 17h, ex. boa-praca-paulista). */
const FALLBACK_TIMES = ['18:00', '19:00', '20:30', '21:00']

/** Fim do expediente (min) a partir do qual o segmento é considerado "noturno". */
const EVENING_FROM_MIN = 21 * 60

interface DayOption {
  /** Dia do mês, ex. "02". */
  dd: string
  /** "Hoje" / "Amanhã" / dia da semana abreviado (SEG, TER…). */
  label: string
  /** Nº de ofertas do mini-rótulo (fixo por posição). */
  count: number
  /** Data real do dia – carregada pela célula até a tela de confirmação (o
   * snapshot da reserva viaja com o dia escolhido em `localDateISO`). */
  date: Date
}

/** Células de dia: 7 datas a partir de hoje (data real, nunca desatualizada).
 * O carrossel precisa de mais itens que a largura do painel para rolar. */
function buildDays(): DayOption[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return {
      dd: String(date.getDate()).padStart(2, '0'),
      label: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : WEEKDAYS[date.getDay()],
      count: OFERTAS_PER_DAY[i] ?? 0,
      date,
    }
  })
}

/** "2" → "2 ofertas" / "1" → "1 oferta". */
function pluralizeOfertas(n: number): string {
  return n === 1 ? '1 oferta' : `${n} ofertas`
}

/** Parseia um segmento "HH:MM - HH:MM" → [abertura, fechamento] em minutos. */
function parseSegment(segment: string): [number, number] | null {
  const m = segment.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (!m) return null
  return [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])]
}

/** 750 → "12:30". */
function formatTime(minOfDay: number): string {
  const h = Math.floor(minOfDay / 60)
  const mm = minOfDay % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/**
 * Chips de horário derivados do expediente real da loja (`merchant.hours`, ex.
 * dual "11:30 - 14:00 / 17:00 - 22:30"). Escolhe o segmento noturno (fim ≥ 21h,
 * senão o último), gera abertura +60/+120/+210/+240 min arredondados a :00/:30
 * e descarta os que passam do fechamento. Limite de 4 chips.
 */
function buildTimes(hours: string): string[] {
  const segments = hours
    .split('/')
    .map((s) => s.trim())
    .map(parseSegment)
    .filter((s): s is [number, number] => s !== null)

  if (segments.length === 0) return FALLBACK_TIMES

  const [open, close] =
    segments.find(([, closeMin]) => closeMin >= EVENING_FROM_MIN) ?? segments[segments.length - 1]

  const out: string[] = []
  for (const offset of OPEN_OFFSETS_MIN) {
    const rounded = Math.round((open + offset) / 30) * 30
    if (rounded > close) continue
    const time = formatTime(rounded)
    if (!out.includes(time)) out.push(time)
  }
  return out.length > 0 ? out.slice(0, 4) : FALLBACK_TIMES
}

/**
 * ReservaSection – widget "Reserva de Mesa" (design yXiFmGvXvY1PTn3fRNHwSB,
 * node 115:8558): seletor interativo (pessoas → dia → horário) + card da
 * oferta de reserva. Substitui o `OfferSection` nas lojas cuja oferta tem
 * `availability` "Reserva". Mantém `id="ofertas"` para a âncora da aba
 * "Benefícios" do `RestaurantTabs`.
 */
export default function ReservaSection({ merchant }: ReservaSectionProps) {
  const [people, setPeople] = useState(2)
  const [activeDay, setActiveDay] = useState(0)
  const [activeTime, setActiveTime] = useState(0)
  const navigate = useNavigate()

  const days = buildDays()
  const times = buildTimes(merchant.hours)
  const reservaIndex = merchant.offers.findIndex((offer) =>
    offer.availability.includes('Reserva'),
  )
  const reward = merchant.offers[reservaIndex >= 0 ? reservaIndex : 0]
  const rewardOfferIndex = reservaIndex >= 0 ? reservaIndex : 0
  const peopleLabel = people === 1 ? '1 pessoa' : `${people} pessoas`

  /* A tag "N ofertas" do dia ativo diz quantos horários daquele dia têm oferta.
     São os horários mais vazios do expediente — os PRIMEIROS chips da fileira
     (ex. 18h/19h), marcados com o ícone de relógio. Os demais horários (ex.
     20:30/21h, quando o salão está cheio) não têm oferta: quem os escolhe não
     vê o card "Ao reservar você ganha". */
  const promoCount = Math.min(OFERTAS_PER_DAY[activeDay] ?? 0, times.length)
  const isPromoSlot = (index: number): boolean => index < promoCount

  /** Trocar de dia redefine o horário pro primeiro disponível (o card depende
   * do par dia×horário e o 1º chip é sempre um horário com oferta). */
  const selectDay = (index: number): void => {
    setActiveDay(index)
    setActiveTime(0)
  }

  return (
    <section id="ofertas" className="reserva-section">
      <h2 className="reserva-section__title">Reserva de Mesa</h2>

      <div className="reserva-panel">
        {/* Número de pessoas (115:8569) */}
        <div className="reserva-block">
          <span className="reserva-label">Número de pessoas</span>
          <div className="reserva-stepper">
            <button
              type="button"
              className="reserva-stepper__btn"
              aria-label="Diminuir número de pessoas"
              disabled={people <= 1}
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
            >
              <svg className="reserva-stepper__glyph reserva-stepper__glyph--minus" viewBox="0 0 10.8333 1.24997" aria-hidden="true">
                <path d="M0 1.24997V0H10.8333V1.24997H0V1.24997" fill="currentColor" />
              </svg>
            </button>

            <span className="reserva-stepper__count" aria-live="polite">
              {peopleLabel}
            </span>

            <button
              type="button"
              className="reserva-stepper__btn"
              aria-label="Aumentar número de pessoas"
              disabled={people >= 12}
              onClick={() => setPeople((p) => Math.min(12, p + 1))}
            >
              <svg className="reserva-stepper__glyph" viewBox="0 0 10.8333 10.8333" aria-hidden="true">
                <path
                  d="M4.79165 6.04162H0V4.79165H4.79165V0H6.04162V4.79165H10.8333V6.04162H6.04162V10.8333H4.79165V6.04162V6.04162"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Dias disponíveis (115:8581) */}
        <div className="reserva-block">
          <span className="reserva-label reserva-label--center">Dias disponíveis</span>
          <div className="reserva-days" role="group" aria-label="Dias disponíveis">
            {days.map((day, index) => (
              <button
                type="button"
                key={`${day.dd}-${day.label}`}
                className={`reserva-day${index === activeDay ? ' reserva-day--active' : ''}`}
                aria-pressed={index === activeDay}
                onClick={() => selectDay(index)}
              >
                <span className="reserva-day__dd">{day.dd}</span>
                <span className="reserva-day__label">{day.label}</span>
                <span className="reserva-day__oferta">{pluralizeOfertas(day.count)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Horários disponíveis (115:8602) */}
        <div className="reserva-block">
          <span className="reserva-label reserva-label--center">Horários disponíveis</span>
          <div className="reserva-times" role="group" aria-label="Horários disponíveis">
            {times.map((time, index) => (
              <button
                type="button"
                key={time}
                className={`reserva-chip${index === activeTime ? ' reserva-chip--active' : ''}`}
                aria-pressed={index === activeTime}
                onClick={() => setActiveTime(index)}
              >
                {isPromoSlot(index) && (
                  <Icon name="clock" style="Filled" size={12} />
                )}
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Ao reservar você ganha (115:8618) – só existe quando o par
            dia×horário selecionado tem oferta: horários com promo são os
            primeiros chips (os com ícone de relógio). Escolher um horário
            sem oferta (ex. 20:30, quando o salão está cheio) esconde o card. */}
        {reward && isPromoSlot(activeTime) ? (
          <div className="reserva-block">
            <span className="reserva-label">Ao reservar você ganha</span>

            <Link
              to={`/loja/${merchant.slug}/beneficio/${rewardOfferIndex}`}
              className="reserva-reward"
            >
              <img className="reserva-reward__logo" src={merchant.logo} alt="" />

              <div className="reserva-reward__content">
                <h3 className="reserva-reward__title">{reward.title}</h3>
                <p className="reserva-reward__subtitle">{reward.subtitle}</p>
                <span className="reserva-reward__more">Saiba mais</span>
              </div>
            </Link>
          </div>
        ) : null}

        {/* CTA "Reservar" (Figma 122:8752) – botão primário de largura total
            na base do painel (321×48). É a ação de reserva em si: fica sempre
            visível, mesmo quando o card "Ao reservar você ganha" some num
            horário sem oferta. Navega pra tela de confirmação carregando a
            escolha atual (pessoas/dia/horário + loja/oferta) num snapshot por
            `location.state` — a data segue como yyyy-mm-dd LOCAL (nunca UTC,
            pra o dia não deslocar ao montar a tela de revisão). */}
        <button
          type="button"
          className="reserva-submit"
          onClick={() => {
            navigate(`/loja/${merchant.slug}/reserva/confirmar`, {
              state: {
                merchantSlug: merchant.slug,
                offerIndex: rewardOfferIndex,
                people,
                dateISO: localDateISO(days[activeDay].date),
                timeLabel: times[activeTime],
              },
            })
          }}
        >
          Reservar
        </button>
      </div>
    </section>
  )
}
