import type { SVGProps } from 'react'

/**
 * Ícones SVG inline do fluxo "Nova reserva". A fonte de ícones do repo não tem
 * glifos para os controles do formulário (+, −, lápis, e-mail, telefone,
 * usuário+), então seguem como vetores stroke, tintáveis via `currentColor`
 * (mesma regra dos assets do `Icon`).
 */

type P = SVGProps<SVGSVGElement> & { size?: number }

function base({ size, ...props }: P): P {
  return {
    width: size ?? 16,
    height: size ?? 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }
}

export function PlusIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function MinusIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function PencilIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

export function MailIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export function PhoneIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9Z" />
    </svg>
  )
}

export function UserPlusIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  )
}

/** X de remover – chips/tags do formulário. */
export function XIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/** Cadeado – indica item bloqueado/indisponível na sidebar do portal. */
export function LockIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
