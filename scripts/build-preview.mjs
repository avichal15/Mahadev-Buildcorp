/**
 * Bundles the built site into one standalone HTML file that runs from disk.
 *
 * Everything the page needs is folded in: the JS, the CSS, and the logo files
 * (which live in public/ and so are referenced by absolute path, which would
 * break the moment the file is opened outside a server). Fonts stay as a
 * remote <link> — the file is meant to be opened in a normal browser, where
 * that resolves fine.
 *
 * Run: npm run build:preview
 *
 * Runs the bundler itself rather than relying on the caller to set SINGLE_FILE,
 * because `VAR=1 cmd` is not portable to Windows shells.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const dist = 'dist';
// Deliberately outside dist/: a later `npm run build` empties that directory
// and would take the preview with it.
const out = process.argv[2] ?? 'mahadev-preview.html';

rmSync(dist, { recursive: true, force: true });
// One command string rather than an args array: with `shell: true` Node warns
// that array args are concatenated unescaped.
const build = spawnSync('npx vite build', {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SINGLE_FILE: '1' },
});
if (build.status !== 0) process.exit(build.status ?? 1);

if (!existsSync(join(dist, 'index.html'))) {
  console.error('No dist/index.html — the build produced nothing.');
  process.exit(1);
}

let html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = readdirSync(join(dist, 'assets'));

const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));

if (js.length !== 1) {
  console.error(`Expected exactly one JS chunk, found ${js.length}. Build with SINGLE_FILE=1.`);
  process.exit(1);
}

/*
 * Always replace via a function, never a replacement string.
 *
 * A string replacement treats `$&`, `$1`, `` $` `` and so on as patterns, and
 * minified React contains `.replace(A, "$&/")`. Passing the bundle in as a
 * replacement string splices the matched <script> tag into React's own
 * key-escaping code and silently corrupts it. A function replacer is passed
 * through verbatim.
 */
const inline = (haystack, pattern, replacement) => haystack.replace(pattern, () => replacement);

// Inline the stylesheet.
for (const file of css) {
  const code = readFileSync(join(dist, 'assets', file), 'utf8');
  html = inline(
    html,
    new RegExp(`\\s*<link[^>]*href="[^"]*${file}"[^>]*>`),
    `\n    <style>\n${code}\n    </style>`,
  );
}

// Inline the script. Escaped so a literal </script> in the bundle cannot end
// the tag early.
const code = readFileSync(join(dist, 'assets', js[0]), 'utf8').replace(/<\/script>/gi, '<\\/script>');
html = inline(
  html,
  new RegExp(`\\s*<script[^>]*src="[^"]*${js[0]}"[^>]*></script>`),
  `\n    <script type="module">\n${code}\n    </script>`,
);

// Fold the public/ images in as data URIs.
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
for (const file of readdirSync(dist)) {
  const ext = extname(file);
  if (!mime[ext]) continue;
  const data = readFileSync(join(dist, file)).toString('base64');
  html = html.split(`/${file}`).join(`data:${mime[ext]};base64,${data}`);
}

writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`Wrote ${out} (${kb} kB)`);

// Only inspect the document shell — the inlined bundle is full of strings that
// look like markup and would drown this check in false positives.
const shell = html.replace(/<script type="module">[\s\S]*?<\/script>/, '');
const leftovers = [...shell.matchAll(/(?:src|href)="(?!data:|https?:|#)([^"]+)"/g)].map((m) => m[1]);
console.log(
  leftovers.length
    ? `Unresolved local refs: ${leftovers.join(', ')}`
    : 'No unresolved local references.',
);
