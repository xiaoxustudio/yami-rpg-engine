#!/usr/bin/env node
// DOM 迁移守卫：扫描命令式 DOM 用法，输出迁移矩阵。
// 用法：
//   node scripts/dom-guard.mjs tracker  生成 DOM 迁移台账
//   node scripts/dom-guard.mjs fix      修 BOM 错位的豁免注释（历史遗留）
//
// C1 后不再提供 exempt 子命令：受限 API 的用法只剩「迁移」或「进白名单」两条路，
// 后者由 `.oxlintrc.json` 的 `overrides` 承担——**名单只有那一份**（见 `scripts/lib/dom-whitelist.mjs`）。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DOM_PATTERNS, countMatches, countCodeMatches } from './lib/scan.mjs';
import { DOM_AUX_PATTERNS, DOM_INFO_PATTERNS, ELEMENT_API_PATTERNS } from './lib/scan.mjs';
import { loadDomWhitelist } from './lib/dom-whitelist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = [join('packages', 'editor', 'src'), join('packages', 'ui-kit', 'src')];
const EXTENSIONS = new Set(['.ts', '.tsx', '.vue']);
const EXCLUDE_RE = /(?:\.spec\.ts$|\.d\.ts$|\/__tests__\/|\.demo\.vue$)/;
const DISABLE_COMMENT = '/* oxlint-disable eslint/no-restricted-properties */';

/**
 * C1 白名单（设计豁免）：这些文件**按设计**必须使用受限 API。
 *
 * **真源是 `.oxlintrc.json`**（`overrides` 里把 `eslint/no-restricted-properties` 关成 `off`
 * 的那些 `files`）——能放行 `pnpm lint` 的才算豁免，台账另认一份名单只会两边对不上。
 * 本文件过去在这里维护过一份字面量数组，已经和 lint 配置漂移过（报表「设计豁免 46」而白名单
 * 只有 14 条），2026-09-17 收口为单一真源；`scripts/migration-ledger.mjs` 的
 * `dom-whitelist-drift` 轴持续守住它。
 *
 * 白名单的设计口径（逐条理由记在 `.oxlintrc.json` 对应 override 的 `comment` 上）：
 *   - A 类·真画布上下文：`createElement('canvas')` 取 2D/WebGL 上下文与像素读回，模板无法替代
 *   - 应用挂载点：Vue 的挂载容器来自 index.html，只能按 id 取一次
 *   - 唯一 DOM 创建/查询缝隙：`$()` 与 renderDetached / createDetachedElement 的实现处
 *   - index.html 外壳元素（`#cursor-region`），非 SFC 渲染
 *   - 元素优先的组件 API 层（P2b 重定义：架构性设计豁免，不以文件数归零为准）
 *   - R2b 收口后的选择器式本地化器：按语言表的键发现元素；id 键的扫描面已归零，
 *     剩下的只有 `[name=…]` / `[.class]` 分组键（`name` 是组件内部的**稳定契约属性**）
 *
 * 口径：`待迁移命中` 只看「带豁免注释且指令仍在用」的文件；白名单文件在 C1 之后都不带注释，
 * 因此「白名单外待迁移命中 = 待迁移命中」——**C1 的验收就是 `待迁移命中 === 0`**。
 * `设计豁免` 列是另一个信息量：白名单里**仍有真实命中**的文件数（说明豁免是被用到的）。
 */
const { match: isWhitelisted } = loadDomWhitelist();

/** 临时豁免（有退出条件）：**已全部销账（2026-09-17）**。
 * 历史上只有一项——`localize/dom-localizer.ts`（归属 R2b）；R2b 的可量化目标达成后
 * 已转为设计豁免，见 `.oxlintrc.json`。保留一个恒为 0 的计数是为了让「临时豁免」这一档
 * 仍然出现在报表里（销账不等于这一档消失，未来仍可能有带退出条件的临时豁免）。 */
const TEMP_WHITELIST_COUNT = 0;

/**
 * 受限 API 模式。
 *
 * 2026-09-17 起**统一 import 自 `scripts/lib/scan.mjs`**（`DOM_PATTERNS`），本文件不再维护
 * 第二份：`migration-ledger.mjs` 数的是同一批模式，两份实现必然分叉。
 * 计数口径也从「原文正则」改为 `countCodeMatches`（排除注释/字符串/`.vue` 的 template+style）
 * ——本仓库的注释里大量写着「原先 document.getElementById」这类**已迁完**的记录，
 * 按原文计数会把它们当成迁移债（2026-09-17 实测虚高 29 文件 / 34 处，而 oxlint 是 0）。
 */
const PATTERNS = DOM_PATTERNS;

// 辅助口径：同属 DOM 耦合、但不在 lint 规则内（避免主表过宽）。
//
// 2026-10 起**模式统一 import 自 `scripts/lib/scan.mjs`**，本文件不再维护第二份：
//   · `DOM_AUX_PATTERNS` / `ELEMENT_API_PATTERNS` —— 已进台账棘轮（dom-style-writes、
//     element-registry-lookups…），这里只补人读明细；
//   · `DOM_INFO_PATTERNS` —— 仍未门禁，只作覆盖面清单。
// 计数也从「原文正则」改为 `countCodeMatches`（排除注释/字符串/.vue 的 template+style）——
// 本仓注释里大量写着「原先 document.getElementById」这类**已迁完**的记录，按原文计数会把
// 它们当成迁移债（2026-09-17 实测虚高 29 文件 / 34 处）。
const AUX_PATTERNS = [...DOM_AUX_PATTERNS, ...ELEMENT_API_PATTERNS];
const INFO_PATTERNS = DOM_INFO_PATTERNS;

/** 共享模式只有英文 key；报表要人读的中文名，标签只在这里维护一份 */
const PATTERN_LABELS = {
	styleWrite: 'style.* 赋值',
	classState: 'classList.add/remove/toggle + hasClass',
	textWrite: 'textContent 赋值',
	domTreeWalk: 'parentElement / closest / 兄弟节点',
	measureRead: 'client*/offset* / getComputedStyle',
	attach: 'attachApi / attachElementApi',
	registryLookup: '元素注册表寻址（*Els.get / registryElement）',
	yamiElementType: 'YamiElement 类型引用',
	renderCallbackProp: '容器式渲染回调（renderX）',
	childrenWalk: '.children 遍历（含树数据，口径偏宽）',
	attributeAccess: 'get/set/removeAttribute',
	innerHtmlWrite: 'innerHTML 赋值',
	scrollTopWrite: 'scrollTop 写',
	datasetAccess: 'dataset.* 状态',
	appendPrepend: 'element.append/prepend',
	nodeValueWrite: 'nodeValue 赋值',
	replaceChildrenEtc: 'replaceChildren/insertAdjacentHTML/matches()',
	customElements: 'customElements.define / attachShadow',
	prototypeAccessor: 'prototype 访问器定义（逗号形式）'
};
const labelOf = (p) => PATTERN_LABELS[p.key] ?? p.key;

function collectFiles() {
	const files = [];
	for (const dir of SCAN_DIRS) {
		const base = join(ROOT, dir);
		if (!existsSync(base)) continue;
		const walk = (p) => {
			for (const entry of readdirSync(p)) {
				const full = join(p, entry);
				const st = statSync(full);
				if (st.isDirectory()) {
					walk(full);
				} else if (EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) {
					const rel = relative(ROOT, full).replace(/\\/g, '/');
					if (!EXCLUDE_RE.test(rel)) files.push(full);
				}
			}
		};
		walk(base);
	}
	return files;
}

function scan() {
	const rows = [];
	for (const file of collectFiles()) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		const source = readFileSync(file, 'utf8');
		const counts = {};
		// 「真实命中」口径：排除注释 / 字符串 / `.vue` 的 template+style。
		// 另存一份原文口径（rawCounts）只作参考——两者的差额就是「写在注释里的历史记录」。
		for (const p of PATTERNS) counts[p.key] = countCodeMatches(source, p.re);
		const rawCounts = {};
		for (const p of PATTERNS) rawCounts[p.key] = countMatches(source, p.re);
		const aux = {};
		for (const p of AUX_PATTERNS) aux[p.key] = countCodeMatches(source, p.re);
		const info = {};
		for (const p of INFO_PATTERNS) info[p.key] = countCodeMatches(source, p.re);
		const lintCount = PATTERNS.filter((p) => p.lint).reduce((sum, p) => sum + counts[p.key], 0);
		const total = PATTERNS.reduce((sum, p) => sum + counts[p.key], 0);
		rows.push({
			rel,
			file,
			counts,
			rawCounts,
			aux,
			info,
			lintCount,
			total,
			exempt: hasRuleDisabled(source)
		});
	}
	return rows;
}

function moduleOf(rel) {
	const seg = rel.split('/');
	if (seg[0] === 'packages' && seg[1] === 'ui-kit') return `ui-kit/${seg[3] ?? 'other'}`;
	if (seg[0] === 'packages' && seg[1] === 'editor') {
		if (seg[2] === 'main') return 'editor/main';
		if (seg[2] === 'src') return `editor/${seg[3] ?? 'root'}`;
		return 'editor/root';
	}
	return 'other';
}

// 判断文件是否已用 oxlint-disable 块注释豁免该规则
function hasRuleDisabled(source) {
	const blockRe = /\/\* oxlint-disable((?:[^*]|\*+(?!\/))*)\*\//g;
	let m;
	while ((m = blockRe.exec(source)) !== null) {
		const names = m[1];
		if (names.trim() === '' || names.includes('no-restricted-properties')) return true;
	}
	return false;
}

function fix() {
	const dirs = [join('packages', 'editor'), join('packages', 'ui-kit')];
	const SKIP_DIR = /(?:node_modules|dist|build|out|jsons|Project|\.git)/;
	let fixed = 0;
	for (const dir of dirs) {
		const base = join(ROOT, dir);
		const walk = (p) => {
			for (const entry of readdirSync(p)) {
				const full = join(p, entry);
				if (statSync(full).isDirectory()) {
					if (!SKIP_DIR.test(entry)) walk(full);
				} else if (entry.endsWith('.ts')) {
					const rel = relative(ROOT, full).replace(/\\/g, '/');
					if (EXCLUDE_RE.test(rel)) continue;
					const source = readFileSync(full, 'utf8');
					const pat = DISABLE_COMMENT + '\n\ufeff';
					if (source.startsWith(pat)) {
						writeFileSync(
							full,
							'\ufeff' + DISABLE_COMMENT + '\n' + source.slice(pat.length)
						);
						fixed++;
					}
				}
			}
		};
		walk(base);
	}
	console.log(`fix: repaired ${fixed} file(s) with misplaced BOM.`);
}

/**
 * 权威口径：用 oxlint 的 `--report-unused-disable-directives` 判定哪些
 * `no-restricted-properties` 豁免注释**已无命中**（陈旧豁免）。
 * 返回 { stale: Set<relPath>, source: 'oxlint' | 'regex' }；oxlint 不可用时回退正则估算。
 */
function detectStaleExemptions(rows) {
	const bin = join(ROOT, 'node_modules', 'oxlint', 'bin', 'oxlint');
	if (existsSync(bin)) {
		const res = spawnSync(
			process.execPath,
			[
				bin,
				'-c',
				'.oxlintrc.json',
				'--report-unused-disable-directives',
				'--format=json',
				'packages/editor',
				'packages/ui-kit'
			],
			{ cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
		);
		const text = res.stdout ?? '';
		const m = text.match(/\{[\s\S]*\}/);
		if (m !== null) {
			try {
				const data = JSON.parse(m[0]);
				const stale = new Set();
				for (const d of data.diagnostics ?? []) {
					const file = String(d.filename ?? '');
					if (file === '') continue;
					const line = d.labels?.[0]?.span?.line ?? 1;
					let directive = '';
					try {
						directive = (
							readFileSync(join(ROOT, file), 'utf8').split('\n')[line - 1] ?? ''
						).trim();
					} catch {
						continue;
					}
					if (directive.includes('no-restricted-properties')) stale.add(file);
				}
				return { stale, source: 'oxlint' };
			} catch {
				/* 落到正则估算 */
			}
		}
	}
	// 回退：带注释且正则无命中的文件（会高估陈旧量，故在报表里标注）
	const stale = new Set(
		rows.filter((row) => row.exempt && row.lintCount === 0).map((row) => row.rel)
	);
	return { stale, source: 'regex' };
}

/**
 * 落盘目标：**本目录（`scripts/`）下那份 tracker Markdown**（**不是** `docs/`）。
 *
 * 为什么强调「不是 `docs/`」：那个目录已按收尾流程**有意删除**，而随手一次 mkdir 就能
 * 让它变回承重结构 —— 所以写盘一律落在 `scripts/`。代价是：矩阵不能再躺在文档目录里
 * 当那份「可复现的迁移矩阵」，只能靠下面两条口径补上：**数字**有真源、**明细**可复算。
 *
 * 现在的口径：
 *   - `scripts/migration-ledger-baseline.json` 是**数字**的真源（棘轮门禁靠它）；
 *   - 本函数产出的 Markdown 是**人读明细**，写进 `scripts/`，可用 `--stdout` 不落盘。
 */
function tracker() {
	const rows = scan();
	const { stale: staleSet, source: staleSource } = detectStaleExemptions(rows);
	const modules = new Map();
	let totalAnnotated = 0;
	let totalStale = 0;
	let totalDesign = 0;
	let totalTemp = 0;
	for (const row of rows) {
		const key = moduleOf(row.rel);
		if (!modules.has(key)) {
			modules.set(key, {
				total: 0,
				affected: 0,
				pending: 0,
				design: 0,
				temp: 0,
				annotated: 0,
				stale: 0,
				counts: {}
			});
		}
		const m = modules.get(key);
		m.total++;
		if (row.total > 0) m.affected++;
		const annotated = row.exempt;
		const stale = annotated && staleSet.has(row.rel);
		if (annotated) {
			m.annotated++;
			totalAnnotated++;
		}
		if (stale) {
			m.stale++;
			totalStale++;
		}
		// 待迁移命中 = 带豁免注释且仍被 oxlint 判定「指令在用」的文件
		// （无注释却命中且不在白名单的属**真迁移债**，见下方 missingAnnotation——它必须为 0）
		if (annotated && !stale) m.pending++;
		// C1：白名单分类（独立于注释，用于说明"豁免是被设计需要的"）
		if (row.total > 0 && isWhitelisted(row.rel)) {
			m.design++;
			totalDesign++;
		}
		if (row.total > 0 && TEMP_WHITELIST_COUNT > 0) {
			m.temp++;
			totalTemp++;
		}
		for (const [k, v] of Object.entries(row.counts)) m.counts[k] = (m.counts[k] ?? 0) + v;
	}
	const totalPending = [...modules.values()].reduce((sum, m) => sum + m.pending, 0);
	const missingAnnotation = rows
		.filter((row) => !row.exempt && row.lintCount > 0)
		.map((row) => row.rel);
	// oxlint 判为陈旧、但正则仍命中 → 命中出现在注释/字符串里
	const commentOnlyHits = rows.filter(
		(row) => row.exempt && staleSet.has(row.rel) && row.lintCount > 0
	).length;
	const keyWidth = Math.max(...[...modules.keys()].map((k) => k.length));
	const header = [
		'模块',
		'文件',
		'命中',
		'待迁移命中',
		'设计豁免',
		'临时豁免',
		'豁免注释',
		...PATTERNS.map((p) => p.key)
	];
	const lines = [];
	lines.push('# DOM 迁移矩阵');
	lines.push('');
	lines.push('> 由 `node scripts/dom-guard.mjs tracker` 自动生成。两个口径别混淆：');
	lines.push(
		'> `待迁移命中` = 仍真正使用受限 API（`eslint/no-restricted-properties`）的文件数——迁移债，靠豁免注释才让 `pnpm lint` 干净；'
	);
	lines.push(
		'> `豁免注释` = 仍带 `/* oxlint-disable eslint/no-restricted-properties */` 的文件数，其中一部分**已无命中**（`待迁移命中 + 陈旧豁免 = 豁免注释`）。'
	);
	lines.push('');
	lines.push(`| ${header.join(' | ')} |`);
	lines.push(`|${header.map(() => '---').join('|')}|`);
	const globalCounts = {};
	let totalFiles = 0;
	// 显式 localeCompare 比较器：`Array.prototype.sort()` 默认按 UTF-16 码元排序，
	// 对非 ASCII 的模块键（本仓库报表里是中文）顺序不稳定，也会让生成的报表 diff 抖动。
	for (const [key, m] of [...modules.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
		lines.push(
			`| ${key.padEnd(keyWidth)} | ${m.total} | ${m.affected} | ${m.pending} | ${m.design} | ${m.temp} | ${m.annotated} | ${PATTERNS.map((p) => m.counts[p.key] ?? 0).join(' | ')} |`
		);
		totalFiles += m.total;
		for (const [k, v] of Object.entries(m.counts)) globalCounts[k] = (globalCounts[k] ?? 0) + v;
	}
	lines.push(
		`| ${'合计'.padEnd(keyWidth)} | ${totalFiles} |  | ${totalPending} | ${totalDesign} | ${totalTemp} | ${totalAnnotated} | ${PATTERNS.map((p) => globalCounts[p.key] ?? 0).join(' | ')} |`
	);
	lines.push('');
	lines.push('## 口径');
	lines.push('');
	lines.push(
		`- 扫描文件：**${totalFiles}**（\`packages/editor/src\` + \`packages/ui-kit/src\`，排除 \`*.spec.ts\` / \`__tests__\` / \`.demo.vue\`）`
	);
	lines.push(
		`- 待迁移命中文件：**${totalPending}**（判定来源：oxlint \`--report-unused-disable-directives\`${staleSource === 'oxlint' ? '' : '（⚠️ oxlint 不可用，当前为**正则估算**）'}）`
	);
	lines.push(`- 豁免注释文件：**${totalAnnotated}**`);
	lines.push(
		`- 陈旧豁免文件：**${totalStale}**（注释在、命中已为 0，可直接删注释；待迁移命中 + 陈旧豁免 = 豁免注释）`
	);
	lines.push(
		`- **设计豁免文件（C1 白名单）：${totalDesign}**——按设计必须使用受限 API，已由 \`.oxlintrc.json\` 的 \`overrides\` 关掉规则、**不再需要豁免注释**（画布上下文 / 应用挂载点 / 唯一 DOM 缝隙 / index.html 外壳元素 / ui-kit 元素优先组件层）。白名单**真源是 \`.oxlintrc.json\`**，本文件不再持有副本`
	);
	lines.push(`- **临时豁免文件（有退出条件）：${totalTemp}**——已全部销账`);
	lines.push(
		`- **C1 验收口径：白名单外待迁移命中 = 待迁移命中 ${totalPending}（白名单文件不带注释）⇒ 要求 \`待迁移命中 === 0\`**`
	);
	lines.push(`- 命中落在注释/字符串（oxlint 判为陈旧但正则命中）：**${commentOnlyHits}**`);
	lines.push(
		`- **白名单外命中：${missingAnnotation.length} 个文件**——注意这**不是**迁移债。真实命中为 0（见上一条），这批文件是正则口径下仍匹配到受限 API 的文件，其中绝大多数命中落在注释/字符串里（本仓库的注释大量写有「原先 document.getElementById」这类**已迁完**的记录）。真迁移债的权威口径是 \`scripts/migration-ledger.mjs\` 的 \`dom-pending\` 轴（计数前先剥离注释、字符串与 \`.vue\` 的 template/style），当前为 **0**`
	);
	if (missingAnnotation.length > 0 && missingAnnotation.length <= 10) {
		for (const rel of missingAnnotation) lines.push(`  - \`${rel}\``);
	}
	lines.push(`- 各 API 列 = 受限 API 在**真实代码**里的出现处数（注释/字符串里的历史记录不计）`);
	const dollarFiles = rows.filter((row) => (row.counts.dollarLookup ?? 0) > 0).length;
	lines.push(
		`- **P5 轴（不在 lint 规则内，故不进入「待迁移命中」）**：\`$('#…')\` 反查 **${globalCounts.dollarLookup ?? 0}** 处 / **${dollarFiles}** 文件、\`new DOMParser()\` **${globalCounts.domParser ?? 0}** 处——前者是 element-utils 的 jQuery 风格寻址（\`packages/editor/src/utils/dom.ts\`），跟踪口径见 \`scripts/migration-ledger.mjs\``
	);
	lines.push('');
	lines.push('## 口径外的耦合（受控轴 + 覆盖面）');
	lines.push('');
	lines.push(
		"> 同属 DOM 耦合，但不在 `no-restricted-properties` 里。**第一张表已进台账棘轮**（`dom-style-writes`、`element-api-attach` 等轴），这里给人读明细；第二张表仍未门禁，只作覆盖面清单 —— 2026-09-11 的度量审计表明这类耦合最容易被漏记（`$('#id')` 就是这么发现的）。"
	);
	lines.push('');
	lines.push('### 已门禁（台账轴）');
	lines.push('');
	lines.push('| 口径键 | 类别 | 处数 | 文件数 |');
	lines.push('| --- | --- | --- | --- |');
	const auxRows = AUX_PATTERNS.map((p) => ({
		key: p.key,
		label: labelOf(p),
		count: rows.reduce((sum, row) => sum + (row.aux[p.key] ?? 0), 0),
		files: rows.filter((row) => (row.aux[p.key] ?? 0) > 0).length
	})).sort((a, b) => b.count - a.count);
	for (const row of auxRows) {
		lines.push(`| ${row.key} | ${row.label} | ${row.count} | ${row.files} |`);
	}
	lines.push('');
	lines.push('### 未门禁（覆盖面）');
	lines.push('');
	lines.push('| 口径键 | 类别 | 处数 | 文件数 |');
	lines.push('| --- | --- | --- | --- |');
	const infoRows = INFO_PATTERNS.map((p) => ({
		key: p.key,
		label: labelOf(p),
		count: rows.reduce((sum, row) => sum + (row.info[p.key] ?? 0), 0),
		files: rows.filter((row) => (row.info[p.key] ?? 0) > 0).length
	})).sort((a, b) => b.count - a.count);
	for (const row of infoRows) {
		lines.push(`| ${row.key} | ${row.label} | ${row.count} | ${row.files} |`);
	}
	lines.push('');
	lines.push('## 明细');
	lines.push('');
	lines.push('| 文件 | 模块 | 行数 | 命中 | 豁免注释 |');
	lines.push('| --- | --- | --- | --- | --- |');
	for (const row of [...rows].sort((a, b) => b.total - a.total)) {
		lines.push(
			`| ${row.rel} | ${moduleOf(row.rel)} | ${readFileSync(row.file, 'utf8').split('\n').length} | ${row.total} | ${row.exempt ? '是' : '-'} |`
		);
	}
	const summary =
		`${rows.length} files; 待迁移命中 ${totalPending}, 白名单外命中 ${missingAnnotation.length}, ` +
		`设计豁免 ${totalDesign}, 临时豁免 ${totalTemp}, 豁免注释 ${totalAnnotated}, 陈旧豁免 ${totalStale}, 来源 ${staleSource}`;
	if (process.argv.includes('--stdout')) {
		console.log(lines.join('\n'));
		return;
	}
	const outDir = join(ROOT, 'scripts');
	writeFileSync(join(outDir, 'dom-migration-tracker.md'), lines.join('\n') + '\n');
	console.log(`tracker: wrote scripts/dom-migration-tracker.md (${summary}).`);
}

const command = process.argv[2];
if (command === 'tracker') tracker();
else if (command === 'fix') fix();
else {
	console.log('usage: node scripts/dom-guard.mjs [tracker|fix]');
	process.exit(1);
}
