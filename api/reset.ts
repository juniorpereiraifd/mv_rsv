/**
 * `POST /api/checkins/reset` – apaga TODOS os check-ins (botão "Redefinir
 * demonstração" no rodapé do /move). O reset só acontece por esse botão com
 * confirmação; nenhum fluxo automático limpa os dados.
 *
 * Retorna `{ ok: true }` mesmo quando já não havia dados (idempotente).
 */
import { clearCheckins } from './store'
import type { CheckinHandler } from './http'

export default (async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    res.end(JSON.stringify({ error: 'Método não permitido' }))
    return
  }

  await clearCheckins()

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.statusCode = 200
  res.end(JSON.stringify({ ok: true }))
}) as CheckinHandler
