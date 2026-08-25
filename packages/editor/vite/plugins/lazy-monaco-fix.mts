import type { IndexHtmlTransformContext, Plugin } from 'vite';

interface BundleEntry {
	type: string;
	fileName?: string;
	source?: unknown;
	code?: string;
	map?: unknown;
}

// 修正 monaco-editor 懒加载 chunk：编译期把 editor.api2 的具名导入改写为模块命名空间访问
export function lazyMonacoFix(): Plugin {
	return {
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
				return html.replace(/<link[^>]*href="\.\/assets\/editor-[^"]*\.css"[^>]*>\s*/g, '');
			}
		},
		generateBundle(_: unknown, bundle: Record<string, BundleEntry>) {
			for (const name of Object.keys(bundle)) {
				const c = bundle[name];
				// oxlint-disable-next-line unicorn/prefer-string-starts-ends-with
				if (c.type !== 'asset' || !/\.html$/.test(c.fileName || '')) continue;
				// oxlint-disable-next-line no-base-to-string
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
	};
}
