/**
 * 只读统计：把全部 null-cast 按「所在语法位置」归类，找出可批量处理的最大簇。
 *
 * 分类信号：
 *   literal-prop  —— 行尾是逗号且形如 `name: null as unknown as T,`（对象字面量的属性初始化）
 *   stmt-assign   —— 形如 `x = null as unknown as T;`（语句赋值）
 *   decl-init     —— 形如 `const x = null as unknown as T;`
 *   other
 * 对 literal-prop 再往上找它所属的对象字面量起点，统计每个字面量的簇大小。
 *
 * 用法：node scripts/null-cast-shapes.mjs [--list]
 *   --list 逐条打印每个命中（file:line [形态] 代码），用于规划具体改法。
 */
import { collectFiles, readSource, codeOnly, SCAN_DIRS, NULL_CAST_RE } from './lib/scan.mjs';

const LIST = process.argv.slice(2).includes('--list');
const allSites = [];
const files = collectFiles({ dirs: SCAN_DIRS });
const kinds = {};
const clusters = new Map(); // "rel::startLine" -> {rel, decl, count}
let total = 0;

for (const { full, rel } of files) {
	const raw = readSource(full);
	if (!NULL_CAST_RE.test(raw)) continue;
	NULL_CAST_RE.lastIndex = 0;
	const code = codeOnly(raw);
	const lines = code.split(/\r?\n/);

	// 行号 -> 该行第一个 null-cast 的索引（用于判定行形态）
	const castLines = [];
	lines.forEach((l, i) => {
		NULL_CAST_RE.lastIndex = 0;
		if (NULL_CAST_RE.test(l)) castLines.push(i);
	});

	// 为每一行找“所属的、以 `= {` 开头的 const 声明块”的起点
	// 做法：顺序扫描，维护一个栈；遇到 /(?:export\s+)?const\s+(\w+)\s*:\s*[^=]*=\s*\{/ 记录开始
	const stack = [];
	let depth = 0;
	const ownerOfLine = Array.from({ length: lines.length }, () => null);
	const openRe = /(?:export\s+)?const\s+(\w+)\s*:\s*[^=]*=\s*\{/;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		ownerOfLine[i] = stack.length > 0 ? stack[stack.length - 1] : null;
		const m = openRe.exec(line);
		if (m) stack.push({ name: m[1], line: i + 1 });
		for (const ch of line) {
			if (ch === '{') depth++;
			else if (ch === '}') {
				depth--;
				// 只有当栈顶对象确实闭合时才弹出：用一次近似——深度回落到对象开始前的深度
				if (stack.length > 0 && depth <= stack[stack.length - 1].depthAtOpen) stack.pop();
			}
		}
		// 记录刚打开的对象在打开前的深度
		if (m && stack.length > 0 && stack[stack.length - 1].line === i + 1) {
			stack[stack.length - 1].depthAtOpen = depth - 1;
		}
	}

	for (const i of castLines) {
		total++;
		const line = lines[i];
		const trimmed = line.trim();
		const endsComma = /,\s*$/.test(trimmed);
		const isProp = /^[\w$]+\s*:\s*null as unknown as/.test(trimmed);
		const isStmtAssign = /^[\w$.[\]]+\s*=\s*null as unknown as/.test(trimmed);
		const isDeclInit = /^(?:const|let|var)\s/.test(trimmed);
		const kind =
			isProp && endsComma
				? 'literal-prop'
				: isStmtAssign
					? 'stmt-assign'
					: isDeclInit
						? 'decl-init'
						: 'other';
		kinds[kind] = (kinds[kind] || 0) + 1;
		allSites.push({ rel, line: i + 1, kind, text: trimmed.slice(0, 110) });

		if (kind === 'literal-prop') {
			const owner = ownerOfLine[i];
			const key = owner ? `${rel}::${owner.line}::${owner.name}` : `${rel}::<top>`;
			if (!clusters.has(key)) clusters.set(key, { rel, owner, count: 0, lines: [] });
			const c = clusters.get(key);
			c.count++;
			if (c.lines.length < 2) c.lines.push(trimmed.slice(0, 90));
		}
	}
}

console.log('');
console.log(`null-cast 总数：${total}`);
console.log('形态分布：');
for (const [k, v] of Object.entries(kinds).sort((a, b) => b[1] - a[1])) {
	console.log(`  ${String(v).padStart(4)}  ${k}  (${((v / total) * 100).toFixed(1)}%)`);
}

const big = [...clusters.values()].sort((a, b) => b.count - a.count);
console.log('');
console.log(`literal-prop 簇：${big.length} 个，合计 ${big.reduce((s, c) => s + c.count, 0)} 处`);
console.log('前 25 大簇：');
for (const c of big.slice(0, 25)) {
	const where = c.owner ? `L${c.owner.line} const ${c.owner.name}` : '<未识别归属>';
	console.log(`  ${String(c.count).padStart(4)}  ${c.rel}  [${where}]`);
}

if (LIST) {
	console.log('');
	console.log('逐条清单（按文件、行号）：');
	let cur = null;
	for (const s of allSites.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line)) {
		if (s.rel !== cur) {
			cur = s.rel;
			console.log(`\n${s.rel}`);
		}
		console.log(`  L${String(s.line).padStart(5)}  [${s.kind}]  ${s.text}`);
	}
}
