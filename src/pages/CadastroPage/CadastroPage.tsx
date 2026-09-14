import EmbeddedPortalPage from '../../components/EmbeddedPortalPage/EmbeddedPortalPage'

/**
 * Formulário de cadastro de interesse embutido na rota `/cadastro` – destino do
 * CTA "Cadastrar meu interesse" do hero do MovePage.
 *
 * Aponta para o Google Forms publicado (modo `viewform`, que responde sem
 * X-Frame-Options/CSP `frame-ancestors` e é embutível no iframe). Sobrescreva
 * via `VITE_CADASTRO_FORM_URL` quando o formulário mudar de endereço. O id
 * `1FAIpQLSf_…` é o id PUBLICADO do form `1JvpWMlp7Yh0jYSqEudeTJ2fnAzKAx1JjfW4hqCDjNJY`
 * (a URL `/edit` redireciona pra cá e não aceita iframe).
 */
const CADASTRO_FORM_URL =
  (import.meta.env.VITE_CADASTRO_FORM_URL as string | undefined) ??
  'https://docs.google.com/forms/d/e/1FAIpQLSf_SotoFEjiDDeB5mMd5TOa1HZmOOvhnb7zhREHfofE1jpBaQ/viewform?usp=header'

/**
 * CadastroPage – CTA "Cadastrar meu interesse" do hero do MovePage.
 *
 * Rota `/cadastro`. Mesma mecânica de /salao e /reservas: o formulário externo
 * é exibido em iframe full-screen dentro do shell do EmbeddedPortalPage (barra
 * discreta com voltar para `/move`), em vez de abrir o link numa nova aba – o
 * usuário continua no demo e volta com um toque.
 */
export default function CadastroPage() {
  return <EmbeddedPortalPage src={CADASTRO_FORM_URL} title="Cadastrar meu interesse" />
}
