import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * 登记侧「疑似没人读」的体检表（**只是线索，不能据此直接删**）。
 *
 * 2026-11-06 实测：静态判定会**漏**掉三类读法，按它删会把真机打断 ——
 *
 *   1. 变量 id 的循环登记（`IfCondition.vue` 的 `registerElement(composableEls, id, …)`）里，
 *      同一个 id 又可能只在 schema 里以字面量出现；
 *   2. `registryElement<T>(composableEls, '…')!.filter = …` 这种「取到就写属性」的用法；
 *   3. spec / 冒烟测试里的间接断言（`deferred-window-smoke` 会统计「接线了的控件数」）。
 *
 * 结论：**注册侧要不要删，只有跑测试能定**。这个脚本用来缩小范围，不是判定器。
 */
const files = globSync('packages/editor/src/**/*.{ts,vue}').filter(
	(file) => !file.includes('__tests__')
);
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

const rows = [];
for (const [file, text] of sources) {
	const ids = [
		...[...text.matchAll(/registerElement\(\s*\w+\s*,\s*'([^']+)'/g)].map((m) => m[1]),
		...[...text.matchAll(/registryRef\(\s*\w+\s*,\s*'([^']+)'\s*\)/g)].map((m) => m[1])
	];
	if (ids.length === 0) continue;
	const deadIds = ids.filter((id) => {
		const patterns = [
			new RegExp(`\\w*Els\\s*\\.\\s*get\\(\\s*'${id}'`),
			new RegExp(`registryElements?\\([^)]*'${id}'`),
			new RegExp(`querySelector\\(\\s*'#${id}'`),
			new RegExp(`queryElementsByIds\\(\\[[^\\]]*'${id}'`),
			new RegExp(`\\bel\\(\\s*'${id}'\\s*\\)`)
		];
		for (const [otherFile, otherText] of sources) {
			if (otherFile === file) continue;
			if (patterns.some((pattern) => pattern.test(otherText))) return false;
		}
		return true;
	});
	rows.push({ file, total: ids.length, dead: deadIds, allDead: deadIds.length === ids.length });
}

rows.sort((a, b) => b.dead.length - a.dead.length);
for (const row of rows.filter((r) => r.dead.length > 0)) {
	const flag = row.allDead ? '全死' : `存活 ${row.total - row.dead.length}`;
	console.log(
		`${String(row.dead.length).padStart(3)}/${String(row.total).padEnd(3)} ${flag.padEnd(7)} ${row.file.replace(/.*src\//, '')}`
	);
}
const allDeadFiles = rows.filter((row) => row.allDead);
console.log(
	`\n全死文件 ${allDeadFiles.length} 个，共 ${allDeadFiles.reduce((sum, r) => sum + r.dead.length, 0)} 条登记`
);
