/**
 * `any-hatches` 站点清单 —— 把「每个站点属于谁」这一步机械化，并按**种类**分开。
 *
 * ## 为什么需要它
 *
 * 第 54 轮踩过的坑：用 `grep '^interface '` 自己建「接口 → 行号」映射会漏掉 `export interface`，
 * 映射整体错位，删掉的签名其实是**另一个接口**的（语法合法、语义全错）。所以这里按**站点行
 * 往上找最近的声明**来归属，并显式标出是不是 `export` 的。
 *
 * ## ⚠️ 第 130 轮的更正：这个轴里其实有**两种**站点，归属方式不同
 *
 * `ANY_HATCH_RE` 匹配两种写法：
 *
 * 1. **索引签名**（`INDEX_SIG`）：`interface X { [k: string]: any }` —— 归给**它所在的那个接口**；
 * 2. **`Record<string, any>` 注解**（`RECORD_ANNOT`）：`export const AutoTile: Record<string, any> = { … }`
 *    —— 这种站点**不在任何接口里**，它是某个**常量自己的类型注解**。旧版一律按「往上找最近的
 *    interface」归属，于是 `auto-tile.ts:49` 的站点被归给了它**上面**的 `AutoTileOpenParams`
 *    （一个毫不相干的类型）—— 我按那张表去删签名，删的是错的声明，tsc 直接语法报错。
 *
 * 所以现在按站点**自身的文本**分类，常量站点归给它**自己那个名字**。
 *
 * ## 用法
 *
 *   node scripts/any-hatch-inventory.mjs            # 全部站点（含种类与站点原文）
 *   node scripts/any-hatch-inventory.mjs --axis     # 只看汇总（按文件聚合）
 *   node scripts/any-hatch-inventory.mjs --kinds    # 只看两种站点各多少、常量各是谁
 *
 * 口径与台账一致：`scripts/lib/scan.mjs` 的 collectFiles / readSource / codeOnly / ANY_HATCH_RE。
 */
import { SCAN_DIRS, collectFiles, readSource, codeOnly, ANY_HATCH_RE } from './lib/scan.mjs';

/** `[k: string]: any` / `[key: string]: any` —— 接口里的索引签名。 */
const INDEX_SIG_RE = /^\s*\[(?:k|key):\s*string\]:\s*any\b/;
/** 同一行里声明并注解的常量（`export const AutoTile: Record<string, any> = {`）。 */
const CONST_DECL_RE = /(?:^|\s)(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/;

const files = collectFiles({ dirs: SCAN_DIRS });
const rows = [];
for (const { full, rel } of files) {
	const text = readSource(full);
	const code = codeOnly(text);
	ANY_HATCH_RE.lastIndex = 0;
	const lines = text.split('\n');
	for (const m of code.matchAll(ANY_HATCH_RE)) {
		const lineNo = text.slice(0, m.index).split('\n').length; // 1-based
		const siteText = lines[lineNo - 1].trim();

		// 最近的上层声明（接口/类型/常量）—— 只在需要兜底时才用
		let enclosing = '(顶层)';
		let enclosingLine = 0;
		let enclosingExported = false;
		for (let i = lineNo - 1; i >= 0; i--) {
			const decl = lines[i].match(/^\s*(export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)/);
			if (decl) {
				enclosing = decl[2];
				enclosingLine = i + 1;
				enclosingExported = Boolean(decl[1]);
				break;
			}
		}

		const kind = INDEX_SIG_RE.test(lines[lineNo - 1]) ? 'INDEX_SIG' : 'RECORD_ANNOT';
		const ownConst = CONST_DECL_RE.exec(lines[lineNo - 1]);
		rows.push({
			rel: rel.replace(/\\/g, '/'),
			line: lineNo,
			kind,
			// 常量站点归给它自己；索引签名归给所在接口
			owner: kind === 'RECORD_ANNOT' && ownConst ? ownConst[1] : enclosing,
			ownerLine: kind === 'RECORD_ANNOT' && ownConst ? lineNo : enclosingLine,
			exported:
				kind === 'RECORD_ANNOT' && ownConst
					? /^\s*export\b/.test(lines[lineNo - 1])
					: enclosingExported,
			text: siteText
		});
	}
}

if (process.argv.includes('--axis')) {
	const byFile = new Map();
	for (const r of rows) byFile.set(r.rel, (byFile.get(r.rel) ?? 0) + 1);
	console.log(`any-hatches 站点：${rows.length} 处 / ${byFile.size} 文件\n`);
	for (const [rel, n] of [...byFile].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
		console.log(`${String(n).padStart(3)}  ${rel}`);
} else if (process.argv.includes('--kinds')) {
	const byKind = new Map();
	for (const r of rows) byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1);
	console.log(`any-hatches 站点：${rows.length} 处\n`);
	for (const [kind, n] of byKind) console.log(`  ${kind}: ${n} 处`);
	console.log('\nRECORD_ANNOT 的宿主常量（这些**不是**接口里的签名，改法与索引签名不同）：');
	const byOwner = new Map();
	for (const r of rows.filter((x) => x.kind === 'RECORD_ANNOT')) {
		const key = `${r.owner}  ${r.rel}:${r.line}`;
		byOwner.set(key, (byOwner.get(key) ?? 0) + 1);
	}
	for (const [key, n] of [...byOwner].sort((a, b) => a[0].localeCompare(b[0]))) {
		console.log(`  ${key}${n > 1 ? `  （${n} 处）` : ''}`);
	}
	console.log('\nINDEX_SIG 的宿主接口（每个接口一处签名）：');
	const byIface = new Map();
	for (const r of rows.filter((x) => x.kind === 'INDEX_SIG')) {
		const key = `${r.owner}${r.exported ? '' : ' (未 export)'}  ${r.rel}:${r.ownerLine}`;
		byIface.set(key, (byIface.get(key) ?? 0) + 1);
	}
	for (const [key, n] of [...byIface].sort((a, b) => a[0].localeCompare(b[0]))) {
		console.log(`  ${key}${n > 1 ? `  （${n} 处签名）` : ''}`);
	}
} else {
	console.log(`any-hatches 站点：${rows.length} 处（口径：scripts/lib/scan.mjs）\n`);
	for (const r of rows) {
		console.log(`${r.rel}:${r.line}  [${r.kind}]`);
		console.log(`    归属 ${r.owner}${r.exported ? ' (export)' : ''}  @L${r.ownerLine}`);
		console.log(`    原文 ${r.text}`);
	}
}
console.log(
	'\n提示：**先看种类再动手** ——\n' +
		'  INDEX_SIG（接口里的 `[k: string]: any`）：删那一行即可，代价=依赖该索引签名的访问点；\n' +
		'  RECORD_ANNOT（常量自己的注解）：删的是**该常量的类型注解**（不是接口成员），\n' +
		'    删掉后 tsc 会按对象字面量推断出精确类型，代价=所有依赖「随便取成员」的访问点。\n' +
		'  两种情况都**必须单独摘、单独跑 tsc** 验证（第 130 轮实测：一次性全摘会级联，量不准）。'
);
