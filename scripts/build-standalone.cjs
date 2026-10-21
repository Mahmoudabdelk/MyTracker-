'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

async function build() {
  const root = path.resolve(__dirname, '..');
  const [html, css, js, favicon] = await Promise.all(
    ['index.html', 'styles.css', 'app.js', 'favicon.svg'].map((file) =>
      fs.readFile(path.join(root, file), 'utf8'),
    ),
  );
  const standalone = html
    .replace(
      /<link\b[^>]*href="styles\.css"[^>]*>/,
      () => `<style>\n${css}\n</style>`,
    )
    .replace(/<script\b[^>]*src="app\.js"[^>]*><\/script>/, '')
    .replace('</body>', () => `<script>\n${js}\n</script>\n</body>`)
    .replace(
      'href="favicon.svg"',
      () => `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`,
    );
  if (
    standalone === html ||
    /(?:src="app\.js"|href="styles\.css")/.test(standalone)
  ) {
    throw new Error('Standalone build could not inline application assets.');
  }
  await fs.mkdir(path.join(root, 'dist'), { recursive: true });
  const target = path.join(root, 'dist', 'HR-System.html');
  await fs.writeFile(target, standalone);
  console.log(`Standalone HTML: ${target}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
