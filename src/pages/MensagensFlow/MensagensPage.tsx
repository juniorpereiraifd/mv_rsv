import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import type { Merchant } from '../../data/merchants'
import { getMerchantUI } from '../../data/merchants.ui'
import { listThreads, type MessageThread } from '../../data/messages'
import './MensagensFlow.css'
import './MensagensPage.css'

/** Resolve a thread na loja real do catálogo. Slug fora do catálogo é
 * descartado (defensivo) – nunca quebra a lista por um slug morto. */
interface ThreadRow {
  thread: MessageThread
  merchant: Merchant
}

function resolveThreads(): ThreadRow[] {
  const rows: ThreadRow[] = []
  for (const thread of listThreads()) {
    const merchant = getMerchantUI(thread.slug)
    if (merchant) rows.push({ thread, merchant })
  }
  return rows
}

/** Normalização accent-insensitive para o filtro (mesma regra da busca de
 * restaurantes): minúsculas + NFD + remoção de marcas de combinação
 * (U+0300–U+036F). Aplica-se ao termo e ao nome da loja. */
function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

/**
 * MensagensPage – rota `/mensagens` (Figma 163:3877 "Mensagens"): caixa de
 * entrada 1:1 restaurante ↔ cliente, fake door. Topo com campo de busca real
 * (filtra as threads por nome da loja) e, abaixo, as conversas da seed
 * (`listThreads`, lojas reais do catálogo) – uma linha por restaurante: logo,
 * nome, "Enviou uma mensagem • tempo" e o dot vermelho quando não lida. O clique
 * na linha abre o chat `/mensagens/:slug`. Sem estado de leitura que persista –
 * `unread` é vitrine fixa (mesmo espírito dos contadores do Perfil).
 */
export default function MensagensPage() {
  const [query, setQuery] = useState('')
  const trimmed = query.trim()

  const rows = useMemo(() => {
    const all = resolveThreads()
    if (!trimmed) return all
    const termo = normalize(trimmed)
    return all.filter(({ merchant }) => normalize(merchant.name).includes(termo))
  }, [trimmed])

  return (
    <div className="mensagens-page">
      <div className="mensagens-toolbar">
        <Link to="/perfil" className="mensagens-toolbar__back" aria-label="Voltar para o perfil">
          <Icon name="back" style="Line" size={24} />
        </Link>
        <h1 className="mensagens-toolbar__title">Mensagens</h1>
      </div>

      <main className="mensagens-page__main">
        <div className="mensagens-page__inner">
          {/* Campo de busca (163:3880) – pill 40px #f5f5f5 radius 16 com a lupa.
              Filtra as conversas pelo nome da loja (accent-insensitive). */}
          <div className="mensagens-search">
            <Icon className="mensagens-search__icon" name="search" style="Line" size={16} />
            <input
              type="text"
              className="mensagens-search__input"
              placeholder="Pesquisar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {rows.length > 0 ? (
            <ul className="mensagens-list" aria-label="Conversas">
              {rows.map(({ thread, merchant }) => (
                <li key={thread.slug}>
                  <Link className="mensagens-row" to={`/mensagens/${merchant.slug}`}>
                    <img className="mensagens-row__logo" src={merchant.logo} alt="" />
                    <span className="mensagens-row__body">
                      <span className="mensagens-row__name">{merchant.name}</span>
                      <span className="mensagens-row__preview">
                        <span className="mensagens-row__preview-text">Enviou uma mensagem</span>
                        <span className="mensagens-row__preview-dot" aria-hidden="true">
                          •
                        </span>
                        <span className="mensagens-row__preview-time">{thread.time}</span>
                      </span>
                    </span>
                    {thread.unread && (
                      <span className="mensagens-row__unread" aria-label="Não lida" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mensagens-empty">Nenhuma conversa encontrada</p>
          )}
        </div>
      </main>
    </div>
  )
}
