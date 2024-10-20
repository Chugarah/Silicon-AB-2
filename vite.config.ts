import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import postcssNesting from "postcss-nesting";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import ViteEnv from "vite-plugin-environment";
import { createHtmlPlugin } from "vite-plugin-html";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import eslintPlugin from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";
import sassGlobImports from "vite-plugin-sass-glob-import";
import react from "@vitejs/plugin-react";
import type { ConfigEnv, UserConfig } from "vite";

const resolvePath = (relativePath: string) =>
	path.resolve(__dirname, relativePath);

const aliases = {
	ajv: "ajv/dist/core",
	"@": resolvePath("./src"),
	"@assets": resolvePath("./src/assets"),
	"@js": resolvePath("./src/js"),
	"@scss": resolvePath("./src/scss"),
	"@fa-scss": resolvePath("./node_modules/@fortawesome/fontawesome-free/scss"),
	"@fontawesome": resolvePath("./node_modules/@fortawesome"),
	"@fontsource": resolvePath("./node_modules/@fontsource"),
};

export default defineConfig((configEnv: ConfigEnv): UserConfig => {
	const env = loadEnv(configEnv.mode, process.cwd(), "");
	const isProd = configEnv.mode === "production";
	const isDev = configEnv.mode === "development";

	return {
		base: env.VITE_BASE || "./",
		plugins: [
			eslintPlugin({
				cache: false,
				include: ["./src/**/*.{js,jsx,ts,tsx}"],
				exclude: ["node_modules"],
				failOnError: isProd,
			}),
			sassGlobImports(),
			TanStackRouterVite(),
			react(),
			svgr(),
			ViteEnv({
				VITE_APP_TITLE: env.VITE_APP_TITLE,
				VITE_SHORT_APP_TITLE: env.VITE_SHORT_APP_TITLE,
			}),
			viteCompression({
				algorithm: "brotliCompress",
				ext: ".br",
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
		],
		resolve: {
			alias: aliases,
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
			modules: {
				localsConvention: "camelCaseOnly",
			},
			postcss: {
				plugins: [postcssNesting(), tailwindcss(), autoprefixer()],
			},
		},
		build: {
			outDir: env.VITE_OUTPUT_DIR || "./dist",
			assetsDir: env.VITE_ASSETS_DIR || "assets",
			target: ["es2022", "chrome100", "safari13"],
			minify: isProd ? "terser" : false,
			terserOptions: isProd
				? {
						compress: {
							drop_console: true,
							drop_debugger: true,
						},
					}
				: undefined,
			rollupOptions: {
				output: {
					manualChunks: {
						react: ["react", "react-dom"],
						router: ["@tanstack/react-router"],
					},
				},
			},
			sourcemap: isDev,
			assetsInlineLimit: 4096,
			chunkSizeWarningLimit: 1000,
			reportCompressedSize: true,
		},
		server: {
			hmr: {
				overlay: true,
			},
			port: 5250,
			open: true,
		},
		optimizeDeps: {
			include: ["react", "react-dom", "@tanstack/react-router"],
		},
		define: {
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
	};
});
