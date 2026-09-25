/**
 * ④-4 **贪心接线**（第 198 轮）：逐批把契约成员接进 `UIShape`，只保留**不会让全仓变红**的那些。
 *
 * 为什么需要它：全接线会打出 40+9 处错误（其中 36 处是「断言了也没用」的签名分歧，第 197 轮已定），
 * 而「全有/全无」二选一都不是路 ⇒ 找可增量的中间态。未接的成员**留在契约文件里**并由 `Pick` 排除，
 * 同时把「待定」名单写进文件头（下一个人一眼能看到欠了什么）。
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseMembers } from './contract-parse.mjs';
const require_ = createRequire(new URL('../../packages/editor/package.json', import.meta.url));
const ts = require_('typescript');
const ROOT = process.cwd();
const CONTRACT = 'packages/editor/src/engine/ui/ui-domain-contract.ts';
const cfg = ts.readConfigFile(join(ROOT, 'packages/editor/tsconfig.strict.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, join(ROOT, 'packages/editor'));
const makeProgram = () => ts.createProgram(parsed.fileNames, parsed.options);

const src0 = readFileSync(CONTRACT, 'utf8');
const base = src0.replace(/\n\/\/ ④-4 接线(?:（贪心）)?[\s\S]*$/, '').trimEnd();
const members = parseMembers(base);
const typeOf = new Map(members);
const all = members.map(([n]) => n);
console.log(`契约成员 ${all.length} 条`);
const DIAG_CODES = new Set([2345, 2322, 2352, 2721, 2769, 2554, 2430, 2416, 2739]);
const inEditor = (f) =>
	f &&
	f.fileName.includes('packages') &&
	f.fileName.includes('editor') &&
	f.fileName.includes('/src/');
const editorDiags = (program) =>
	ts.getPreEmitDiagnostics(program).filter((d) => inEditor(d.file) && DIAG_CODES.has(d.code));

let excluded = new Set();
for (let round = 1; round <= 8; round++) {
	const included = all.filter((n) => !excluded.has(n));
	const pick = included.map((n) => `'${n}'`).join(' | ') || 'never';
	writeFileSync(
		CONTRACT,
		base +
			`\n\n// ④-4 接线（**贪心**，第 198 轮）：只接不会让全仓变红的成员；其余留在 UIDomainMembers 里待定。\n` +
			`// 待定 ${excluded.size} 条：${[...excluded].toSorted((a, b) => a.localeCompare(b)).join(' ') || '(无)'}\n` +
			`declare module './ui-singleton.ts' {\n\tinterface UIShape extends Pick<UIDomainMembers, ${pick}> {}\n}\n`,
		'utf8'
	);
	const program = makeProgram();
	const diags = editorDiags(program);
	console.log(`第 ${round} 轮：接了 ${included.length} 条，编辑区错误 ${diags.length}`);
	if (!diags.length) {
		console.log('✅ 收敛：全仓 0 错，可以落地');
		break;
	}
	const before = excluded.size;
	for (const d of diags) {
		const msg = ts.flattenDiagnosticMessageText(d.messageText, ' ');
		const p = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
		const line = d.file.text.split('\n')[p.line] ?? '';
		const named = [
			...new Set([...line.matchAll(/([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))
		].filter((n) => typeOf.has(n) && !excluded.has(n));
		for (const n of named) excluded.add(n);
		for (const n of all) if (!excluded.has(n) && msg.includes(typeOf.get(n))) excluded.add(n);
	}
	if (excluded.size === before) {
		console.log('⚠️ 本轮归因不到新成员 ⇒ 停（避免死循环）');
		break;
	}
}
console.log(
	`最终：待定 ${excluded.size} 条 → ${[...excluded].toSorted((a, b) => a.localeCompare(b)).join(' ')}`
);
