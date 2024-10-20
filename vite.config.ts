import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import postcssNesting from 'postcss-nesting'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import preserveDirectives from "rollup-plugin-preserve-directives"
import { visualizer } from "rollup-plugin-visualizer"
import viteCompression from "vite-plugin-compression"
import ViteEnv from "vite-plugin-environment"
import { createHtmlPlugin } from "vite-plugin-html"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import mkcert from "vite-plugin-mkcert"
import { VitePWA } from "vite-plugin-pwa"
import eslintPlugin from 'vite-plugin-eslint'
import svgr from "vite-plugin-svgr"
import type { ConfigEnv, Plugin, UserConfig } from 'vite'

const resolvePath = (relativePath: string) => path.resolve(__dirname, relativePath)

const aliases = {
  'ajv': 'ajv/dist/core',
  "@": resolvePath("./src"),
  "@assets": resolvePath("./src/assets"),
  "@js": resolvePath("./src/js"),
  "@scss": resolvePath("./src/scss"),
  "@fa-scss": resolvePath("./node_modules/@fortawesome/fontawesome-free/scss"),
  "@fontawesome": resolvePath("./node_modules/@fortawesome"),
  "@fontsource": resolvePath("./node_modules/@fontsource"),
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

export default defineConfig((configEnv: ConfigEnv): UserConfig => {
  const env = loadEnv(configEnv.mode, process.cwd(), "")
  const isProd = configEnv.mode === "production"
  const isDev = configEnv.mode === "development"

  return {
    base: env.VITE_BASE || "/",
    plugins: [
      TanStackRouterVite(),
      viteReact(),
      preserveDirectives({
        include: ['**/*.js', '**/*.ts', '**/*.tsx'],
        exclude: ['**/*.css', '**/*.scss', '**/*.sass']
      }),
      scssPlugin,
      mkcert(),
      svgr(),
      ViteEnv({
        VITE_APP_TITLE: env.VITE_APP_TITLE,
        VITE_SHORT_APP_TITLE: env.VITE_SHORT_APP_TITLE,
      }),
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
      }),
      visualizer({
        filename: resolvePath("./dist/stats.html"),
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      createHtmlPlugin({
        minify: isProd,
        inject: {
          data: {
            title: env.VITE_APP_TITLE,
          },
        },
      }),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        jpg: { quality: 80 },
        webp: { lossless: false, quality: 90 },
        svg: { multipass: true },
      }),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
        manifest: {
          name: env.VITE_APP_TITLE,
          short_name: env.VITE_SHORT_APP_TITLE,
          theme_color: "#ffffff",
          icons: [
            {
              src: "./android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "./android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      eslintPlugin({
        cache: false,
        include: ["./src/**/*.js", "./src/**/*.jsx", "./src/**/*.ts", "./src/**/*.tsx"],
        exclude: [],
        failOnError: isProd,
      }),
    ],
    resolve: {
      alias: aliases
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          api: "modern",
          sourceMap: isDev,
          outputStyle: isProd ? "compressed" : "expanded",
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
      outDir: env.VITE_OUTPUT_DIR || './dist',
      assetsDir: env.VITE_ASSETS_DIR || "assets",
      minify: isProd ? "terser" : false,
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              safari10: true,
            },
          }
        : undefined,
      chunkSizeWarningLimit: 250 * 1024,
      assetsInlineLimit: 256,
      reportCompressedSize: true,
      sourcemap: isDev,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom")) {
                return "react-vendor"
              }
              if (id.includes("@fortawesome")) {
                return "fontawesome-vendor"
              }
              return "vendor"
            }
            return null
          },
          entryFileNames: "js/[name].[hash].js",
          chunkFileNames: "js/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split(".") ?? []
            let extType = info[info.length - 1]
            if (extType) {
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                extType = "img"
              } else if (/woff|woff2/.test(extType)) {
                extType = "fonts"
              } else if (extType === "css") {
                extType = "css"
              }
            }
            return `${extType}/[name].[hash][extname]`
          },
        },
      },
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari13.1"],
      cssCodeSplit: true,
      cssTarget: ["chrome61", "firefox60", "safari11", "edge18"],
    },
    server: {
      hmr: {
        overlay: true,
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@fortawesome/fontawesome-free",
        "vite-plugin-mkcert",
        "vite-plugin-compression",
        "rollup-plugin-visualizer",
        "vite-plugin-image-optimizer",
        "vite-plugin-html",
        "vite-plugin-pwa",
        "vite-plugin-eslint",
        "@vitejs/plugin-react",
        "vite-plugin-preload",
      ],
      exclude: [],
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})