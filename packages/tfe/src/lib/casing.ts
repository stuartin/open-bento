import decamelizeKeys from 'decamelize-keys';
import camelcaseKeys from 'camelcase-keys'; 'camelcase-keys';

// biome-ignore lint/suspicious/noExplicitAny: required
export const toCamel = <T extends Record<string, any>>(obj: T) => camelcaseKeys<T>(obj)
// biome-ignore lint/suspicious/noExplicitAny: required
export const toKebab = <T extends Record<string, any>>(obj: T) => decamelizeKeys<T, "-">(obj, { separator: "-" })