// 抽出 `Animation.<name> = <Engine>.<member>;` 这类**属性**镜像，声明成 `typeof <Engine>.<member>`
// （第 248 轮）。这样属性的类型直接复用引擎侧已推断出的类型，不必逐个手写。
//
// 用法：node scripts/oneoff/gen-anim-props.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIRS = ['packages/editor/src/animation', 'packages/editor/src/engine/animation'];
const files = DIRS.flatMap((dir) =>
	readdirSync(dir)
		.filter((f) => f.endsWith('.ts'))
		.map((f) => join(dir, f))
);

const mirrors = new Map();
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	for (const m of text.matchAll(/^Animation\.(\w+) = (\w+)\.(\w+);$/gm)) {
		mirrors.set(m[1], `${m[2]}.${m[3]}`);
	}
}
for (const [name, target] of [...mirrors].sort((a, b) => a[0].localeCompare(b[0]))) {
	console.log(`\t${name}: typeof ${target};`);
}
console.error(`// property mirrors: ${mirrors.size}`);
