import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Gera um único index.html (JS, CSS e fonte embutidos) para servir pelo GitHub Pages.
export default defineConfig({ plugins: [react(), viteSingleFile()], build: { assetsInlineLimit: 1e8 } })
