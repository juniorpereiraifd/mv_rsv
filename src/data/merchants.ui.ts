import { MERCHANTS, type Merchant } from './merchants'

/**
 * Catálogo para a UI (SPA-only). Desde a regeneração via CSV
 * (`scripts/build_catalog.mjs`), `merchants.ts`/`photos.ts` já carregam as
 * fotos REAIS dos parceiros (URLs públicas verificadas) – não existe mais a
 * camada de raspagem local que sobrescrevia mídia por slug. Este módulo é um
 * pass-through mantido para o App e as páginas continuarem importando
 * `MERCHANTS_UI`/`getMerchantUI` sem mudança de contrato.
 *
 * Consumo: telas importam `MERCHANTS_UI`/`getMerchantUI` no lugar de
 * `MERCHANTS`/`getMerchant`. Os tipos continuam vindo de `merchants`.
 */
/** Catálogo final para exibição: conteúdo + fotos reais por slug. */
export const MERCHANTS_UI: Merchant[] = MERCHANTS

const merchantUiIndex = new Map(MERCHANTS_UI.map((m) => [m.slug, m]))

/** Busca uma loja (já com a mídia real do catálogo) pelo slug. */
export function getMerchantUI(slug?: string): Merchant | undefined {
  return slug ? merchantUiIndex.get(slug) : undefined
}
