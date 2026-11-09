#!/usr/bin/env node
/**
 * 一致性体检（按注册表）：**被读但没人写**的元素注册表 / id。
 *
 * 与 `audit-orphan-ids.mjs` 的区别：那个把全仓 id 混成一个集合，只要**任何**地方登记过就算
 * 有主；这里按注册表分账，并且把「镜像注册表」（`createElementRegistry(composableEls)`）
 * 的写入也算到被镜像的那张表上。迁移里真正会出事的是下面两种：
 *
 *   1. 整张注册表**没有写入方**（组件早已改成 `createSkeletonTable` / `useControlRefs`），
 *      消费方读到的永远是 `undefined` —— 编译、lint 都不报，只在真机偶发崩溃/静默失效；
 *   2. 单个 id 在这张表里**被读但没人写**（登记侧迁走了，读侧忘了改）。
 *
 * 口径与边界：
 *   - 只认字面量 id；动态读（`els.get(someVar)`）会把该注册表标记为「有动态读」，
 *     不参与孤儿判定，避免误报；
 *   - 动态写（`registerElement(els, id, …)`）同理，标记后整表不判孤儿；
 *   - `registryElements(els, [ 'a', 'b' ])` 这种数组读也要覆盖（旧脚本漏了）；
 *   - 这是**线索**不是判定：先看输出，再逐个确认消费方是不是还活着。
 *
 * 用法：
 *   node scripts/oneoff/audit-orphan-registry-reads.mjs
 *   node scripts/oneoff/audit-orphan-registry-reads.mjs --json
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'packages/editor/src');
const AS_JSON = process.argv.includes('--json');

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			if (name === 'node_modules' || name === '__tests__') continue;
			walk(full, out);
		} else if (/\.(ts|vue)$/.test(name)) {
			out.push(full);
		}
	}
	return out;
}

const files = walk(SRC);
/** 注释里的示例代码不算消费方（`export-language-bridge` 的文档注释就写过 `localEls.get(...)`）。 */
const stripComments = (text) =>
	text
		.replace(/\/\*[\s\S]*?\*\//g, '')
		// 只剥「前面是行首或空白」的 `//`：`https://` 里的 `//` 前面是冒号，不会被误伤
		.replace(/(^|\s)\/\/[^\n]*/g, '$1');

const sources = new Map(files.map((file) => [file, stripComments(readFileSync(file, 'utf8'))]));

/** registry 变量 → 它镜像的 registry（`createElementRegistry(shared)`）。 */
const mirrors = new Map();
const registryNames = new Set();
for (const [, text] of sources) {
	for (const m of text.matchAll(
		/(?:export\s+)?const\s+(\w+)\s*=\s*createElementRegistry\(\s*(?:(\w+)\s*)?\)/g
	)) {
		registryNames.add(m[1]);
		if (m[2]) mirrors.set(m[1], m[2]);
	}
}

/** 谁写进了这张表（含镜像它的表）。 */
const writersOf = (name) => [name, ...[...mirrors].filter(([, t]) => t === name).map(([s]) => s)];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseArgs = (raw) => {
	const ids = [...raw.matchAll(/'([^']+)'/g)].map((m) => m[1]);
	return { ids, dynamic: ids.length === 0 || /[\w$]/.test(raw.replace(/'[^']*'/g, '')) };
};

const reads = new Map(); // registry -> Map(origin -> { ids:Set, dynamic:boolean, site:string })
const writes = new Map(); // registry -> { ids:Set, dynamic:boolean, sites:[] }

const record = (map, registry, origin, parsed, site) => {
	if (!map.has(registry)) map.set(registry, new Map());
	const byOrigin = map.get(registry);
	if (!byOrigin.has(origin)) byOrigin.set(origin, { ids: new Set(), dynamic: false, sites: [] });
	const entry = byOrigin.get(origin);
	parsed.ids.forEach((id) => entry.ids.add(id));
	entry.dynamic ||= parsed.dynamic;
	entry.sites.push(site);
};

for (const [file, text] of sources) {
	const rel = relative(SRC, file).replace(/\\/g, '/');

	for (const name of registryNames) {
		const R = escape(name);

		// 读：registryElement(Reg, 'id') / registryElements(Reg, ['a','b']) / Reg.get('id')
		for (const m of text.matchAll(
			new RegExp(
				`registryElement(?:s)?\\s*(?:<[\\s\\S]{0,160}?>)?\\s*\\(\\s*${R}\\s*,([\\s\\S]{0,240}?)\\)`,
				'g'
			)
		)) {
			record(reads, name, rel, parseArgs(m[1]), 'registryElement');
		}
		for (const m of text.matchAll(
			new RegExp(`\\b${R}\\s*\\.\\s*get\\s*\\(([^)]{0,80}?)\\)`, 'g')
		)) {
			record(reads, name, rel, parseArgs(m[1]), 'get');
		}

		// 写：registryRef(Reg, 'id') / registerElement(Reg, 'id', …) / Reg.set('id', …)
		for (const m of text.matchAll(
			new RegExp(`registryRef\\s*\\(\\s*${R}\\s*,\\s*([^),]{0,80}?)\\)`, 'g')
		)) {
			record(writes, name, rel, parseArgs(m[1]), 'registryRef');
		}
		for (const m of text.matchAll(
			new RegExp(`registerElement\\s*\\(\\s*${R}\\s*,\\s*([^,]{0,80}?),`, 'g')
		)) {
			record(writes, name, rel, parseArgs(m[1]), 'registerElement');
		}
		for (const m of text.matchAll(
			new RegExp(`\\b${R}\\s*\\.\\s*set\\s*\\(([^,]{0,80}?),`, 'g')
		)) {
			record(writes, name, rel, parseArgs(m[1]), 'set');
		}
	}
}

const writtenIds = new Set();
const dynamicWritten = new Set();
for (const [name, byOrigin] of writes) {
	for (const target of writersOf(name)) {
		if (!writes.has(target) && !byOrigin) continue;
	}
	if ([...byOrigin.values()].some((v) => v.dynamic)) dynamicWritten.add(name);
}

// 汇总：每个注册表的「写入 id 集合」（含镜像）
const effectiveWrites = new Map();
for (const name of registryNames) {
	const ids = new Set();
	let dynamic = false;
	for (const source of writersOf(name)) {
		const byOrigin = writes.get(source);
		if (!byOrigin) continue;
		for (const entry of byOrigin.values()) {
			entry.ids.forEach((id) => ids.add(id));
			if (entry.dynamic) dynamic = true;
		}
	}
	effectiveWrites.set(name, { ids, dynamic });
	ids.forEach((id) => writtenIds.add(id));
	if (dynamic) dynamicWritten.add(name);
}

const deadRegistries = [];
const orphanIds = [];

/** 字符串集合 → 排序数组（显式 comparator：oxlint 的 require-array-sort-compare）。 */
const sorted = (values) => [...values].sort((a, b) => a.localeCompare(b));

const dumpArg = process.argv.indexOf('--dump');
if (dumpArg !== -1) {
	const target = process.argv[dumpArg + 1];
	const write = effectiveWrites.get(target);
	console.log(`# ${target}  writes=${JSON.stringify(sorted(write?.ids ?? []))}`);
	console.log(`# ${target}.dynamic=${write?.dynamic}`);
	for (const [origin, entry] of writes.get(target) ?? []) {
		console.log(
			`# write ← ${origin}: ${[...entry.ids].join(', ')}${entry.dynamic ? ' (dynamic)' : ''}`
		);
	}
	for (const [origin, entry] of reads.get(target) ?? []) {
		console.log(
			`# read  ← ${origin}: ${[...entry.ids].join(', ')}${entry.dynamic ? ' (dynamic)' : ''}`
		);
	}
}
for (const [name, byOrigin] of reads) {
	const write = effectiveWrites.get(name) ?? { ids: new Set(), dynamic: false };
	// 按 id 收读者：只给某个 id 的真读者，不要把「读过这张表其它 id」的文件都算进来
	const readById = new Map();
	let dynamicRead = false;
	for (const [origin, entry] of byOrigin) {
		entry.ids.forEach((id) => {
			if (!readById.has(id)) readById.set(id, new Set());
			readById.get(id).add(origin);
		});
		if (entry.dynamic) dynamicRead = true;
	}
	if (write.ids.size === 0) {
		deadRegistries.push({
			registry: name,
			dynamicWrite: write.dynamic,
			dynamicRead,
			readers: sorted(byOrigin.keys()),
			ids: sorted(readById.keys())
		});
		continue;
	}
	// 动态读（`els.get(someVar)`）不影响字面量 id 的判定：那张表照样可能在别处漏登记。
	for (const [id, readerSet] of [...readById].sort((a, b) => a[0].localeCompare(b[0]))) {
		if (write.ids.has(id)) continue;
		orphanIds.push({
			registry: name,
			id,
			readers: sorted(readerSet),
			elsewhere: writtenIds.has(id),
			// 该表有动态写：可能是 `registerElement(els, someId, …)` 那种写法登记的
			uncertain: write.dynamic
		});
	}
}

// 只报有读者的死表
const dead = deadRegistries.filter((item) => item.ids.length > 0 || item.readers.length > 0);

/** 反过来：有人写、但全仓没有任何读取方的注册表（登记侧可以先不动，属于 P4 清理线索）。 */
const unreadRegistries = [];
for (const name of registryNames) {
	if (reads.has(name)) continue;
	const write = effectiveWrites.get(name);
	if (!write || (write.ids.size === 0 && !write.dynamic)) continue;
	unreadRegistries.push({
		registry: name,
		ids: sorted(write.ids),
		dynamic: write.dynamic
	});
}

if (AS_JSON) {
	console.log(JSON.stringify({ deadRegistries: dead, orphanIds, unreadRegistries }, null, 2));
	process.exit(0);
}

console.log(
	`注册表：${registryNames.size} 张；有读者的死表：${dead.length} 张；孤儿 id：${orphanIds.length} 个\n`
);

if (dead.length > 0) {
	console.log('=== 整张表没有写入方（读到的永远是 undefined）===');
	for (const item of dead) {
		console.log(
			`\n${item.registry}  （${item.dynamicWrite ? '有动态写' : '无写入方'}${item.dynamicRead ? '，有动态读' : ''}）`
		);
		if (item.ids.length > 0) console.log(`  读的 id：${item.ids.join(', ')}`);
		for (const reader of item.readers) console.log(`  ← ${reader}`);
	}
}

if (orphanIds.length > 0) {
	console.log('\n=== 单 id 在这张表里被读但没人写 ===');
	for (const item of orphanIds) {
		console.log(
			`\n${item.id}  @${item.registry}${item.elsewhere ? '  （同一 id 在别的注册表有登记，注意）' : ''}${item.uncertain ? '  （该表另有动态写，需人工确认）' : ''}`
		);
		for (const reader of item.readers) console.log(`  ← ${reader}`);
	}
}

if (unreadRegistries.length > 0) {
	console.log('\n=== 有人写、但全仓没有读取方的注册表（P4 清理线索）===');
	for (const item of unreadRegistries) {
		console.log(
			`\n${item.registry}${item.dynamic ? '（含动态写）' : ''}: ${item.ids.join(', ')}`
		);
	}
}
