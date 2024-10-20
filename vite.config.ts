import { defineConfig, mergeConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { tanstackViteConfig } from '@tanstack/config/vite'

// https://vitejs.dev/config/
const config = defineConfig({
  plugins: [TanStackRouterVite({}), viteReact()],
  resolve: {
    alias: {
      'ajv': 'ajv/dist/core'
    }
  }
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: './src/main.tsx', // Updated to match your project structure
    srcDir: './src',
  }),
)