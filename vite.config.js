import { resolve } from 'path'
import { readdir } from 'fs/promises'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm';

const dirContents = await readdir(resolve(__dirname, './'))
const examples = dirContents
  .filter((f) => f.endsWith('.html'))
  .filter((f) => f !== 'index.html')
  .map((f) => f.slice(0, -'.html'.length))

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  server: {
    host: true,
  },
  plugins: [wasm()],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html'),
        ...Object.fromEntries(
          examples.map((example) => [example, resolve(__dirname, `./${example}.html`)])
        ),
      },
    },
  },
})
