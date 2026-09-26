#!/usr/bin/env node
/**
 * global.d.ts 审计器
 *
 * 用途：把 `packages/editor/Project/global.d.ts` 里每一条"全局类型增强声明"
 * 与"运行期实现"、"全仓引用"对账，输出四分类：
 *
 *   - real      —— 有运行期实现（真·原型/静态扩展）⇒ 保留并注明出处
 *   - residual  —— 无探测到的实现，但被使用 ⇒ 疑似类型残留，需人工确认
 *   - dead      —— 接收者感知的引用为 0 ⇒ 死声明，可直接删
 *   - dup       —— 同一接口同一成员在本文件里声明了两次（纯重复）
 *
 * 为什么要有脚本：曾记下"还剩 26 条同名声明"，复核发现实际是 16 条
 * （文档数字漂移）。判据必须能一键复算，而不是靠人记。
 *
 * 用法：
 *   node scripts/global-types-audit.mjs                 # 全量报表
 *   node scripts/global-types-audit.mjs --json          # JSON 输出
 *   node scripts/global-types-audit.mjs --focus=HTMLElement
 *   node scripts/global-types-audit.mjs --dead          # 只列 0 引用（死声明）
 *   node scripts/global-types-audit.mjs --kind=real     # 只列某分类
 *   node scripts/global-types-audit.mjs --sites         # 打印引用站点（前 8 条）
 *
 * 口径：
 *   **接收者感知**计数——不是裸词边界（`number` 会命中 11000 次），而是
 *   - 实例接口（HTMLElement/Element/Event/…）：只数 `.member` 形式的属性访问
 *   - 构造器/命名空间（Math/ObjectConstructor/CSS/…）：只数 `Host.member`
 *   - `Array<T>`：只数 `.member(` 的调用形态
 *   扫描 `packages/**` + `scripts/**` + `main/**`（排除 node_modules/dist/build 与 `*.d.ts`），
 *   **不排除注释**——所以"0 引用"是强结论。
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TARGET = path.join(ROOT, 'packages/editor/Project/global.d.ts');

const SCAN_DIRS = ['packages', 'scripts', 'main'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue']);
const SKIP_SEGMENTS = new Set(['node_modules', 'dist', 'build', 'out', '.git', 'coverage']);

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
	const hit = args.find((a) => a.startsWith(`--${name}=`));
	return hit ? hit.slice(name.length + 3) : null;
};

/** 构造器/命名空间：按 `Host.member` 计数 */
const CONSTRUCTOR_IFACES = new Set([
	'Math',
	'JSON',
	'Reflect',
	'CSS',
	'ArrayConstructor',
	'ObjectConstructor',
	'StringConstructor',
	'NumberConstructor',
	'RegExpConstructor',
	'FunctionConstructor',
	'BooleanConstructor',
	'SymbolConstructor',
	'Object',
	'String',
	'Number',
	'RegExp',
	'Function',
	'TimerStatic',
	'Window'
]);

/** 接口名 → 运行时全局对象名（不一致时在此登记） */
const HOST_ALIAS = {
	TimerStatic: 'Timer',
	PlatformPath: 'Path'
};

/** 需要同时匹配大小写两种写法的宿主（`window.x` 与 `Window.x` 都是同一个对象） */
const CASE_INSENSITIVE_HOST = new Set(['Window', 'window']);

// ---------------------------------------------------------------- 源码收集

function collectFiles() {
	const out = [];
	const walk = (dir) => {
		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const e of entries) {
			if (SKIP_SEGMENTS.has(e.name)) continue;
			const full = path.join(dir, e.name);
			if (e.isDirectory()) walk(full);
			else if (SCAN_EXT.has(path.extname(e.name)) && !e.name.endsWith('.d.ts'))
				out.push(full);
		}
	};
	for (const d of SCAN_DIRS) walk(path.join(ROOT, d));
	return out;
}

// ------------------------------------------------------- global.d.ts 解析

function parseDecl(fileText) {
	const lines = fileText.split(/\r?\n/);
	const blocks = [];
	let i = 0;
	while (i < lines.length) {
		// 允许泛型形参：`interface Array<T> {`
		const m =
			/^(?:declare\s+)?(?:interface|namespace)\s+([A-Za-z_$][\w$]*)(?:<[^>]*>)?\s*\{/.exec(
				lines[i]
			);
		if (!m) {
			i++;
			continue;
		}
		let depth = 0;
		const body = [];
		let j = i;
		for (; j < lines.length; j++) {
			for (const ch of lines[j]) {
				if (ch === '{') depth++;
				else if (ch === '}') depth--;
			}
			body.push(lines[j]);
			if (depth === 0 && j > i) break;
		}
		blocks.push({
			name: m[1],
			startLine: i + 1,
			endLine: j + 1,
			members: extractMembers(body.slice(1, -1), i + 2)
		});
		i = j + 1;
	}
	return blocks;
}

function extractMembers(bodyLines, baseLine) {
	const out = [];
	for (let k = 0; k < bodyLines.length; k++) {
		const raw = bodyLines[k];
		if (/^\s*\/\//.test(raw) || raw.trim() === '') continue;
		const indent = /^[\t ]*/.exec(raw)[0];
		if (indent.length === 0) continue;
		if (indent.replace(/\t/g, '    ').length > 4) continue; // 嵌套成员，跳过
		const m = /^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*[?:(]/.exec(raw);
		if (!m) continue;
		out.push({ name: m[1], line: baseLine + k, decl: raw.trim() });
	}
	return out;
}

// --------------------------------------------------------- 运行期实现探测

function buildImplIndex(files) {
	const index = new Map();
	const add = (host, member, file, line, kind) => {
		const key = `${host}.${member}`;
		if (!index.has(key)) index.set(key, []);
		const rel = path.relative(ROOT, file).replace(/\\/g, '/');
		if (index.get(key).some((e) => e.file === rel && e.line === line)) return;
		// 只在测试里被"实现"的不算生产实现——`Array.prototype.append` 就是活证据：
		// 唯一的补丁在 `engine/__tests__/ui.spec.ts`，声明却留在 global.d.ts 里。
		const testOnly = /__tests__[\\/]|\.spec\.[jt]s$|\.test\.[jt]s$/.test(rel);
		index.get(key).push({ file: rel, line, kind, testOnly });
	};
	for (const file of files) {
		const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
		for (let n = 0; n < lines.length; n++) {
			const l = lines[n];
			if (/^\s*(?:\/\/|\*)/.test(l)) continue;
			let m = /\b([A-Za-z_$][\w$]*)\.prototype\.([A-Za-z_$][\w$]*)\s*=/g;
			let r;
			while ((r = m.exec(l))) add(r[1], r[2], file, n + 1, 'prototype');
			m = /\b([A-Za-z_$][\w$]*)\.prototype\s*,\s*'([A-Za-z_$][\w$]*)'/g;
			while ((r = m.exec(l))) add(r[1], r[2], file, n + 1, 'prototype-comma');
			m = /\b([A-Z][A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\s*=/g;
			while ((r = m.exec(l))) {
				if (/^\s*(?:const|let|var|this|export|import)\b/.test(l)) continue;
				add(r[1], r[2], file, n + 1, 'static');
			}
			if (/Object\.assign\(\s*([A-Za-z_$][\w$.]*)/.test(l)) {
				const host = /Object\.assign\(\s*([A-Za-z_$][\w$.]*)/.exec(l)[1].split('.').pop();
				for (let q = n; q < Math.min(n + 60, lines.length); q++) {
					const inner = lines[q];
					const mm = /^\s{1,8}([A-Za-z_$][\w$]*)\s*[:(]/g;
					let rr;
					while ((rr = mm.exec(inner))) add(host, rr[1], file, q + 1, 'assign');
					if (/\}\s*\)/.test(inner)) break;
				}
			}
			// attachApi(el, { read, write, … })：ui-kit 把 API 方法装成**元素实例上的自有属性**
			// （不是原型）。这是 `HTMLElement.loadItems` 一类声明的真正实现来源。
			if (/attachApi\s*\(/.test(l)) {
				for (let q = n; q < Math.min(n + 40, lines.length); q++) {
					const inner = lines[q];
					const mm = /([A-Za-z_$][\w$]*)\s*[:,}]/g;
					let rr;
					while ((rr = mm.exec(inner))) {
						if (/^(attachApi|const|function|return)$/.test(rr[1])) continue;
						add('HTMLElement', rr[1], file, q + 1, 'attachApi');
					}
					if (/\}\s*\)/.test(inner) || /\)\s*;?\s*$/.test(inner)) break;
				}
			}
			// Object.defineProperty(X, 'name', …) / Object.defineProperties(X.prototype, { name: … })
			m = /Object\.definePropert(?:y|ies)\(\s*([^,]+),\s*['"]([A-Za-z_$][\w$]*)['"]/g;
			while ((r = m.exec(l))) {
				const host = r[1]
					.replace(/\.prototype$/, '')
					.split('.')
					.pop()
					.trim();
				add(host, r[2], file, n + 1, 'defineProperty');
			}
		}
	}
	return index;
}

// ------------------------------------------------------------------- main

function main() {
	const blocks = parseDecl(fs.readFileSync(TARGET, 'utf8'));
	const files = collectFiles();
	const implIndex = buildImplIndex(files);

	// 预读所有源码
	const sources = files.map((f) => ({ file: f, text: fs.readFileSync(f, 'utf8') }));

	/** 接收者感知的引用计数 */
	function countRefs(iface, member) {
		const esc = member.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		let re;
		if (CONSTRUCTOR_IFACES.has(iface)) {
			// `TimerStatic` 这类"接口名 ≠ 运行时对象名"的，按映射表换回真名
			const host = HOST_ALIAS[iface] ?? iface.replace(/Constructor$/, '');
			// `Window` 接口的成员在运行时写作 `window.x`（小写），大小写都得认
			re = new RegExp(`\\b${host}\\.${esc}\\b`, CASE_INSENSITIVE_HOST.has(host) ? 'gi' : 'g');
		} else {
			// 实例接口：`.member` 属性访问。
			// 负向后视排除 `..`，但**允许** `this.scrollListener.member` 这类链式接收者
			// （早先版本用 `[^\w$.]` 排除链式，把真实调用漏成"0 引用"）。
			re = new RegExp(`(?<!\\.)\\.${esc}\\b`, 'g');
		}
		const hits = [];
		for (const { file, text } of sources) {
			re.lastIndex = 0;
			let r;
			while ((r = re.exec(text))) {
				const line = text.slice(0, r.index).split('\n').length;
				hits.push({
					file: path.relative(ROOT, file).replace(/\\/g, '/'),
					line,
					text: (text.split(/\r?\n/)[line - 1] ?? '').trim().slice(0, 140)
				});
			}
		}
		return hits;
	}

	// 重复声明检测
	const seen = new Map();
	const rows = [];
	const focus = opt('focus');

	for (const block of blocks) {
		if (focus && block.name !== focus) continue;
		for (const mem of block.members) {
			const key = `${block.name}.${mem.name}`;
			const dup = seen.has(key);
			seen.set(key, (seen.get(key) ?? 0) + 1);
			const hits = dup ? [] : countRefs(block.name, mem.name);
			const alias = HOST_ALIAS[block.name] ?? block.name.replace(/Constructor$/, '');
			const impl = implIndex.get(key) ?? implIndex.get(`${alias}.${mem.name}`) ?? [];
			const prodImpl = impl.filter((i) => !i.testOnly);
			let kind;
			if (dup) kind = 'dup';
			else if (prodImpl.length > 0) kind = 'real';
			else if (impl.length > 0)
				kind = 'testonly'; // 只在测试里被装过 ⇒ 类型残留
			else if (hits.length === 0) kind = 'dead';
			else kind = 'residual';
			rows.push({
				iface: block.name,
				member: mem.name,
				line: mem.line,
				decl: mem.decl,
				refs: hits.length,
				hits: hits.slice(0, 8),
				impl,
				kind
			});
		}
	}

	if (flag('json')) {
		console.log(JSON.stringify({ rows }, null, 2));
		return;
	}

	const onlyKind = opt('kind');
	const order = { dup: 0, testonly: 1, dead: 2, residual: 3, real: 4 };
	const shown = rows.filter((r) =>
		flag('dead') ? r.kind === 'dead' : onlyKind ? r.kind === onlyKind : true
	);
	shown.sort(
		(a, b) =>
			({ dup: 0, testonly: 1, dead: 2, residual: 3, real: 4 })[a.kind] - order[b.kind] ||
			a.iface.localeCompare(b.iface) ||
			a.member.localeCompare(b.member)
	);

	const byKind = {};
	for (const r of rows) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;

	console.log('=== global.d.ts 全局类型增强审计 ===');
	console.log(`文件: ${path.relative(ROOT, TARGET).replace(/\\/g, '/')}`);
	console.log(`接口块: ${blocks.length}   成员声明: ${rows.length}`);
	console.log(
		`分类: dup=${byKind.dup ?? 0}（重复声明） dead=${byKind.dead ?? 0}（0 引用） ` +
			`residual=${byKind.residual ?? 0}（无实现探测） real=${byKind.real ?? 0}（有实现）`
	);
	console.log('');

	for (const r of shown) {
		const implStr = r.impl.length ? r.impl.map((i) => `${i.file}:${i.line}`).join(' ') : '';
		console.log(
			`[${r.kind.toUpperCase().padEnd(8)}] ${r.iface}.${r.member}  (L${r.line})  refs=${r.refs}${implStr ? `  impl=${implStr}` : ''}`
		);
		if (flag('sites') && r.kind !== 'dup') {
			for (const h of r.hits) console.log(`             · ${h.file}:${h.line}  ${h.text}`);
		}
	}
}

main();
