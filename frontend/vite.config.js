import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      context: path.resolve(__dirname, 'src/context'),
      examples: path.resolve(__dirname, 'src/examples'),
      layouts: path.resolve(__dirname, 'src/layouts'),
      variables: path.resolve(__dirname, 'src/variables'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) {
              return 'vendor_mui';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor_charts';
            }
            if (id.includes('react-icons')) {
              return 'vendor_icons';
            }
            return 'vendor_core';
          }
        }
      }
    }
  }
})
