/**
 * Pretendard ships every @font-face with a woff2 source and a legacy woff
 * fallback. Every browser this app supports reads woff2, so the woff copies are
 * never transferred — they only inflate the deployed bundle by ~3MB.
 *
 * Runs after `vite build`: drops the woff sources from the emitted CSS, then
 * deletes the files nothing references any more.
 */
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ASSETS_DIR = 'dist/assets';

async function main() {
  let entries;
  try {
    entries = await readdir(ASSETS_DIR);
  } catch {
    console.log('strip-legacy-woff: dist/assets가 없어 건너뜁니다.');
    return;
  }

  let rewritten = 0;
  for (const name of entries.filter((f) => f.endsWith('.css'))) {
    const path = join(ASSETS_DIR, name);
    const css = await readFile(path, 'utf8');
    // `url(a.woff2) format("woff2"), url(b.woff) format("woff")` -> woff2 only
    const next = css.replace(
      /,\s*url\([^)]*\.woff\)\s*format\((["'])woff\1\)/g,
      ''
    );
    if (next !== css) {
      await writeFile(path, next);
      rewritten += 1;
    }
  }

  let removed = 0;
  let bytes = 0;
  for (const name of entries.filter((f) => f.endsWith('.woff'))) {
    const path = join(ASSETS_DIR, name);
    bytes += (await stat(path)).size;
    await rm(path);
    removed += 1;
  }

  console.log(
    `strip-legacy-woff: CSS ${rewritten}개 정리, .woff ${removed}개 삭제 (${(bytes / 1024 / 1024).toFixed(1)}MB)`
  );
}

await main();
