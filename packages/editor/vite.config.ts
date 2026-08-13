import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import vueDevTools from 'vite-plugin-vue-devtools';
import type { Connect, ViteDevServer, IndexHtmlTransformContext } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

const isCustomElement = (tag: string) =>
	tag === 'log-item' || tag === 'anim-dir' || tag === 'tooltip-line';

type BundleEntry = {
	type: string;
	fileName?: string;
	source?: unknown;
	code?: string;
	map?: unknown;
};

// 递归复制目录（保留静态资源到 dist）
const copyDirRecursive = (src: string, dest: string) => {
	if (!existsSync(src)) return;
	mkdirSync(dest, { recursive: true });
	for (const name of readdirSync(src)) {
		const srcPath = join(src, name);
		const destPath = join(dest, name);
		if (statSync(srcPath).isDirectory()) {
			copyDirRecursive(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
};

// 将 Project/ 下需原样输出的静态资源复制到 dist/
const copyStaticAssets = (outDir: string) => {
	const root = resolve(__dirname, 'Project');
	const staticDirs = ['Locales', 'Fonts', 'Images', 'Apk'];
	const staticFiles: Array<[string, string]> = [
		['default.json', 'default.json'],
		['commands.json', 'commands.json'],
		// packmeta 运行时由 global.ts 以 __dirname/Script/module/packmeta.json 读取，dest 保持原路径；源文件已随 src/ 迁移至项目根
		['../src/legacy/module/packmeta.json', 'Script/module/packmeta.json']
	];
	// 创建module目录
	mkdirSync(join(outDir, 'Script/module'), { recursive: true });
	for (const dir of staticDirs) {
		copyDirRecursive(join(root, dir), join(outDir, dir));
	}
	for (const [file, dest] of staticFiles) {
		const src = join(root, file);
		if (existsSync(src)) copyFileSync(src, join(outDir, dest));
	}
};

export default defineConfig({
	root: '.',
	base: './',

	plugins: [
		vue({ template: { compilerOptions: { isCustomElement } } }),
		vueDevTools(),
		{
			name: 'electron-renderer-resolve',
			transform(code: string, id: string) {
				if (!id.endsWith('.ts') && !id.endsWith('.js') && !id.endsWith('.mjs')) return;
				const b64 = (src: string) =>
					'data:text/javascript;base64,' + Buffer.from(src).toString('base64');
				const bareModules = {
					electron: `const e = window.__nodeRequire?.('electron') ?? {}; export const { clipboard, ipcRenderer, shell, webFrame } = e; export default e`,
					axios: `const a = window.__nodeRequire?.('axios') ?? {}; export default a`,
					'markdown-it': `const M = window.__nodeRequire?.('markdown-it') ?? {}; export default M`,
					'fs-extra': `const f = window.__nodeRequire?.('fs-extra') ?? {}; export default f`,
					yauzl: `const y = window.__nodeRequire?.('yauzl') ?? {}; export default y`,
					'uglify-js': `const u = window.__nodeRequire?.('uglify-js') ?? {}; export default u`
				};
				const nodeModules = {
					'node:path': `const p = window.__nodeRequire?.('path') ?? {}; export default p; export const { sep, delimiter, posix, win32, resolve, normalize, isAbsolute, join, relative, dirname, basename, extname, parse, format } = p`,
					'node:fs': `const f = window.__nodeRequire?.('fs') ?? {}; export default f; export const { promises, existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, unlinkSync, copyFileSync, renameSync } = f`,
					'node:os': `const o = window.__nodeRequire?.('os') ?? {}; export default o; export const { homedir, platform, tmpdir, hostname, cpus, totalmem, freemem, EOL } = o`,
					'node:url': `const u = window.__nodeRequire?.('url') ?? {}; export default u; export const { fileURLToPath, URL, pathToFileURL, format, parse, resolve } = u`,
					'node:child_process': `const c = window.__nodeRequire?.('child_process') ?? {}; export default c; export const { exec, execSync, spawn, spawnSync, fork } = c`
				};
				let out = code;
				const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				for (const [mod, src] of Object.entries({
					...bareModules,
					...nodeModules
				})) {
					const dataUrl = b64(src);
					out = out
						.replace(
							new RegExp(`from\\s+['"]${escapeRe(mod)}['"]`, 'g'),
							`from '${dataUrl}'`
						)
						.replace(
							new RegExp(`import\\s+['"]${escapeRe(mod)}['"]`, 'g'),
							`import '${dataUrl}'`
						);
				}
				return { code: out, map: null };
			}
		},
		{
			name: 'copy-static-assets',
			closeBundle() {
				const outDir = resolve(__dirname, 'dist');
				copyStaticAssets(outDir);
			}
		},
		// dev 模式走 /local-file/?path= 代理绕过 file:// 限制
		{
			name: 'local-file-proxy',
			configureServer(server: ViteDevServer) {
				server.middlewares.use(
					(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
						if (!req.url?.startsWith('/local-file/')) {
							return next();
						}
						const url = new URL(req.url, 'http://localhost');
						const path = url.searchParams.get('path');
						if (!path) {
							res.statusCode = 400;
							res.end('Missing path param');
							return;
						}
						const diskPath = (
							path.startsWith('file://')
								? fileURLToPath(path)
								: path.replace(/[#?]ver=\d+$/, '')
						).replace(/[\\/]{2,}/g, '/');
						try {
							const buf = readFileSync(diskPath);
							res.setHeader('Content-Type', 'application/octet-stream');
							res.setHeader('Access-Control-Allow-Origin', '*');
							res.end(buf);
						} catch {
							res.statusCode = 404;
							res.end(`File not found: ${diskPath}`);
						}
					}
				);
			}
		},
		{
			name: 'lazy-monaco-fix',
			enforce: 'post',
			transformIndexHtml: {
				order: 'post',
				handler(html: string, ctx: IndexHtmlTransformContext) {
					const bundle = ctx.bundle as Record<string, BundleEntry> | undefined;
					if (!bundle) return html;
					const monacoName = Object.keys(bundle).find((name) =>
						name.startsWith('assets/editor.api2-')
					);
					if (!monacoName) return html;
					const monacoCode = bundle[monacoName].code as string;
					const defM = monacoCode.match(
						/var\s+(\w+)=Object\.defineProperty,(\w+)=\(e,t\)=>\{/
					);
					let alias = 'g';
					if (defM) {
						const tail = monacoCode.slice(monacoCode.lastIndexOf('export{'));
						const aliasM = tail.match(
							new RegExp('(?:^|[,{])(?:' + defM[2] + ')\\s+as\\s+(\\w+)')
						);
						if (aliasM) alias = aliasM[1];
					}
					const scripts = [...html.matchAll(/src="\.\/assets\/([^"]+\.js)"/g)].map(
						(m) => m[1]
					);
					for (const file of scripts) {
						const c = bundle['assets/' + file];
						if (!c || c.type !== 'chunk') continue;
						const code = c.code as string;
						const m = code.match(
							new RegExp('import\\{([^{}]*)\\}from"\\.\\/editor\\.api2[^"]*"')
						);
						if (!m) continue;
						const sm = m[1].trim().match(/^(\w+) as (\w+)$/);
						if (!sm) {
							throw new Error(
								'lazy-monaco-fix: unexpected multi-symbol import from editor.api2 in ' +
									file
							);
						}
						const [, expName, localName] = sm;
						if (expName !== alias) {
							throw new Error(
								'lazy-monaco-fix: unexpected import "' +
									expName +
									'" from editor.api2 in ' +
									file
							);
						}
						let dp = '__m2dp';
						while (code.includes(dp)) dp += '_';
						const helper =
							'var ' +
							dp +
							'=Object.defineProperty,' +
							localName +
							'=(e,t)=>{let n={};for(var r in e)' +
							dp +
							'(n,r,{get:e[r],enumerable:!0});return t||' +
							dp +
							'(n,Symbol.toStringTag,{value:"Module"}),n};';
						c.code = code.replace(m[0], helper);
						c.map = null;
					}
					html = html.replace(
						/<script[^>]*src="\.\/assets\/editor\.api2-[^"]*\.js"[^>]*><\/script>\s*/g,
						''
					);
					html = html.replace(
						/<link[^>]*href="\.\/assets\/editor\.api2-[^"]*\.js"[^>]*>\s*/g,
						''
					);
					return html.replace(
						/<link[^>]*href="\.\/assets\/editor-[^"]*\.css"[^>]*>\s*/g,
						''
					);
				}
			},
			generateBundle(_: unknown, bundle: Record<string, BundleEntry>) {
				for (const name of Object.keys(bundle)) {
					const c = bundle[name];
					// oxlint-disable-next-line unicorn/prefer-string-starts-ends-with
					if (c.type !== 'asset' || !/\.html$/.test(c.fileName || '')) continue;
					const html = String(c.source ?? '');
					const scripts = [...html.matchAll(/src="\.\/assets\/([^"]+\.js)"/g)].map(
						(m) => m[1]
					);
					for (const file of scripts) {
						const chunk = bundle['assets/' + file];
						if (!chunk || chunk.type !== 'chunk') continue;
						if (/from"\.\/editor\.api2[^"]*"/.test(chunk.code as string)) {
							throw new Error(
								'lazy-monaco-fix: initial chunk ' +
									file +
									' still statically imports editor.api2'
							);
						}
					}
				}
			}
		},
		electron({
			vite: {
				build: {
					outDir: resolve(__dirname, 'dist-electron'),
					emptyOutDir: true,
					sourcemap: true,
					minify: true,
					lib: {
						entry: {
							main: resolve(__dirname, 'main/main.ts'),
							apk: resolve(__dirname, 'main/apk.ts')
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
							'sharp'
						]
					}
				}
			},
			onstart: async ({ startup }) => {
				const deadline = Date.now() + 15000;
				while (Date.now() < deadline) {
					try {
						// oxlint-disable-next-line no-await-in-loop
						await fetch('http://localhost:5173');
						break;
					} catch {
						// oxlint-disable-next-line no-await-in-loop
						await new Promise((r) => setTimeout(r, 200));
					}
				}
				// 插件默认以 server.config.root 为 cwd，electron 需要在项目根找 package.json 入口
				await startup(
					['.', '--dirname=Project', '--dev-server-url=http://localhost:5173'],
					{ cwd: __dirname }
				);
			}
		})
	],

	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		rolldownOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				vue: resolve(__dirname, 'vue.html')
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
							return 'aaa-vue';
						if (id.includes('monaco-editor') && id.includes('nls')) return 'aaa-vue';
						if (id.includes('monaco-editor')) return undefined;
						if (id.includes('vue') || id.includes('@vue')) return 'aaa-vue';
						if (id.includes('pinia')) return 'aaa-vue';
						if (id.includes('@vueuse')) return 'aaa-vue';
						return 'vendor';
					}
				}
			}
		},
		minify: true,
		sourcemap: true
	},

	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true,
		cors: true,
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
			'@': resolve(__dirname, 'src/legacy'),
			'@app': resolve(__dirname, 'src'),
			'@ui-kit': resolve(__dirname, '../ui-kit/src/index.ts')
		}
	},

	publicDir: false,

	optimizeDeps: {
		include: ['axios', 'vue', 'pinia'],
		exclude: ['electron']
	},

	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
	},

	oxc: {
		target: 'chrome150'
	}
});
