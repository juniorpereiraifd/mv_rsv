import EmbeddedPortalPage from '../../components/EmbeddedPortalPage/EmbeddedPortalPage'

/**
 * Endereço do Portal B2B (repo `Portal-B2B-main/`) embutido na rota `/salao`,
 * em substituição ao app Salão do repo `b2b/`. Aponta para o portal publicado
 * do demo – `https://portal-nn.vercel.app/` (CRM B2B). Sobrescreva via
 * `VITE_PORTAL_B2B_URL` quando quiser rodar contra outra base (ex.: o dev
 * server local do Portal-B2B-main na porta 4004, via `pnpm --dir
 * Portal-B2B-main dev`).
 */
const PORTAL_B2B_URL =
  (import.meta.env.VITE_PORTAL_B2B_URL as string | undefined) ?? 'https://portal-nn.vercel.app/'

/**
 * SalaoPage – "Visão do restaurante" (card do MovePage, Figma 103:8013).
 *
 * Rota `/salao`. O app externo (Portal B2B do restaurante, publicado em
 * portal-nn.vercel.app) é exibido em iframe full-screen dentro do shell do
 * EmbeddedPortalPage (barra discreta com voltar para `/move`) – mesma mecânica
 * da "Visão de reservas" (/reservas). O conteúdo abaixo da barra é 100% do app
 * parceiro.
 */
export default function SalaoPage() {
  return <EmbeddedPortalPage src={PORTAL_B2B_URL} title="Visão do restaurante" />
}
