import decamelizeKeys from 'decamelize-keys';
import camelcaseKeys from 'camelcase-keys'; 'camelcase-keys';

export const toCamel = <T extends Record<string, any>>(obj: T) => camelcaseKeys<T>(obj)
export const toKebab = <T extends Record<string, any>>(obj: T) => decamelizeKeys<T, "-">(obj, { separator: "-" })