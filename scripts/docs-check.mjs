#!/usr/bin/env node
// 文档一致性检查：把**当前真正在维护的文档**里「可验证的声明」与仓库对账。
//
// 用法：
//   node scripts/docs-check.mjs            校验（失败退出码 1）
//   node scripts/docs-check.mjs --verbose  打印通过项计数
//   node scripts/docs-check.mjs --json     机器可读输出
//
// ## 为什么这个脚本在 2026-09-21 被重写
//
// 它原来的扫描面是 `docs/*.md`，检查项是为那 7 份计划文档量身写的（`vue3-migration-plan.md`、
// `remaining-work.md` 的「计划条目对照」表、`docs/dom-migration-tracker.md` 的三口径核对…）。
// `docs/` 已在 Phase 15 **按收尾流程有意删除**，于是这个 769 行的门禁退化成
// 「目录不存在 → 打印一行 → `exit 0`」——`package.json` 里却一直挂着 `docs:check`，
// **一条永远绿的门禁**。这是最坏的一种红/绿：它让人以为文档有人管。
//
// 更糟的是它**修不回来**：里面的 `checkC1Whitelist()` 还在 `scripts/dom-guard.mjs` 里找
// `WHITELIST` / `TEMP_WHITELIST` 两个常量，而这两个常量早在 C1 收口时就被删除（白名单的
// 单一真源现在是 `.oxlintrc.json`，读法见 `scripts/lib/dom-whitelist.mjs`）—— 也就是说
// 只要 `docs/` 一回来，它立刻会因为「找不到 WHITELIST 常量」而红。
//
// 所以不是「补几条路径」，而是按**现有文档**重新定检查面。保留下来的三条，全部实测过
// **当前零误报**（过宽的规则会被无视；本仓已有一条永远红的 `format:check` 作为反面教材）：
//
//   A) 文档里提到的包脚本必须真实存在（按 `-F <pkg>` 定位到具体 package.json；
//      没有 `-F` 时按「文档所在包 ∪ 仓库根」判定）—— 实测抓到 README 的
//      `pnpm run start` / `build:runtime` / `build:runtime:mac` 三个不存在的脚本。
//   B) Markdown 相对链接的目标文件存在（`./README.en.md` 这类）。
//   D) `node scripts/<file>` 里引用的脚本存在。
//
// **刻意删掉**的检查（理由必须留档，否则下一个人会想加回来）：
//   C) 「文档里出现的 `packages/…` / `scripts/…` 路径存在」—— 本仓的计划文档是**沿革记录**，
//      会合法地提到已删除/已平移的文件（如 `packages/editor/src/ui/ui-window.ts`、已删的
//      `scripts/check-module-init.js`）。实测 34 条引用里 6 条报红、**没有一条是真缺陷**，
//      全是历史提及 ⇒ 报出来必然一片噪音，只会教人忽略这条门禁。
//      宁可少一条轴，也不要一条没人看的红轴。真迁移债由 `migration-ledger.mjs` 的 14 轴守。
//
// 不检查（需实跑）：测试用例数、真机冒烟结论、构建产物、文档里引用的**数字**
//   （数字的真源是 `pnpm migration:ledger` 的输出，不是任何一份文档）。

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');
const AS_JSON = process.argv.includes('--json');

/** 生成物：由脚本重写，不参与文档门禁（它的数字由台账守）。 */
const GENERATED_DOCS = new Set(['scripts/dom-migration-tracker.md']);

/** 不参与门禁的文档：许可证正文，不是给人看的「说明」。 */
const SKIP_BASENAMES = new Set(['LICENSE.md', 'LICENSE']);

/** pnpm 自身的子命令，不是包脚本。 */
const PNPM_BUILTINS = new Set([
	'install',
	'i',
	'add',
	'remove',
	'rm',
	'up',
	'update',
	'update-interactive',
	'dlx',
	'exec',
	'why',
	'list',
	'ls',
	'outdated',
	'publish',
	'pack',
	'prune',
	'audit',
	'licenses',
	'patch',
	'config',
	'init',
	'import',
	'link',
	'unlink',
	'rebuild',
	'root',
	'bin',
	'store',
	'setup',
	'deploy',
	'env',
	'fetch',
	'create',
	'node',
	'bun'
]);

const problems = [];
const notes = [];
/** 「沿革记录」豁免掉的命中（去重后只报计数与来源，避免噪音淹没真问题）。 */
const historicalExemptions = new Set();
const checked = { scripts: 0, links: 0, nodeScripts: 0 };

/**
 * 一行是否在**记录历史**而不是在**给指令**。
 *
 * 本仓的计划文档（`xr.md` / `PHASE-1C-*.md`）会成段写「哪个命令曾经不存在、后来怎么修的」，
 * 那些写法必然长得像可执行命令。判据沿用旧脚本里的 `REMOVED_RE` 思路（收紧到单行）。
 * 没有这个豁免，门禁会被历史记录逼红，然后所有人学会忽略它 —— 那比没有门禁更糟。
 */
const HISTORICAL_RE =
	/已修|已删|已移除|已退役|不存在|错误|缺陷|失效|曾|原先|改回|改为|回退|不要再用|曾经/;

function fail(message) {
	problems.push(message);
}

// ---------------------------------------------------------------------------
// 文档集：按**目录结构**发现，不写死文件名（写死的清单正是上一个版本的死因）
// ---------------------------------------------------------------------------

function discoverDocs() {
	const out = [];
	const push = (abs) => {
		const rel = relative(ROOT, abs).replace(/\\/g, '/');
		if (SKIP_BASENAMES.has(rel.split('/').pop())) return;
		if (GENERATED_DOCS.has(rel)) return;
		if (!out.includes(rel)) out.push(rel);
	};
	for (const entry of readdirSync(ROOT)) {
		if (!entry.endsWith('.md')) continue;
		push(join(ROOT, entry));
	}
	const pkgRoot = join(ROOT, 'packages');
	if (existsSync(pkgRoot)) {
		for (const pkg of readdirSync(pkgRoot)) {
			const dir = join(pkgRoot, pkg);
			if (!statSync(dir).isDirectory()) continue;
			for (const entry of readdirSync(dir)) {
				if (!entry.endsWith('.md')) continue;
				push(join(dir, entry));
			}
		}
	}
	// 显式 localeCompare：默认排序按 UTF-16 码元，对非 ASCII 文件名顺序不稳定，
	// 也会让输出在机器之间抖动（本仓报表统一用 localeCompare，见 migration-ledger）。
	return out.sort((a, b) => a.localeCompare(b));
}

/** 找文档所在目录最近的 package.json（`packages/editor/PHASE-1C-*.md` → `packages/editor/package.json`）。 */
function contextPackage(docRel) {
	let dir = dirname(join(ROOT, docRel));
	for (;;) {
		if (existsSync(join(dir, 'package.json'))) {
			return relative(ROOT, join(dir, 'package.json')).replace(/\\/g, '/');
		}
		const up = dirname(dir);
		if (up === dir || !up.startsWith(ROOT)) return 'package.json';
		dir = up;
	}
}

/** 工作区里所有 package.json 的 scripts（路径 → 脚本名集合）与 name → 路径。 */
function collectScripts() {
	const scripts = new Map();
	const byName = new Map();
	const skip = new Set([
		'node_modules',
		'dist',
		'dist-electron',
		'build',
		'out',
		'.git',
		'.kilo'
	]);
	const walk = (dir) => {
		let entries;
		try {
			entries = readdirSync(dir);
		} catch {
			return;
		}
		for (const entry of entries) {
			if (skip.has(entry)) continue;
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) {
				walk(full);
				continue;
			}
			if (entry !== 'package.json') continue;
			const rel = relative(ROOT, full).replace(/\\/g, '/');
			try {
				const json = JSON.parse(readFileSync(full, 'utf8'));
				scripts.set(rel, new Set(Object.keys(json.scripts ?? {})));
				if (typeof json.name === 'string') byName.set(json.name, rel);
			} catch {
				/* 坏 json 不属本门禁的职责 */
			}
		}
	};
	walk(ROOT);
	return { scripts, byName };
}

/** 取行内代码片段（反引号）或围栏内的整行 —— 命令只在这些位置才当作「可执行声明」。 */
function codeSpans(line, inFence) {
	if (inFence) return [line];
	return [...line.matchAll(/`([^`]*)`/g)].map((m) => m[1]);
}

// ---------------------------------------------------------------------------
// A) 文档提到的包脚本必须存在
// ---------------------------------------------------------------------------

function checkScripts(docRel, lines, scripts, byName) {
	const ctx = contextPackage(docRel);
	// 没有 `-F` 时接受「文档所在包」与「仓库根」两种上下文：
	// `packages/editor/PHASE-1C-*.md` 里的 `pnpm lint` / `pnpm migration:check` 是**根**脚本，
	// 而 `packages/editor/README.md` 里的 `npm test` 是**该包**脚本 —— 两者都合法。
	const defaultTargets = [...new Set(['package.json', ctx])];
	let inFence = false;
	lines.forEach((line, index) => {
		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			return;
		}
		// 「沿革记录」豁免：见 HISTORICAL_RE 的说明。
		const historical = HISTORICAL_RE.test(line);
		for (const span of codeSpans(line, inFence)) {
			for (const m of span.matchAll(/\b(?:pnpm|npm)\b([^\n&|;]*)/g)) {
				const parts = m[1].trim().split(/\s+/).filter(Boolean);
				let at = 0;
				let targets = defaultTargets;
				if (parts[at] === 'run') at++;
				while (parts[at] === '-F' || parts[at] === '--filter') {
					const name = parts[at + 1];
					const rel = byName.get(name);
					if (rel === undefined) {
						targets = null;
						fail(
							`${docRel}:${index + 1} 引用了工作区里不存在的包 \`${name}\`（在 \`${span.trim()}\` 里）`
						);
						break;
					}
					targets = [rel];
					at += 2;
				}
				if (targets === null) continue;
				if (parts[at] === 'run') at++;
				const name = parts[at];
				if (name === undefined || !/^[a-zA-Z][\w:.-]*$/.test(name)) continue;
				if (PNPM_BUILTINS.has(name)) continue;
				checked.scripts++;
				if (targets.some((t) => scripts.get(t)?.has(name))) continue;
				if (historical) {
					historicalExemptions.add(
						`${docRel}:${index + 1} → \`${name}\`（该行带沿革/修复标记）`
					);
					continue;
				}
				fail(
					`${docRel}:${index + 1} 文档写了 \`${span.trim()}\`，但 ${targets.join(' 与 ')} 里都没有脚本 \`${name}\``
				);
			}
		}
	});
}

// ---------------------------------------------------------------------------
// B) Markdown 相对链接的目标存在
// ---------------------------------------------------------------------------

function checkLinks(docRel, lines) {
	lines.forEach((line, index) => {
		for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
			const target = m[1];
			if (/^(?:https?:|mailto:|data:|#)/.test(target)) continue;
			const clean = target.split('#')[0];
			if (clean === '') continue;
			checked.links++;
			if (!existsSync(resolve(join(ROOT, dirname(docRel)), clean))) {
				fail(`${docRel}:${index + 1} 相对链接 \`${target}\` 指向不存在的路径`);
			}
		}
	});
}

// ---------------------------------------------------------------------------
// D) `node scripts/<file>` 引用的脚本存在
// ---------------------------------------------------------------------------

function checkNodeScripts(docRel, lines) {
	const seen = new Set();
	lines.forEach((line, index) => {
		const historical = HISTORICAL_RE.test(line);
		for (const m of line.matchAll(/\bnode\s+(scripts\/[\w./-]+\.(?:mjs|cjs|js))/g)) {
			if (seen.has(m[1])) continue;
			seen.add(m[1]);
			checked.nodeScripts++;
			if (existsSync(join(ROOT, m[1]))) continue;
			if (historical) {
				historicalExemptions.add(
					`${docRel}:${index + 1} → \`${m[1]}\`（该行带沿革/修复标记）`
				);
				continue;
			}
			fail(`${docRel}:${index + 1} 引用了不存在的脚本 \`${m[1]}\``);
		}
	});
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
	const docs = discoverDocs();
	if (docs.length === 0) {
		if (AS_JSON) console.log(JSON.stringify({ docs: [], problems: [] }, null, '\t'));
		else console.log('docs-check: 没有发现任何文档（扫描面为空）—— 本门禁无事可做，退出 0。');
		return;
	}
	const { scripts, byName } = collectScripts();
	for (const docRel of docs) {
		const lines = readFileSync(join(ROOT, docRel), 'utf8').split('\n');
		checkScripts(docRel, lines, scripts, byName);
		checkLinks(docRel, lines);
		checkNodeScripts(docRel, lines);
	}
	notes.push(
		`文档数字的真源是 \`pnpm migration:ledger\`，不是任何一份文档 —— 本文只校验可执行声明与链接`
	);

	if (AS_JSON) {
		console.log(JSON.stringify({ docs, checked, problems, notes }, null, '\t'));
		process.exit(problems.length === 0 ? 0 : 1);
	}

	if (VERBOSE) {
		console.log(
			`docs-check: 扫描 ${docs.length} 份文档 → 包脚本 ${checked.scripts}、相对链接 ${checked.links}、node 脚本引用 ${checked.nodeScripts}`
		);
	}
	for (const note of notes) console.log(`docs-check: note: ${note}`);
	if (historicalExemptions.size > 0) {
		console.log(
			`docs-check: note: ${historicalExemptions.size} 处「沿革记录」豁免（带失效/修复标记的行里提到的不存在命令）`
		);
		if (VERBOSE) {
			for (const item of historicalExemptions) console.log(`docs-check:   - ${item}`);
		}
	}

	if (problems.length > 0) {
		for (const problem of problems) console.error(`docs-check: FAIL ${problem}`);
		console.error(
			`docs-check: ${problems.length} 处不一致（改文档或补上脚本；不要靠放宽本门禁来变绿）。`
		);
		process.exit(1);
	}
	console.log(`docs-check: OK（${docs.length} 份文档）`);
}

main();
