// 逐站扫描 `any-hatches` 的**单点代价**，按代价排序 —— 第 152 轮新增。
//
// 为什么需要它：第 151 轮证明了「先量种类、再量单点代价」有效，但**站点是猜的**（我按文件名和
// PHASE 里的旧笔记挑了三处，两处事后证明很贵）。逐站扫一遍会把「挑站点」这件事从猜变成查表。
//
// 口径：站点枚举**复用 `lib/scan.mjs`**（同 SCAN_DIRS / EXCLUDE_RE / ANY_HATCH_RE / codeOnly），
// 与 `pnpm migration:check` 的 `any-hatches` 轴**同源** ⇒ 枚举出的站点数必须与台账读数相等
// （脚本末尾自证；不等就说明口径漂了，别拿结果做决策）。
// 单点测量复用 `measure-any-hatch-site.mjs` 的 `measureAnyHatchSite()`（**同一份摘法**）。
//
// ⚠️ 每测一处会**临时改写**该文件再写回（逐字复核）。⇒ 扫描期间不要并行编辑仓库；
// 也不要并发跑两个扫描。
//
// 用法：
//   node scripts/oneoff/scan-any-hatch-costs.mjs [--limit N] [--kind INDEX_SIG|RECORD_ANNOT] [--all]
import { SCAN_DIRS, collectFiles, readSource, codeOnly, ANY_HATCH_RE } from '../lib/scan.mjs';
import { measureAnyHatchSite, INDEX_SIG_RE } from './measure-any-hatch-site.mjs';

const argv = process.argv.slice(2);
const limitArg = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 8;
const kindFilter = argv.includes('--kind') ? argv[argv.indexOf('--kind') + 1] : null;
const all = argv.includes('--all');
const limit = all ? Infinity : limitArg;

/** 枚举站点（与台账同一口径；每行独立重置 lastIndex，因为正则带 /g） */
function sites() {
	const out = [];
	for (const { full, rel } of collectFiles({ dirs: SCAN_DIRS })) {
		const source = readSource(full);
		const code = codeOnly(source);
		code.split('\n').forEach((codeLine, index) => {
			ANY_HATCH_RE.lastIndex = 0;
			if (!ANY_HATCH_RE.test(codeLine)) return;
			out.push({
				rel: rel.replace(/\\/g, '/'),
				line: index + 1,
				kind: INDEX_SIG_RE.test(source.split('\n')[index]) ? 'INDEX_SIG' : 'RECORD_ANNOT'
			});
		});
	}
	return out;
}

const all_sites = sites();
console.log(`any-hatches 站点：${all_sites.length} 处（台账 any-hatches.total 应与此相等）`);
console.log(
	`本次测：${kindFilter ? `种类=${kindFilter}，` : ''}${all ? '全部' : `最多 ${limit} 处`}\n`
);

const picked = all_sites.filter((s) => !kindFilter || s.kind === kindFilter).slice(0, limit);
const results = [];
const refusals = [];
let index = 0;
for (const site of picked) {
	index += 1;
	process.stdout.write(`  [${index}/${picked.length}] ${site.rel}:${site.line} … `);
	const r = measureAnyHatchSite(site.rel, site.line);
	if (r.refusal) {
		refusals.push({ ...site, why: r.refusal });
		console.log(`跳过（${r.refusal}）`);
		continue;
	}
	if (!r.restored) {
		console.error(
			`\n✗ 写回失败：${site.rel} 与原文不一致 —— 立刻 git checkout 该文件并停止扫描`
		);
		process.exit(3);
	}
	const props = [...r.byProp].sort((a, b) => b[1] - a[1]);
	const files = [...r.byFile].sort((a, b) => b[1] - a[1]);
	results.push({ ...site, n: r.errors.length, props, files, suspect: Boolean(r.suspect) });
	console.log(
		`${String(r.errors.length).padStart(3)} 条${r.errors.length === 0 ? '  ← 可直接摘' : ''}` +
			(r.suspect ? '  ⚠️ 自检：全是语法族 / 隐式 any，读数无效' : '')
	);
}

console.log('\n=== 按代价升序（便宜的在前面）===');
for (const r of [...results].sort((a, b) => a.n - b.n || a.rel.localeCompare(b.rel))) {
	const props = r.props
		.slice(0, 4)
		.map(([p, n]) => `${p}×${n}`)
		.join(' ');
	const files = r.files
		.slice(0, 3)
		.map(([f, n]) => `${f.split('/').slice(-2).join('/')}×${n}`)
		.join(' ');
	console.log(`  ${String(r.n).padStart(3)}  ${r.kind.padEnd(12)} ${r.rel}:${r.line}`);
	if (r.suspect) console.log('        ⚠️ 自检无效（语法族 / 隐式 any）—— 不得当「便宜」用');
	if (props) console.log(`        字段：${props}`);
	if (files) console.log(`        文件：${files}`);
}

if (refusals.length !== 0) {
	console.log('\n=== 跳过（不可机械测）===');
	for (const r of refusals) console.log(`  ${r.rel}:${r.line} —— ${r.why}`);
}

console.log('\n提示：本表只量「摘掉这一处会报几条」。改法仍要按种类走：');
console.log(
	'  INDEX_SIG（接口成员）→ 逆推字段补声明；RECORD_ANNOT（常量注解）→ 具名形状 + Partial。'
);
