import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import vueDevTools from 'vite-plugin-vue-devtools';
import { electronRendererResolve } from './vite/plugins/electron-renderer-resolve.mts';
import { copyStaticAssets } from './vite/plugins/copy-static-assets.mts';
import { sourcemapStub, localFileProxy } from './vite/plugins/dev-middleware.mts';
import { lazyMonacoFix } from './vite/plugins/lazy-monaco-fix.mts';
import { fileURLToPath } from 'url';

function fileToPath(src: string) {
	return fileURLToPath(new URL(src, import.meta.url));
}

const isServe = process.env.VITE_SERVE === 'true';
const projectDir = process.env.VITE_PROJECT_DIR || 'Project';
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
const devServerPort = Number(process.env.VITE_DEV_SERVER_PORT || 5173);
const uiKitAlias =
	process.env.VITE_UI_KIT === 'dist' || !isServe
		? fileToPath('../ui-kit/dist/ui-kit.js')
		: fileToPath('../ui-kit/src/index.ts');
const uiKitStylesAlias =
	process.env.VITE_UI_KIT === 'dist' || !isServe
		? fileToPath('../ui-kit/src/styles/prod.css')
		: fileToPath('../ui-kit/src/styles/index.css');

/**
 * 启动 Electron 前剔除 ELECTRON_RUN_AS_NODE。
 *
 * 某些终端 / 工具链（例如 DSH 的 node、pnpm shim）会把这个变量导出给整棵子进程树，
 * 于是 electron.exe 会退化成纯 Node 进程：require('electron') 返回的是可执行文件路径字符串，
 * 主进程随即在 require('electron').ipcMain 处抛
 * `TypeError: Cannot read properties of undefined (reading 'handle')`。
 * 这里显式还原成真正的 Electron 启动，避免开发环境依赖外部 shell 的状态。
 */
function devElectronEnv() {
	const env = { ...process.env };
	delete env.ELECTRON_RUN_AS_NODE;
	return env;
}

export default defineConfig({
	root: '.',
	base: './',

	plugins: [
		vue(),
		...(isServe ? [vueDevTools()] : []),
		electronRendererResolve(),
		copyStaticAssets(fileToPath('.')),
		sourcemapStub(),
		localFileProxy(),
		lazyMonacoFix(),
		electron({
			vite: {
				build: {
					outDir: fileToPath('dist-electron'),
					emptyOutDir: true,
					sourcemap: true,
					minify: true,
					lib: {
						entry: {
							main: fileToPath('main/main.ts'),
							apk: fileToPath('main/apk.ts'),
							preload: fileToPath('main/preload.ts')
						},
						formats: ['cjs']
					},
					rolldownOptions: {
						external: [
							'electron',
							'fs',
							'path',
							'os',
							'url',
							'util',
							'child_process',
							'http',
							'https',
							'node:fs',
							'node:path',
							'node:os',
							'node:url',
							'node:util',
							'node:child_process',
							'node:http',
							'node:https',
							'koa',
							'mime-types',
							'qrcode',
							'exceljs',
							'xml2js',
							'sharp',
							// tsc.ts 在运行期 require 它做进程内转译；必须 external，
							// 否则会把 8MB+ 的编译器打进主进程包（运行期由 extraResources 提供）
							'typescript'
						]
					}
				}
			},
			onstart: async ({ startup }) => {
				const deadline = Date.now() + 15000;
				while (Date.now() < deadline) {
					try {
						// oxlint-disable-next-line no-await-in-loop
						await fetch(devServerUrl);
						break;
					} catch {
						// oxlint-disable-next-line no-await-in-loop
						await new Promise((r) => setTimeout(r, 200));
					}
				}
				// 插件默认以 server.config.root 为 cwd，electron 需要在项目根找 package.json 入口
				// env 里剔除 ELECTRON_RUN_AS_NODE，否则 electron 会以纯 Node 模式启动主进程
				await startup(
					['.', `--dirname=${projectDir}`, `--dev-server-url=${devServerUrl}`],
					{ cwd: __dirname, env: devElectronEnv() }
				);
			}
		})
	],

	build: {
		outDir: fileToPath('dist'),
		emptyOutDir: true,
		rolldownOptions: {
			input: {
				main: fileToPath('index.html')
			},
			external: [
				'electron',
				'node:fs',
				'node:path',
				'node:url',
				'node:os',
				'node:child_process',
				'axios',
				'fs-extra',
				'yauzl',
				'uglify-js',
				'markdown-it'
			],
			output: {
				entryFileNames: 'assets/[name].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',
				manualChunks(id: string) {
					if (id.includes('node_modules')) {
						if (id.includes('jsonc-parser') || id.includes('vscode-uri'))
							return 'ym-vue';
						if (id.includes('monaco-editor') && id.includes('nls')) return 'ym-vue';
						if (id.includes('monaco-editor')) return undefined;
						if (id.includes('vue') || id.includes('@vue')) return 'ym-vue';
						if (id.includes('pinia')) return 'ym-vue';
						if (id.includes('@vueuse')) return 'ym-vue';
						return 'vendor';
					}
					return undefined;
				}
			}
		},
		minify: true,
		sourcemap: false,
		chunkSizeWarningLimit: 7500
	},

	server: {
		host: 'localhost',
		port: devServerPort,
		strictPort: true,
		cors: true,
		warmup: {
			clientFiles: [
				'index.html',
				'src/main.ts',
				'src/App.vue',
				'src/AppShell.vue',
				'src/components/layout/LayoutPanel.vue',
				'src/engine/layout/layout.ts',
				'src/tools/window-cluster.ts'
			]
		},
		proxy: {
			// dev 模式走 Vite 代理避 CORS（prod 模式 file:// 协议无 CORS 限制）
			'^/github-raw/': {
				target: 'https://raw.githubusercontent.com',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/github-raw\//, '/')
			},
			'^/jsdelivr/': {
				target: 'https://cdn.jsdelivr.net',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/jsdelivr\//, '/')
			}
		}
	},

	resolve: {
		alias: {
			'@app': fileToPath('src'),
			'@ui-kit/styles.css': uiKitStylesAlias,
			'@ui-kit': uiKitAlias
		}
	},

	publicDir: false,

	optimizeDeps: {
		include: ['vue', 'pinia'],
		exclude: ['electron']
	}
});
