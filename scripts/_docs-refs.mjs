import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// 迁移规划文档随 docs/ 目录移除后，源码里的 `docs/<name>.md` 会变成悬空路径。
// 统一改成不带路径的文档名——读者在 git 历史里按名字能找回，注释也不再指向不存在的文件。
const MAP = {
	'docs/remaining-work.md': '迁移收尾清单',
	'docs/vue3-migration-plan.md': '主迁移规划',
	'docs/layout-vue-plan.md': 'layout 迁移规划',
	'docs/tree-list-vfor-plan.md': 'tree 迁移规划',
	'docs/monolith-render-plan.md': '巨石渲染规划',
	'docs/dom-migration-tracker.md': 'DOM 迁移台账'
};

const out = execFileSync('git', ['ls-files'], { cwd: process.cwd(), encoding: 'utf8' })
	.split(/\r?\n/)
	.filter((f) => /\.(ts|vue|mjs|js)$/.test(f) && !f.startsWith('build/'))
	.filter((f) => fs.existsSync(f));

let touched = 0;
for (const f of out) {
	const src = fs.readFileSync(f, 'utf8');
	let next = src;
	for (const [from, to] of Object.entries(MAP)) next = next.split(from).join(to);
	if (next !== src) {
		fs.writeFileSync(f, next);
		touched++;
		console.log('updated', f);
	}
}
console.log('files touched:', touched);
void path;
