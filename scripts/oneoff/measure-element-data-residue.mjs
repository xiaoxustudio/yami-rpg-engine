// 一次性盘点：`elementDataOf` 家族的「**必填字段残留**」。
// 只读。用法：node scripts/oneoff/measure-element-data-residue.mjs
//
// ## 它找的是什么（第 121 轮那条线索的自动化）
//
// 一批字段已从「元素上的隐式属性」搬进**元素数据**（WeakMap，经 `elementDataOf` 读写）。
// 搬迁之后，元素类型上那些**必填**（非 `?`）字段若没跟着删，类型就在说谎：
// 它声称 `el.x` 是 `T`，而运行期读出来是 `undefined` —— 而且它常常是某处
// `as unknown as` 存在的唯一理由（第 121 轮：`FolderElement.indent`）。
//
// 判据（同时满足才报）：
//   1. 该字段在某个 interface/type 里是**必填**的；
//   2. 本文件里存在 `data.<字段>`（说明它确实住进了元素数据）；
//   3. 本文件里**没有**任何别的 `<宿主>.<字段> =` 赋值，也没有别的读取
//      —— 即：从来没有人真的把它写到元素上过。
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const { codeOnly, collectFiles, readSource, SCAN_DIRS } = await import(
	pathToFileURL(join(ROOT, 'scripts/lib/scan.mjs')).href
);

const files = collectFiles({ dirs: SCAN_DIRS, includeTests: false });
const report = [];

for (const { full, rel } of files) {
	const src = readSource(full);
	if (!src.includes('elementDataOf')) continue;
	const code = codeOnly(src);

	// 本文件声明的 interface / type 的成员（粗解析：逐行看 `名字?: 类型;`）
	const members = []; // { iface, name, optional, line }
	let current = null;
	const lines = code.split('\n');
	lines.forEach((line, i) => {
		const mIf = line.match(/^\s*(?:export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)\b/);
		if (mIf) {
			current = mIf[1];
			return;
		}
		if (line.startsWith('}') || /^\s*\}\s*(?:;|$)/.test(line)) {
			current = null;
			return;
		}
		if (current === null) return;
		const m = line.match(/^\s*([A-Za-z_$][\w$]*)(\?)?\s*:\s*(.+?);?\s*$/);
		if (!m) return;
		if (m[3].startsWith('(') || m[3].includes('=>')) return; // 方法/函数成员跳过
		members.push({ iface: current, name: m[1], optional: m[2] === '?', line: i + 1 });
	});

	for (const mem of members) {
		if (mem.optional) continue;
		const n = mem.name;
		const dataAccess = new RegExp(
			`\\bdata\\.[A-Za-z_$]*\\.?${n}\\b|\\bdata\\[['"]${n}['"]\\]`
		).test(code);
		if (!dataAccess) continue;
		// 除 `data.x` 之外，还有没有别的宿主访问（读或写）？
		const allAccess = [
			...code.matchAll(new RegExp(`\\b([A-Za-z_$][\\w$]*)\\s*\\.\\s*${n}\\b`, 'g'))
		];
		const otherOwners = allAccess.map((m) => m[1]).filter((o) => o !== 'data');
		const writes = new RegExp(`\\b[A-Za-z_$][\\w$]*\\s*\\.\\s*${n}\\s*=(?!=)`).test(code);
		if (otherOwners.length === 0 && !writes) {
			report.push({
				rel: rel.replace(/\\/g, '/'),
				iface: mem.iface,
				name: n,
				line: mem.line
			});
		}
	}
}

console.log(`扫描面：${files.length} 个文件（含 \`elementDataOf\` 的才看）\n`);
console.log('=== 候选：必填 + 只以 `data.<字段>` 出现（从没写到元素上）===');
if (report.length === 0) console.log('  （无）');
for (const r of report) {
	console.log(`  ${r.rel}:${r.line}  ${r.iface}.${r.name}`);
}
console.log(
	`\n共 ${report.length} 处候选 ⇒ 逐处人工确认后再删字段（删完可能连带消掉一处 unknown-casts）。`
);
