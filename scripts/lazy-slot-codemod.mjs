/**
 * 单例模块对象字面量的「延迟槽占位」清理（附录十二 · 技法 5）
 *
 * 迁移前：
 *   export const Sprite: SpriteModule = {
 *     state: 'closed',
 *     body: null as unknown as YamiElement,   // ← 每一槽都在说谎：声明成 YamiElement，实际是 null
 *     ...
 *   };
 *
 * 迁移后：
 *   export const Sprite = {
 *     state: 'closed',
 *     ...
 *   } satisfies Partial<SpriteModule> as SpriteModule;
 *
 * 与既有手法一致：`attribute-window.ts` / `variable.ts` / `plugin.ts` 已经是
 * 「字面量按 Omit<…> 受检 + 导出时断言成完整形状」，本技法把同一思路推广到槽位：
 * 用 `satisfies Partial<T>` 取代 `Omit<T, 一长串键>`——检查强度相同，但不必枚举键。
 *
 * 为什么不是「把字段类型放宽成 T | null」：
 *   这些槽（DOM 元素、方法、canvas 上下文）在 initialize() 之前没有合法值。
 *   放宽类型会把同一处谎言扩散到**每一个读取点**（都要补 `!`），而不是消除它。
 *   `satisfies Partial<T>` 反而让「真实值部分」保持逐字段受检：字段名拼错报 TS2561、
 *   类型写错报 TS2322、内联方法参数仍按上下文推断；槽位则由 initialize() 里的
 *   真实赋值补齐，那些赋值同样逐字段受检。
 *
 * 安全约束：
 *   1. 只删除**顶层**（深度 0）属性；嵌套层级里的占位保持原样（`Partial` 是浅层的，
 *      删掉嵌套项会让字面量对不上内层类型）。
 *   2. 只删除右值恰为 `null as unknown as …` 的行。真正的 `null` 初值（如 `symbol: null`）
 *      与 `null as T | null` 一律保留。
 *   3. 类型标注必须与 `= {` 在同一行；跨行标注（多行 Omit 等）跳过，交人工。
 *   4. .vue 文件跳过（脚本段里的对象字面量另有语义，交人工）。
 *
 * 运行期影响：被删的键由「值为 null」变为「不存在」（读取得 undefined）。
 *   全仓已核对：不存在 `X.slot === null` 形式的比较；唯一的展开处
 *   （local-window.ts 的 `{...Localization, idMap}`）只做真值判断，null/undefined 等价。
 *
 * 用法：node scripts/lazy-slot-codemod.mjs [--apply] [--file=<rel>]
 *   （或 pnpm migration:lazy-slots）
 *   默认 dry-run，只打印将删除的行；加 --apply 才写盘。
 *   对已迁移过的文件幂等：声明形态不再匹配，报 0。
 */
import { writeFileSync } from 'node:fs';
import { collectFiles, readSource, codeOnly, SCAN_DIRS } from './lib/scan.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const only = args.find((a) => a.startsWith('--file='))?.slice(7);

const DECL_RE = /^([ \t]*)(export\s+)?const\s+([A-Za-z_$][\w$]*)\s*:\s*[^;{]+\s*=\s*\{\s*$/;
const CAST_RE = /null as unknown as/;
/** 顶层、整行就是一个占位属性（末尾逗号可有可无，稍后单独判定）
 *  注意 `[ \t\r]*$`：本仓部分是 CRLF 文件，`split('\n')` 会在行尾留下 `\r`，
 *  写成 `[ \t]*$` 会把它们全部误判成「非单行属性」。 */
const PLACEHOLDER_LINE_RE = /^[ \t]*[A-Za-z_$][\w$]*\s*:\s*null as unknown as [^\n]*?,[ \t\r]*$/;
const PLACEHOLDER_LINE_NOCOMMA_RE =
	/^[ \t]*[A-Za-z_$][\w$]*\s*:\s*null as unknown as [^\n]*?[^,{ \t][ \t\r]*$/;

/** 返回给定偏移所在行的行号（0 基） */
function lineOf(src, index) {
	let n = 0;
	for (let i = 0; i < index; i++) if (src[i] === '\n') n++;
	return n;
}

const results = [];
const skippedFiles = [];

const ALL = collectFiles({ dirs: SCAN_DIRS });

for (const { full, rel } of ALL) {
	if (only && rel !== only) continue;
	const src = readSource(full);
	if (!CAST_RE.test(src)) continue;
	if (rel.endsWith('.vue')) {
		skippedFiles.push({
			rel,
			why: '.vue（脚本段字面量另有语义）',
			n: (src.match(/null as unknown as/g) ?? []).length
		});
		continue;
	}
	const code = codeOnly(src);
	const lines = src.split('\n');
	const codeLines = code.split('\n');

	for (let li = 0; li < lines.length; li++) {
		if (!DECL_RE.test(codeLines[li])) continue;
		// 类型标注必须与 `= {` 同行，且要从未被置空的原始行里取
		const rawLine = lines[li];
		if (!/=\s*\{\s*$/.test(rawLine)) continue;
		const m = DECL_RE.exec(codeLines[li]);
		const name = m[3];
		const constIdx = rawLine.indexOf(`const ${name}`);
		const colonIdx = rawLine.indexOf(':', constIdx + 5 + name.length);
		const eqIdx = rawLine.lastIndexOf('=');
		if (colonIdx < 0 || eqIdx < colonIdx) continue;
		const ann = rawLine.slice(colonIdx + 1, eqIdx).trim();
		if (!ann || /[;{}]/.test(ann)) continue;

		// 括号配平找字面量闭合位置
		const lineStart = lines.slice(0, li).reduce((s, l) => s + l.length + 1, 0);
		const eqOff = lineStart + eqIdx;
		const openIdx = code.indexOf('{', eqOff);
		if (openIdx < 0) continue;
		let depth = 0;
		let closeIdx = -1;
		for (let k = openIdx; k < code.length; k++) {
			if (code[k] === '{') depth++;
			else if (code[k] === '}') {
				depth--;
				if (depth === 0) {
					closeIdx = k;
					break;
				}
			}
		}
		if (closeIdx < 0) continue;

		// 逐行扫描字面量内部，收集顶层占位
		const deleteLines = [];
		const handWork = [];
		let idx = code.indexOf('\n', openIdx) + 1;
		while (idx > 0 && idx < closeIdx) {
			const nl = src.indexOf('\n', idx);
			const lineEnd = nl === -1 || nl > closeIdx ? closeIdx : nl;
			const lineNo = lineOf(src, idx);
			const raw = src.slice(idx, lineEnd);
			let d = 0;
			for (const c of code.slice(openIdx + 1, idx)) {
				if (c === '{') d++;
				else if (c === '}') d--;
			}
			if (CAST_RE.test(raw)) {
				const isTop = d === 0;
				const simple = PLACEHOLDER_LINE_RE.test(raw);
				// 无逗号的末位属性：仅当其后紧跟字面量闭合括号时才算
				let noCommaOk = false;
				if (!simple && PLACEHOLDER_LINE_NOCOMMA_RE.test(raw)) {
					const rest = src.slice(lineEnd + 1, closeIdx);
					noCommaOk = /^\s*$/.test(rest);
				}
				if (isTop && (simple || noCommaOk)) deleteLines.push(lineNo);
				else
					handWork.push({
						line: lineNo + 1,
						text: raw.trim().slice(0, 96),
						why: isTop ? '非单行属性' : '嵌套层级'
					});
			}
			if (nl === -1) break;
			idx = nl + 1;
		}

		if (deleteLines.length === 0) continue;
		results.push({
			rel,
			full,
			name,
			ann,
			exported: Boolean(m[2]),
			declLine: li + 1,
			deleteLines,
			handWork,
			lines
		});
	}
}

// ---------------------------------------------------------------------------
// 技法 5e：类型标注是**跨行内联类型字面量**
//
//   export const Command: {                       interface CommandShape {
//     target: typeof commandState.target;   →       target: typeof commandState.target;
//     initialize: CommandMethod;                    initialize: CommandMethod;
//   } = {                                         }
//     initialize: null as unknown as …   ←删
//   };                                            export const Command = {
//                                                 } satisfies Partial<CommandShape> as CommandShape;
//
// 这一类之所以 5a 处理不了，是因为类型与 `= {` 不在同一行 ⇒ 5a 的
// 「annotation 必须单行」前置条件不成立。做法是把匿名类型提成具名 interface，
// 其余与 5a 完全相同。若 `NAMEShape` 已被占用则跳过（交人工）。
// ---------------------------------------------------------------------------
const INLINE_TYPE_DECL_RE = /^([ \t]*)(export\s+)?const\s+([A-Za-z_$][\w$]*)\s*:\s*\{\s*$/;

/** 从 `openIdx` 处的 `{` 出发做括号配平，返回配对 `}` 的下标（找不到返回 -1） */
function braceMatch(code, openIdx) {
	let depth = 0;
	for (let k = openIdx; k < code.length; k++) {
		if (code[k] === '{') depth++;
		else if (code[k] === '}') {
			depth--;
			if (depth === 0) return k;
		}
	}
	return -1;
}

const results5e = [];

for (const { full, rel } of ALL) {
	if (only && rel !== only) continue;
	const src = readSource(full);
	if (!CAST_RE.test(src)) continue;
	if (rel.endsWith('.vue')) continue;
	const code = codeOnly(src);
	const lines = src.split('\n');
	const codeLines = code.split('\n');

	for (let li = 0; li < lines.length; li++) {
		const m = INLINE_TYPE_DECL_RE.exec(codeLines[li]);
		if (!m) continue;
		const name = m[3];
		// 具名 interface 可能撞名 ⇒ 交人工
		if (new RegExp(`\\b(?:interface|type)\\s+${name}Shape\\b`).test(code)) {
			skippedFiles.push({ rel, why: `${name}Shape 名字已被占用`, n: 0 });
			continue;
		}
		const lineStart = lines.slice(0, li).reduce((s, l) => s + l.length + 1, 0);
		const tOpen = code.indexOf('{', lineStart);
		const tClose = braceMatch(code, tOpen);
		if (tClose < 0) continue;
		const mm = /^\s*=\s*\{/.exec(src.slice(tClose + 1));
		if (!mm) continue;
		const vOpen = tClose + 1 + mm[0].length - 1;
		const vClose = braceMatch(code, vOpen);
		if (vClose < 0) continue;

		const deleteLines = [];
		const handWork = [];
		let idx = code.indexOf('\n', vOpen) + 1;
		while (idx > 0 && idx < vClose) {
			const nl = src.indexOf('\n', idx);
			const lineEnd = nl === -1 || nl > vClose ? vClose : nl;
			const lineNo = lineOf(src, idx);
			const raw = src.slice(idx, lineEnd);
			let d = 0;
			for (const c of code.slice(vOpen + 1, idx)) {
				if (c === '{') d++;
				else if (c === '}') d--;
			}
			if (CAST_RE.test(raw)) {
				const simple = PLACEHOLDER_LINE_RE.test(raw);
				let noCommaOk = false;
				if (!simple && PLACEHOLDER_LINE_NOCOMMA_RE.test(raw)) {
					noCommaOk = /^\s*$/.test(src.slice(lineEnd + 1, vClose));
				}
				if (d === 0 && (simple || noCommaOk)) deleteLines.push(lineNo);
				else
					handWork.push({
						line: lineNo + 1,
						text: raw.trim().slice(0, 96),
						why: d === 0 ? '非单行属性' : '嵌套层级'
					});
			}
			if (nl === -1) break;
			idx = nl + 1;
		}
		if (deleteLines.length === 0) continue;
		results5e.push({ rel, full, name, declLine: li + 1, deleteLines, handWork, lines });
	}
}

let total = 0;
let totalHand = 0;
console.log('');
console.log('技法 5 dry-run：单例模块延迟槽占位清理');
console.log('-------------------------------------------------------------------------');
for (const r of results.sort((a, b) => b.deleteLines.length - a.deleteLines.length)) {
	total += r.deleteLines.length;
	totalHand += r.handWork.length;
	console.log(
		`  ${String(r.deleteLines.length).padStart(3)}  ${r.rel}  [L${r.declLine} ${r.exported ? 'export ' : ''}${r.name}: ${r.ann}]` +
			(r.handWork.length ? `  ⚠ 人工 ${r.handWork.length}` : '')
	);
	for (const h of r.handWork) console.log(`         L${h.line} [${h.why}] ${h.text}`);
}
console.log('');
console.log('技法 5e dry-run：类型标注为跨行内联类型字面量');
console.log('-------------------------------------------------------------------------');
for (const r of results5e.sort((a, b) => b.deleteLines.length - a.deleteLines.length)) {
	total += r.deleteLines.length;
	totalHand += r.handWork.length;
	console.log(
		`  ${String(r.deleteLines.length).padStart(3)}  ${r.rel}  [L${r.declLine} ${r.name} → interface ${r.name}Shape]` +
			(r.handWork.length ? `  ⚠ 人工 ${r.handWork.length}` : '')
	);
	for (const h of r.handWork) console.log(`         L${h.line} [${h.why}] ${h.text}`);
}
console.log('-------------------------------------------------------------------------');
console.log(`可自动清理：${results.length} 个字面量，${total} 处顶层占位`);
console.log(`需人工：${totalHand + skippedFiles.reduce((s, f) => s + f.n, 0)} 处`);
for (const s of skippedFiles) console.log(`  (跳过整个文件) ${s.rel}  ${s.why}  含 ${s.n} 处`);

if (apply) {
	console.log('');
	console.log('--- 应用 ---');
	for (const r of results) {
		const keep = r.lines.filter((_, i) => !r.deleteLines.includes(i));
		let out = keep.join('\n');
		const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// 1) 声明行去掉类型标注（保留是否 export）
		out = out.replace(
			new RegExp(
				`^([ \\t]*)(export\\s+)?const\\s+${esc(r.name)}\\s*:\\s*${esc(r.ann)}\\s*=\\s*\\{$`,
				'm'
			),
			(_s, ind, e2) => `${ind}${e2 ?? ''}const ${r.name} = {`
		);
		// 2) 在字面量闭合括号后补 ` satisfies Partial<…> as …`
		const outCode = codeOnly(out);
		const outLines = out.split('\n');
		const dli = outLines.findIndex((l) =>
			new RegExp(`const\\s+${esc(r.name)}\\s*=\\s*\\{\\s*$`).test(l)
		);
		if (dli < 0) throw new Error(`应用失败（找不到声明行）: ${r.rel}`);
		const start = outLines.slice(0, dli).reduce((s, l) => s + l.length + 1, 0);
		const o2 = outCode.indexOf('{', start);
		let dep = 0;
		let c2 = -1;
		for (let k = o2; k < outCode.length; k++) {
			if (outCode[k] === '{') dep++;
			else if (outCode[k] === '}') {
				dep--;
				if (dep === 0) {
					c2 = k;
					break;
				}
			}
		}
		if (c2 < 0) throw new Error(`应用失败（找不到闭合括号）: ${r.rel}`);
		out = `${out.slice(0, c2 + 1)} satisfies Partial<${r.ann}> as ${r.ann}${out.slice(c2 + 1)}`;
		writeFileSync(r.full, out, 'utf8');
		console.log(`  ✅ ${r.rel}  -${r.deleteLines.length}`);
	}
	console.log(`共改写 ${results.length} 个文件`);

	for (const r of results5e) {
		const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const keep = r.lines.filter((_, i) => !r.deleteLines.includes(i));
		let out = keep.join('\n');
		// 1) 声明行：`export const NAME: {` → `interface NAMEShape {`（去掉 export，接口只在本文件用）
		out = out.replace(
			new RegExp(`^([ \\t]*)(export\\s+)?const\\s+${esc(r.name)}\\s*:\\s*\\{$`, 'm'),
			(_s, ind) => `${ind}interface ${r.name}Shape {`
		);
		// 2) 类型闭合 `}` 与字面量 `{` 之间插入新的导出声明
		const code1 = codeOnly(out);
		const iType = out.search(
			new RegExp(`^[ \\t]*interface\\s+${esc(r.name)}Shape\\s*\\{`, 'm')
		);
		if (iType < 0) throw new Error(`5e 应用失败（找不到接口头）: ${r.rel}`);
		const tClose = braceMatch(code1, code1.indexOf('{', iType));
		if (tClose < 0) throw new Error(`5e 应用失败（接口未闭合）: ${r.rel}`);
		const tail = out.slice(tClose + 1);
		const mm = /^\s*=\s*\{/.exec(tail);
		if (!mm) throw new Error(`5e 应用失败（接口后不是 = {）: ${r.rel}`);
		out = `${out.slice(0, tClose)}}\n\nexport const ${r.name} = {${tail.slice(mm[0].length)}`;
		// 3) 在字面量闭合括号后补 ` satisfies Partial<…> as …`
		const code2 = codeOnly(out);
		const iDecl = out.search(
			new RegExp(`^[ \\t]*export\\s+const\\s+${esc(r.name)}\\s*=\\s*\\{`, 'm')
		);
		if (iDecl < 0) throw new Error(`5e 应用失败（找不到导出声明）: ${r.rel}`);
		const vClose = braceMatch(code2, code2.indexOf('{', iDecl));
		if (vClose < 0) throw new Error(`5e 应用失败（字面量未闭合）: ${r.rel}`);
		out = `${out.slice(0, vClose + 1)} satisfies Partial<${r.name}Shape> as ${r.name}Shape${out.slice(vClose + 1)}`;
		writeFileSync(r.full, out, 'utf8');
		console.log(`  ✅ ${r.rel}  -${r.deleteLines.length}  (5e: interface ${r.name}Shape)`);
	}
	console.log(`共改写 ${results.length + results5e.length} 个文件`);
} else {
	console.log('');
	console.log('（只读模式。加 --apply 执行；--file=<rel> 限定单文件）');
}
