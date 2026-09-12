/**
 * 元素注册表「渲染方登记」注解器（P5b 后续批次：把 `document.getElementById('id')` 一类查找
 * 改为读分组注册表时，渲染 SFC 需要把元素登记进来）。
 *
 * 与 `element-registry-migrate.mjs` 的分工：
 *   - `element-registry-migrate.mjs`：模块侧 `$('#id')` → `<registry>.get('id')`（含 SFC 注解）；
 *   - 本工具：**模块侧已经改完**（例如手工把 `document.getElementById('x')` 换成
 *     `<registry>.get('x')`）之后，只补 SFC 侧的登记——也用于「工具认不出的写法」的补登记。
 *
 * 判据约定（沿用 `element-registry-migrate.mjs` 踩坑后固化的规则）：
 *   - 一律用「检查 import 语句」判断符号是否已导入，**不要**用「标识符是否出现」
 *     （模板里的 `registryRef(reg, …)` 会让后者误判为已导入 → TS2339/TS2304）；
 *   - **不做** import 合并/去重（历史上曾把 23 个文件的 import 写坏）；
 *   - 标签已有具名 `ref="x"` 时，改为在 `onMounted` 里 `registerElement(reg, 'id', x.value)`
 *     （`:ref` 槽位被占用时硬塞第二个 `:ref` 只会让后写的覆盖前一个）；
 *   - 标签已有**其它** `:ref` 且无具名 ref 时**跳过并报 unresolved**——静默跳过会变成
 *     "模块读注册表 → 取不到 → 静默 no-op"，必须人工处理。
 *
 * 用法：
 *   node scripts/element-ref-annotate.mjs --registry=composableEls \
 *     --registry-file=packages/editor/src/composables/element-registry.ts \
 *     --ids=a,b,c --sfcs=packages/editor/src/components/tools/VariableGetter.vue [--apply]
 *   省略 --apply 为干跑（只打印将做的改动）。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const eolOf = (s) => (s.includes('\r\n') ? '\r\n' : '\n');

const registry = opt('registry');
const registryFile = opt('registry-file');
const ids = (opt('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const sfcPaths = (opt('sfcs') ?? '').split(',').map((s) => s.trim()).filter(Boolean);

if (!registry || !registryFile || ids.length === 0 || sfcPaths.length === 0) {
	console.error('缺少参数：--registry --registry-file --ids --sfcs');
	process.exit(1);
}
const regImport = registryFile.replace('packages/editor/src/', '@app/').replace(/\.ts$/, '');

const hasImport = (src, symbol, mod) =>
	new RegExp(
		`import \\{[^}]*\\b${symbol}\\b[^}]*\\} from '${mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}';`
	).test(src);

let fresh = 0;
let namedCount = 0;
const unresolved = [];
const missed = [];

for (const rel of sfcPaths) {
	const path = join(ROOT, rel);
	let sfc = readFileSync(path, 'utf8');
	const eol = eolOf(sfc);
	const namedHere = [];
	let freshHere = 0;

	for (const id of ids) {
		const tag = new RegExp(`<[^>]*\\sid="${id}"[^>]*>`, 's').exec(sfc)?.[0];
		if (!tag) {
			missed.push(`${id} @ ${rel}`);
			continue;
		}
		if (
			tag.includes(`registryRef(${registry}, '${id}')`) ||
			tag.includes(`registerElement(${registry}, '${id}'`)
		) {
			continue;
		}
		const refName = /\sref="([\w$]+)"/.exec(tag)?.[1];
		if (refName) {
			namedHere.push({ id, refName });
			continue;
		}
		if (tag.includes(':ref')) {
			unresolved.push(`${id} @ ${rel.split('/').pop()}`);
			continue;
		}
		sfc = sfc.replace(
			new RegExp(`(\\sid="${id}")`),
			`$1\n\t\t\t\t:ref="registryRef(${registry}, '${id}')"`
		);
		freshHere++;
		fresh++;
	}

	if (namedHere.length > 0) {
		const lines = namedHere
			.map(({ id, refName }) => `\tregisterElement(${registry}, '${id}', ${refName}.value);`)
			.join(eol);
		if (/onMounted\(\(\) => \{\r?\n/.test(sfc)) {
			sfc = sfc.replace(/onMounted\(\(\) => \{\r?\n/, (m) => `${m}${lines}${eol}`);
		} else {
			console.error(`  !! ${rel} 无 onMounted，具名 ref 需人工`);
		}
		namedCount += namedHere.length;
	}

	const helpers = [];
	if (
		new RegExp(`registryRef\\(${registry}`).test(sfc) &&
		!/import \{[^}]*\bregistryRef\b[^}]*\} from '@app\/utils\/element-registry'/.test(sfc)
	) {
		helpers.push('registryRef');
	}
	if (
		new RegExp(`registerElement\\(${registry}`).test(sfc) &&
		!/import \{[^}]*\bregisterElement\b[^}]*\} from '@app\/utils\/element-registry'/.test(sfc)
	) {
		helpers.push('registerElement');
	}
	if (helpers.length > 0) {
		if (/import \{[^}]*\} from '@app\/utils\/element-registry';/.test(sfc)) {
			sfc = sfc.replace(
				/import \{([^}]*)\} from '@app\/utils\/element-registry';/,
				(_m, inner) => {
					const set = new Set(
						inner
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean)
							.concat(helpers)
					);
					return `import { ${[...set].join(', ')} } from '@app/utils/element-registry';`;
				}
			);
		} else {
			sfc = sfc.replace(
				/^(import [^\n]*\r?\n)/m,
				`$1import { ${helpers.join(', ')} } from '@app/utils/element-registry';${eol}`
			);
		}
	}
	if (!hasImport(sfc, registry, regImport)) {
		sfc = sfc.replace(/^(import [^\n]*\r?\n)/m, `$1import { ${registry} } from '${regImport}';${eol}`);
	}

	if (APPLY) writeFileSync(path, sfc);
	console.log(`  ${rel.split('/').pop()}: +${freshHere} :ref, ${namedHere.length} 具名`);
}

console.log(`合计：新增 ${fresh} 个 :ref、${namedCount} 个具名 ref 命令式登记`);
if (unresolved.length > 0) console.log(`需人工（:ref 已占用）: ${unresolved.join(', ')}`);
if (missed.length > 0) console.log(`未在模板中找到（请核对 id）: ${missed.join(', ')}`);
