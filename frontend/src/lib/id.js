export function generateId(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}
