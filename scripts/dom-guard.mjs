#!/usr/bin/env node
// DOM 迁移守卫：扫描命令式 DOM 用法，为存量代码打豁免标记，输出迁���矩阵。
// 用法：
//   node scripts/dom-guard.mjs tracker  生成 DOM 迁移台账（白名单口径见 WHITELIST）
//   node scripts/dom-guard.mjs fix      修 BOM 错位的豁免注释（历史遗留）
//
// C1 后不再提供 exempt 子命令：受限 API 的用法只剩「迁移」或「进白名单」两条路，
// 后者由 WHITELIST / TEMP_WHITELIST + .oxlintrc.json 的 overrides 承担。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = [join('packages', 'editor', 'src'), join('packages', 'ui-kit', 'src')];
const EXTENSIONS = new Set(['.ts', '.tsx', '.vue']);
const EXCLUDE_RE = /(?:\.spec\.ts$|\.d\.ts$|\/__tests__\/|\.demo\.vue$)/;
const DISABLE_COMMENT = '/* oxlint-disable eslint/no-restricted-properties */';

/**
 * C1 白名单（设计豁免）：这些文件**按设计**必须使用受限 API，已由 `.oxlintrc.json` 的
 * `overrides` 关掉 `eslint/no-restricted-properties`，因此不再需要豁免注释。
 *
 * 口径：`待迁移命中` 只看「带豁免注释且指令仍在用」的文件；白名单文件在 C1 之后都不带注释，
 * 因此「白名单外待迁移命中 = 待迁移命中」——**C1 的验收就是 `待迁移命中 === 0`**。
 * `设计豁免` 列是另一个信息量：白名单里**正则仍命中受限 API**的文件数（说明豁免是被用到的）。
 */
const WHITELIST = [
	// A 类·真画布上下文：createElement('canvas') 取 2D/WebGL 上下文与像素读回，模板无法替代
	'packages/editor/src/engine/webgl/webgl-init.ts',
	'packages/editor/src/engine/webgl/webgl-methods.ts',
	'packages/editor/src/engine/palette/palette-engine.ts',
	'packages/editor/src/engine/scene/draw-start-position.ts',
	'packages/editor/src/printer/printer.ts',
	'packages/editor/src/audio/audio-manager.ts',
	'packages/editor/src/data/transition-window.ts',
	// 应用挂载点：Vue 的挂载容器来自 index.html，只能按 id 取一次
	'packages/editor/src/main.ts',
	// 唯一 DOM 创建/查询缝隙：$() 与 renderDetached / createDetachedElement 的实现处
	'packages/editor/src/utils/dom.ts',
	// ui-kit 侧的同类缝隙：离屏建元素收在一处（B1 收口用，组件内不再直接 document.createElement）
	'packages/ui-kit/src/utils/detached.ts',
	// index.html 外壳元素（#cursor-region），非 SFC 渲染
	'packages/editor/src/composables/usePointerObjectWindow.ts',
	// 元素优先的组件 API 层（P2b 重定义：架构性设计豁免，不以文件数归零为准）
	'packages/ui-kit/src/components/**',
	'packages/ui-kit/src/utils/radio-proxy.ts',
	// R2b 收口后的**设计豁免**：选择器式本地化器。它的职责是按语言表的键发现元素；
	// 其中 id 键的扫描面已归零（改由模板 `t()` / `v-tip` / `useLocalizedOptions` 承担），
	// 剩下的只有 18 个 `[name=…]` / `[.class]` 分组键——`name` 是组件内部的**稳定契约属性**
	// （`YMFormButtons` 的 CSS 就依赖 `button[name="confirm"]`），无法用 id/模板替代。
	'packages/editor/src/localize/dom-localizer.ts'
];

/** C1 临时豁免（有退出条件）：**已全部销账（2026-09-17）**。
 * 历史上只有一项——`localize/dom-localizer.ts`（归属 R2b）；R2b 的可量化目标达成后
 * 已转为设计豁免，见上方 WHITELIST 的说明。保留空数组是为了让「临时豁免」这一档仍然可见。 */
const TEMP_WHITELIST = [];

const globToRegExp = (pattern) => {
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
	const body = escaped.replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
	return new RegExp(`^${body}$`);
};
const WHITELIST_RES = WHITELIST.map(globToRegExp);
const TEMP_WHITELIST_RES = TEMP_WHITELIST.map(globToRegExp);
const isWhitelisted = (rel) => WHITELIST_RES.some((re) => re.test(rel));
const isTempWhitelisted = (rel) => TEMP_WHITELIST_RES.some((re) => re.test(rel));

const PATTERNS = [
	// 受限 API 按「属性访问」计数：与 .oxlintrc.json 的 no-restricted-properties 对齐，
	// 不能要求后面紧跟 '('——`document.querySelector<HTMLElement>(...)` 这类带类型实参的写法会漏计。
	{ key: 'getElementById', re: /document\s*\.\s*getElementById\b/g, lint: true },
	{ key: 'querySelector', re: /document\s*\.\s*querySelector(?:All)?\b/g, lint: true },
	{ key: 'getElementsByClass', re: /document\s*\.\s*getElementsByClassName\b/g, lint: true },
	{ key: 'getElementsByName', re: /document\s*\.\s*getElementsByName\b/g, lint: true },
	{ key: 'getElementsByTag', re: /document\s*\.\s*getElementsByTagName\b/g, lint: true },
	{ key: 'createElement', re: /document\s*\.\s*createElement\b/g, lint: true },
	{ key: 'appendChild', re: /\.appendChild\s*\(/g },
	{ key: 'removeChild', re: /\.removeChild\s*\(/g },
	{ key: 'insertBefore', re: /\.insertBefore\s*\(/g },
	{ key: 'parentNode', re: /\.parentNode\b/g },
	{ key: 'innerHTML', re: /\.innerHTML\b/g },
	{ key: 'addEventListener', re: /\.addEventListener\s*\(/g },
	{ key: 'dispatchEvent', re: /\.dispatchEvent\s*\(/g },
	// P5 尾巴：element-utils 的 jQuery 风格寻址（utils/dom.ts L147-157 的 `$`）
	// 与字符串模板建 DOM——都不在 lint 规则内，但同属待迁移的 DOM 耦合，故单列计数。
	{ key: 'dollarLookup', re: /\$\(\s*['"\u0060]#/g },
	{ key: 'domParser', re: /new DOMParser\(\)/g },
	{ key: 'protoExt', re: /(?:HTMLElement|Element|ChildNode|ParentNode)\.prototype\./g }
];

// 辅助口径：同属 DOM 耦合、但既不在 lint 规则内、也不进每模块列（避免表过宽）。
// 只作「覆盖面清单」报告——2026-09-11 的度量审计显示这类耦合容易被漏记（`$('#id')` 就是这么发现的）。
const AUX_PATTERNS = [
	{ key: 'textContent 赋值', re: /\.textContent\s*=/g },
	{ key: 'classList.add/remove/toggle', re: /\.classList\.(?:add|remove|toggle)\(/g },
	{ key: 'style.* 赋值', re: /\.style\.[A-Za-z]+\s*=/g },
	{ key: '.children 遍历', re: /\.children\b/g },
	{ key: 'clientWidth/Height 读', re: /\.(?:clientWidth|clientHeight)\b/g },
	{ key: 'scrollTop 写', re: /\.scrollTop\s*=/g },
	{ key: 'parentElement', re: /\.parentElement\b/g },
	{ key: 'closest()', re: /\.closest\(/g },
	{ key: 'next/prevElementSibling', re: /\.(?:next|previous)ElementSibling\b/g },
	{ key: 'element.append/prepend', re: /\.(?:append|prepend)\(/g },
	{ key: 'nodeValue 赋值', re: /\.nodeValue\s*=/g },
	{ key: 'offsetWidth/Height 读', re: /\.(?:offsetWidth|offsetHeight)\b/g },
	{ key: 'getComputedStyle', re: /getComputedStyle\(/g },
	{ key: 'innerHTML 赋值', re: /\.innerHTML\s*=/g },
	{ key: 'replaceChildren/insertAdjacentHTML/matches()', re: /\.(?:replaceChildren|insertAdjacentHTML|matches)\(/g },
	{ key: 'customElements.define / attachShadow', re: /(?:customElements\.define|\.attachShadow)\(/g },
	// 原型**访问器**定义（`Object.defineProperty(HTMLElement.prototype, field, …)`）——
	// protoExt 列要求 `prototype.`，这种"逗号形式"会被漏掉，故单列（2026-09-11 发现）。
	{ key: 'prototype 访问器定义（逗号形式）', re: /(?:Object\.defineProperty|Object\.setPrototypeOf)\(\s*(?:HTMLElement|Element|ChildNode|ParentNode)\.prototype/g },
	// 覆盖面审计补充轴（2026-09-11）：class 当状态读、属性当状态、data-* 当状态
	{ key: 'hasClass() 读 class 当状态', re: /\bhasClass\(/g },
	{ key: 'get/set/removeAttribute', re: /\.(?:get|set|remove)Attribute\(/g },
	{ key: 'dataset.* 状态（R-8 监测位）', re: /\.dataset\b/g }
];

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

function countMatches(source, re) {
	re.lastIndex = 0;
	let count = 0;
	while (re.exec(source) !== null) count++;
	return count;
}

function scan() {
	const rows = [];
	for (const file of collectFiles()) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		const source = readFileSync(file, 'utf8');
		const counts = {};
		for (const p of PATTERNS) counts[p.key] = countMatches(source, p.re);
		const aux = {};
		for (const p of AUX_PATTERNS) aux[p.key] = countMatches(source, p.re);
		const lintCount = PATTERNS.filter((p) => p.lint).reduce((sum, p) => sum + counts[p.key], 0);
		const total = PATTERNS.reduce((sum, p) => sum + counts[p.key], 0);
		rows.push({ rel, file, counts, aux, lintCount, total, exempt: hasRuleDisabled(source) });
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
				} else if (/\.ts$/.test(entry)) {
					const rel = relative(ROOT, full).replace(/\\/g, '/');
					if (EXCLUDE_RE.test(rel)) continue;
					const source = readFileSync(full, 'utf8');
					const pat = DISABLE_COMMENT + '\n\ufeff';
					if (source.startsWith(pat)) {
						writeFileSync(full, '\ufeff' + DISABLE_COMMENT + '\n' + source.slice(pat.length));
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
			[bin, '-c', '.oxlintrc.json', '--report-unused-disable-directives', '--format=json', 'packages/editor', 'packages/ui-kit'],
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
						directive = (readFileSync(join(ROOT, file), 'utf8').split('\n')[line - 1] ?? '').trim();
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
	const stale = new Set(rows.filter((row) => row.exempt && row.lintCount === 0).map((row) => row.rel));
	return { stale, source: 'regex' };
}

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
		// （无注释却正则命中的属正则误报，见口径区，不计入）
		if (annotated && !stale) m.pending++;
		// C1：白名单分类（独立于注释，用于说明"豁免是被设计需要的"）
		if (row.lintCount > 0 && isWhitelisted(row.rel)) {
			m.design++;
			totalDesign++;
		}
		if (row.lintCount > 0 && isTempWhitelisted(row.rel)) {
			m.temp++;
			totalTemp++;
		}
		for (const [k, v] of Object.entries(row.counts)) m.counts[k] = (m.counts[k] ?? 0) + v;
	}
	const totalPending = [...modules.values()].reduce((sum, m) => sum + m.pending, 0);
	const missingAnnotation = rows.filter((row) => !row.exempt && row.lintCount > 0).map((row) => row.rel);
	// oxlint 判为陈旧、但正则仍命中 → 命中出现在注释/字符串里
	const commentOnlyHits = rows.filter((row) => row.exempt && staleSet.has(row.rel) && row.lintCount > 0).length;
	const keyWidth = Math.max(...[...modules.keys()].map((k) => k.length));
	const header = ['模块', '文件', '命中', '待迁移命中', '设计豁免', '临时豁免', '豁免注释', ...PATTERNS.map((p) => p.key)];
	const lines = [];
	lines.push('# DOM 迁移矩阵');
	lines.push('');
	lines.push('> 由 `node scripts/dom-guard.mjs tracker` 自动生成。两个口径别混淆：');
	lines.push('> `待迁移命中` = 仍真正使用受限 API（`eslint/no-restricted-properties`）的文件数——迁移债，靠豁免注释才让 `pnpm lint` 干净；');
	lines.push('> `豁免注释` = 仍带 `/* oxlint-disable eslint/no-restricted-properties */` 的文件数，其中一部分**已无命中**（`待迁移命中 + 陈旧豁免 = 豁免注释`）。');
	lines.push('');
	lines.push(`| ${header.join(' | ')} |`);
	lines.push(`|${header.map(() => '---').join('|')}|`);
	const globalCounts = {};
	let totalFiles = 0;
	for (const [key, m] of [...modules.entries()].sort()) {
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
	lines.push(`- 扫描文件：**${totalFiles}**（\`packages/editor/src\` + \`packages/ui-kit/src\`，排除 \`*.spec.ts\` / \`__tests__\` / \`.demo.vue\`）`);
	lines.push(`- 待迁移命中文件：**${totalPending}**（判定来源：oxlint \`--report-unused-disable-directives\`${staleSource === 'oxlint' ? '' : '（⚠️ oxlint 不可用，当前为**正则估算**）'}）`);
	lines.push(`- 豁免注释文件：**${totalAnnotated}**`);
	lines.push(`- 陈旧豁免文件：**${totalStale}**（注释在、命中已为 0，可直接删注释；待迁移命中 + 陈旧豁免 = 豁免注释）`);
	lines.push(
		`- **设计豁免文件（C1 白名单）：${totalDesign}**——按设计必须使用受限 API，已由 \`.oxlintrc.json\` 的 \`overrides\` 关掉规则、**不再需要豁免注释**（画布上下文 / 应用挂载点 / 唯一 DOM 缝隙 / index.html 外壳元素 / ui-kit 元素优先组件层）`
	);
	lines.push(
		`- **临时豁免文件（有退出条件）：${totalTemp}**——归属别的任务线，见 [remaining-work.md](./remaining-work.md) C1 白名单表`
	);
	lines.push(
		`- **C1 验收口径：白名单外待迁移命中 = 待迁移命中 ${totalPending} − 0（白名单文件不带注释）⇒ 要求 \`待迁移命中 === 0\`**`
	);
	lines.push(`- 命中落在注释/字符串（oxlint 判为陈旧但正则命中）：**${commentOnlyHits}**`);
	lines.push(`- 正则命中但无豁免注释：**${missingAnnotation.length}**（\`pnpm lint\` 干净 ⇒ 这些是**正则误报**；迁移债以「带注释且非陈旧」为准）`);
	if (missingAnnotation.length > 0 && missingAnnotation.length <= 5) {
		for (const rel of missingAnnotation) lines.push(`  - \`${rel}\``);
	}
	lines.push(`- 各 API 列 = 属性访问的**出现处数**（正则计数，含注释/字符串中的出现，只作趋势参考）`);
	const dollarFiles = rows.filter((row) => (row.counts.dollarLookup ?? 0) > 0).length;
	lines.push(
		`- **P5 轴（不在 lint 规则内，故不进入「待迁移命中」）**：\`$('#…')\` 反查 **${globalCounts.dollarLookup ?? 0}** 处 / **${dollarFiles}** 文件、\`new DOMParser()\` **${globalCounts.domParser ?? 0}** 处——前者是 element-utils 的 jQuery 风格寻址（\`packages/editor/src/utils/dom.ts\` L147-157），阶段 4 列为改造项但仍在，见 [remaining-work.md](./remaining-work.md) P5b`
	);
	lines.push('');
	lines.push('## 辅助口径（未门禁，仅计数）');
	lines.push('');
	lines.push('> 同属 DOM 耦合，但既不在 lint 规则内、也不进每模块列（避免表过宽）。**只作覆盖面清单**——2026-09-11 的度量审计表明这类耦合最容易被漏记（`$(\'#id\')` 就是这么发现的）。');
	lines.push('');
	lines.push('| 类别 | 处数 | 文件数 |');
	lines.push('| --- | --- | --- |');
	const auxRows = AUX_PATTERNS.map((p) => ({
		key: p.key,
		count: rows.reduce((sum, row) => sum + (row.aux[p.key] ?? 0), 0),
		files: rows.filter((row) => (row.aux[p.key] ?? 0) > 0).length
	})).sort((a, b) => b.count - a.count);
	for (const row of auxRows) {
		lines.push(`| ${row.key} | ${row.count} | ${row.files} |`);
	}
	lines.push('');
	lines.push('## 明细');
	lines.push('');
	lines.push('| 文件 | 行数 | 命中 | 豁免注释 |');
	lines.push('| --- | --- | --- | --- |');
	for (const row of [...rows].sort((a, b) => b.total - a.total)) {
		lines.push(`| ${row.rel} | ${readFileSync(row.file, 'utf8').split('\n').length} | ${row.total} | ${row.exempt ? '是' : '-'} |`);
	}
	const out = join(ROOT, 'docs');
	// 「docs/ 可以被删除」是 P15 收尾的验收之一：目录已经不存在时**不要再创建它**。
	// 旧行为是 `mkdirSync(recursive)`——那样删掉文档后随手跑一次 tracker，docs/ 又变回承重结构。
	if (!existsSync(out)) {
		console.log(
			`tracker: docs/ 不存在，跳过写出（${rows.length} files; 待迁移命中 ${totalPending}, 设计豁免 ${totalDesign}, 临时豁免 ${totalTemp}, 豁免注释 ${totalAnnotated}, 陈旧豁免 ${totalStale}, 来源 ${staleSource}）。`
		);
		return;
	}
	writeFileSync(join(out, 'dom-migration-tracker.md'), lines.join('\n') + '\n');
	console.log(
		`tracker: wrote DOM 迁移台账 (${rows.length} files; 待迁移命中 ${totalPending}, 设计豁免 ${totalDesign}, 临时豁免 ${totalTemp}, 豁免注释 ${totalAnnotated}, 陈旧豁免 ${totalStale}, 来源 ${staleSource}).`
	);
}

const command = process.argv[2];
if (command === 'tracker') tracker();
else if (command === 'fix') fix();
else {
	console.log('usage: node scripts/dom-guard.mjs [tracker|fix]');
	process.exit(1);
}