import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    build: {
        lib: {
            entry: 'src/embed.ts',
            name: 'BayseEmbed',
            formats: ['iife'],
            fileName: () => 'embed.js'
        },
        outDir: 'dist/cdn',
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        }
    }
})