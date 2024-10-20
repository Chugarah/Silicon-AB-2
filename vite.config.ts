import path from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import postcssNesting from 'postcss-nesting'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import preserveDirectives from "rollup-plugin-preserve-directives"
import type { Plugin } from 'vite'

const resolvePath = (relativePath: string) => path.resolve(__dirname, relativePath)

const aliases = {
  'ajv': 'ajv/dist/core',
  "@": resolvePath("./src"),
  "@assets": resolvePath("./src/assets"),
  "@js": resolvePath("./src/js"),
  "@scss": resolvePath("./src/scss"),
}

const scssPlugin: Plugin = {
  name: 'scss-handler',
  transform(id: string): { code: string; map: null } | undefined {
    if (id.endsWith('.scss')) {
      return {
        code: `import '${id}'; export default {}`,
        map: null
      }
    }
    return undefined;
  }
}
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    viteReact(),
    preserveDirectives({
      include: ['**/*.js', '**/*.ts', '**/*.tsx'],
      exclude: ['**/*.css', '**/*.scss', '**/*.sass']
    }),
    scssPlugin
  ],
  resolve: {
    alias: aliases
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        api: "modern"
      },
    },
    postcss: {
      plugins: [
        postcssNesting(),
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  build: {
    outDir: './dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})
