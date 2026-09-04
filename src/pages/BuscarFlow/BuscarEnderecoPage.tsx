import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon, { type IconName } from '../../components/Icon/Icon'
import './BuscarFlow.css'
import './BuscarEnderecoPage.css'

/** Uma opção de endereço do design (Figma 139:5230) – dados estáticos. */
interface AddressOption {
  key: string
  title: string
  /** Linhas de endereço (cada uma vira uma linha 12px sob o título). */
  lines: string[]
  /** Glifo Line à esquerda (localização/casa/trabalho/custom). */
  icon: IconName
}

/* As 4 opções do frame – endereços reais fixos do design (região de Osasco).
   Os ícones acompanham a tabela do design: localização atual, Casa, Trabalho e
   o endereço salvo (pin). */
const ADDRESS_OPTIONS: AddressOption[] = [
  {
    key: 'localizacao',
    title: 'Usar minha localização',
    lines: ['Av. Brasília, Vila Yara', 'Osasco - SP'],
    icon: 'locate-me',
  },
  {
    key: 'casa',
    title: 'Casa',
    lines: ['Av. dos Autonomistas, 1496', 'Vila Yara', 'Osasco - SP'],
    icon: 'home',
  },
  {
    key: 'trabalho',
    title: 'Trabalho',
    lines: ['Av. Brasília, 1496', 'Vila Yara', 'Osasco - SP'],
    icon: 'work',
  },
  {
    key: 'salvo',
    title: 'Av. dos Autonomistas, 1496',
    lines: ['Vila Yara', 'Osasco - SP'],
    icon: 'location',
  },
]

/**
 * BuscarEnderecoPage – rota `/buscar/endereco` (Figma 139:5230): troca do
 * endereço de entrega do fluxo de busca, como fake door puro. Topo com o campo
 * "Buscar endereço" INATIVO (pílula decorativa, não é `<input>` – não há busca
 * de endereço real) + "Cancelar" à direita (volta à home `/` – o hub "Buscar
 * em" virou overlay montado pela home, não existe mais rota para ele).
 *
 * Tocar numa das 4 opções apenas marca o rádio E permanece na tela (decisão do
 * usuário); não altera o rótulo do hub nem persiste. Sai-se pelo Cancelar. O
 * rádio é um grupo single-select em estado local (`selected`); desmarcado
 * reproduz o design literal (disco 24px #e0e0e0) e marcado acrescenta o ponto
 * na cor da marca (variante marcada não foi exportada no frame – ajustada
 * visualmente no dev).
 */
export default function BuscarEnderecoPage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="buscar-page">
      <main className="buscar-page__main">
        <div className="buscar-page__inner">
          {/* Topo: campo "Buscar endereço" inerte (pin + placeholder) + Cancelar. */}
          <div className="buscar-toolbar">
            <div className="buscar-field">
              <Icon className="buscar-field__icon" name="location" size={16} style="Line" />
              <span className="buscar-field__placeholder">Buscar endereço</span>
            </div>
            <Link to="/" className="buscar-cancel">
              Cancelar
            </Link>
          </div>

          {/* Opções de endereço – cada card é um rádio de grupo. Tocar marca e
              permanece (fake door); aria-checked reflete a seleção local. */}
          <div className="buscar-addr__list" role="radiogroup" aria-label="Escolher endereço">
            {ADDRESS_OPTIONS.map((option) => {
              const ativo = selected === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  className="buscar-addr"
                  onClick={() => setSelected(option.key)}
                >
                  <Icon className="buscar-addr__icon" name={option.icon} size={24} style="Line" />
                  <span className="buscar-addr__body">
                    <span className="buscar-addr__title">{option.title}</span>
                    {option.lines.map((line) => (
                      <span key={line} className="buscar-addr__line">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="buscar-addr__radio" aria-hidden="true">
                    {ativo && <span className="buscar-addr__radio-dot" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
