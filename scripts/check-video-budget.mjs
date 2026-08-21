/**
 * Fails the build when a bundled video is larger than it has any reason to be.
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
const PER_FILE_LIMIT = 8 * 1024 * 1024;
const TOTAL_LIMIT = 16 * 1024 * 1024;

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

async function main() {
  let entries;
  try {
    entries = await readdir(ASSETS_DIR);
  } catch {
    console.log('check-video-budget: dist/assets가 없어 건너뜁니다.');
    return;
  }

  const videos = entries.filter((name) =>
    VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension))
  );

  if (videos.length === 0) {
    return;
  }

  const sized = await Promise.all(
    videos.map(async (name) => ({
      name,
      size: (await stat(join(ASSETS_DIR, name))).size,
    }))
  );

  const total = sized.reduce((sum, video) => sum + video.size, 0);
  const oversized = sized.filter((video) => video.size > PER_FILE_LIMIT);
  const problems = [];

  for (const video of oversized) {
    problems.push(
      `  ${video.name} — ${mb(video.size)} (개별 상한 ${mb(PER_FILE_LIMIT)})`
    );
  }

  if (total > TOTAL_LIMIT) {
    problems.push(`  합계 ${mb(total)} (상한 ${mb(TOTAL_LIMIT)})`);
  }

  if (problems.length > 0) {
    console.error(
      [
        'check-video-budget: 번들된 영상이 예산을 넘었습니다.',
        ...problems,
        '',
        '예산을 올리지 말고 재인코딩하세요:',
        '  ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow \\',
        '         -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4',
      ].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `check-video-budget: 영상 ${sized.length}개, 합계 ${mb(total)} — 통과`
  );
}

await main();
