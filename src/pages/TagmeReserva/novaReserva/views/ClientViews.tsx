import { useState } from 'react'
import Icon from '../../../../components/Icon/Icon'
import type { Cliente } from '../reservaModel'
import { MailIcon, PencilIcon, PhoneIcon } from '../icons'

/* ---------------------------- Compartilhado ---------------------------- */

const PREFERENCIAS_SUGERIDAS = [
  'Ribs on the Barbie',
  'Coca-cola',
  'Área externa',
  'Mesa silenciosa',
  'Sem glúten',
  'Vegetariano',
]

function BlocoContadores({ cliente }: { cliente: Cliente }) {
  const c = cliente.contadores
  if (!c) return null
  const itens = [
    { rotulo: 'Passante', valor: c.passante },
    { rotulo: 'Reservas', valor: c.reservas },
    { rotulo: 'Fila', valor: c.fila },
    { rotulo: 'No-show', valor: c.noshow },
    { rotulo: 'Cancelada', valor: c.cancelada },
  ]
  return (
    <div className="nova-reserva__counters">
      {itens.map((i) => (
        <div key={i.rotulo} className="nova-reserva__counter">
          <span className="nova-reserva__counter-label">{i.rotulo}</span>
          <span className="nova-reserva__counter-value">{i.valor}</span>
        </div>
      ))}
    </div>
  )
}

function InfoChave({ rotulo, valor }: { rotulo: string; valor?: string }) {
  if (!valor) return null
  return (
    <div className="nova-reserva__info-row">
      <span className="nova-reserva__info-label">{rotulo}</span>
      <span className="nova-reserva__info-value">{valor}</span>
    </div>
  )
}

interface BotaoAcaoProps {
  children: string
  onClick: () => void
  variante?: 'primary' | 'secondary'
}

function BotaoAcao({ children, onClick, variante = 'secondary' }: BotaoAcaoProps) {
  return (
    <button
      type="button"
      className={`nova-reserva__btn nova-reserva__btn--${variante}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function GrupoInput(props: {
  id: string
  rotulo: string
  children: React.ReactNode
}) {
  return (
    <div className="nova-reserva__field">
      <label className="nova-reserva__field-label" htmlFor={props.id}>
        {props.rotulo}
      </label>
      {props.children}
    </div>
  )
}

/* ------------------------ Ver mais detalhes ------------------------ */

interface DetalhesViewProps {
  cliente: Cliente
  onEditar: () => void
}

/** DetalhesView – cartão expandido do cliente (quadro "Ver mais detalhes do
 * cliente"): contadores (Passante/Reservas/Fila/No-show/Cancelada), última
 * visita, preferências, aniversário e observação. */
export function DetalhesView({ cliente, onEditar }: DetalhesViewProps) {
  return (
    <div className="nova-reserva__body nova-reserva__body--plain">
      <div className="nova-reserva__client-hero">
        <span className="nova-reserva__avatar nova-reserva__avatar--lg">{cliente.inicial}</span>
        <div className="nova-reserva__client-hero-main">
          <div className="nova-reserva__client-name-row">
            <span className="nova-reserva__client-name">{cliente.nome}</span>
            <button
              type="button"
              className="nova-reserva__icon-btn"
              aria-label="Editar perfil do cliente"
              onClick={onEditar}
            >
              <PencilIcon size={14} />
            </button>
          </div>
          <div className="nova-reserva__client-hero-contacts">
            <span className="nova-reserva__hero-contact">
              <MailIcon size={14} />
              {cliente.email}
            </span>
            <span className="nova-reserva__hero-contact">
              <PhoneIcon size={14} />
              {cliente.telefone}
            </span>
          </div>
        </div>
      </div>

      <BlocoContadores cliente={cliente} />

      <div className="nova-reserva__info-card">
        <InfoChave rotulo="Última visita" valor={cliente.ultimaVisita} />

        {cliente.preferencias && cliente.preferencias.length > 0 && (
          <div className="nova-reserva__info-row">
            <span className="nova-reserva__info-label">Preferências</span>
            <div className="nova-reserva__prefs">
              {cliente.preferencias.map((p) => (
                <span key={p} className="nova-reserva__pref">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <InfoChave rotulo="Aniversário" valor={cliente.aniversario} />
        <InfoChave rotulo="Observação" valor={cliente.observacao} />
      </div>
    </div>
  )
}

/* --------------------------- Novo cliente --------------------------- */

interface NovoClienteViewProps {
  onSalvar: (cliente: Cliente) => void
  onCancelar: () => void
}

/** NovoClienteView – cadastro rápido (quadro "Novo cliente"): nome, e-mail e
 * telefone. Salvar cria o cliente, seleciona e volta ao formulário. */
export function NovoClienteView({ onSalvar, onCancelar }: NovoClienteViewProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const valido = nome.trim() && email.includes('@') && telefone.trim()

  const salvar = () => {
    if (!valido) return
    const slug = nome.trim().toLowerCase().replace(/\s+/g, '-')
    onSalvar({
      id: `novo-${slug}-${Date.now()}`,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      inicial: nome.trim().charAt(0).toUpperCase(),
    })
  }

  return (
    <div className="nova-reserva__body nova-reserva__body--plain nova-reserva__body--form">
      <GrupoInput id="nv-nome" rotulo="Nome e sobrenome">
        <input
          id="nv-nome"
          className="nova-reserva__input"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </GrupoInput>
      <GrupoInput id="nv-email" rotulo="E-mail">
        <input
          id="nv-email"
          className="nova-reserva__input"
          type="email"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </GrupoInput>
      <GrupoInput id="nv-fone" rotulo="Telefone">
        <input
          id="nv-fone"
          className="nova-reserva__input"
          inputMode="tel"
          placeholder="+55 11 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </GrupoInput>

      <div className="nova-reserva__form-actions">
        <BotaoAcao onClick={onCancelar}>Cancelar</BotaoAcao>
        <BotaoAcao variante="primary" onClick={salvar}>
          Salvar cliente
        </BotaoAcao>
      </div>
    </div>
  )
}

/* --------------------------- Editar perfil --------------------------- */

interface EditarPerfilViewProps {
  cliente: Cliente
  onSalvar: (cliente: Cliente) => void
  onCancelar: () => void
}

/** EditarPerfilView – edição completa (quadro "Editar perfil"): nome, telefone,
 * e-mail, gênero, aniversário, preferências (chips) e observação. */
export function EditarPerfilView({ cliente, onSalvar, onCancelar }: EditarPerfilViewProps) {
  const [nome, setNome] = useState(cliente.nome)
  const [email, setEmail] = useState(cliente.email)
  const [telefone, setTelefone] = useState(cliente.telefone)
  const [genero, setGenero] = useState('')
  const [aniversario, setAniversario] = useState(cliente.aniversario ?? '')
  const [preferencias, setPreferencias] = useState<string[]>(cliente.preferencias ?? [])
  const [obs, setObs] = useState(cliente.observacao ?? '')

  const alternarPref = (p: string) =>
    setPreferencias((atual) =>
      atual.includes(p) ? atual.filter((x) => x !== p) : [...atual, p],
    )

  const salvar = () => {
    if (!nome.trim() || !email.includes('@')) return
    onSalvar({
      ...cliente,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      inicial: nome.trim().charAt(0).toUpperCase(),
      aniversario: aniversario.trim() || undefined,
      observacao: obs.trim() || undefined,
      preferencias,
    })
  }

  return (
    <div className="nova-reserva__body nova-reserva__body--plain nova-reserva__body--form">
      <GrupoInput id="ep-nome" rotulo="Nome e sobrenome">
        <input
          id="ep-nome"
          className="nova-reserva__input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </GrupoInput>

      <div className="nova-reserva__field">
        <span className="nova-reserva__field-label" id="ep-fone">
          Telefone
        </span>
        <div className="nova-reserva__fone-row">
          <div className="nova-reserva__select nova-reserva__fone-ddi">
            <select aria-label="DDI" value="+55" onChange={() => {}}>
              <option value="+55">+55</option>
            </select>
          </div>
          <input
            className="nova-reserva__input nova-reserva__fone-num"
            aria-label="Número do telefone"
            inputMode="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
      </div>

      <GrupoInput id="ep-email" rotulo="E-mail">
        <input
          id="ep-email"
          className="nova-reserva__input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </GrupoInput>

      <div className="nova-reserva__two-col">
        <GrupoInput id="ep-genero" rotulo="Gênero">
          <div className="nova-reserva__select">
            <select id="ep-genero" value={genero} onChange={(e) => setGenero(e.target.value)}>
              <option value="">Selecionar</option>
              <option>Masculino</option>
              <option>Feminino</option>
              <option>Outro</option>
            </select>
            <Icon name="chevron-down" style="Line" size={16} />
          </div>
        </GrupoInput>
        <GrupoInput id="ep-aniversario" rotulo="Aniversário">
          <input
            id="ep-aniversario"
            className="nova-reserva__input"
            placeholder="dd/mm"
            value={aniversario}
            onChange={(e) => setAniversario(e.target.value)}
          />
        </GrupoInput>
      </div>

      <div className="nova-reserva__field">
        <span className="nova-reserva__field-label" id="ep-prefs">
          Preferências
        </span>
        <div className="nova-reserva__pref-picker" role="group" aria-labelledby="ep-prefs">
          {PREFERENCIAS_SUGERIDAS.map((p) => {
            const ativa = preferencias.includes(p)
            return (
              <button
                key={p}
                type="button"
                aria-pressed={ativa}
                className={`nova-reserva__pref-btn${ativa ? ' nova-reserva__pref-btn--active' : ''}`}
                onClick={() => alternarPref(p)}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>

      <GrupoInput id="ep-obs" rotulo="Observação (opcional)">
        <textarea
          id="ep-obs"
          className="nova-reserva__textarea"
          rows={3}
          placeholder="Escrever observação"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />
      </GrupoInput>

      <div className="nova-reserva__form-actions">
        <BotaoAcao onClick={onCancelar}>Cancelar</BotaoAcao>
        <BotaoAcao variante="primary" onClick={salvar}>
          Salvar alterações
        </BotaoAcao>
      </div>
    </div>
  )
}
