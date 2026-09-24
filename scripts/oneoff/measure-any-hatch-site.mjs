// 一次性探针（第 133 轮）：量**单独一处** `any-hatches` 站点的代价。
//
// 为什么必须「单独一处」：第 130 轮实测过「一次摘掉全部、按报错类型名归属」——不成立。
// 两个原因：(1) 两种站点的摘法不同（索引签名删那一行 vs 常量注解去掉 `Record<string, any>`），
// 混着摘直接把文件写成语法错误；(2) 代价出现在**使用点**，使用点散落全仓，「报错文件」≠「声明文件」。
//
// 本脚本做对的一件事：**按站点种类用对应的摘法**，摘一处、跑一次 tsc、把报错按
// 「错误码 + 属性名」归类，然后**把文件写回原样并逐字复核**。
//
// 用法：
//   node scripts/oneoff/measure-any-hatch-site.mjs <相对路径> <行号>
// 例：
//   node scripts/oneoff/measure-any-hatch-site.mjs packages/editor/src/engine/ui/element-classes.ts 141

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const [rel, lineArg] = process.argv.slice(2);
if (!rel || !lineArg) {
	console.error('用法：node scripts/oneoff/measure-any-hatch-site.mjs <相对路径> <行号>');
	process.exit(2);
}
const line = Number(lineArg);
const full = join(ROOT, rel);
const original = readFileSync(full, 'utf8');
const lines = original.split('\n');
const text = lines[line - 1];
if (text === undefined) {
	console.error(`第 ${line} 行不存在`);
	process.exit(2);
}

const INDEX_SIG = /^\s*\[(?:k|key):\s*string\]:\s*any\b/;
const kind = INDEX_SIG.test(text) ? 'INDEX_SIG' : 'RECORD_ANNOT';
console.log(`站点 ${rel}:${line}`);
console.log(`  原文 ${text.trim()}`);
console.log(`  种类 ${kind}`);

// 按种类摘：索引签名整行注释掉（保留行号）；注解只去掉 `: Record<string, any>` 这一段。
const next = [...lines];
if (kind === 'INDEX_SIG') {
	next[line - 1] = `// ${next[line - 1]}`;
} else {
	// `Record<string, any>` 有两种落点：
	//   `x: Record<string, any>`       —— 注解，摘掉注解即可（可机械测量）
	//   `type X = Record<string, any>` —— 类型别名，**不可机械摘**：别名必须指向某个类型，
	//     换任何具体类型都会改变测量结果 ⇒ 那属于设计工作（第 133 轮实测踩到，故在此显式拒绝）。
	if (/=\s*Record<string,\s*any>/.test(next[line - 1])) {
		console.error('  这一行是**类型别名**（`type X = Record<string, any>`）：摘不掉它 ——');
		console.error(
			'  别名必须指向某个类型，换任何具体类型都会改变测量结果 ⇒ 属设计工作，不能机械测。'
		);
		process.exit(2);
	}
	const stripped = next[line - 1].replace(/\s*:\s*Record<string,\s*any>/g, '');
	if (stripped === next[line - 1]) {
		console.error('  这一行里没找到可摘的 `: Record<string, any>` —— 请人工确认摘法');
		process.exit(2);
	}
	next[line - 1] = stripped;
}

let tscOut = '';
try {
	writeFileSync(full, next.join('\n'), 'utf8');
	try {
		tscOut = execFileSync('pnpm', ['-F', '@yami/editor', 'run', 'typecheck'], {
			cwd: ROOT,
			encoding: 'utf8',
			shell: true,
			maxBuffer: 1 << 28
		});
	} catch (e) {
		tscOut = `${e.stdout ?? ''}${e.stderr ?? ''}`;
	}
} finally {
	writeFileSync(full, original, 'utf8');
	const same = readFileSync(full, 'utf8') === original;
	console.log(`
写回复核：${same ? '与原文逐字一致 ✓' : '✗ 不一致，请立刻 git checkout 该文件'}`);
	if (!same) process.exit(3);
}

const errors = tscOut.split('\n').filter((l) => /error TS\d+/.test(l));
console.log(`
摘掉这一处后 tsc 报错 ${errors.length} 条`);

const byCode = new Map();
const byProp = new Map();
const byFile = new Map();
for (const e of errors) {
	const code = (e.match(/error (TS\d+)/) ?? [])[1] ?? '?';
	byCode.set(code, (byCode.get(code) ?? 0) + 1);
	const file = (e.match(/^(\S+?)\(/) ?? [])[1] ?? '?';
	byFile.set(file, (byFile.get(file) ?? 0) + 1);
	const prop = e.match(/Property '([^']+)' does not exist/);
	if (prop) byProp.set(prop[1], (byProp.get(prop[1]) ?? 0) + 1);
}

console.log('\n=== 按错误码 ===');
for (const [code, n] of [...byCode].sort((a, b) => b[1] - a[1]))
	console.log(`  ${String(n).padStart(3)}  ${code}`);

console.log('\n=== 「属性不存在」逐字段（= 需要声明或分型的字段）===');
for (const [prop, n] of [...byProp].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
	console.log(`  ${String(n).padStart(3)}  ${prop}`);

console.log('\n=== 按文件（前 15）===');
for (const [file, n] of [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 15))
	console.log(`  ${String(n).padStart(3)}  ${file}`);

console.log('\n=== 非 TS2339 的报错原文（前 20，用来判「可空解引用」这类）===');
const others = errors.filter((e) => !/Property '[^']+' does not exist/.test(e));
console.log(`  （共 ${others.length} 条）`);
for (const e of others.slice(0, 20)) console.log(`  ${e.slice(0, 165)}`);
