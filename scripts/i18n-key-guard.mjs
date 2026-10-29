#!/usr/bin/env node
/**
 * 界面文案 key 完整性门禁（i18n-key-guard）
 *
 * 编辑器里 `t('components.x.y')` / `t('properties.x.y')` 这类**静态字面量** key 必须同时存在于
 * `packages/editor/Project/Locales/` 下的**每一种**语言里：
 *   - 缺席 zh-CN → 界面上直接显示 key（或空标签）；
 *   - 缺席 en-US → 英文环境回退成中文/原始 key。
 * 动态拼接（`t('prefix.' + x)`、模板字符串）不在扫描面内——它们的前缀以 `.` 结尾，自动跳过。
 *
 * 语言包已按组件命名空间拆分（见 `scripts/oneoff/i18n-split-locales.mjs`）：
 *   `Locales/<lang>.<alias>.json`     入口：properties + 静态键（本地化器需要的 `[confirm]` 之类）
 *   `Locales/<lang>/components.<ns>.json`  分片：组件文案（运行时懒加载）
 * 因此本门禁按**语言**聚合入口 + 全部分片后再比对静态 key，并顺带校验分片布局：
 * 文件名与内部 id 的命名空间一致、id 不重复、入口带 `format: 2`。
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
const CHUNK_FILE_RE = /^components\.([A-Za-z0-9_]+)\.json$/;
const ENTRY_FORMAT = 2;

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

/** 组件 id → 分片命名空间。必须与 `src/i18n/loader.ts` 的 `componentNamespaceOf` 一致。 */
export function namespaceOf(id) {
	return id.split('-')[0];
}

/** `components.setList.json` → `setList`；不符合分片命名规则返回 null。 */
export function parseChunkNamespace(filename) {
	return CHUNK_FILE_RE.exec(filename)?.[1] ?? null;
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

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/**
 * 读一种语言：入口 + 分片按 key 聚合；同时收集布局问题。
 * @returns {{ name: string, langKey: string, keys: Set<string>, chunks: number }}
 */
export function loadLocaleBundle(localesDir, entryName) {
	const layout = [];
	const langKey = entryName.split('.')[0];
	const entryPath = join(localesDir, entryName);
	const entry = readJson(entryPath);
	const components = { ...entry.components };
	const keys = flattenKeys({ properties: entry.properties ?? {} });
	for (const key of flattenKeys({ components })) keys.add(key);

	if (entry.format !== ENTRY_FORMAT) {
		layout.push({
			locale: entryName,
			kind: 'format',
			message: `入口缺少 format: ${ENTRY_FORMAT}（旧单文件语言包？）`
		});
	}

	const chunkDir = join(localesDir, langKey);
	let chunks = 0;
	if (existsSync(chunkDir)) {
		const chunkFiles = readdirSync(chunkDir)
			.filter((name) => name.endsWith('.json'))
			.sort();
		for (const chunkName of chunkFiles) {
			chunks++;
			const namespace = parseChunkNamespace(chunkName);
			if (!namespace) {
				layout.push({
					locale: entryName,
					kind: 'chunk-name',
					message: `分片文件名不合法：${chunkName}（应为 components.<ns>.json）`
				});
				continue;
			}
			const chunk = readJson(join(chunkDir, chunkName));
			for (const [id, item] of Object.entries(chunk.components ?? {})) {
				if (namespaceOf(id) !== namespace) {
					layout.push({
						locale: entryName,
						kind: 'chunk-id',
						message: `${chunkName} 里的 ${id} 属于命名空间 ${namespaceOf(id)}`
					});
				}
				if (id in components) {
					layout.push({
						locale: entryName,
						kind: 'duplicate-id',
						message: `组件 ${id} 同时出现在入口/多个分片里`
					});
					continue;
				}
				components[id] = item;
			}
		}
	} else {
		layout.push({
			locale: entryName,
			kind: 'missing-chunk-dir',
			message: `缺少分片目录 ${langKey}/（语言包未拆分）`
		});
	}

	for (const key of flattenKeys({ components })) keys.add(key);
	return { name: entryName, langKey, keys, chunks, layout };
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

const SELFTEST_LAYOUT_CASES = [
	{
		name: '分片文件名 → 命名空间',
		run: () => parseChunkNamespace('components.setList.json'),
		expect: 'setList'
	},
	{
		name: '非分片文件名不认',
		run: () => parseChunkNamespace('zh-CN.简体中文.json'),
		expect: null
	},
	{
		name: '组件 id → 命名空间（按 - 前段）',
		run: () => namespaceOf('setList-operand-object-property'),
		expect: 'setList'
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
	for (const testCase of SELFTEST_LAYOUT_CASES) {
		const actual = testCase.run();
		const ok = actual === testCase.expect;
		if (!ok) failed++;
		console.log(`${ok ? '✓' : '✗'} ${testCase.name}（${actual} / ${testCase.expect}）`);
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
const locales = readdirSync(LOCALES_DIR)
	.filter((name) => name.endsWith('.json'))
	.sort()
	.map((name) => loadLocaleBundle(LOCALES_DIR, name));
const findings = [];
const layoutFindings = locales.flatMap((locale) => locale.layout);
for (const locale of locales) {
	for (const [key, file] of used) {
		if (!locale.keys.has(key)) findings.push({ locale: locale.name, key, file });
	}
}
const totalKeys = locales.reduce((sum, locale) => sum + locale.keys.size, 0);
const totalChunks = locales.reduce((sum, locale) => sum + locale.chunks, 0);
const ok = findings.length === 0 && layoutFindings.length === 0;

if (AS_JSON) {
	console.log(
		JSON.stringify(
			{
				scan: {
					sourceFiles: files.length,
					locales: locales.map((item) => item.name),
					usedKeys: used.size,
					totalKeys,
					totalChunks
				},
				missing: findings,
				layout: layoutFindings,
				ok
			},
			null,
			2
		)
	);
} else {
	console.log('界面文案 key 门禁（i18n-key-guard）');
	console.log(
		`  扫描：${files.length} 个源文件 / ${used.size} 个静态 key / ${locales.length} 份语言（${totalKeys} 个 key，${totalChunks} 个分片）`
	);
	if (VERBOSE) {
		for (const locale of locales)
			console.log(
				`    - ${locale.name}: ${locale.keys.size} 个 key / ${locale.chunks} 个分片`
			);
	}
	console.log('');
	if (layoutFindings.length === 0) {
		console.log('  ✓ 语言包布局：入口 + 分片命名空间一致，无重复 id');
	} else {
		console.log(`  ✗ 语言包布局：${layoutFindings.length} 处问题`);
		for (const item of layoutFindings.slice(0, 20)) {
			console.log(`      [${item.locale}] ${item.message}`);
		}
	}
	if (findings.length === 0) {
		console.log('  ✓ components./properties. 静态 key 在所有语言里都存在');
	} else {
		console.log(`  ✗ 缺 key：${findings.length} 处`);
		for (const item of findings.slice(0, 40)) {
			console.log(`      ${item.locale}  ${item.key}  （${item.file}）`);
		}
		if (findings.length > 40) console.log(`      …还有 ${findings.length - 40} 处`);
	}
	if (ok) {
		console.log('\n✓ 全部通过。\n');
	} else {
		console.error('\n✗ 门禁未通过：补齐语言文件 / 重新生成分片后重跑。\n');
		process.exit(1);
	}
}

if (!ok) process.exit(1);
