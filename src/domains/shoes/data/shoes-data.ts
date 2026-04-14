import type { ShoeItem, ShoesCatalog } from '../types';

export function normalizeShoesCatalog(items: ShoeItem[]) {
  return items.reduce<ShoesCatalog>((catalog, item) => {
    const currentItems = catalog[item.brand] ?? [];

    catalog[item.brand] = [...currentItems, item];

    return catalog;
  }, {});
}

export const globalShoes: ShoeItem[] = [];

export function getShoesCatalog() {
  return normalizeShoesCatalog(globalShoes);
}
