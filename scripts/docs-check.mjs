#!/usr/bin/env node
// 文档一致性检查：把 docs/*.md 里"可验证的声明"与当前代码对账，防止计划文档漂移。
//
// 用法：
//   node scripts/docs-check.mjs            校验（失败退出码 1）
//   node scripts/docs-check.mjs --verbose  额外打印通过项计数
//
// 检查项：
//   1) 相对 Markdown 链接的目标文件存在；
//   2) 文档中出现的 `packages/` `scripts/` `docs/` 前缀路径存在
//      （`scripts/x` 允许解析为 packages/*/scripts/x）；
//   3) 文档中提到的 `*.spec.ts` 文件在仓库中存在；
//   4) 文档引用的 DOM 扫描口径与**当前代码**一致，且与
//      docs/dom-migration-tracker.md 的合计行一致。
//
// 不检查（需实跑）：测试用例数、真机冒烟结论、构建产物。
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');
const DOCS_DIR = join(ROOT, 'docs');

// 与 packages 内代码扫描保持一致（同 scripts/dom-guard.mjs）
// 受限 API 按「属性访问」计数——`document.querySelector<T>(...)` 这类带类型实参的写法也要计入
const SCAN_DIRS = [join('packages', 'editor', 'src'), join('packages', 'ui-kit', 'src')];
const EXTENSIONS = new Set(['.ts', '.tsx', '.vue']);
const EXCLUDE_RE = /(?:\.spec\.ts$|\.d\.ts$|\/__tests__\/|\.demo\.vue$)/;
const LINT_PATTERNS = [
	/document\s*\.\s*getElementById\b/g,
	/document\s*\.\s*querySelector(?:All)?\b/g,
	/document\s*\.\s*getElementsByClassName\b/g,
	/document\s*\.\s*getElementsByName\b/g,
	/document\s*\.\s*getElementsByTagName\b/g,
	/document\s*\.\s*createElement\b/g
];
const METRIC_PATTERNS = {
	getElementById: /document\s*\.\s*getElementById\b/g,
	createElement: /document\s*\.\s*createElement\b/g,
	appendChild: /\.appendChild\s*\(/g,
	addEventListener: /\.addEventListener\s*\(/g,
	// P5 轴：element-utils 的 `$('#id')` 寻址与字符串模板建 DOM（不在 lint 规则内，单列计数）
	dollarLookup: /\$\(\s*['"\u0060]#/g,
	domParser: /new DOMParser\(\)/g
};

const problems = [];
const notes = [];
let checked = { links: 0, paths: 0, specs: 0 };
/** 文档里表示「已删除/已移除」的措辞：命中的行内引用的 spec 视为历史记录 */
const REMOVED_RE = /删除|移除|已删|revert|removed/;

function fail(message) {
	problems.push(message);
}

function countMatches(source, re) {
	re.lastIndex = 0;
	let count = 0;
	while (re.exec(source) !== null) count++;
	return count;
}

function walkFiles(base, filter, out = []) {
	if (!existsSync(base)) return out;
	for (const entry of readdirSync(base)) {
		const full = join(base, entry);
		if (statSync(full).isDirectory()) {
			if (entry === 'node_modules' || entry === 'dist' || entry === 'build') continue;
			walkFiles(full, filter, out);
		} else if (filter(full)) {
			out.push(full);
		}
	}
	return out;
}

/** 扫描当前代码，得到文档引用的口径数字 */
function scanCode() {
	const metrics = {
		files: 0,
		annotated: 0,
		regexHitFiles: 0,
		regexFalsePositive: 0,
		getElementById: 0,
		createElement: 0,
		appendChild: 0,
		addEventListener: 0,
		dollarLookup: 0,
		domParser: 0
	};
	for (const dir of SCAN_DIRS) {
		const base = join(ROOT, dir);
		if (!existsSync(base)) continue;
		for (const file of walkFiles(base, (full) => EXTENSIONS.has(full.slice(full.lastIndexOf('.'))))) {
			const rel = relative(ROOT, file).replace(/\\/g, '/');
			if (EXCLUDE_RE.test(rel)) continue;
			const source = readFileSync(file, 'utf8');
			metrics.files++;
			let lintHits = 0;
			for (const re of LINT_PATTERNS) lintHits += countMatches(source, re);
			const annotated = hasRuleDisabled(source);
			if (annotated) metrics.annotated++;
			if (lintHits > 0) {
				metrics.regexHitFiles++;
				// 无豁免注释却有正则命中 → oxlint 未报错，说明命中落在注释/字符串里（正则误报）
				if (!annotated) metrics.regexFalsePositive++;
			}
			for (const [key, re] of Object.entries(METRIC_PATTERNS)) metrics[key] += countMatches(source, re);
		}
	}
	return metrics;
}

function docFiles() {
	return readdirSync(DOCS_DIR)
		.filter((name) => name.endsWith('.md'))
		.map((name) => join(DOCS_DIR, name));
}

function readDoc(file) {
	return readFileSync(file, 'utf8').split('\n');
}

/** 解析路径记号：先按仓库根解析，再尝试 packages/<pkg>/ 前缀（文档常写 scripts/x） */
function resolvePath(token) {
	if (existsSync(join(ROOT, token))) return true;
	if (token.startsWith('scripts/') || token.startsWith('docs/')) {
		const packagesDir = join(ROOT, 'packages');
		if (existsSync(packagesDir)) {
			for (const pkg of readdirSync(packagesDir)) {
				if (existsSync(join(packagesDir, pkg, token))) return true;
			}
		}
	}
	return false;
}

function checkLinks(files) {
	const linkRe = /\]\((?!https?:|mailto:|#)([^)\s]+)\)/g;
	for (const file of files) {
		const lines = readDoc(file);
		lines.forEach((line, index) => {
			linkRe.lastIndex = 0;
			let m;
			while ((m = linkRe.exec(line)) !== null) {
				const target = m[1].split('#')[0];
				if (target === '') continue;
				checked.links++;
				const resolved = join(dirname(file), target);
				if (!existsSync(resolved)) {
					fail(`${relative(ROOT, file).replace(/\\/g, '/')}:${index + 1} 链接目标不存在 → ${target}`);
				}
			}
		});
	}
}

function checkPaths(files) {
	const pathRe = /\b((?:packages|scripts|docs)\/[\w./-]+\.(?:json|mjs|tsx|ts|vue|js|md|css|html))/g;
	const reported = new Set();
	for (const file of files) {
		const lines = readDoc(file);
		lines.forEach((line, index) => {
			pathRe.lastIndex = 0;
			let m;
			while ((m = pathRe.exec(line)) !== null) {
				const token = m[1];
				if (token.includes('*') || token.includes('{')) continue;
				checked.paths++;
				if (resolvePath(token)) continue;
				const key = `${token}`;
				if (reported.has(key)) continue;
				reported.add(key);
				fail(`${relative(ROOT, file).replace(/\\/g, '/')}:${index + 1} 引用的路径不存在 → ${token}`);
			}
		});
	}
}

/** 文档里被明确标注为「删除/移除/revert」的 spec 名（跨文档汇总，视为历史记录） */
function declaredRemovedSpecs(files) {
	const removed = new Set();
	const specRe = /\b([\w.-]+\.spec\.ts)\b/g;
	for (const file of files) {
		for (const line of readDoc(file)) {
			if (!REMOVED_RE.test(line)) continue;
			for (const m of line.matchAll(specRe)) removed.add(m[1]);
		}
	}
	return removed;
}

function checkSpecs(files, declaredRemoved) {
	const specIndex = new Set(
		walkFiles(join(ROOT, 'packages'), (full) => full.endsWith('.spec.ts')).map((full) =>
			full.split(/[\\/]/).pop()
		)
	);
	const specRe = /\b([\w.-]+\.spec\.ts)\b/g;
	const reported = new Set();
	for (const file of files) {
		const lines = readDoc(file);
		const missingNames = new Map(); // name -> 行号（首次出现）
		lines.forEach((line, index) => {
			specRe.lastIndex = 0;
			let m;
			while ((m = specRe.exec(line)) !== null) {
				const name = m[1];
				checked.specs++;
				if (specIndex.has(name)) continue;
				if (!missingNames.has(name)) missingNames.set(name, index + 1);
			}
		});
		for (const [name, index] of missingNames) {
			// 文档在别处明确写了「删除/移除/revert」该 spec → 视为历史记录，不算漂移
			if (declaredRemoved.has(name)) {
				notes.push(`${relative(ROOT, file).replace(/\\/g, '/')}:${index} 历史引用（已删除的 spec）→ ${name}`);
				continue;
			}
			if (reported.has(name)) continue;
			reported.add(name);
			fail(`${relative(ROOT, file).replace(/\\/g, '/')}:${index} 提到的 spec 文件不存在 → ${name}`);
		}
	}
}

/** 与 scripts/dom-guard.mjs#hasRuleDisabled 一致：文件是否带 no-restricted-properties 豁免注释 */
function hasRuleDisabled(source) {
	const blockRe = /\/\* oxlint-disable((?:[^*]|\*+(?!\/))*)\*\//g;
	let m;
	while ((m = blockRe.exec(source)) !== null) {
		const names = m[1];
		if (names.trim() === '' || names.includes('no-restricted-properties')) return true;
	}
	return false;
}

/** docs/dom-migration-tracker.md 合计行 + 口径区（按表头列名/文案取值，避免列序变化出错） */
function trackerTotals() {
	const file = join(DOCS_DIR, 'dom-migration-tracker.md');
	if (!existsSync(file)) return null;
	const lines = readDoc(file);
	const headerIndex = lines.findIndex((line) => line.startsWith('| 模块'));
	const totalIndex = lines.findIndex((line) => line.startsWith('| 合计'));
	if (headerIndex < 0 || totalIndex < 0) return null;
	const header = lines[headerIndex].split('|').map((c) => c.trim());
	const cells = lines[totalIndex].split('|').map((c) => c.trim());
	const pick = (name) => {
		const index = header.indexOf(name);
		if (index < 0) return undefined;
		const value = Number(cells[index]);
		return Number.isFinite(value) ? value : undefined;
	};
	const text = lines.join('\n');
	const grab = (re) => {
		const m = re.exec(text);
		return m === null ? undefined : Number(m[1]);
	};
	return {
		files: pick('文件'),
		exempt: pick('待迁移命中'),
		getElementById: pick('getElementById'),
		createElement: pick('createElement'),
		appendChild: pick('appendChild'),
		addEventListener: pick('addEventListener'),
		annotated: grab(/豁免注释文件：\*\*(\d+)\*\*/),
		stale: grab(/陈旧豁免文件：\*\*(\d+)\*\*/),
		commentOnlyHits: grab(/命中落在注释\/字符串[^：]*：\*\*(\d+)\*\*/),
		regexFalsePositive: grab(/正则命中但无豁免注释：\*\*(\d+)\*\*/),
		dollarLookup: pick('dollarLookup'),
		domParser: pick('domParser')
	};
}

/** docs/vue3-migration-plan.md「一、现状总览」表 */
function planTotals() {
	const file = join(DOCS_DIR, 'vue3-migration-plan.md');
	if (!existsSync(file)) return null;
	const metrics = {};
	const labels = {
		扫描文件总数: 'files',
		待迁移命中: 'exempt',
		带豁免注释文件: 'annotated',
		其中陈旧豁免: 'stale',
		'`getElementById`': 'getElementById',
		'`document.createElement`': 'createElement',
		'`appendChild`': 'appendChild',
		'`addEventListener`': 'addEventListener',
		反查处数: 'dollarLookup',
		'处数（字符串模板建 DOM）': 'domParser'
	};
	for (const line of readDoc(file)) {
		if (!line.startsWith('|')) continue;
		const cells = line.split('|').map((c) => c.trim());
		if (cells.length < 4) continue;
		for (const [label, key] of Object.entries(labels)) {
			if (cells[1].includes(label.replaceAll('`', ''))) {
				const value = Number(/(\d+)/.exec(cells[2])?.[1]);
				if (Number.isFinite(value) && metrics[key] === undefined) metrics[key] = value;
			}
		}
	}
	return Object.keys(metrics).length > 0 ? metrics : null;
}

/** docs/README.md 当前快照行 */
function readmeTotals() {
	const file = join(DOCS_DIR, 'README.md');
	if (!existsSync(file)) return null;
	const src = readFileSync(file, 'utf8');
	const grab = (re) => {
		const m = re.exec(src);
		return m === null ? undefined : Number(m[1]);
	};
	const metrics = {
		files: grab(/文件\s*\*{0,2}(\d+)\*{0,2}\s*[；;]/),
		exempt: grab(/待迁移命中\s*\*{0,2}(\d+)/),
		annotated: grab(/豁免注释\s*\*{0,2}(\d+)/),
		stale: grab(/陈旧豁免\s*\*{0,2}(\d+)/),
		getElementById: grab(/`getElementById`\s*\*{0,2}(\d+)/),
		createElement: grab(/`createElement`\s*\*{0,2}(\d+)/),
		appendChild: grab(/`appendChild`\s*\*{0,2}(\d+)/),
		addEventListener: grab(/`addEventListener`\s*\*{0,2}(\d+)/),
		dollarLookup: grab(/反查\s*\*{0,2}(\d+)\s*处/),
		domParser: grab(/`new DOMParser\(\)`\s*\*{0,2}(\d+)\s*处/)
	};
	return Object.values(metrics).every((v) => v !== undefined) ? metrics : null;
}

function compareMetrics(label, expected, actual) {
	if (expected === null || expected === undefined) {
		notes.push(`${label}: 未找到可比对的数字（跳过大口径核对）`);
		return;
	}
	for (const [key, value] of Object.entries(expected)) {
		if (value === undefined) continue;
		if (actual[key] !== value) {
			fail(`${label} 口径不一致：${key} 文档写 ${value}，当前为 ${actual[key]}`);
		}
	}
}

/**
 * docs/remaining-work.md：速览表条目 ID 与明细小节必须一一对应。
 * 规则：速览表每行首列是 ID（`| T5b | ... |`），明细用 `## <ID> — 标题`。
 */
function checkChecklist() {
	const file = join(DOCS_DIR, 'remaining-work.md');
	if (!existsSync(file)) {
		notes.push('docs/remaining-work.md: 不存在（跳过清单结构检查）');
		return;
	}
	const lines = readDoc(file);
	const tableIds = new Set();
	const sectionIds = new Set();
	let inOverview = false;
	for (const line of lines) {
		if (line.startsWith('## ')) {
			inOverview = line.includes('速览');
			const m = /^##\s+([A-Za-z][\w.]*)\s*[—－-]/.exec(line);
			if (m !== null) sectionIds.add(m[1]);
			continue;
		}
		if (!inOverview || !line.startsWith('|')) continue;
		const id = line.split('|')[1]?.trim();
		if (id === undefined || id === 'ID' || /^-+$/.test(id)) continue; // 表头 / 分隔行
		if (/^[A-Za-z][\w.]*$/.test(id)) tableIds.add(id);
	}
	if (tableIds.size === 0) {
		fail('docs/remaining-work.md「速览」表未解析到条目 ID（格式应为 `| ID | 事项 | ... |`）');
		return;
	}
	for (const id of tableIds) {
		if (!sectionIds.has(id)) fail(`docs/remaining-work.md 速览表条目 ${id} 缺少对应明细小节（## ${id} — ...）`);
	}
	for (const id of sectionIds) {
		if (!tableIds.has(id)) fail(`docs/remaining-work.md 明细小节 ${id} 未登记在速览表`);
	}
	notes.push(`docs/remaining-work.md: 清单结构一致（${tableIds.size} 条）`);
}

/**
 * 同文档内部章节引用必须能落到标题上：
 *   `见 2.4` / `见 2.4 节` / `见第 3 节` / `见附录 B`
 * 含 `.md` 的行视为跨文档引用（如「见 layout-vue-plan.md 附录 B」），只记 note 不判失败。
 */
function checkSectionRefs(files) {
	for (const file of files) {
		const lines = readDoc(file);
		const headings = new Set();
		for (const line of lines) {
			const num = /^#{2,3}\s+(\d+(?:\.\d+)*)[.\s]/.exec(line);
			if (num !== null) headings.add(num[1]);
			const apx = /^##\s+附录\s*([A-F])/.exec(line);
			if (apx !== null) headings.add(`附录${apx[1]}`);
		}
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		lines.forEach((line, index) => {
			if (line.includes('.md')) return; // 跨文档引用
			const refs = new Set();
			for (const m of line.matchAll(/见\s*(\d+\.\d+)/g)) refs.add(m[1]);
			for (const m of line.matchAll(/见\s*(?:第\s*)?(\d+)\s*节/g)) refs.add(m[1]);
			for (const m of line.matchAll(/见\s*附录\s*([A-F])/g)) refs.add(`附录${m[1]}`);
			for (const ref of refs) {
				if (!headings.has(ref)) fail(`${rel}:${index + 1} 引用的章节不存在 → 见 ${ref}`);
			}
		});
	}
}

/**
 * 测试基线跨文档一致：所有出现「<组件> N 文件 P/P」的**当前基线**行必须给出同一组数字。
 * 只认这种固定写法，历史进展条目里的「editor 全量 1871/1871」不会被卷入。
 */
function checkTestBaseline(files) {
	const re = /(ui-kit|editor)\s+(\d+)\s*文件\s*\*{0,2}(\d+)\/(\d+)/g;
	const seen = new Map(); // component -> Map<value, Set<doc>>
	for (const file of files) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		for (const line of readDoc(file)) {
			if (!line.includes('测试基线')) continue;
			// 进展记录是追加式的历史快照（`- 2026-…` 开头），不参与"当前基线"一致性判定
			if (/^-\s*20\d\d-\d\d-\d\d/.test(line)) continue;
			re.lastIndex = 0;
			let m;
			while ((m = re.exec(line)) !== null) {
				const [, component, filesCount, passed, total] = m;
				const value = `${filesCount} 文件 ${passed}/${total}`;
				if (!seen.has(component)) seen.set(component, new Map());
				const byValue = seen.get(component);
				if (!byValue.has(value)) byValue.set(value, new Set());
				byValue.get(value).add(rel);
			}
		}
	}
	for (const [component, byValue] of seen) {
		if (byValue.size > 1) {
			const detail = [...byValue.entries()].map(([v, docs]) => `${v}（${[...docs].join(', ')}）`).join(' vs ');
			fail(`测试基线跨文档不一致：${component} → ${detail}`);
		}
	}
	if (seen.size > 0) {
		const summary = [...seen.entries()].map(([c, v]) => `${c} ${[...v.keys()][0]}`).join('；');
		notes.push(`测试基线一致：${summary}`);
	}
}

/**
 * 本地化器键数：语言文件 `Project/Locales/en-US.English.json` 的 `components` 键数
 * 与文档里「`components` … **N**」的声明必须一致（R2b 的规模基线）。
 */
function checkLocalizerKeys(files) {
	const localeFile = join(ROOT, 'packages', 'editor', 'Project', 'Locales', 'en-US.English.json');
	if (!existsSync(localeFile)) {
		notes.push('本地化语言文件不存在（跳过 components 键数核对）');
		return;
	}
	let count;
	try {
		count = Object.keys(JSON.parse(readFileSync(localeFile, 'utf8')).components ?? {}).length;
	} catch {
		notes.push('本地化语言文件解析失败（跳过 components 键数核对）');
		return;
	}
	const re = /`components`[^\n]{0,60}?\*\*(\d+)\*\*/g;
	let declared = 0;
	for (const file of files) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		readDoc(file).forEach((line, index) => {
			if (/^-\s*20\d\d-\d\d-\d\d/.test(line)) return; // 历史进展条目不参与
			re.lastIndex = 0;
			let m;
			while ((m = re.exec(line)) !== null) {
				declared++;
				if (Number(m[1]) !== count) {
					fail(`${rel}:${index + 1} 本地化 components 键数不符：文档写 ${m[1]}，实际 ${count}`);
				}
			}
		});
	}
	if (declared > 0) notes.push(`本地化 components 键数一致（${count}）`);
}

/**
 * ui-kit 元素 API 文件数：文档里「`*-api.ts` … **N**」的声明必须等于磁盘上的实际文件数
 * （阶段 2 的验收目标是 0，见 P2b）。
 */
function checkApiFileCount(files) {
	const dir = join(ROOT, 'packages', 'ui-kit', 'src');
	if (!existsSync(dir)) {
		notes.push('ui-kit src 不存在（跳过 *-api.ts 计数核对）');
		return;
	}
	let count = 0;
	for (const full of walkFiles(dir, () => true)) {
		const rel = relative(ROOT, full).replace(/\\/g, '/');
		if (rel.includes('/__tests__/')) continue;
		if (rel.endsWith('-api.ts')) count++;
	}
	const re = /`\*-api\.ts`[^\n]{0,60}?\*\*(\d+)\*\*/g;
	let declared = 0;
	for (const file of files) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		readDoc(file).forEach((line, index) => {
			if (/^-\s*20\d\d-\d\d-\d\d/.test(line)) return; // 历史进展条目不参与
			re.lastIndex = 0;
			let m;
			while ((m = re.exec(line)) !== null) {
				declared++;
				if (Number(m[1]) !== count) {
					fail(`${rel}:${index + 1} ui-kit \`*-api.ts\` 文件数不符：文档写 ${m[1]}，实际 ${count}`);
				}
			}
		});
	}
	if (declared > 0) notes.push(`ui-kit *-api.ts 文件数一致（${count}，目标：不增长）`);
}

/**
 * P4b 原型访问器门禁（**双向**）。
 *
 * P4b 收口前：`utils/element-data.ts` 里有 `DATA_FIELDS` + `defineDataAccessors()`，
 * 本项核对「字段数与文档里『`DATA_FIELDS` … **N**』的**当前**口径声明一致」。
 * P4b 收口后（2026-09-16 起）：两者都**不允许再出现**，本项转为回归门禁——
 * 代码里若又冒出 `DATA_FIELDS`/`defineDataAccessors`/`HTMLElement.prototype` 安装，
 * 或者文档仍在宣称"还有 N 个字段"，都会失败。
 *
 * 实现于 2026-09-12 的 P4b 第四刀从 editor 迁到 **ui-kit**（editor 侧变成同路径再导出），
 * 于是这里必须按候选路径找——只认 editor 那份会让本项**静默跳过**（曾经如此）。
 */
function checkPrototypeFields(files) {
	const candidates = [
		join(ROOT, 'packages', 'ui-kit', 'src', 'utils', 'element-data.ts'),
		join(ROOT, 'packages', 'editor', 'src', 'utils', 'element-data.ts')
	];
	const target = candidates.find((p) => existsSync(p));
	if (target === undefined) {
		notes.push('element-data.ts 不存在（跳过原型访问器门禁）');
		return;
	}
	const source = readFileSync(target, 'utf8');
	const block = /const DATA_FIELDS = \[([\s\S]*?)\]\s*as const;/.exec(source);
	const installsAccessors = /Object\.defineProperty\(\s*HTMLElement\.prototype/.test(source);
	const count =
		block === null
			? 0
			: block[1]
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => /^'[\w$]+',?$/.test(line)).length;
	const re = /`DATA_FIELDS`[^\n]{0,40}?\*\*(\d+)\*\*/g;
	let declared = 0;
	for (const file of files) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		readDoc(file).forEach((line, index) => {
			if (/^-\s*20\d\d-\d\d-\d\d/.test(line)) return; // 历史进展条目不参与
			re.lastIndex = 0;
			let m;
			while ((m = re.exec(line)) !== null) {
				declared++;
				if (Number(m[1]) !== count) {
					fail(`${rel}:${index + 1} DATA_FIELDS 字段数不符：文档写 ${m[1]}，实际 ${count}`);
				}
			}
		});
	}
	if (count === 0 && !installsAccessors) {
		if (declared > 0) {
			fail(`文档仍宣称 DATA_FIELDS 有字段数（${declared} 处），但代码里已经退役（P4b 已收口）`);
		}
		notes.push('P4b 已收口：DATA_FIELDS / defineDataAccessors 不存在（回归门禁）');
		return;
	}
	if (declared === 0) {
		// 曾经如此：文档改用「**83 → 72**」的箭头写法后，正则一条都匹配不到，
		// 本项静默失效（"未解析到 DATA_FIELDS（跳过计数核对）"被当成正常路径）。
		fail(
			'文档里没有「`DATA_FIELDS` … **N**」形式的**当前**口径声明（箭头写法 `**A → B**` 不算）——本项门禁形同虚设'
		);
	}
}

/**
 * 计划条目覆盖率：三份计划的每个「阶段 N / MN / 步骤 N」条目都必须出现在
 * `remaining-work.md` 的「计划条目对照」表里——防止"计划里有、待办里没有"（历史上
 * 阶段 2 的 api 收尾、阶段 4 的原型访问器都是这样漏掉的）。
 */
function checkPlanCoverage() {
	const planFiles = ['vue3-migration-plan.md', 'layout-vue-plan.md', 'tree-list-vfor-plan.md', 'monolith-render-plan.md'];
	const checklist = join(DOCS_DIR, 'remaining-work.md');
	if (!existsSync(checklist)) {
		notes.push('remaining-work.md 不存在（跳过计划条目覆盖率）');
		return;
	}
	const lines = readDoc(checklist);
	const start = lines.findIndex((line) => line.startsWith('## 计划条目对照'));
	const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
	const section = start < 0 ? '' : lines.slice(start, end < 0 ? lines.length : end).join('\n');
	if (section === '') {
		fail('remaining-work.md 缺少「计划条目对照」一节（无法核对计划覆盖率）');
		return;
	}
	// 两侧都去掉空白再比对（计划里写「阶段 1」、对照行里可能写「阶段1」）
	const sectionCompact = section.replace(/\s+/g, '');
	let checkedEntries = 0;
	for (const name of planFiles) {
		const file = join(DOCS_DIR, name);
		if (!existsSync(file)) continue;
		const tokens = new Set();
		for (const line of readDoc(file)) {
			const m = /^#{2,3}\s+(阶段\s*\d+(?:\.\d+)?|[MＭ]\d+[a-z]?|步骤\s*\d+[a-z]?)/.exec(line);
			if (m !== null) tokens.add(m[1].replace(/\s+/g, ''));
		}
		for (const token of tokens) {
			checkedEntries++;
			if (!sectionCompact.includes(token)) {
				fail(`${name} 的计划条目「${token}」未出现在 remaining-work.md 的「计划条目对照」表中`);
			}
		}
	}
	if (checkedEntries > 0) notes.push(`计划条目覆盖率：${checkedEntries} 个阶段/里程碑均有对照行`);
}

function main() {
	const files = docFiles();
	if (files.length === 0) {
		// 「docs/ 可以被删除」是 P15 的验收之一（见 monolith-render-plan.md 的附录）：
		// 目录整体不存在时按「文档已退役」口径**跳过**，不再让门禁失败——
		// 否则删掉文档目录就必然让 `pnpm docs:check` 变红，等于它仍然是承重结构。
		console.log('docs-check: docs/ 不存在（或已无 .md 文件）——按「文档已退役」口径跳过，退出 0。');
		return;
	}
	checkLinks(files);
	checkPaths(files);
	checkSpecs(files, declaredRemovedSpecs(files));
	checkChecklist();
	checkSectionRefs(files);
	checkTestBaseline(files);
	checkLocalizerKeys(files);
	checkApiFileCount(files);
	checkPrototypeFields(files);
	checkPlanCoverage();

	const metrics = scanCode();
	const tracker = trackerTotals();
	// tracker 是权威（它记录了 oxlint 的命中判定），先验它自身的恒等式与可正则复核项
	if (tracker !== null) {
		if (
			Number.isFinite(tracker.exempt) &&
			Number.isFinite(tracker.stale) &&
			Number.isFinite(tracker.annotated) &&
			tracker.exempt + tracker.stale !== tracker.annotated
		) {
			fail(
				`docs/dom-migration-tracker.md 口径恒等式不成立：待迁移命中 ${tracker.exempt} + 陈旧豁免 ${tracker.stale} ≠ 豁免注释 ${tracker.annotated}`
			);
		}
		for (const key of [
			'files',
			'annotated',
			'getElementById',
			'createElement',
			'appendChild',
			'addEventListener',
			'dollarLookup',
			'domParser'
		]) {
			if (tracker[key] !== undefined && tracker[key] !== metrics[key]) {
				fail(`docs/dom-migration-tracker.md 与代码不一致：${key} tracker 写 ${tracker[key]}，当前为 ${metrics[key]}`);
			}
		}
		// 交叉验证：正则命中文件 − 正则误报 − 命中落在注释/字符串 = tracker 的待迁移命中数
	// （C1 之后，白名单文件由 .oxlintrc.json 的 overrides 关掉规则且不带豁免注释，
	//   因此它们正好落在「正则命中但无豁免注释」= 正则误报这一项里，恒等式不变。）
		const regexPending = metrics.regexHitFiles - metrics.regexFalsePositive - (tracker.commentOnlyHits ?? 0);
		if (tracker.exempt !== undefined && tracker.exempt !== regexPending) {
			fail(
				`待迁移命中数交叉验证失败：tracker 写 ${tracker.exempt}，正则推算 ${regexPending}（正则命中文件 ${metrics.regexHitFiles} − 误报 ${metrics.regexFalsePositive} − 注释内命中 ${tracker.commentOnlyHits ?? '?'}）`
			);
		}
	} else {
		notes.push('docs/dom-migration-tracker.md: 未解析到口径（跳过多口径核对）');
	}
	compareMetrics('docs/vue3-migration-plan.md「现状总览」表', planTotals(), tracker ?? metrics);
	compareMetrics('docs/README.md「当前快照」', readmeTotals(), tracker ?? metrics);

	// ── C1 验收：白名单外待迁移命中 = 0，且白名单三处同源（dom-guard 常量 ↔ oxlint overrides ↔ 文件存在）
	checkC1Whitelist(tracker);

	if (VERBOSE) {
		console.log(
			`docs-check: 扫描 ${files.length} 份文档 → 链接 ${checked.links}、路径 ${checked.paths}、spec 引用 ${checked.specs}`
		);
		console.log(
			`docs-check: 代码口径 文件 ${metrics.files} / 豁免注释 ${metrics.annotated}（正则可复核） / getElementById ${metrics.getElementById} / createElement ${metrics.createElement} / appendChild ${metrics.appendChild} / addEventListener ${metrics.addEventListener} / $反查 ${metrics.dollarLookup} / DOMParser ${metrics.domParser}`
		);
		if (tracker !== null) {
			console.log(
				`docs-check: tracker 权威口径 待迁移命中 ${tracker.exempt} / 豁免注释 ${tracker.annotated} / 陈旧豁免 ${tracker.stale}`
			);
		}
	}
	for (const note of notes) console.log(`docs-check: note: ${note}`);

	if (problems.length > 0) {
		for (const problem of problems) console.error(`docs-check: FAIL ${problem}`);
		console.error(`docs-check: ${problems.length} 处不一致（修文档或运行 pnpm dom:guard:tracker 后重试）。`);
		process.exit(1);
	}
	console.log('docs-check: OK');
}

/**
 * C1 验收（白名单外的迁移项必须为 0）：
 * ① `待迁移命中 === 0`——没有文件仍需要 `/* oxlint-disable *​/` 才能过 lint；
 * ② `dom-guard.mjs` 的 WHITELIST / TEMP_WHITELIST 每一项都在 `.oxlintrc.json` 的
 *    `overrides`（关掉 `eslint/no-restricted-properties`）里，且非 glob 项的文件真实存在。
 * 这两条把"白名单"从一个说法变成可核对的事实，防止三处漂移。
 */
function checkC1Whitelist(tracker) {
	if (tracker !== null && Number.isFinite(tracker.exempt) && tracker.exempt !== 0) {
		fail(`C1 白名单外仍有迁移债：待迁移命中 ${tracker.exempt}（应为 0，检查是否新增了需要豁免注释的文件）`);
	}
	const guardPath = join(ROOT, 'scripts', 'dom-guard.mjs');
	const oxlintPath = join(ROOT, '.oxlintrc.json');
	if (!existsSync(guardPath) || !existsSync(oxlintPath)) return;
	const guard = readFileSync(guardPath, 'utf8');
	const entries = [];
	for (const name of ['WHITELIST', 'TEMP_WHITELIST']) {
		const block = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`).exec(guard);
		if (block === null) {
			fail(`scripts/dom-guard.mjs: 未找到 ${name} 常量`);
			continue;
		}
		// 只取「独占一行的字符串字面量」——注释/说明里的 'canvas' 之类不应被当成白名单项
		for (const line of block[1].split('\n')) {
			const m = /^\s*'([^']+)',?\s*$/.exec(line);
			if (m !== null) entries.push({ name, glob: m[1] });
		}
	}
	let overrideFiles = [];
	try {
		const config = JSON.parse(readFileSync(oxlintPath, 'utf8'));
		for (const override of config.overrides ?? []) {
			if (override.rules?.['eslint/no-restricted-properties'] !== 'off') continue;
			overrideFiles.push(...(override.files ?? []));
		}
	} catch (error) {
		fail(`.oxlintrc.json 解析失败：${String(error)}`);
		return;
	}
	for (const entry of entries) {
		if (!overrideFiles.includes(entry.glob)) {
			fail(`C1 白名单漂移：${entry.name} 的 \`${entry.glob}\` 未出现在 .oxlintrc.json 的 overrides 中`);
		}
		if (!entry.glob.includes('*') && !existsSync(join(ROOT, entry.glob))) {
			fail(`C1 白名单指向不存在的文件：\`${entry.glob}\``);
		}
	}
	notes.push(`docs-check: C1 白名单 ${entries.length} 项（设计豁免 + 临时豁免）与 .oxlintrc.json overrides 同源`);
}

main();
