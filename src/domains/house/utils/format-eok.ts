export function formatEok(manwon: number, mode: 'default' | 'map' = 'default') {
  const absolute = Math.abs(manwon);
  const sign = manwon < 0 ? '-' : '';
  if (absolute < 10000) {
    return `${sign}${Math.round(absolute).toLocaleString('ko-KR')}만`;
  }
  const digits = mode === 'map' ? 1 : 2;
  const rounded =
    mode === 'map'
      ? Math.round(absolute / 1000) / 10
      : Math.round(absolute / 100) / 100;
  return `${sign}${rounded.toFixed(digits)}억`;
}

export function formatChangeManwon(manwon: number) {
  return `${manwon > 0 ? '+' : ''}${formatEok(manwon)}`;
}

export function formatChangePct(pct: number) {
  const rounded = (Math.round(Math.abs(pct) * 100) / 100).toFixed(2);
  return `${pct > 0 ? '+' : pct < 0 ? '-' : ''}${rounded}%`;
}
