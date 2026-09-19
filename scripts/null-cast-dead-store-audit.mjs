/**
 * null-cast 死写审计（`null as unknown as` 轴的降本工具，只读）
 *
 *     node scripts/null-cast-dead-store-audit.mjs            # 汇总
 *     node scripts/null-cast-dead-store-audit.mjs --list     # 逐条列出候选
 *     node scripts/null-cast-dead-store-audit.mjs --file=<相对路径>
 *
 * ## 为什么需要它
 *
 * `null-casts` 轴有近 700 处 `null as unknown as T`，它们是**遗留单例的占位写**：
 * 字段先被写成 `null` 以满足"非空"的类型，等真正初始化时再赋真值。
 * 这类断言本身不是 bug，但其中混着一批**纯死写** —— 写完几行后立刻被真值覆盖，
 * 中间没有任何读取。死写可以直接删：语义等价，而 `null-casts` 与 `unknown-casts`
 * 两条轴同时下降（`null as unknown as` 同时命中两者的正则）。
 *
 * 实测样例（`plugin/plugin-initialize.ts`）：7 个成员先写 null、再在同一个函数里
 * 全部赋真值 ⇒ 删掉 7 行，两轴各 −7。
 *
 * ## 判据（保守，宁可漏报不可误报）
 *
 * 一个赋值 `A.B = null as unknown as T` 被判为死写，必须同时满足：
 *   1. 之后存在 `A.B = <非 null 占位>` 的**再赋值**；
 *   2. 在"占位写"与"再赋值"之间，`A.B` **没有被读取**过
 *      （任何不后跟 `=` 的出现都算读取）；
 *   3. 两者之间**没有函数/箭头函数的边界**（`function` 或 `=>`）。
 *
 * 条件 3 是实测踩坑后加的：只看位置会把**跨函数的延迟赋值**误判成死写。典型误报：
 *
 * ```ts
 * let animationWindow = null as unknown as typeof Animation;   // ← 不是死写
 * export function bindAnimationWindow(instance) { animationWindow = instance; }
 * ```
 *
 * 以及类字段在异步 `create()` 里赋值的形态（`module/editdata.ts` 的 `editor` / `model`）。
 * 这两类都是"声明时占位、真正初始化在别处"，`null` 是可观测的初始值。
 *
 * ## 仍然存在的局限（必须人工过一眼）
 *
 * 工具只看**直接赋值**，看不见**间接写入**：例如
 * `bindListClipboardMethods({ list })` 这种"把容器传进去让别人赋值"的形态，
 * 以及被调函数内部是否**读取**过这些成员。因此：
 *   · 只有「连续若干行占位写 → 紧接着连续若干行真值赋值」这种**直线型**块才够硬；
 *   · 中间夹着函数调用的（如 `enum-window.ts`）一律**不报**，留给人工判断。
 */
import { collectFiles, readSource, codeOnly, SCAN_DIRS, NULL_CAST_RE } from './lib/scan.mjs';

const args = process.argv.slice(2);
const listAll = args.includes('--list');
const slotsAll = args.includes('--slots');
const fileFilter = args.find((a) => a.startsWith('--file='))?.slice('--file='.length);

/** 行内位置 → 行号（1 基） */
const lineOf = (src, index) => src.slice(0, index).split('\n').length;

/** 逐字符的大括号深度表（`codeOnly` 已去掉注释与字符串，因此计数可靠） */
const depthTable = (src) => {
	const table = new Int32Array(src.length + 1);
	let d = 0;
	for (let i = 0; i < src.length; i++) {
		table[i] = d;
		const c = src[i];
		if (c === '{') d += 1;
		else if (c === '}') d -= 1;
	}
	table[src.length] = d;
	return table;
};

// LHS 允许裸名（类字段 / 解构后再赋）与点号路径（`this.x` / `Obj.x`）
const ASSIGN_RE =
	/((?:this|[A-Za-z_$][\w$]*)(?:\.[A-Za-z_$][\w$]*)*)\s*=\s*null\s+as\s+unknown\s+as\b/g;
// 对象字面量槽位：`prop: null as unknown as T` —— 不是死写，需要改类型，单独计数
const SLOT_RE = /[A-Za-z_$][\w$]*\s*:\s*null\s+as\s+unknown\s+as\b/g;

const files = collectFiles({ dirs: SCAN_DIRS }).filter(
	(f) => !fileFilter || f.rel.endsWith(fileFilter)
);

const candidates = [];
let placeholderTotal = 0;
let slotTotal = 0;
const slotByFile = new Map();

for (const { full, rel } of files) {
	const raw = readSource(full);
	if (!NULL_CAST_RE.test(raw)) continue;
	NULL_CAST_RE.lastIndex = 0;
	const code = codeOnly(raw);
	const depths = depthTable(code);
	const depthAt = (index) => depths[index];

	const slots = (code.match(SLOT_RE) ?? []).length;
	slotTotal += slots;
	if (slots > 0) slotByFile.set(rel, slots);

	// 逐条占位写
	const writes = [];
	ASSIGN_RE.lastIndex = 0;
	let m;
	while ((m = ASSIGN_RE.exec(code)) !== null) {
		writes.push({ path: m[1], index: m.index, line: lineOf(code, m.index) });
	}
	placeholderTotal += writes.length;

	for (const w of writes) {
		const escaped = w.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// 之后的所有出现：要么是再赋值（`=` 且非 `==`），要么是读取
		const afterRe = new RegExp(`${escaped}\\s*(={1,3})(?!=)`, 'g');
		afterRe.lastIndex = w.index + 1;
		let overwrite = null;
		let readBeforeOverwrite = null;
		let mm;
		while ((mm = afterRe.exec(code)) !== null) {
			const isAssign = mm[1] === '=';
			const rhs = code.slice(mm.index + mm[0].length, mm.index + mm[0].length + 40);
			const isNullPlaceholder = /^\s*null\s+as\s+unknown\s+as\b/.test(rhs);
			if (isAssign && !isNullPlaceholder) {
				overwrite = { line: lineOf(code, mm.index), index: mm.index };
				break;
			}
			if (!isAssign) {
				readBeforeOverwrite = { line: lineOf(code, mm.index) };
				break;
			}
		}
		if (overwrite && !readBeforeOverwrite) {
			// 条件 3：两者必须处于**同一个大括号深度**。
			// 跨深度 ⇒ 覆盖发生在别的函数/类体里，那是"延迟初始化"而非死写
			// （实例：`let animationWindow = null as …` + `bindAnimationWindow()`；
			//   `editdata.ts` 的类字段 `editor` / `model` 在异步 create() 里赋值）。
			if (depthAt(code, w.index) !== depthAt(code, overwrite.index)) continue;

			// 分类：中间各行**是否全部**是对同一 family 的赋值。
			// 全是 ⇒ 直线型，可安全删除；夹了函数调用（可能间接读写）⇒ 需人工确认。
			const family = w.path.split('.').slice(0, -1).join('.');
			const familyRe = new RegExp(`^${family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.`);
			const betweenLines = code.split('\n').slice(w.line, overwrite.line - 1);
			const straightLine = betweenLines.every((ln) => {
				const t = ln.trim();
				if (t === '' || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'))
					return true;
				return familyRe.test(t) && t.includes('=');
			});

			candidates.push({
				file: rel,
				line: w.line,
				path: w.path,
				overwrite: overwrite.line,
				straightLine
			});
		}
	}
}

const byFile = new Map();
const safe = candidates.filter((c) => c.straightLine);
const review = candidates.filter((c) => !c.straightLine);
for (const c of safe) byFile.set(c.file, (byFile.get(c.file) ?? 0) + 1);
const reviewByFile = new Map();
for (const c of review) reviewByFile.set(c.file, (reviewByFile.get(c.file) ?? 0) + 1);

console.log('');
console.log('null-cast 死写审计 —— 占位写后被真值覆盖、且中间无读取');
console.log('-----------------------------------------------------------------');
console.log(`扫描文件：${files.length}（${SCAN_DIRS.join(' + ')}）`);
console.log(`① 赋值形态 X.prop = null as unknown as T ：${placeholderTotal} 处`);
console.log(`   · **直线型死写（可直接删）**：${safe.length} 处，${byFile.size} 个文件`);
console.log(
	`   · 需人工确认（中间夹了函数调用，可能间接读写）：${review.length} 处，${reviewByFile.size} 个文件`
);
console.log(
	`② 对象字面量形态 prop: null as unknown as T ：${slotTotal} 处，分布在 ${slotByFile.size} 个文件`
);
console.log('   （② 不是死写，是"接口声明非空、初值只能写 null" ⇒ 要改类型才能去掉，另行处理）');
console.log('');
if (slotByFile.size > 0) {
	const sorted = [...slotByFile].sort((a, b) => (slotsAll ? a[1] - b[1] : b[1] - a[1]));
	console.log(slotsAll ? '② 全部文件（升序，便于从小到大推进）：' : '② 最多的文件：');
	for (const [file, n] of slotsAll ? sorted : sorted.slice(0, 8)) {
		console.log(`  ${String(n).padStart(3)}  ${file}`);
	}
	console.log('');
}
if (byFile.size > 0) {
	console.log('① 可删死写按文件：');
	for (const [file, n] of [...byFile].sort((a, b) => b[1] - a[1])) {
		console.log(`  ${String(n).padStart(3)}  ${file}`);
	}
	console.log('');
}
if (listAll && candidates.length > 0) {
	console.log('逐条候选（占位写行 → 覆盖行）：');
	for (const c of candidates.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
		console.log(`  ${c.file}:${c.line}  ${c.path}  → 被 ${c.overwrite} 行覆盖`);
	}
	console.log('');
}
console.log(
	candidates.length === 0
		? '✓ 没有发现死写（余下的占位写都有实际作用）。'
		: `提示：删除后请跑 tsc + migration:check；必要时用 --list 逐条核对。`
);
