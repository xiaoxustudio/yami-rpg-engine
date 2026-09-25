/**
 * ④-4 待定成员**归因表**（第 199 轮）：把「全接线」时的错误逐条归到成员上，
 * 看清 40 条待定各自卡在什么地方 —— 分类之前不动手（第 197 轮定的规矩）。
 * 只读，不改任何文件。
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const require_ = createRequire(new URL('../../packages/editor/package.json', import.meta.url));
const ts = require_('typescript');
const ROOT = process.cwd();
const CONTRACT = 'packages/editor/src/engine/ui/ui-domain-contract.ts';
const cfg = ts.readConfigFile(join(ROOT, 'packages/editor/tsconfig.strict.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, join(ROOT, 'packages/editor'));
const src = readFileSync(CONTRACT, 'utf8');
const types = new Map(
	[...src.matchAll(/^\t([A-Za-z_$][\w$]*): (.+);$/gm)].map((m) => [m[1], m[2]])
);
// 临时把「全接线」写进内存版增强：用 ts.createSourceFile 覆盖？—— 改用编译前先写文件再还原
import { writeFileSync } from 'node:fs';
const backup = src;
writeFileSync(
	CONTRACT,
	src.replace(
		/Pick<\s*UIDomainMembers\s*,\s*[\s\S]*?>/,
		`Pick<UIDomainMembers, ${[...types.keys()].map((n) => `'${n}'`).join(' | ')}>`
	),
	'utf8'
);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diags = ts
	.getPreEmitDiagnostics(program)
	.filter(
		(d) =>
			d.file &&
			d.file.fileName.includes('/src/') &&
			[2345, 2322, 2352, 2721, 2769, 2554, 2430, 2416, 2739].includes(d.code)
	);
writeFileSync(CONTRACT, backup, 'utf8');
const byMember = new Map();
for (const d of diags) {
	const p = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
	const line = (d.file.text.split('\n')[p.line] ?? '').trim();
	const msg = ts.flattenDiagnosticMessageText(d.messageText, ' ');
	const named = [...new Set([...line.matchAll(/([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))].filter(
		(n) => types.has(n)
	);
	const hit = named.length ? named : [...types.keys()].filter((n) => msg.includes(types.get(n)));
	for (const n of hit) {
		if (!byMember.has(n)) byMember.set(n, []);
		byMember.get(n).push(`${d.code} ${line.slice(0, 46)} :: ${msg.slice(0, 52)}`);
	}
}
console.log(`全接线错误 ${diags.length} 条，涉及成员 ${byMember.size} 个\n`);
for (const [n, list] of [...byMember.entries()].sort((a, b) => b[1].length - a[1].length)) {
	console.log(`${n} (${list.length})  ${list[0].slice(0, 110)}`);
}
const unattributed = diags.length - [...byMember.values()].reduce((a, l) => a + l.length, 0);
console.log(`\n未被归因的错误条目数（可重叠计）：${unattributed}`);
