#!/usr/bin/env node
/**
 * Frame decimation pipeline — emits 720w (q72) and 1080w (q76) WebP
 * variants of every /public/frames/fNN.webp into siblings -720.webp and
 * -1080.webp. Native files stay untouched as the 1440w tier.
 *
 * v4 spec: scroll-choreography.md §6.2 / §7. Mobile <link rel="preload"
 * imagesrcset> picks the 720w variant on mobile DPR; <img srcset> on the
 * runtime element picks per viewport.
 *
 * Run once before commit; the emitted files are committed to the repo so
 * Cloudflare Pages does NOT need sharp at build time. Re-run after any
 * /public/frames/fNN.webp source change.
 *
 *   $ node scripts/decimate-frames.mjs
 */
import { readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = path.resolve(__dirname, "..", "public", "frames");

const VARIANTS = [
  { suffix: "-720", width: 720, quality: 72 },
  { suffix: "-1080", width: 1080, quality: 76 },
];

const SOURCE_RE = /^f(\d{3})\.webp$/;

async function main() {
  const all = await readdir(FRAMES_DIR);
  const sources = all.filter((n) => SOURCE_RE.test(n)).sort();
  if (sources.length === 0) {
    console.error(`no source frames in ${FRAMES_DIR}`);
    process.exit(1);
  }

  let totalIn = 0;
  let totalOut = 0;

  for (const name of sources) {
    const srcPath = path.join(FRAMES_DIR, name);
    const srcSize = (await stat(srcPath)).size;
    totalIn += srcSize;

    for (const v of VARIANTS) {
      const outName = name.replace(/\.webp$/, `${v.suffix}.webp`);
      const outPath = path.join(FRAMES_DIR, outName);
      await sharp(srcPath)
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: v.quality, effort: 6 })
        .toFile(outPath);
      const outSize = (await stat(outPath)).size;
      totalOut += outSize;
      console.log(`${name} -> ${outName} (${v.width}w q${v.quality}) = ${(outSize / 1024).toFixed(1)} KB`);
    }
  }

  console.log("---");
  console.log(`sources: ${sources.length} files, ${(totalIn / 1024).toFixed(0)} KB`);
  console.log(`emitted: ${sources.length * VARIANTS.length} files, ${(totalOut / 1024).toFixed(0)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
