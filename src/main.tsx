import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App'
import BeneficioPage from './pages/BeneficioPage/BeneficioPage'
import CategoriaPage from './pages/CategoriaPage/CategoriaPage'
import MovePage from './pages/MovePage/MovePage'
import BuscarEnderecoPage from './pages/BuscarFlow/BuscarEnderecoPage'
import BuscarRestaurantesPage from './pages/BuscarFlow/BuscarRestaurantesPage'
import PerfilPage from './pages/PerfilPage/PerfilPage'
import ReservasPage from './pages/ReservasPage/ReservasPage'
import ReservaConfirmPage from './pages/ReservaFlow/ReservaConfirmPage'
import ReservaSuccessPage from './pages/ReservaFlow/ReservaSuccessPage'
import RestaurantPage from './pages/RestaurantPage/RestaurantPage'
import SalaoPage from './pages/SalaoPage/SalaoPage'
import { CheckinProvider } from './context/CheckinProvider'
import { ReservaProvider } from './context/ReservaProvider'
import ClientFrame from './tv/ClientFrame'
import './styles/global.css'

// Dentro do mockup de iPhone (TV), o ClientTvShell carrega esta mesma rota com
// `?mockup=1` num iframe de ~402px. Como um celular real tem a MESMA largura, a
// única forma de o documento interno saber que está no mockup (para escopar
// ajustes como o gutter de 12px) é este marcador na URL. Aplicamos no <html>
// ANTES do primeiro render para não piscar o estilo errado. A navegação SPA
// interna preserva o atributo (ele vale para a vida do documento).
if (new URLSearchParams(window.location.search).has('mockup')) {
  document.documentElement.setAttribute('data-mockup', '')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* CheckinProvider carrega os check-ins do fake back-end e expõe o estado
        global de "check-in realizado" para a navegação. ReservaProvider guarda
        as reservas confirmadas no localStorage (store local, sem rede). */}
    <CheckinProvider>
      <ReservaProvider>
        <BrowserRouter>
          <Routes>
            {/* Seleção de perfil (Move) e Visão Restaurante (Portal B2B): fluidas
                em TODA tela, inclusive na TV. */}
            <Route path="/move" element={<MovePage />} />
            <Route path="/salao" element={<SalaoPage />} />

            {/* Visão de Reservas: embute o portal de reservas externo
                (portal-nn.vercel.app) em iframe full-screen – mesma mecânica de
                /salao, com barra "Voltar" para /move (ver ReservasPage). */}
            <Route path="/reservas" element={<ReservasPage />} />

            {/* Visão Cliente: cada rota é envolvida pelo ClientFrame, que abaixo
                do breakpoint de tablet renderiza normal e, em telas grandes/TV,
                renderiza a mesma rota dentro do mockup de um iPhone 17 Pro (iframe
                estreito com o layout mobile). Rotas novas de cliente entram aqui,
                dentro de um <ClientFrame>. */}
            <Route path="/" element={<ClientFrame><App /></ClientFrame>} />
            <Route path="/loja/:slug" element={<ClientFrame><RestaurantPage /></ClientFrame>} />
            {/* Fluxo "Confirmação de Reserva": revisão → (overlay) → sucesso. As
                rotas específicas ganham prioridade sobre /loja/:slug no React
                Router e o mockup de TV vem de graça (ambas dentro de ClientFrame).
                Os dados da reserva trafegam por location.state (ver ReservaFlow). */}
            <Route path="/loja/:slug/reserva/confirmar" element={<ClientFrame><ReservaConfirmPage /></ClientFrame>} />
            <Route path="/loja/:slug/reserva/sucesso" element={<ClientFrame><ReservaSuccessPage /></ClientFrame>} />
            <Route path="/loja/:slug/beneficio/:offerIndex" element={<ClientFrame><BeneficioPage /></ClientFrame>} />
            <Route path="/perfil" element={<ClientFrame><PerfilPage /></ClientFrame>} />
            {/* Fluxo de busca (fake door, Figma 139:3692/5230/5390-5548): o hub
                "Buscar em" deixou de ser uma rota – a pílula do BrandHeader abre
                um OVERLAY sobre a home viva (App/BuscarSheet, ver lá). Aqui só
                ficam as sub-telas cheias, alcançadas pelo overlay: a troca de
                endereço e os resultados de restaurantes são cosméticos (sem
                geolocalização real – endereço atual fixo do design) e o
                "Cancelar" delas volta à home `/` (deep-link antigo `/buscar` cai
                no fallback `*` → `/`). */}
            <Route path="/buscar/endereco" element={<ClientFrame><BuscarEnderecoPage /></ClientFrame>} />
            <Route path="/buscar/restaurantes" element={<ClientFrame><BuscarRestaurantesPage /></ClientFrame>} />
            {/* Páginas de categoria do rail da home (MerchantRail): /categorias/:slug
                reapresenta a seção alta da home (chips + grade) filtrada pela
                categoria tocada (ver CategoriaPage). Dentro do ClientFrame – o
                mockup de TV vem de graça. */}
            <Route path="/categorias/:slug" element={<ClientFrame><CategoriaPage /></ClientFrame>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ReservaProvider>
    </CheckinProvider>
  </StrictMode>,
)
