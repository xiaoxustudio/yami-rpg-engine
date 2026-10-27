#!/usr/bin/env node
/**
 * 界面文案 key 完整性门禁（i18n-key-guard）
 *
 * 编辑器里 `t('components.x.y')` / `t('properties.x.y')` 这类**静态字面量** key 必须同时存在于
 * `packages/editor/Project/Locales/` 下的**每一份**语言文件里：
 *   - 缺席 zh-CN → 界面上直接显示 key（或空标签）；
 *   - 缺席 en-US → 英文环境回退成中文/原始 key。
 * 动态拼接（`t('prefix.' + x)`、模板字符串）不在扫描面内——它们的前缀以 `.` 结尾，自动跳过。
 *
 * 用法：
 *   node scripts/i18n-key-guard.mjs              校验（失败退出码 1）
 *   node scripts/i18n-key-guard.mjs --json       机器可读输出
 *   node scripts/i18n-key-guard.mjs --verbose    打印扫描范围
 *   node scripts/i18n-key-guard.mjs --selftest   验证门禁自身的口径
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/editor/src');
const LOCALES_DIR = join(ROOT, 'packages/editor/Project/Locales');
const NAMESPACES = ['components.', 'properties.'];

const ARGV = new Set(process.argv.slice(2));
const AS_JSON = ARGV.has('--json');
const VERBOSE = ARGV.has('--verbose');
const SELFTEST = ARGV.has('--selftest');

/** 展开 JSON 为 `a.b.c` 形式的 key 集合。 */
export function flattenKeys(value, prefix = '', out = new Set()) {
	for (const [key, child] of Object.entries(value ?? {})) {
		const full = prefix ? `${prefix}.${key}` : key;
		if (child && typeof child === 'object' && !Array.isArray(child)) {
			flattenKeys(child, full, out);
		} else {
			out.add(full);
		}
	}
	return out;
}

/** 抓 `t('literal')` / `t("literal")`。 */
const CALL_RE = /\bt\(\s*(['"])([A-Za-z][\w.-]*)\1/g;

export function usedKeys(text) {
	const keys = new Set();
	for (const match of text.matchAll(CALL_RE)) {
		const key = match[2];
		if (!NAMESPACES.some((ns) => key.startsWith(ns))) continue;
		if (key.endsWith('.')) continue; // 前缀拼接，不是完整 key
		keys.add(key);
	}
	return keys;
}

function listSourceFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (entry === '__tests__' || entry === 'node_modules') continue;
		const stat = readdirSync(dir, { withFileTypes: true }).find((item) => item.name === entry);
		if (stat?.isDirectory()) {
			files.push(...listSourceFiles(full));
			continue;
		}
		if (!/\.(ts|vue)$/.test(entry) || entry.endsWith('.spec.ts')) continue;
		files.push(full);
	}
	return files;
}

function loadLocales() {
	return readdirSync(LOCALES_DIR)
		.filter((name) => name.endsWith('.json'))
		.map((name) => ({
			name,
			keys: flattenKeys(JSON.parse(readFileSync(join(LOCALES_DIR, name), 'utf8')))
		}));
}

export function scanSources(files) {
	const used = new Map();
	for (const file of files) {
		const text = readFileSync(file, 'utf8');
		for (const key of usedKeys(text)) {
			if (!used.has(key)) used.set(key, relative(ROOT, file).replace(/\\/g, '/'));
		}
	}
	return used;
}

const SELFTEST_CASES = [
	{
		name: '静态 key 命中同一份语言文件的集合',
		text: `t('components.condition-type.label'); t("properties.color")`,
		exists: ['components.condition-type.label', 'properties.color'],
		expect: 0
	},
	{
		name: '缺 key → 命中',
		text: `t('components.condition-type.label')`,
		exists: ['properties.color'],
		expect: 1
	},
	{
		name: '前缀拼接（以 . 结尾）不参与校验',
		text: `t('components.condition.' + suffix)`,
		exists: [],
		expect: 0
	},
	{
		name: '命名空间外（common./command.）不参与校验',
		text: `t('common.none'); t('command.alias')`,
		exists: [],
		expect: 0
	},
	{
		name: '模板字符串不参与校验',
		text: 't(`components.${name}.label`)',
		exists: [],
		expect: 0
	}
];

function runSelftest() {
	let failed = 0;
	for (const testCase of SELFTEST_CASES) {
		const keys = usedKeys(testCase.text);
		const exists = new Set(testCase.exists);
		const missing = [...keys].filter((key) => !exists.has(key)).length;
		const ok = missing === testCase.expect;
		if (!ok) failed++;
		console.log(`${ok ? '✓' : '✗'} ${testCase.name}（缺失 ${missing}/${testCase.expect}）`);
	}
	if (failed > 0) {
		console.error(`\n门禁口径自测失败：${failed} 例`);
		process.exit(1);
	}
	console.log('\n门禁口径自测通过。');
}

if (SELFTEST) {
	runSelftest();
	process.exit(0);
}

if (!existsSync(LOCALES_DIR)) {
	console.error('找不到语言目录:', LOCALES_DIR);
	process.exit(1);
}

const files = listSourceFiles(SRC);
const used = scanSources(files);
const locales = loadLocales();
const findings = [];
for (const locale of locales) {
	for (const [key, file] of used) {
		if (!locale.keys.has(key)) findings.push({ locale: locale.name, key, file });
	}
}

if (AS_JSON) {
	console.log(
		JSON.stringify(
			{
				scan: {
					sourceFiles: files.length,
					locales: locales.map((item) => item.name),
					usedKeys: used.size
				},
				missing: findings,
				ok: findings.length === 0
			},
			null,
			2
		)
	);
} else {
	console.log('界面文案 key 门禁（i18n-key-guard）');
	console.log(
		`  扫描：${files.length} 个源文件 / ${used.size} 个静态 key / ${locales.length} 份语言文件`
	);
	if (VERBOSE) {
		for (const locale of locales)
			console.log(`    - ${locale.name}: ${locale.keys.size} 个 key`);
	}
	console.log('');
	if (findings.length === 0) {
		console.log('  ✓ components./properties. 静态 key 在所有语言里都存在');
		console.log('\n✓ 全部通过。\n');
	} else {
		console.log(`  ✗ 缺 key：${findings.length} 处`);
		for (const item of findings.slice(0, 40)) {
			console.log(`      ${item.locale}  ${item.key}  （${item.file}）`);
		}
		if (findings.length > 40) console.log(`      …还有 ${findings.length - 40} 处`);
		console.error('\n✗ 门禁未通过：补齐语言文件后重跑。\n');
		process.exit(1);
	}
}

if (findings.length !== 0) process.exit(1);
