import EmbeddedPortalPage from '../../components/EmbeddedPortalPage/EmbeddedPortalPage'

/**
 * Endereço do protótipo "Gestão de Reservas" (Tagme) embutido na rota `/tagme`.
 * Vem da pasta estática `tagme-nova-reserva` (HTML + CSS + JS puro, sem build),
 * copiada para `public/tagme-nova-reserva/` para o Vite servir em
 * `/tagme-nova-reserva/` — mesma mecânica de hospedagem estática descrita no
 * README daquela pasta.
 */
const TAGME_URL = '/tagme-nova-reserva/index.html'

/**
 * TagmePreviewPage – nova experiência da "Prévia Tagme".
 *
 * Rota `/tagme`. Substitui a antiga tela de acesso do portal TagMe (que levava
 * ao Painel Hostess em `/tagme/reservas`): agora o clique no CTA "Prévia Tagme"
 * da landing de reservas abre diretamente o protótipo de "Gestão de Reservas"
 * dentro de um iframe full-screen, no shell do EmbeddedPortalPage — com o botão
 * claro "Voltar para o menu", que tira o usuário do iframe e devolve ao `/move`
 * (a navegação principal).
 */
export default function TagmePreviewPage() {
  return (
    <EmbeddedPortalPage
      src={TAGME_URL}
      title="Prévia Tagme"
      backLabel="Voltar para o menu"
    />
  )
}
