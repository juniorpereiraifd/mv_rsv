import { useMemo, useState } from 'react'
import Icon from '../../../../components/Icon/Icon'
import {
  acharCliente,
  buscarClientes,
  HORARIOS,
  ORIGENS_RESERVA,
  SALOES,
  STATUS_RESERVA,
  type Cliente,
  type ReservaDraft,
} from '../reservaModel'
import { MinusIcon, PencilIcon, PlusIcon, UserPlusIcon, XIcon } from '../icons'

/** Nº de células do calendário (6 semanas × 7 dias, começa no domingo). */
const CELLS = 42
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface ReservaFormProps {
  clientes: Cliente[]
  draft: ReservaDraft
  onPatch: (patch: Partial<ReservaDraft>) => void
  onSelecionar: (cliente: Cliente) => void
  onLimparCliente: () => void
  onNovoCliente: () => void
  onEditarCliente: (cliente: Cliente) => void
  onDetalhesCliente: (cliente: Cliente) => void
}

/**
 * ReservaForm – corpo principal do drawer "Adicionar reserva": escolha de
 * cliente (busca com dropdown) e os "dados da reserva" (status/origem, pessoas,
 * data no calendário, horários, salão, mesa e informações opcionais). Reproduz
 * os quadros "Cliente já existente"/"Novo cliente" e "Encontrando o cliente"/
 * "Cliente encontrado" do Figma: a busca vira um cartão compacto do cliente ao
 * escolher um resultado.
 */
export default function ReservaForm({
  clientes,
  draft,
  onPatch,
  onSelecionar,
  onLimparCliente,
  onNovoCliente,
  onEditarCliente,
  onDetalhesCliente,
}: ReservaFormProps) {
  const selecionado = acharCliente(clientes, draft.clienteId)
  const [busca, setBusca] = useState('')
  const [focada, setFocada] = useState(false)

  // Mês em exibição no calendário (primeiro dia). Começa no mês da data atual.
  const [mesVisivel, setMesVisivel] = useState(() => {
    const [y, m] = draft.data.split('-').map(Number)
    return new Date(y, m - 1, 1)
  })

  const resultados = useMemo(
    () => buscarClientes(clientes, busca).slice(0, 4),
    [clientes, busca],
  )
  const dropdownAberto = focada && busca.trim().length > 0

  const mudarMes = (delta: number) =>
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1))

  const [obsAberta, setObsAberta] = useState(false)
  const [obsTemp, setObsTemp] = useState(draft.observacao ?? '')

  const setPessoas = (n: number) => onPatch({ pessoas: Math.min(40, Math.max(1, n)) })
  const hojeISO = useMemo(() => {
    const h = new Date()
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(
      h.getDate(),
    ).padStart(2, '0')}`
  }, [])

  const hoje = useMemo(() => new Date(hojeISO + 'T00:00:00'), [hojeISO])

  // Células do mês visível (domingo como primeiro dia; meses vizinhos vazios).
  const celulas = useMemo(() => {
    const ano = mesVisivel.getFullYear()
    const mes = mesVisivel.getMonth()
    const primeiro = new Date(ano, mes, 1)
    const inicio = primeiro.getDay() // 0 = domingo
    const cells: (Date | null)[] = []
    for (let i = 0; i < CELLS; i++) {
      const d = new Date(ano, mes, 1 - inicio + i)
      cells.push(d.getMonth() === mes ? d : null)
    }
    return cells
  }, [mesVisivel])

  const nomeMes = mesVisivel.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const isoDe = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
      2,
      '0',
    )}`

  return (
    <div className="nova-reserva__body">
      {/* -------------------- Dados do cliente -------------------- */}
      <section className="nova-reserva__section">
        <span className="nova-reserva__section-kicker">dados do cliente</span>

        {!selecionado ? (
          <>
            <label className="nova-reserva__field-label" htmlFor="nova-reserva-busca">
              Adicionar cliente
            </label>
            <div className="nova-reserva__search">
              <Icon name="search" style="Line" size={20} />
              <input
                id="nova-reserva-busca"
                className="nova-reserva__search-input"
                type="text"
                placeholder="Procurar cliente por telefone, e-mail ou nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onFocus={() => setFocada(true)}
                onBlur={() => setFocada(false)}
              />
              {busca && (
                <button
                  type="button"
                  className="nova-reserva__search-clear"
                  aria-label="Limpar busca"
                  onClick={() => setBusca('')}
                >
                  <XIcon size={16} />
                </button>
              )}
            </div>

            {dropdownAberto && (
              <div className="nova-reserva__dropdown">
                {resultados.length === 0 ? (
                  <p className="nova-reserva__dropdown-empty">Nenhum cliente encontrado</p>
                ) : (
                  resultados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="nova-reserva__result"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSelecionar(c)
                        setBusca('')
                      }}
                    >
                      <span className="nova-reserva__avatar">{c.inicial}</span>
                      <span className="nova-reserva__result-text">
                        <span className="nova-reserva__result-nome">{c.nome}</span>
                        <span className="nova-reserva__result-sub">
                          {c.email} | {c.telefone}
                        </span>
                      </span>
                    </button>
                  ))
                )}
                <button
                  type="button"
                  className="nova-reserva__add-client"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setBusca('')
                    setFocada(false)
                    onNovoCliente()
                  }}
                >
                  <UserPlusIcon size={18} />
                  Adicionar novo cliente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="nova-reserva__client-card">
            <span className="nova-reserva__avatar nova-reserva__avatar--lg">{selecionado.inicial}</span>
            <div className="nova-reserva__client-main">
              <div className="nova-reserva__client-name-row">
                <span className="nova-reserva__client-name">{selecionado.nome}</span>
                <button
                  type="button"
                  className="nova-reserva__icon-btn"
                  aria-label="Editar perfil do cliente"
                  onClick={() => onEditarCliente(selecionado)}
                >
                  <PencilIcon size={14} />
                </button>
              </div>
              <span className="nova-reserva__client-sub">
                {selecionado.email} | {selecionado.telefone}
              </span>
              <div className="nova-reserva__client-actions">
                <button type="button" className="nova-reserva__link" onClick={() => onDetalhesCliente(selecionado)}>
                  Ver mais
                </button>
                <button type="button" className="nova-reserva__link" onClick={onLimparCliente}>
                  Alterar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* -------------------- Dados da reserva -------------------- */}
      <section className="nova-reserva__section">
        <span className="nova-reserva__section-kicker">dados da reserva</span>

        <div className="nova-reserva__two-col">
          <div className="nova-reserva__field">
            <label className="nova-reserva__field-label" htmlFor="nova-reserva-status">
              Status da reserva
            </label>
            <div className="nova-reserva__select">
              <select
                id="nova-reserva-status"
                value={draft.status}
                onChange={(e) => onPatch({ status: e.target.value as ReservaDraft['status'] })}
              >
                {STATUS_RESERVA.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" style="Line" size={16} />
            </div>
          </div>

          <div className="nova-reserva__field">
            <label className="nova-reserva__field-label" htmlFor="nova-reserva-origem">
              Origem
            </label>
            <div className="nova-reserva__select">
              <select
                id="nova-reserva-origem"
                value={draft.origem}
                onChange={(e) => onPatch({ origem: e.target.value as ReservaDraft['origem'] })}
              >
                {ORIGENS_RESERVA.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" style="Line" size={16} />
            </div>
          </div>
        </div>

        <div className="nova-reserva__field">
          <span className="nova-reserva__field-label" id="nova-reserva-pessoas">
            Quantidade de pessoas
          </span>
          <div className="nova-reserva__stepper" role="group" aria-labelledby="nova-reserva-pessoas">
            <button
              type="button"
              className="nova-reserva__stepper-btn"
              aria-label="Diminuir pessoas"
              disabled={draft.pessoas <= 1}
              onClick={() => setPessoas(draft.pessoas - 1)}
            >
              <MinusIcon size={20} />
            </button>
            <output className="nova-reserva__stepper-value">{draft.pessoas}</output>
            <button
              type="button"
              className="nova-reserva__stepper-btn"
              aria-label="Aumentar pessoas"
              disabled={draft.pessoas >= 40}
              onClick={() => setPessoas(draft.pessoas + 1)}
            >
              <PlusIcon size={20} />
            </button>
          </div>
        </div>

        {/* Calendário */}
        <div className="nova-reserva__field">
          <span className="nova-reserva__field-label" id="nova-reserva-data">
            Data da reserva
          </span>
          <div className="nova-reserva__calendar">
            <div className="nova-reserva__cal-head">
              <button
                type="button"
                className="nova-reserva__cal-nav"
                aria-label="Mês anterior"
                onClick={() => mudarMes(-1)}
              >
                <Icon name="back" style="Line" size={18} />
              </button>
              <span className="nova-reserva__cal-title">{nomeMes}</span>
              <button
                type="button"
                className="nova-reserva__cal-nav"
                aria-label="Próximo mês"
                onClick={() => mudarMes(1)}
              >
                <span className="nova-reserva__cal-next">
                  <Icon name="back" style="Line" size={18} />
                </span>
              </button>
            </div>
            <div className="nova-reserva__cal-grid" role="grid" aria-labelledby="nova-reserva-data">
              {DIAS_SEMANA.map((d) => (
                <span key={d} className="nova-reserva__cal-dow">
                  {d}
                </span>
              ))}
              {celulas.map((d, i) => {
                if (!d) return <span key={i} />
                const iso = isoDe(d)
                const passado = d < hoje
                const seleto = iso === draft.data
                return (
                  <button
                    key={i}
                    type="button"
                    className={`nova-reserva__cal-day${seleto ? ' nova-reserva__cal-day--selected' : ''}`}
                    disabled={passado}
                    aria-pressed={seleto}
                    aria-label={d.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    onClick={() => onPatch({ data: iso })}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Horários */}
        <div className="nova-reserva__field">
          <span className="nova-reserva__field-label" id="nova-reserva-horarios">
            Horários
          </span>
          <div className="nova-reserva__horarios" role="group" aria-labelledby="nova-reserva-horarios">
            {HORARIOS.map((h, i) => {
              // Alguns slots do design vêm esmaecidos (indisponíveis).
              const indisponivel = i === 3 || i === 6 || i === 10
              const seleto = draft.horario === h
              return (
                <button
                  key={h}
                  type="button"
                  className={`nova-reserva__hora${seleto ? ' nova-reserva__hora--selected' : ''}${
                    indisponivel ? ' nova-reserva__hora--off' : ''
                  }`}
                  disabled={indisponivel}
                  aria-pressed={seleto}
                  onClick={() => onPatch({ horario: seleto ? null : h })}
                >
                  {h}
                </button>
              )
            })}
          </div>
          <button type="button" className="nova-reserva__link nova-reserva__link--more">
            Ver mais horários
          </button>
        </div>

        <div className="nova-reserva__field">
          <label className="nova-reserva__field-label" htmlFor="nova-reserva-salao">
            Salão
          </label>
          <div className="nova-reserva__select">
            <select
              id="nova-reserva-salao"
              value={draft.salao}
              onChange={(e) => onPatch({ salao: e.target.value })}
            >
              {SALOES.map((s) => (
                <option key={s.nome} value={s.nome}>
                  {s.nome} ({s.disponiveis} lugares disponíveis)
                </option>
              ))}
            </select>
            <Icon name="chevron-down" style="Line" size={16} />
          </div>
        </div>

        <div className="nova-reserva__field">
          <label className="nova-reserva__field-label" htmlFor="nova-reserva-mesa">
            Número da mesa
          </label>
          <div className="nova-reserva__select">
            <select
              id="nova-reserva-mesa"
              value={draft.mesa ?? ''}
              onChange={(e) => onPatch({ mesa: e.target.value || undefined })}
            >
              <option value="">Escolher mesa(s)</option>
              {['05', '17', '21', '36', '12', '18'].map((m) => (
                <option key={m} value={m}>
                  Mesa {m}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" style="Line" size={16} />
          </div>
        </div>

        {/* Informações opcionais (expansível) */}
        <div className="nova-reserva__field">
          <button
            type="button"
            className="nova-reserva__optional-toggle"
            aria-expanded={obsAberta}
            onClick={() => {
              setObsAberta((v) => !v)
              if (!obsAberta) setObsTemp(draft.observacao ?? '')
            }}
          >
            <span className="nova-reserva__optional-label">Informações opcionais</span>
            <Icon
              name="chevron-down"
              style="Line"
              size={18}
              className={obsAberta ? 'nova-reserva__optional-chevron--up' : undefined}
            />
          </button>
          {obsAberta && (
            <div className="nova-reserva__optional">
              <label className="nova-reserva__field-label" htmlFor="nova-reserva-obs">
                Observação
              </label>
              <textarea
                id="nova-reserva-obs"
                className="nova-reserva__textarea"
                rows={3}
                placeholder="Escrever observação"
                value={obsTemp}
                onChange={(e) => setObsTemp(e.target.value)}
                onBlur={() => onPatch({ observacao: obsTemp.trim() || undefined })}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
