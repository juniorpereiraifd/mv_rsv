import EmbeddedPortalPage from '../../components/EmbeddedPortalPage/EmbeddedPortalPage'

/**
 * Endereço do Portal de Reservas embutido na rota `/reservas`. Sobrescreva via
 * `VITE_RESERVAS_PORTAL_URL` quando o portal rodar em outra base (ex.: um dev
 * server local com o mesmo código). Sem a env var, aponta para o portal
 * publicado do demo – o ginb2b abre direto na tela de unidades (`/units`).
 */
const RESERVAS_URL =
  (import.meta.env.VITE_RESERVAS_PORTAL_URL as string | undefined) ??
  'https://ginb2b.vercel.app/units'

/**
 * ReservasPage – "Visão de reservas" (terceiro card do MovePage).
 *
 * Rota `/reservas`. Mesma mecânica da "Visão do restaurante": o app externo
 * (portal de reservas, publicado em ginb2b.vercel.app) é exibido em iframe
 * full-screen dentro do shell do EmbeddedPortalPage (barra discreta com voltar
 * para `/move`), em vez de abrir o link numa nova aba – o usuário continua no
 * demo e volta com um toque.
 */
export default function ReservasPage() {
  return <EmbeddedPortalPage src={RESERVAS_URL} title="Visão de reservas" />
}
