/**
 * 元素注册表分组迁移工具（P5b 批次 4 用；也可复用于后续同类迁移）。
 *
 * 背景：`docs/remaining-work.md` 的 P5b 批次把 `$('#id')` 逐组改造成「按组元素注册表 + 渲染方登记」。
 * 本工具做三件事（幂等，可重复跑）：
 *   ① 生成分组注册表模块（若不存在）：`export const <registry> = createElementRegistry();`
 *   ② 模块侧：`$('#id')` → `<registry>.get('id')`（覆盖存在性门 / 赋值 / 句柄 / 方法调用 / 实参；
 *      断言一律加括号，避免 `as T?.m()` 这类非法形态）
 *   ③ 渲染 SFC 侧：给拥有该 id 的标签补 `:ref="registryRef(<registry>, 'id')"`；
 *      标签已有具名 `ref="x"` 时改为在 `onMounted` 里 `registerElement(<registry>, 'id', x.value)`
 *
 * 判据约定（前几轮踩坑后固化）：
 *   - 一律用「检查 import 语句」判断符号是否已导入，**不要**用「标识符是否出现」（模板里的
 *     `registryRef(reg, …)` 会让后者误判为已导入）；
 *   - **不做** import 合并/去重（曾把 23 个文件的 import 写坏）；
 *   - 清理未用 `$` 导入前先剥离注释与**正则字面量**（`/\$([0-9a-f]{16})/` 会被误判为还在用 `$()`）。
 *
 * 用法：
 *   审计：node scripts/element-registry-migrate.mjs audit <src 子目录…>
 *   迁移：node scripts/element-registry-migrate.mjs migrate --registry=<名> --registry-file=<路径> \
 *           --sfcs=<a.vue,b.vue> --modules=<x.ts,y.ts> [--apply]      # 省略 --apply 为干跑
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const mode = process.argv[2];
const args = process.argv.slice(3);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const eolOf = (s) => (s.includes('\r\n') ? '\r\n' : '\n');
const RE = /\$\(\s*['"`]#([\w-]+)['"`]/g;

/** 剥离注释与正则字面量，用于"是否仍在使用 $()"的判断 */
const strip = (s) =>
	s
		.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')
		.replace(/\/(?:\\.|\[[^\]]*\]|[^/\n\\])+\/[gimsuy]*/g, '');

const hasImport = (src, symbol, mod) =>
	new RegExp(`import \\{[^}]*\\b${symbol}\\b[^}]*\\} from '${mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}';`).test(src);

const allVues = [];
const walkVue = (p) => {
	for (const e of readdirSync(p)) {
		const full = join(p, e);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (e !== 'node_modules' && e !== '__tests__') walkVue(full);
		} else if (e.endsWith('.vue')) allVues.push({ path: full, src: readFileSync(full, 'utf8') });
	}
};
walkVue(join(ROOT, 'packages/editor/src'));

const walkTs = (p, out) => {
	for (const e of readdirSync(p)) {
		const full = join(p, e);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (e !== '__tests__' && e !== 'node_modules') walkTs(full, out);
		} else if (e.endsWith('.ts') && !e.endsWith('.spec.ts') && !e.endsWith('element-registry.ts')) out.push(full);
	}
};

if (mode === 'audit') {
	for (const dir of args.filter((a) => !a.startsWith('--'))) {
		const base = join(ROOT, 'packages/editor/src', dir);
		const files = [];
		walkTs(base, files);
		console.log(`\n########## src/${dir}`);
		const sfcSet = new Set();
		for (const f of files) {
			const src = readFileSync(f, 'utf8');
			const ids = [...new Set([...src.matchAll(RE)].map((m) => m[1]))];
			if (ids.length === 0) continue;
			console.log(`  ${relative(base, f)}  (${(src.match(RE) ?? []).length} 处 / ${ids.length} id)`);
			for (const id of ids) {
				const owners = allVues
					.filter((v) => v.src.includes(`id="${id}"`))
					.map((v) => v.path.replace(join(ROOT, 'packages/editor/src/'), ''));
				for (const o of owners) sfcSet.add(o);
				console.log(`     ${id.padEnd(30)} ← ${owners.join(', ') || '(无渲染者)'}`);
			}
		}
		console.log(`  >>> 涉及 SFC: ${[...sfcSet].join(', ') || '(无)'}`);
	}
	process.exit(0);
}

const registry = opt('registry');
const registryFile = opt('registry-file');
const sfcPaths = (opt('sfcs') ?? opt('sfc') ?? '').split(',').filter(Boolean);
const modulePaths = (opt('modules') ?? '').split(',').filter(Boolean);
if (!registry || !registryFile || sfcPaths.length === 0 || modulePaths.length === 0) {
	console.error('缺少参数：--registry --registry-file --sfcs --modules');
	process.exit(1);
}
const regImport = registryFile.replace('packages/editor/src/', '@app/').replace(/\.ts$/, '');

if (!existsSync(registryFile)) {
	if (APPLY) {
		writeFileSync(
			registryFile,
			`/**\n * ${registry}：分组元素注册表（渲染方登记，模块读取以替代按 id 查 DOM）。\n */\nimport { createElementRegistry } from '@app/utils/element-registry';\n\nexport const ${registry} = createElementRegistry();\n`
		);
	}
	console.log(`注册表模块将创建: ${registryFile}`);
}

let total = 0;
const idsUsed = new Set();
for (const p of modulePaths) {
	const raw = readFileSync(p, 'utf8');
	const hasBom = raw.charCodeAt(0) === 0xfeff; // 部分文件带 BOM，^import 会匹配不到
	let src = hasBom ? raw.slice(1) : raw;
	const before = src;
	const eol = eolOf(src);
	total += (src.match(RE) ?? []).length;
	for (const m of src.matchAll(RE)) idsUsed.add(m[1]);

	src = src.replace(/if\s*\(\s*!\$\(\s*'#([\w-]+)'\s*\)\s*\)/g, (_m, id) => `if (!${registry}.get('${id}'))`);
	src = src.replace(/\(\s*\$\('#([\w-]+)'\)\s+as\s+([^;]+?)\)/g, (_m, id, t) => `(${registry}.get('${id}') as ${t.trim()})`);
	src = src.replace(/(=\s*)\$\('#([\w-]+)'\);/g, (_m, eq, id) => `${eq}${registry}.get('${id}') as HTMLElement;`);
	src = src.replace(/([:,]\s*)\$\('#([\w-]+)'\)/g, (_m, sep, id) => `${sep}${registry}.get('${id}') as HTMLElement`);
	src = src.replace(/\$\('#([\w-]+)'\)\s*\?\.\s*([\w$]+)\s*\?*\(/g, (_m, id, m2) => `(${registry}.get('${id}') as HTMLElement)?.${m2}?.(`);
	src = src.replace(/\$\('#([\w-]+)'\)\s*\.\s*([\w$]+)\s*\(/g, (_m, id, m2) => `(${registry}.get('${id}') as HTMLElement)?.${m2}?.(`);
	src = src.replace(/\$\('#([\w-]+)'\)/g, (_m, id) => `(${registry}.get('${id}') as HTMLElement)`);

	if (!hasImport(src, registry, regImport)) {
		src = src.replace(/^(import [^\n]*\r?\n)/m, `$1import { ${registry} } from '${regImport}';${eol}`);
	}
	if (!/\$\(/.test(strip(src))) {
		if (/^import \{ \$ \} from '@app\/utils\/dom';\r?\n/m.test(src)) {
			src = src.replace(/^import \{ \$ \} from '@app\/utils\/dom';\r?\n/m, '');
		} else if (/^import \{ \$([^}]*)\} from '@app\/utils\/dom';\r?\n/m.test(src)) {
			src = src.replace(/^import \{ \$([^}]*)\} from '@app\/utils\/dom';\r?\n/m, (_m, rest) => {
				const kept = rest.replace(/^\s*,\s*/, '').trim();
				return kept ? `import { ${kept} } from '@app/utils/dom';${eol}` : '';
			});
		}
	}
	if (APPLY && src !== before) writeFileSync(p, (hasBom ? '\uFEFF' : '') + src);
}
console.log(`模块侧 ${total} 处 / ${modulePaths.length} 文件；用到 ${idsUsed.size} 个 id`);

let fresh = 0;
let namedCount = 0;
const unresolved = [];
for (const sfcPath of sfcPaths) {
	let sfc = readFileSync(sfcPath, 'utf8');
	const eol = eolOf(sfc);
	const namedHere = [];
	let freshHere = 0;
	for (const id of idsUsed) {
		const tag = new RegExp(`<[^>]*\\sid="${id}"[^>]*>`, 's').exec(sfc)?.[0];
		if (!tag) continue;
		if (tag.includes(`registryRef(${registry}, '${id}')`) || tag.includes(`registerElement(${registry}, '${id}'`)) continue;
		const refName = /\sref="([\w$]+)"/.exec(tag)?.[1];
		if (refName) {
			namedHere.push({ id, refName });
			continue;
		}
		if (tag.includes(':ref')) {
			unresolved.push(`${id} @ ${sfcPath.split('/').pop()}`);
			continue;
		}
		sfc = sfc.replace(new RegExp(`(\\sid="${id}")`), `$1\n\t\t\t\t:ref="registryRef(${registry}, '${id}')"`);
		freshHere++;
		fresh++;
	}
	if (namedHere.length > 0) {
		const lines = namedHere.map(({ id, refName }) => `\tregisterElement(${registry}, '${id}', ${refName}.value);`).join(eol);
		if (/onMounted\(\(\) => \{\r?\n/.test(sfc)) sfc = sfc.replace(/onMounted\(\(\) => \{\r?\n/, (m) => `${m}${lines}${eol}`);
		else console.error(`  !! ${sfcPath} 无 onMounted，具名 ref 需人工`);
		namedCount += namedHere.length;
	}
	const helpers = [];
	if (new RegExp(`registryRef\\(${registry}`).test(sfc) && !/import \{[^}]*\bregistryRef\b[^}]*\} from '@app\/utils\/element-registry'/.test(sfc)) helpers.push('registryRef');
	if (new RegExp(`registerElement\\(${registry}`).test(sfc) && !/import \{[^}]*\bregisterElement\b[^}]*\} from '@app\/utils\/element-registry'/.test(sfc)) helpers.push('registerElement');
	if (helpers.length > 0) {
		if (/import \{[^}]*\} from '@app\/utils\/element-registry';/.test(sfc)) {
			sfc = sfc.replace(/import \{([^}]*)\} from '@app\/utils\/element-registry';/, (_m, inner) => {
				const set = new Set(inner.split(',').map((s) => s.trim()).filter(Boolean).concat(helpers));
				return `import { ${[...set].join(', ')} } from '@app/utils/element-registry';`;
			});
		} else {
			sfc = sfc.replace(/^(import [^\n]*\r?\n)/m, `$1import { ${helpers.join(', ')} } from '@app/utils/element-registry';${eol}`);
		}
	}
	if (!hasImport(sfc, registry, regImport)) {
		sfc = sfc.replace(/^(import [^\n]*\r?\n)/m, `$1import { ${registry} } from '${regImport}';${eol}`);
	}
	if (APPLY) writeFileSync(sfcPath, sfc);
	console.log(`  ${sfcPath.split('/').pop()}: +${freshHere} :ref, ${namedHere.length} 具名`);
}
if (unresolved.length) console.log(`  需人工（:ref 已占用）: ${unresolved.join(', ')}`);
