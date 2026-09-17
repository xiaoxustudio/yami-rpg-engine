import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const F = 'packages/editor/Project/global.d.ts';

// 借审计器拿到"每条声明 → 实现文件"的映射（口径只有一份）
const json = execFileSync(process.execPath, ['scripts/global-types-audit.mjs', '--json'], {
	cwd: ROOT,
	encoding: 'utf8',
	maxBuffer: 64 * 1024 * 1024
});
const { rows } = JSON.parse(json);

const lines = fs.readFileSync(F, 'utf8').split(/\r?\n/);

// 逐行定位：同一 (interface, member) 可能同名多次，用行号精确匹配
const byLine = new Map();
for (const r of rows) {
	if (r.kind !== 'real' || !r.impl.length) continue;
	// 只写**生产**实现（排除仅测试里的补丁），且只取 editor / ui-kit 两侧——
	// `packages/template-arpg/runtime/Script/util.ts` 是导出的游戏模板里的一份
	// 平行副本，对"这个仓库的类型增强从哪来"没有解释力，写进来只会稀释信号。
	const prod = r.impl.filter(
		(i) => !/__tests__|\.spec\.|\.test\./.test(i.file) && /^packages\/(editor|ui-kit)\//.test(i.file)
	);
	if (!prod.length) continue;
	const files = [...new Set(prod.map((i) => `${i.file}:${i.line}`))];
	byLine.set(r.line, files.join(' '));
}

let inserted = 0;
for (const ln of [...byLine.keys()].sort((a, b) => b - a)) {
	const idx = ln - 1;
	if (idx < 0 || idx >= lines.length) continue;
	lines.splice(idx + 1, 0, `\t// → ${byLine.get(ln)}`);
	inserted++;
}

fs.writeFileSync(F, lines.join('\n'));
console.log(`已为 ${inserted} 条声明写入实现出处注释`);
