// 一次性：给 Data 单例补非空字段声明（工单见 data-object.ts:35）。
//
// 用法：
//   node scripts/oneoff/declare-data-fields.mjs           # 干跑
//   node scripts/oneoff/declare-data-fields.mjs --write   # 写回
//
// 只做两件事（类型来源都是工单里写明的、确定无疑的）：
//   1. 在接口兜底索引签名之前插入非空声明；
//   2. 把字面量里对应的 `X: null,` 改成 `X: null!,`（运行期仍是 null，避免 undefined 回归）。
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'packages/editor/src/data/data-object.ts';
const WRITE = process.argv.includes('--write');

// 名字 -> 声明（本批只放类型无歧义的）
const FIELDS = [
	['manifest', 'Manifest'],
	['variables', 'VariableNode[]'],
	['localization', '{ list: LocalizationNode[]; map: Record<string, LocalizationNode> }'],
	['attribute', '{ context: AttributeContext; [k: string]: unknown }'],
	['enumeration', '{ context: EnumerationContext; [k: string]: unknown }'],
];

const text = readFileSync(FILE, 'utf8');
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const lines = text.split(/\r?\n/);

// 定位兜底索引签名（其上一行是 oxlint 抑制注释）
const idxAny = lines.findIndex((l) => l.trim() === '[k: string]: any;');
if (idxAny < 0) {
	console.error('未找到兜底索引签名');
	process.exit(1);
}
const insertAt = lines[idxAny - 1]?.includes('oxlint-disable-next-line') ? idxAny - 1 : idxAny;

const already = lines.slice(0, idxAny).filter((l) => FIELDS.some(([n]) => l.trim().startsWith(`${n}:`)));
const toAdd = FIELDS.filter(([n]) => !already.some((l) => l.trim().startsWith(`${n}:`)));

const decl = toAdd.length
	? [
			'\t// 装载后非空（正常状态）；`close()` 用 Reflect.set 清回 null，故字面量占位写 `null!`。',
			...toAdd.map(([n, t]) => `\t${n}: ${t};`),
		]
	: [];

const out = [...lines.slice(0, insertAt), ...decl, ...lines.slice(insertAt)];

let renames = 0;
for (let i = 0; i < out.length; i++) {
	const m = /^\t(\w+): null,$/.exec(out[i]);
	if (m && FIELDS.some(([n]) => n === m[1])) {
		out[i] = out[i].replace(': null,', ': null!,');
		renames++;
	}
}

console.log(`declarations added: ${toAdd.length} (${toAdd.map(([n]) => n).join(', ') || 'none'})`);
console.log(`placeholders -> null!: ${renames}`);
if (WRITE) {
	writeFileSync(FILE, out.join(eol), 'utf8');
	console.log('written: ' + FILE);
} else {
	console.log('dry run');
}


