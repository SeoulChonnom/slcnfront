/**
 * Fails the build when a bundled media file is larger than it has any reason
 * to be.
 *
 * The two shoe clips once shipped at 20MB and 38MB — 17 seconds of 1080p at
 * ~28 Mbps, which was 89% of the entire build output. They were camera
 * exports dropped in as-is; re-encoding at CRF 23 took them to ~6MB combined
 * with no visible change. Nothing in the toolchain noticed, because a big
 * asset is not an error, just a bill someone else pays on their data plan.
 *
 * Runs after `vite build`, against the emitted assets rather than the source
 * tree, so it sees exactly what would be deployed.
 *
 * If this fails, re-encode rather than raising the budget:
 *
 *   ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow \
 *          -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
 *
 * `-movflags +faststart` matters as much as the size: it moves the index to
 * the front of the file so playback can start before the whole clip arrives.
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ASSETS_DIR = 'dist/assets';
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];
const VIDEO_PER_FILE_LIMIT = 8 * 1024 * 1024;
const VIDEO_TOTAL_LIMIT = 16 * 1024 * 1024;

/* Images get their own, much tighter ceiling. A 1.2MB PNG once shipped for a
   118x157 thumbnail; the WebP that replaced it is 81KB. 250KB leaves plenty of
   room for a legitimately large photograph while still catching a raw export
   dropped in by mistake. */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];
const IMAGE_PER_FILE_LIMIT = 250 * 1024;

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

async function main() {
  let entries;
  try {
    entries = await readdir(ASSETS_DIR);
  } catch {
    console.log('check-media-budget: dist/assets가 없어 건너뜁니다.');
    return;
  }

  const measure = async (extensions) =>
    Promise.all(
      entries
        .filter((name) => extensions.some((ext) => name.endsWith(ext)))
        .map(async (name) => ({
          name,
          size: (await stat(join(ASSETS_DIR, name))).size,
        }))
    );

  const videos = await measure(VIDEO_EXTENSIONS);
  const images = await measure(IMAGE_EXTENSIONS);
  const videoTotal = videos.reduce((sum, file) => sum + file.size, 0);
  const imageTotal = images.reduce((sum, file) => sum + file.size, 0);
  const problems = [];

  for (const file of videos.filter((v) => v.size > VIDEO_PER_FILE_LIMIT)) {
    problems.push(
      `  ${file.name} — ${mb(file.size)} (영상 개별 상한 ${mb(VIDEO_PER_FILE_LIMIT)})`
    );
  }

  if (videoTotal > VIDEO_TOTAL_LIMIT) {
    problems.push(
      `  영상 합계 ${mb(videoTotal)} (상한 ${mb(VIDEO_TOTAL_LIMIT)})`
    );
  }

  for (const file of images.filter((i) => i.size > IMAGE_PER_FILE_LIMIT)) {
    problems.push(
      `  ${file.name} — ${mb(file.size)} (이미지 개별 상한 ${mb(IMAGE_PER_FILE_LIMIT)})`
    );
  }

  if (problems.length > 0) {
    console.error(
      [
        'check-media-budget: 번들된 미디어가 예산을 넘었습니다.',
        ...problems,
        '',
        '예산을 올리지 말고 다시 인코딩하세요.',
        '영상:',
        '  ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow \\',
        '         -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4',
        '이미지 (표시 크기의 2배를 넘겨 담지 마세요):',
        '  cwebp -q 80 -m 6 -resize <표시폭*2> 0 in.png -o out.webp',
      ].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `check-media-budget: 영상 ${videos.length}개 ${mb(videoTotal)}, ` +
      `이미지 ${images.length}개 ${mb(imageTotal)} — 통과`
  );
}

await main();
