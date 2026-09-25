/**
 * ④-4 接线第二阶段：**用 `.vue` 的错误纠正 `.ts` oracle 的视野窄**（第 200 轮）。
 * 第 198 轮的教训：贪心循环的 oracle 是 tsconfig.strict.json（只有 .ts），而门禁含 vue-tsc。
 * 用法：先 `pnpm -F @yami/editor run typecheck:vue > .tmp-vue.txt`，再跑本脚本。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const CONTRACT = 'packages/editor/src/engine/ui/ui-domain-contract.ts';
const out = readFileSync('.tmp-vue.txt', 'utf8');
const TYPE_CODES = new Set([
	'TS2345',
	'TS2322',
	'TS2554',
	'TS2769',
	'TS2721',
	'TS2352',
	'TS2739',
	'TS2430'
]);
const hits = [...out.matchAll(/^\s*\+ (\S+?):(\d+):(\d+): (TS\d+)/gm)].filter(([, , , , code]) =>
	TYPE_CODES.has(code)
);
if (!hits.length) {
	console.log('无 .vue 新错');
	process.exit(0);
}
const c = readFileSync(CONTRACT, 'utf8');
const types = new Map([...c.matchAll(/^\t([A-Za-z_$][\w$]*): (.+);$/gm)].map((m) => [m[1], m[2]]));
const pickM = c.match(/Pick<\s*UIDomainMembers\s*,\s*([\s\S]*?)>/);
const wired = pickM
	? pickM[1]
			.split('|')
			.map((s) => s.trim().replace(/'/g, ''))
			.filter(Boolean)
	: [];
const deferM = c.match(/\/\/ 待定 (\d+) 条：([^\n]*)/);
const deferred = new Set(deferM ? deferM[2].split(/\s+/).filter((x) => x && x !== '(无)') : []);
const add = new Set();
for (const [, file, ln, , code] of hits) {
	const rel = existsSync(file)
		? file
		: existsSync('packages/editor/' + file)
			? 'packages/editor/' + file
			: file;
	const line = readFileSync(rel, 'utf8').split('\n')[Number(ln) - 1] ?? '';
	const named = [...new Set([...line.matchAll(/([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))].filter(
		(n) => types.has(n)
	);
	console.log(
		`${code} ${rel}:${ln} → ${named.join(' ') || '(未归因)'}  :: ${line.trim().slice(0, 70)}`
	);
	for (const n of named) add.add(n);
}
for (const n of add) deferred.add(n);
const newWired = wired.filter((n) => !deferred.has(n));
const next = c
	.replace(
		/Pick<\s*UIDomainMembers\s*,\s*[\s\S]*?>/,
		`Pick<UIDomainMembers, ${newWired.map((n) => `'${n}'`).join(' | ')}>`
	)
	.replace(
		/\/\/ 待定 \d+ 条：[^\n]*/,
		`// 待定 ${deferred.size} 条：${[...deferred].toSorted((a, b) => a.localeCompare(b)).join(' ')}`
	);
writeFileSync(CONTRACT, next, 'utf8');
console.log(
	`\n按 .vue 错误再挪 ${add.size} 条进待定 ⇒ 接线 ${newWired.length} / 待定 ${deferred.size}`
);
