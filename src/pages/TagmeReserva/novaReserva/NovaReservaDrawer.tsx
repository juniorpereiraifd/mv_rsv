import { useEffect, useReducer, useRef, useState } from 'react'
import Icon from '../../../components/Icon/Icon'
import { ConfirmView, SuccessView } from './views/ConfirmView'
import { DetalhesView, EditarPerfilView, NovoClienteView } from './views/ClientViews'
import ReservaForm from './views/ReservaForm'
import {
  acharCliente,
  CLIENTES_INICIAIS,
  reservaVazia,
  type Cliente,
  type ReservaDraft,
} from './reservaModel'
import './NovaReservaDrawer.css'

/** Tempo da animação de saída – casa com a transição do CSS. */
const EXIT_MS = 260

/** Etapas do fluxo do drawer "Nova reserva" (quadros do Figma 163-4747). */
type Step =
  | { nome: 'reserva' } // formulário principal
  | { nome: 'detalhes'; clienteId: string } // "Ver mais detalhes do cliente"
  | { nome: 'novo-cliente' } // cadastro rápido
  | { nome: 'editar-perfil'; clienteId: string } // edição completa do perfil
  | { nome: 'confirmar' } // resumo
  | { nome: 'sucesso' } // reserva confirmada

interface Estado {
  step: Step
  draft: ReservaDraft
  clientes: Cliente[]
}

type Acao =
  | { tipo: 'abrir' }
  | { tipo: 'fechar' }
  | { tipo: 'patch'; patch: Partial<ReservaDraft> }
  | { tipo: 'selecionar'; cliente: Cliente }
  | { tipo: 'limpar-cliente' }
  | { tipo: 'ver-detalhes'; clienteId: string }
  | { tipo: 'novo-cliente' }
  | { tipo: 'editar-cliente'; clienteId: string }
  | { tipo: 'salvar-cliente'; cliente: Cliente }
  | { tipo: 'confirmar' }
  | { tipo: 'concluido' }
  | { tipo: 'voltar' }

function estadoInicial(): Estado {
  return { step: { nome: 'reserva' }, draft: reservaVazia(), clientes: CLIENTES_INICIAIS }
}

/** Reducer do fluxo – cada ação avança/volta um quadro do drawer. */
function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'abrir':
      return estadoInicial()
    case 'patch':
      return { ...estado, draft: { ...estado.draft, ...acao.patch } }
    case 'selecionar':
      return {
        ...estado,
        step: { nome: 'reserva' },
        draft: { ...estado.draft, clienteId: acao.cliente.id },
      }
    case 'limpar-cliente':
      return { ...estado, draft: { ...estado.draft, clienteId: null } }
    case 'ver-detalhes':
      return { ...estado, step: { nome: 'detalhes', clienteId: acao.clienteId } }
    case 'novo-cliente':
      return { ...estado, step: { nome: 'novo-cliente' } }
    case 'editar-cliente':
      return { ...estado, step: { nome: 'editar-perfil', clienteId: acao.clienteId } }
    case 'salvar-cliente': {
      const jaExiste = estado.clientes.some((c) => c.id === acao.cliente.id)
      const clientes = jaExiste
        ? estado.clientes.map((c) => (c.id === acao.cliente.id ? acao.cliente : c))
        : [...estado.clientes, acao.cliente]
      return {
        ...estado,
        step: { nome: 'reserva' },
        clientes,
        draft: { ...estado.draft, clienteId: acao.cliente.id },
      }
    }
    case 'confirmar':
      return { ...estado, step: { nome: 'confirmar' } }
    case 'voltar': {
      // De volta à tela reserva da origem; sucesso não volta.
      const origem = estado.step.nome
      if (origem === 'detalhes' || origem === 'editar-perfil') {
        return { ...estado, step: { nome: 'reserva' } }
      }
      if (origem === 'confirmar') {
        return { ...estado, step: { nome: 'reserva' } }
      }
      return estado
    }
    case 'concluido':
      return { ...estado, step: { nome: 'sucesso' } }
    case 'fechar':
      return estado
    default:
      return estado
  }
}

interface NovaReservaDrawerProps {
  open: boolean
  onClose: () => void
  /** Chamado quando uma reserva é confirmada – a página insere o card na lista
   * de Reservas. Inclui o nome do cliente resolvido no momento da confirmação. */
  onConfirmada: (reserva: ReservaConfirmada) => void
}

/** Reserva confirmada entregue à página (draft + nome do cliente para o card). */
export interface ReservaConfirmada extends ReservaDraft {
  clienteNome: string
}

/**
 * NovaReservaDrawer – drawer lateral (painel de 500px à direita + scrim) do
 * fluxo "Nova reserva" (Figma 163-4747). Abre ao tocar em "+ Nova reserva" na
 * página Reserva do TagMe. Roteia as views por um `useReducer`: formulário →
 * (detalhes / novo cliente / editar perfil) → resumo → sucesso. Fecha ao tocar
 * no scrim, no Escape ou nos botões Cancelar/X — exceto em "sucesso".
 *
 * Reaproveita o ciclo de vida do BottomSheet do repo (animação de saída, foco
 * no painel, trava de scroll no body, Escape), mas ancorado à DIREITA.
 */
export default function NovaReservaDrawer({ open, onClose, onConfirmada }: NovaReservaDrawerProps) {
  const [estado, dispatch] = useReducer(reducer, undefined, estadoInicial)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Abre sempre com o formulário zerado; guarda a última reserva para o onConfirmada.
  const confirmadaRef = useRef<ReservaConfirmada | null>(null)

  // Monta/desmonta com a animação de saída.
  useEffect(() => {
    if (open) {
      dispatch({ tipo: 'abrir' })
      setClosing(false)
      setVisible(true)
      return
    }
    if (visible) {
      setClosing(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setClosing(false)
      }, EXIT_MS)
      return () => clearTimeout(timer)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Foco no painel ao abrir; devolve o foco a quem abriu ao fechar.
  useEffect(() => {
    if (!visible) return
    const anterior = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => anterior?.focus()
  }, [visible])

  // Trava a rolagem do body enquanto aberto.
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const fechar = () => {
    if (estado.step.nome === 'sucesso') return // não sai do sucesso pelo scrim/Escape
    onClose()
  }

  // Escape fecha (exceto em sucesso).
  useEffect(() => {
    if (!visible || estado.step.nome === 'sucesso') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, onClose, estado.step.nome])

  if (!visible) return null

  const { step, draft, clientes } = estado
  const clienteAtual = acharCliente(clientes, draft.clienteId)
  const stepCliente =
    step.nome === 'detalhes' || step.nome === 'editar-perfil'
      ? acharCliente(clientes, step.clienteId)
      : undefined

  // Cabeçalho: título da tela (com "Voltar" nos steps internos) + X de fechar.
  const ehRaiz = step.nome === 'reserva' || step.nome === 'sucesso'
  const titulo =
    step.nome === 'reserva'
      ? 'Adicionar reserva'
      : step.nome === 'detalhes'
        ? 'Detalhes do cliente'
        : step.nome === 'novo-cliente'
          ? 'Novo cliente'
          : step.nome === 'editar-perfil'
            ? 'Editar perfil'
            : step.nome === 'confirmar'
              ? 'Confirmar reserva'
              : 'Reserva confirmada'

  const handleConcluido = () => {
    if (confirmadaRef.current) {
      onConfirmada(confirmadaRef.current)
      confirmadaRef.current = null
    }
    onClose()
  }

  return (
    <div className="nova-reserva__overlay" onClick={fechar}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`nova-reserva__panel${closing ? ' nova-reserva__panel--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="nova-reserva__header">
          <div className="nova-reserva__header-title">
            {!ehRaiz && (
              <button
                type="button"
                className="nova-reserva__back"
                aria-label="Voltar"
                onClick={() => dispatch({ tipo: 'voltar' })}
              >
                <Icon name="back" style="Line" size={18} />
              </button>
            )}
            <h2 className="nova-reserva__title">{titulo}</h2>
          </div>
          <button
            type="button"
            className="nova-reserva__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        {/* Conteúdo do passo atual */}
        {step.nome === 'reserva' && (
          <ReservaForm
            clientes={clientes}
            draft={draft}
            onPatch={(patch) => dispatch({ tipo: 'patch', patch })}
            onSelecionar={(cliente) => dispatch({ tipo: 'selecionar', cliente })}
            onLimparCliente={() => dispatch({ tipo: 'limpar-cliente' })}
            onNovoCliente={() => dispatch({ tipo: 'novo-cliente' })}
            onEditarCliente={(cliente) => dispatch({ tipo: 'editar-cliente', clienteId: cliente.id })}
            onDetalhesCliente={(cliente) => dispatch({ tipo: 'ver-detalhes', clienteId: cliente.id })}
          />
        )}

        {step.nome === 'detalhes' && stepCliente && (
          <DetalhesView
            cliente={stepCliente}
            onEditar={() => dispatch({ tipo: 'editar-cliente', clienteId: stepCliente.id })}
          />
        )}

        {step.nome === 'novo-cliente' && (
          <NovoClienteView
            onCancelar={() => dispatch({ tipo: 'voltar' })}
            onSalvar={(cliente) => dispatch({ tipo: 'salvar-cliente', cliente })}
          />
        )}

        {step.nome === 'editar-perfil' && stepCliente && (
          <EditarPerfilView
            cliente={stepCliente}
            onCancelar={() => dispatch({ tipo: 'voltar' })}
            onSalvar={(cliente) => dispatch({ tipo: 'salvar-cliente', cliente })}
          />
        )}

        {/* Rodapé do formulário: Cancelar + ir para a confirmação */}
        {(step.nome === 'reserva' || step.nome === 'detalhes' || step.nome === 'editar-perfil' || step.nome === 'novo-cliente') && (
          <footer className="nova-reserva__footer">
            <button type="button" className="nova-reserva__btn" onClick={onClose}>
              Cancelar
            </button>
            {step.nome === 'reserva' && (
              <button
                type="button"
                className="nova-reserva__btn nova-reserva__btn--primary"
                disabled={!clienteAtual || !draft.horario}
                onClick={() => dispatch({ tipo: 'confirmar' })}
              >
                Confirmar reserva
              </button>
            )}
          </footer>
        )}

        {step.nome === 'confirmar' && (
          <ConfirmView
            cliente={clienteAtual}
            draft={draft}
            onVoltar={() => dispatch({ tipo: 'voltar' })}
            onConfirmar={() => {
              if (clienteAtual && draft.horario) {
                confirmadaRef.current = {
                  ...draft,
                  clienteId: clienteAtual.id,
                  clienteNome: clienteAtual.nome,
                }
              }
              dispatch({ tipo: 'concluido' })
            }}
          />
        )}

        {step.nome === 'sucesso' && (
          <SuccessView clienteNome={clienteAtual?.nome ?? ''} onConcluir={handleConcluido} />
        )}
      </div>
    </div>
  )
}
