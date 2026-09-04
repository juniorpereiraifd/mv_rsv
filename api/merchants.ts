/**
 * `GET /api/merchants` – catálogo completo de lojas do "Comer Fora"
 * (fake back-end). Serve o mesmo `MERCHANTS` usado pelo frontend (fonte única
 * em `src/data/merchants.ts` + fotos em `src/data/photos.ts`), garantindo que o
 * catálogo servido aqui tem as mesmas 50 lojas reais de SP com fotos próprias.
 *
 * Como o script do build (`tsc`) cobre só `src/`, este arquivo não é
 * typechecked pelo `npm run build` – ele é empacotado à parte pelo runtime
 * serverless da Vercel (esbuild), que remove os `import type` da camada de
 * dados. Os imports de componentes em `merchants.ts` são só de tipo.
 */
import { MERCHANTS } from '../src/data/merchants'
import type { CheckinHandler } from './http'

export default (async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end(JSON.stringify({ error: 'Método não permitido' }))
    return
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.statusCode = 200
  res.end(JSON.stringify(MERCHANTS))
}) as CheckinHandler
