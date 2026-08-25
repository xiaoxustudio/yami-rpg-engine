import type { Plugin } from 'vite';

// 渲染进程对 node/electron 内置模块的桥接：源码 import 具名符号 → data URL 导出
// （index.html 的 importmap 只提供 default，具名导出依赖此插件）
const b64 = (src: string) => 'data:text/javascript;base64,' + Buffer.from(src).toString('base64');
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bareModules: Record<string, string> = {
	electron: `const e = window.__nodeRequire?.('electron') ?? {}; export const { clipboard, ipcRenderer, shell, webFrame } = e; export default e`,
	axios: `const a = window.__nodeRequire?.('axios') ?? {}; export default a`,
	'markdown-it': `const M = window.__nodeRequire?.('markdown-it') ?? {}; export default M`,
	'fs-extra': `const f = window.__nodeRequire?.('fs-extra') ?? {}; export default f`,
	yauzl: `const y = window.__nodeRequire?.('yauzl') ?? {}; export default y`,
	'uglify-js': `const u = window.__nodeRequire?.('uglify-js') ?? {}; export default u`
};
const nodeModules: Record<string, string> = {
	'node:path': `const p = window.__nodeRequire?.('path') ?? {}; export default p; export const { sep, delimiter, posix, win32, resolve, normalize, isAbsolute, join, relative, dirname, basename, extname, parse, format } = p`,
	'node:fs': `const f = window.__nodeRequire?.('fs') ?? {}; export default f; export const { promises, existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, unlinkSync, copyFileSync, renameSync } = f`,
	'node:os': `const o = window.__nodeRequire?.('os') ?? {}; export default o; export const { homedir, platform, tmpdir, hostname, cpus, totalmem, freemem, EOL } = o`,
	'node:url': `const u = window.__nodeRequire?.('url') ?? {}; export default u; export const { fileURLToPath, URL, pathToFileURL, format, parse, resolve } = u`,
	'node:child_process': `const c = window.__nodeRequire?.('child_process') ?? {}; export default c; export const { exec, execSync, spawn, spawnSync, fork } = c`
};
const rendererModuleNames = Object.keys({ ...bareModules, ...nodeModules });
const rendererModules = rendererModuleNames.map((mod) => ({
	dataUrl: b64(bareModules[mod] ?? nodeModules[mod]!),
	fromRe: new RegExp(`from\\s+['"]${escapeRe(mod)}['"]`, 'g'),
	importRe: new RegExp(`import\\s+['"]${escapeRe(mod)}['"]`, 'g')
}));
const rendererSpecifierRe = new RegExp(
	`(?:from|import)\\s+['"](?:${rendererModuleNames.map(escapeRe).join('|')})['"]`
);

export function electronRendererResolve(): Plugin {
	return {
		name: 'electron-renderer-resolve',
		transform(code: string, id: string) {
			if (!id.endsWith('.ts') && !id.endsWith('.js') && !id.endsWith('.mjs')) return;
			if (!rendererSpecifierRe.test(code)) return;
			let out = code;
			for (const { dataUrl, fromRe, importRe } of rendererModules) {
				out = out
					.replace(fromRe, `from '${dataUrl}'`)
					.replace(importRe, `import '${dataUrl}'`);
			}
			return { code: out, map: null };
		}
	};
}
