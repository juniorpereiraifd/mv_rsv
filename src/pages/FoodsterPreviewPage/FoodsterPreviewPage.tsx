import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import featOmnichannelUrl from '../../assets/move/foodster-feat-omnichannel.svg'
import featFilasUrl from '../../assets/move/foodster-feat-filas.svg'
import featReservasUrl from '../../assets/move/foodster-feat-reservas.svg'
import featIaUrl from '../../assets/move/foodster-feat-ia.svg'
import './FoodsterPreviewPage.css'

/**
 * FoodsterPreviewPage – prévia da página do Foodster, o atendente de I.A. do
 * WhatsApp para restaurantes (Figma "-Move--Comer-Fora" 193:15184 "Background").
 *
 * É a terceira prévia da landing de reservas (CTA "Prévia Foodster"). O design
 * do Figma é um hero escuro (#191a18) com acento lima (#a6d02c) e tipografia
 * Acumin — identidade do Foodster. Aqui a página é reconstruída na identidade
 * "Comer Fora" do projeto (a mesma das outras landings /move e
 * /reservas/visao-geral): hero vermelho #f91c4c full-height, texto branco com
 * realce creme (#fff7c3) no lugar do lima, e o mockup de chat passa de tema
 * escuro para um cartão branco com bolhas de I.A. em vermelho da marca.
 *
 * O chat é ANIMADO (ver FoodsterChat): simula um atendimento em tempo real, em
 * loop — indicador de "digitando" antes de cada resposta da I.A., bolhas que
 * entram com pop, confirmação de leitura e auto-scroll. A conversa é a mesma do
 * widget do Foodster (roteiro de 8 mensagens), só com as cores traduzidas.
 *
 * Composição (mesma do design, só com as cores traduzidas):
 *  1. Hero vermelho full-height com a fileira de recursos colada na base.
 *  2. Coluna esquerda: lockup do Foodster (símbolo de garfo dentro de um círculo
 *     branco + wordmark), headline em 4 linhas ("Seu restaurante não precisa
 *     perder reservas porque o WhatsApp lotou.") com perder/reservas/lotou em
 *     realce creme, subtítulo e legenda de público-alvo.
 *  3. Coluna direita: mockup de chat animado (cartão branco, header com "online
 *     agora", conversa em loop e barra de input decorativa).
 *  4. Fileira de recursos: 4 chips translúcidos (ícone + rótulo) na base.
 *
 * Rota: `/foodster` (registrada no main.tsx). O botão "Voltar" devolve ao /move.
 */
export default function FoodsterPreviewPage() {
  return (
    <div className="foodster">
      <div className="foodster__hero" aria-hidden="true">
        <div className="foodster__faixas" />
      </div>

      <div className="foodster__frame">
        {/* Voltar para o /move – mesma pílula translúcida das outras landings. */}
        <Link to="/move" className="foodster__back">
          <Icon name="back" style="Line" size={20} className="foodster__back-icon" />
          <span className="foodster__back-label">Voltar</span>
        </Link>

        {/* Conteúdo em duas colunas: texto à esquerda, chat à direita. */}
        <div className="foodster__content">
          <div className="foodster__copy">
            {/* Lockup do Foodster – o símbolo (garfo) dentro de um círculo branco,
                ao lado do wordmark em texto (mesma fonte da marca). */}
            <div className="foodster__logo" aria-label="Foodster">
              <span className="foodster__logo-badge" aria-hidden="true">
                <FoodsterMark className="foodster__logo-mark" />
              </span>
              <span className="foodster__logo-word">Foodster</span>
            </div>

            <h1 className="foodster__title">
              Seu restaurante
              <br />
              não precisa <span className="foodster__title-accent">perder</span>
              <br />
              <span className="foodster__title-accent">reservas</span> porque o
              <br />
              WhatsApp <span className="foodster__title-accent">lotou</span>.
            </h1>

            <p className="foodster__subtitle">
              O Foodster atende clientes 24h/7, responde dúvidas, realiza
              reservas e organiza filas: com integração nativa com seu sistema de
              reserva e transbordo humano quando necessário.
            </p>

            <p className="foodster__audience">
              Para bares, restaurantes e operações gastronômicas com alto volume
              de atendimento.
            </p>
          </div>

          {/* Mockup do chat animado (193:15221) – "Simulação de atendimento
              automatizado da Foodster via chat". */}
          <div className="foodster__phone">
            <FoodsterChat />
          </div>
        </div>

        {/* Fileira de recursos (193:15200/15209/15214/15217) – 4 chips na base,
            cada um com ícone + rótulo, em pílulas translúcidas sobre o vermelho. */}
        <div className="foodster__features">
          <div className="foodster-feature">
            <img className="foodster-feature__icon" src={featOmnichannelUrl} alt="" />
            <span className="foodster-feature__label">Atendimento unificado (omnichannel)</span>
          </div>
          <div className="foodster-feature">
            <img className="foodster-feature__icon" src={featFilasUrl} alt="" />
            <span className="foodster-feature__label">Atende e gerencia filas</span>
          </div>
          <div className="foodster-feature">
            <img className="foodster-feature__icon" src={featReservasUrl} alt="" />
            <span className="foodster-feature__label">Integração de reservas</span>
          </div>
          <div className="foodster-feature">
            <img className="foodster-feature__icon" src={featIaUrl} alt="" />
            <span className="foodster-feature__label">Não é robô, é I.A.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Símbolo do Foodster (garfo + rabo de balão) — traçado vetorial da marca. O
 * fill usa `currentColor`, então a cor vem do container via CSS: vermelho dentro
 * do círculo branco do lockup, branco dentro do avatar vermelho do chat. */
function FoodsterMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M6.75479 0.000709669C3.02414 0.000709669 0 3.02485 0 6.7555C0 10.2156 2.59314 13.0615 5.94675 13.4578C5.95456 13.4585 5.95811 13.4592 5.96166 13.4592C6.4303 13.516 6.75479 13.8582 6.75479 14.3141V16.222C6.75479 17.1394 7.85751 17.6137 8.52568 16.9846C9.79953 15.7846 11.2559 14.4099 11.2559 14.4099C11.672 14.0222 12.2684 13.5103 13.2667 13.5103H17.2388C20.9176 13.5103 23.9375 10.5742 23.9993 6.87053C24.0625 3.08663 21.0142 0 17.2452 0H6.7555L6.75479 0.000709669V0.000709669M17.2445 11.9957C14.351 11.9957 12.005 9.6497 12.005 6.75621C12.005 3.86272 14.351 1.51669 17.2445 1.51669C20.138 1.51669 22.484 3.86272 22.484 6.75621C22.484 9.6497 20.138 11.9957 17.2445 11.9957V11.9957"
        fill="currentColor"
      />
    </svg>
  )
}

/** Confirmação de leitura (duplo check) das bolhas da I.A. */
function CheckIcon() {
  return (
    <svg className="foodster-chat__check" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 5.5 4 8.5 9.5 2.5" />
      <path d="M7.5 8.5 13 2.5" />
    </svg>
  )
}

/** Ícone de clipe da barra de input (decorativo). */
function ClipIcon() {
  return (
    <svg className="foodster-chat__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8.5 12.5 17a4 4 0 0 1-5.6-5.6l8-8a2.6 2.6 0 0 1 3.7 3.7l-8 8a1.2 1.2 0 0 1-1.7-1.7l7.3-7.3" />
    </svg>
  )
}

/** Ícone de microfone da barra de input (decorativo). */
function MicIcon() {
  return (
    <svg className="foodster-chat__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}

/** Uma mensagem do roteiro do chat. `dir` = direção da bolha ('in' cliente,
 * 'out' Foodster), `t` = horário exibido, `typing` = ms de "digitando" antes da
 * mensagem da I.A. aparecer. */
interface ChatMsg {
  dir: 'in' | 'out'
  text: string
  t: string
  typing?: number
}

/** Roteiro da conversa (o mesmo do widget do Foodster no Landingi): um
 * atendimento completo de reserva via WhatsApp, com transbordo de cardápio. */
const SCRIPT: ChatMsg[] = [
  { dir: 'in', text: 'Oi! Tem mesa pra 2 hoje à noite?', t: '19:40' },
  { dir: 'out', text: 'Oi! Hoje às 20h temos disponibilidade. Quer que eu reserve pra você?', t: '19:40', typing: 1300 },
  { dir: 'in', text: 'Quero sim! No nome de Ana.', t: '19:41' },
  { dir: 'out', text: 'Pronto, Ana! Mesa pra 2 às 20h confirmada. 🎉', t: '19:41', typing: 1400 },
  { dir: 'in', text: 'Posso acessar o menu antecipadamente?', t: '19:42' },
  { dir: 'out', text: 'Claro! Você pode acessar o cardápio por este link: https://foodster.tagme.menu/menu/foodster', t: '19:42', typing: 1500 },
  { dir: 'in', text: 'Perfeito, obrigada!', t: '19:42' },
  { dir: 'out', text: 'Imagina! Te mando um lembrete 1h antes. Até logo, Ana 😊', t: '19:43', typing: 1300 },
]

/** Quebra o texto da mensagem destacando a URL (se houver) em `.foodster-chat__link`. */
function renderMessageText(text: string) {
  const start = text.indexOf('http')
  if (start === -1) return text
  const before = text.slice(0, start)
  const rest = text.slice(start)
  const end = rest.indexOf(' ')
  const url = end === -1 ? rest : rest.slice(0, end)
  const after = end === -1 ? '' : rest.slice(end)
  return (
    <>
      {before}
      <span className="foodster-chat__link">{url}</span>
      {after}
    </>
  )
}

/**
 * FoodsterChat – mockup de chat animado. Reproduz a conversa do SCRIPT em loop:
 * limpa o corpo, então exibe cada mensagem na ordem, com o indicador de
 * "digitando" antes das respostas da I.A., auto-scroll para a última mensagem e
 * pausa antes de reiniciar. Começa só quando entra na viewport (IntersectionObserver)
 * com fail-safe de 2,5s; respeita `prefers-reduced-motion` (renderiza o roteiro
 * completo, estático, sem loop).
 */
function FoodsterChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [typing, setTyping] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    const body = bodyRef.current
    if (!root || !body) return

    // Reduced motion: mostra a conversa inteira de uma vez, sem loop.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setMessages(SCRIPT)
      return
    }

    let cancelled = false

    const scrollDown = () => {
      body.scrollTop = body.scrollHeight
    }
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

    async function runOnce() {
      if (cancelled) return
      setMessages([])
      setTyping(false)
      await wait(500)

      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return
        const msg = SCRIPT[i]

        if (msg.dir === 'out' && msg.typing) {
          setTyping(true)
          scrollDown()
          await wait(msg.typing)
          if (cancelled) return
          setTyping(false)
        } else {
          // Pausa natural antes das mensagens do cliente (a 1ª já sai logo).
          await wait(i === 0 ? 0 : 650)
          if (cancelled) return
        }

        setMessages((prev) => [...prev, msg])
        scrollDown()
        await wait(500)
      }
    }

    async function loop() {
      while (!cancelled) {
        await runOnce()
        await wait(3500)
      }
    }

    const start = () => {
      if (cancelled || startedRef.current) return
      startedRef.current = true
      void loop()
    }

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              start()
              observer?.disconnect()
            }
          })
        },
        { threshold: 0.01 },
      )
      observer.observe(root)
    } else {
      start()
    }

    // Fail-safe: se o observer não disparar (iframe, layout, etc.), começa
    // mesmo assim — o chat nunca fica parado.
    const failSafe = window.setTimeout(start, 2500)

    return () => {
      cancelled = true
      observer?.disconnect()
      window.clearTimeout(failSafe)
      // Libera o guard para o re-mount do StrictMode (dev) reiniciar o loop.
      startedRef.current = false
    }
  }, [])

  return (
    <div className="foodster-chat" role="img" aria-label="Simulação de atendimento automatizado da Foodster via chat" ref={rootRef}>
      <div className="foodster-chat__header">
        <span className="foodster-chat__avatar" aria-hidden="true">
          <FoodsterMark className="foodster-chat__avatar-mark" />
        </span>
        <div className="foodster-chat__who">
          <span className="foodster-chat__name">Foodster</span>
          <span className="foodster-chat__status">
            <span className="foodster-chat__status-dot" />
            online agora
          </span>
        </div>
        <span className="foodster-chat__menu" aria-hidden="true">
          <i /><i /><i />
        </span>
      </div>

      <div className="foodster-chat__body" ref={bodyRef}>
        <div className="foodster-chat__daysep">
          <span>Hoje</span>
        </div>

        <div className="foodster-chat__stream">
          {messages.map((msg, i) => (
            <div key={i} className={`foodster-chat__msg foodster-chat__msg--${msg.dir}`}>
              <span className="foodster-chat__bubble">
                {renderMessageText(msg.text)}
                <span className="foodster-chat__meta">
                  {msg.t}
                  {msg.dir === 'out' && <CheckIcon />}
                </span>
              </span>
            </div>
          ))}

          {typing && (
            <div className="foodster-chat__msg foodster-chat__msg--in">
              <span className="foodster-chat__typing" aria-hidden="true">
                <i /><i /><i />
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="foodster-chat__input" aria-hidden="true">
        <ClipIcon />
        <span className="foodster-chat__input-hint">Digite uma mensagem</span>
        <MicIcon />
      </div>
    </div>
  )
}
