/**
 * Normaliza texto para búsquedas: minúsculas + sin tildes/diacríticos.
 * Así "María", "maria" y "MARIA" coinciden todos. (María Grande = Maria Grande)
 */
export const norm = (s: string): string =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
