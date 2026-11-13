import type { CompareItem } from '@/domains/house/types';

export function parseCompareParam(value: string | null): CompareItem[] {
  const items: CompareItem[] = [];
  const seen = new Set<string>();
  for (const entry of value?.split(',') ?? []) {
    const match = /^([^,:\s]+):(59|84)$/.exec(entry);
    if (!match || seen.has(entry)) continue;
    seen.add(entry);
    items.push({
      complexId: match[1],
      area: match[2] === '84' ? 'B84' : 'B59',
    });
    if (items.length === 3) break;
  }
  return items;
}

export function serializeCompareParam(items: CompareItem[]) {
  const serialized = items
    .map(
      ({ complexId, area }) => `${complexId}:${area === 'B84' ? '84' : '59'}`
    )
    .join(',');
  return parseCompareParam(serialized)
    .map(
      ({ complexId, area }) => `${complexId}:${area === 'B84' ? '84' : '59'}`
    )
    .join(',');
}

export function toCompareApiItems(items: CompareItem[]) {
  return parseCompareParam(serializeCompareParam(items))
    .map(({ complexId, area }) => `${complexId}:${area}`)
    .join(',');
}
