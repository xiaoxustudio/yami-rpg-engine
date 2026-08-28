#!/usr/bin/env node
// DOM 迁移守卫：扫描命令式 DOM 用法，为存量代码打豁免标记，输出迁���矩阵。
// 用法：
//   node scripts/dom-guard.mjs exempt   为存量违规文件添加 oxlint-disable 豁免（幂等，基于 oxlint 输出）
//   node scripts/dom-guard.mjs tracker  生成 docs/dom-migration-tracker.md
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = [join('packages', 'editor', 'src'), join('packages', 'ui-kit', 'src')];
const EXTENSIONS = new Set(['.ts', '.tsx', '.vue']);
const EXCLUDE_RE = /(?:\.spec\.ts$|\.d\.ts$|\/__tests__\/|\.demo\.vue$)/;
const DISABLE_COMMENT = '/* oxlint-disable eslint/no-restricted-properties */';

const PATTERNS = [
	{ key: 'getElementById', re: /document\.getElementById\s*\(/g, lint: true },
	{ key: 'querySelector', re: /document\.querySelectorAll?\s*\(/g, lint: true },
	{ key: 'getElementsByClass', re: /document\.getElementsByClassName\s*\(/g, lint: true },
	{ key: 'getElementsByName', re: /document\.getElementsByName\s*\(/g, lint: true },
	{ key: 'getElementsByTag', re: /document\.getElementsByTagName\s*\(/g, lint: true },
	{ key: 'createElement', re: /document\.createElement\s*\(/g, lint: true },
	{ key: 'appendChild', re: /\.appendChild\s*\(/g },
	{ key: 'removeChild', re: /\.removeChild\s*\(/g },
	{ key: 'insertBefore', re: /\.insertBefore\s*\(/g },
	{ key: 'parentNode', re: /\.parentNode\b/g },
	{ key: 'innerHTML', re: /\.innerHTML\b/g },
	{ key: 'addEventListener', re: /\.addEventListener\s*\(/g },
	{ key: 'dispatchEvent', re: /\.dispatchEvent\s*\(/g },
	{ key: 'protoExt', re: /(?:HTMLElement|Element|ChildNode|ParentNode)\.prototype\./g }
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
		const lintCount = PATTERNS.filter((p) => p.lint).reduce((sum, p) => sum + counts[p.key], 0);
		const total = PATTERNS.reduce((sum, p) => sum + counts[p.key], 0);
		rows.push({ rel, file, counts, lintCount, total, exempt: hasRuleDisabled(source) });
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

function insertDisable(rel, source) {
	const bom = source.charCodeAt(0) === 0xfeff ? '\ufeff' : '';
	if (rel.endsWith('.vue')) {
		const m = /(\s*<script[^>]*>)/.exec(source);
		if (!m) return null;
		const at = m.index + m[1].length;
		return bom + source.slice(bom ? 1 : 0, at) + '\n' + DISABLE_COMMENT + source.slice(at);
	}
	const body = bom ? source.slice(1) : source;
	return bom + DISABLE_COMMENT + '\n' + body;
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

function lintAffectedFiles() {
	const bin = join(ROOT, 'node_modules', 'oxlint', 'bin', 'oxlint');
	const res = spawnSync(
		process.execPath,
		[bin, '-c', '.oxlintrc.json', '--format=json', 'packages/editor', 'packages/ui-kit'],
		{ cwd: ROOT, encoding: 'utf8' }
	);
	const m = (res.stdout ?? '').match(/\{[\s\S]*\}/);
	if (!m) {
		console.error('exempt: failed to parse oxlint json output.');
		process.exit(1);
	}
	const data = JSON.parse(m[0]);
	const files = new Set();
	for (const d of data.diagnostics ?? []) {
		if (String(d.code).includes('no-restricted-properties') && d.filename) files.add(d.filename);
	}
	return files;
}

function exempt() {
	const files = lintAffectedFiles();
	let added = 0;
	let skipped = 0;
	for (const rel of files) {
		const file = join(ROOT, rel);
		if (!existsSync(file)) continue;
		const source = readFileSync(file, 'utf8');
		if (hasRuleDisabled(source)) {
			skipped++;
			continue;
		}
		const next = insertDisable(rel, source);
		if (next !== null) {
			writeFileSync(file, next);
			added++;
		}
	}
	console.log(`exempt: ${files.size} affected file(s), marked ${added}, already exempt ${skipped}.`);
}

function tracker() {
	const rows = scan();
	const modules = new Map();
	for (const row of rows) {
		const key = moduleOf(row.rel);
		if (!modules.has(key)) {
			modules.set(key, { total: 0, affected: 0, exempt: 0, lintCount: 0, counts: {} });
		}
		const m = modules.get(key);
		m.total++;
		if (row.total > 0) m.affected++;
		if (row.lintCount > 0) {
			m.exempt++;
			m.lintCount += row.lintCount;
		}
		for (const [k, v] of Object.entries(row.counts)) m.counts[k] = (m.counts[k] ?? 0) + v;
	}
	const keyWidth = Math.max(...[...modules.keys()].map((k) => k.length));
	const header = ['模块', '文件', '命中', '待迁移', ...PATTERNS.map((p) => p.key)];
	const lines = [];
	lines.push('# DOM 迁移矩阵');
	lines.push('');
	lines.push('> 由 `node scripts/dom-guard.mjs tracker` 自动生成。`待迁移` = 仍带 oxlint-disable 豁免的存量文件，迁移完成后应移除豁免注释。');
	lines.push('');
	lines.push(`| ${header.join(' | ')} |`);
	lines.push(`|${header.map(() => '---').join('|')}|`);
	const globalCounts = {};
	let totalFiles = 0;
	let totalExempt = 0;
	for (const [key, m] of [...modules.entries()].sort()) {
		lines.push(`| ${key.padEnd(keyWidth)} | ${m.total} | ${m.affected} | ${m.exempt} | ${PATTERNS.map((p) => m.counts[p.key] ?? 0).join(' | ')} |`);
		totalFiles += m.total;
		totalExempt += m.exempt;
		for (const [k, v] of Object.entries(m.counts)) globalCounts[k] = (globalCounts[k] ?? 0) + v;
	}
	lines.push(`| ${'合计'.padEnd(keyWidth)} | ${totalFiles} |  | ${totalExempt} | ${PATTERNS.map((p) => globalCounts[p.key] ?? 0).join(' | ')} |`);
	lines.push('');
	lines.push('## 明细');
	lines.push('');
	lines.push('| 文件 | 行数 | 命中 | 待迁移豁免 |');
	lines.push('| --- | --- | --- | --- |');
	for (const row of [...rows].sort((a, b) => b.total - a.total)) {
		lines.push(`| ${row.rel} | ${readFileSync(row.file, 'utf8').split('\n').length} | ${row.total} | ${row.exempt ? '是' : '-'} |`);
	}
	const out = join(ROOT, 'docs');
	if (!existsSync(out)) mkdirSync(out, { recursive: true });
	writeFileSync(join(out, 'dom-migration-tracker.md'), lines.join('\n') + '\n');
	console.log(`tracker: wrote docs/dom-migration-tracker.md (${rows.length} files).`);
}

const command = process.argv[2];
if (command === 'exempt') exempt();
else if (command === 'tracker') tracker();
else if (command === 'fix') fix();
else {
	console.log('usage: node scripts/dom-guard.mjs [exempt|tracker|fix]');
	process.exit(1);
}
