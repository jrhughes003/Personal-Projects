import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// Written into the built HTML only: Vite's dev server needs inline scripts
// and a websocket for hot reload, which this policy would block.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
].join('; ')

function contentSecurityPolicy(): Plugin {
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      ),
  }
}

export default defineConfig({
  // Relative asset paths so the build loads from file:// inside Electron.
  base: './',
  plugins: [react(), contentSecurityPolicy()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
