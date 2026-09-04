/**
 * Tipos estruturais mínimos de req/res das serverless functions. Não importam
 * `@types/node` nem `@vercel/node` – ficam autocontidos para o `tsc` do `src/`
 * não ser contaminado por globais do Node. A Vercel entrega os objetos Node
 * reais em runtime; aqui só garantimos o contrato que usamos.
 */

/** Request como iterável assíncrono de chunks (para ler o corpo do POST). */
export interface HttpRequest {
  method?: string
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>
}

export interface HttpResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
}

/** Assinatura padrão de handler das serverless functions. */
export type CheckinHandler = (req: HttpRequest, res: HttpResponse) => void | Promise<void>
