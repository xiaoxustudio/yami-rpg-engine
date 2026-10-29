#!/usr/bin/env node
/**
 * 语言包按组件命名空间拆分（一次性迁移工具，可重复跑；幂等）。
 *
 * 目标布局（每种语言）：
 *   Project/Locales/<lang>.<alias>.json     —— 入口：`properties` + 无法懒加载的组件（本地化器要用的静态键）
 *   Project/Locales/<lang>/components.<ns>.json —— 组件命名空间分片：`{ "components": { <id>: {...} } }`
 *
 * 命名空间 = 组件 id 的第一个 `-` 之前的段（`setList-operand` → `setList`）。运行时按同一规则
 * 收集分片并在**加载语言时一次合并**（不逐片 merge：那会让所有 `t()` 消费者反复重渲染）。
 * 分片的收益是文件布局 / diff，不是运行期懒加载。
 *
 * 哪些键留在入口：`template-localized.ts` 里**没有**的组件 id。这些键仍由
 * `localizeDomComponents()` 按 `document.getElementById` 本地化，必须在语言加载时就绪。
 * 其余组件全部走模板 `t('components.<id>.…')`，可随窗口懒加载。
 *
 * 用法：
 *   node scripts/oneoff/i18n-split-locales.mjs          重写分片（读入口 + 现有分片后重新分组）
 *   node scripts/oneoff/i18n-split-locales.mjs --check  只校验布局，不写文件
 *
 * 注意：本工具只搬运键，不翻译、不改文案；`properties` 原样留在入口。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOCALES_DIR = join(ROOT, 'packages/editor/Project/Locales');
const TEMPLATE_KEYS_FILE = join(ROOT, 'packages/editor/src/localize/template-localized.ts');
const CHECK = process.argv.includes('--check');

const templateLocalizedKeys = (() => {
	const source = readFileSync(TEMPLATE_KEYS_FILE, 'utf8');
	return new Set([...source.matchAll(/'([^']+)'/g)].map((match) => match[1]));
})();

/** 组件 id → 分片命名空间。与 `src/i18n/loader.ts` 的 `componentNamespaceOf` 必须一致。 */
const namespaceOf = (id) => id.split('-')[0];

const entryFiles = readdirSync(LOCALES_DIR)
	.filter((name) => name.toLowerCase().endsWith('.json'))
	.sort();

if (entryFiles.length === 0) {
	console.error('找不到语言入口文件');
	process.exit(1);
}

let changed = 0;
const report = [];

for (const entryFile of entryFiles) {
	const langKey = basename(entryFile).split('.')[0];
	const entryPath = join(LOCALES_DIR, entryFile);
	const entry = JSON.parse(readFileSync(entryPath, 'utf8'));
	const chunkDir = join(LOCALES_DIR, langKey);

	// 先把现有分片读回来合并，保证重复跑不会丢键（入口里的同名 id 以分片为准会被覆盖，故分片后合并）
	const components = { ...entry.components };
	if (existsSync(chunkDir)) {
		for (const name of readdirSync(chunkDir)) {
			if (!name.endsWith('.json')) continue;
			const chunk = JSON.parse(readFileSync(join(chunkDir, name), 'utf8'));
			Object.assign(components, chunk.components ?? {});
		}
	}

	const eager = {};
	const chunks = new Map();
	for (const [id, item] of Object.entries(components)) {
		if (!templateLocalizedKeys.has(id)) {
			eager[id] = item;
			continue;
		}
		const namespace = namespaceOf(id);
		// 文件系统不安全的命名空间直接留在入口：宁可同步加载，也不要生成 Windows 非法文件名。
		if (!/^[A-Za-z0-9_]+$/.test(namespace)) {
			eager[id] = item;
			continue;
		}
		let bucket = chunks.get(namespace);
		if (!bucket) {
			bucket = {};
			chunks.set(namespace, bucket);
		}
		bucket[id] = item;
	}

	const entryContent = `${JSON.stringify(
		{ format: 2, properties: entry.properties ?? {}, components: eager },
		null,
		'\t'
	)}\n`;
	const expected = new Map();
	for (const [namespace, bucket] of chunks) {
		expected.set(
			`components.${namespace}.json`,
			`${JSON.stringify({ components: bucket }, null, '\t')}\n`
		);
	}

	if (CHECK) {
		const stale = [];
		if (!existsSync(chunkDir)) {
			console.error(`✗ ${langKey}: 缺分片目录 ${chunkDir}`);
			process.exitCode = 1;
			continue;
		}
		const actualFiles = new Set(readdirSync(chunkDir).filter((name) => name.endsWith('.json')));
		for (const [name, content] of expected) {
			const path = join(chunkDir, name);
			if (!actualFiles.has(name) || readFileSync(path, 'utf8') !== content) stale.push(name);
			actualFiles.delete(name);
		}
		for (const name of actualFiles) stale.push(name);
		if (stale.length > 0) {
			console.error(
				`✗ ${langKey}: ${stale.length} 个分片与期望不一致（${stale.slice(0, 5).join(', ')}）`
			);
			process.exitCode = 1;
		}
		report.push(
			`${langKey}: ${Object.keys(eager).length} 个入口键 / ${chunks.size} 个分片 / ${Object.keys(components).length} 个组件键`
		);
		continue;
	}

	// 先写分片，再写入口：中途失败时不会出现「入口已瘦身、分片还没落盘」的丢键状态。
	mkdirSync(chunkDir, { recursive: true });
	for (const [name, content] of expected) {
		const path = join(chunkDir, name);
		const previous = existsSync(path) ? readFileSync(path, 'utf8') : null;
		if (previous !== content) {
			writeFileSync(path, content);
			changed++;
		}
	}
	for (const name of readdirSync(chunkDir)) {
		if (name.endsWith('.json') && !expected.has(name)) {
			rmSync(join(chunkDir, name));
			changed++;
		}
	}
	if (readFileSync(entryPath, 'utf8') !== entryContent) {
		writeFileSync(entryPath, entryContent);
		changed++;
	}
	report.push(
		`${langKey}: 入口 ${Object.keys(eager).length} 键（${(entryContent.length / 1024).toFixed(1)} KB）/ ${chunks.size} 个分片 / 组件键 ${Object.keys(components).length}`
	);
}

for (const line of report) console.log(line);
if (CHECK) {
	console.log(process.exitCode ? '\n✗ 语言包布局需要重新生成。' : '\n✓ 语言包布局与期望一致。');
} else {
	console.log(`\n${changed === 0 ? '无需改动。' : `已写入 ${changed} 个文件。`}`);
}
