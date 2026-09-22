#!/usr/bin/env node
/**
 * 组件样式迁移工具：
 * 把 Project/css/<file>.css 中「归属单一 Vue 组件」的顶层 #id 规则块
 * 迁移到对应 .vue 文件的 <style> 中，并从该 css 删除。
 *
 * 用法：
 *   node scripts/migrate-window-css.cjs [xxx.css] --dry-run   # 仅输出计划与保留清单
 *   node scripts/migrate-window-css.cjs [xxx.css] [--pages]   # 实际执行（默认 command.css）
 *
 * 判定规则：
 * 模式 A（窗口，默认）：
 * - Vue 窗口清单：src/components 下所有 .vue 中 <WindowFrame ... id="X">
 * - 规则块归属：块内每个选择器均为 #id[后缀]，取「最长的窗口 id 前缀」作 owner
 * 模式 B（--pages）：模式 A 未命中时，回退按「模板 id 字面量前缀」最长匹配；
 *   所有选择器必须归属同一 .vue 文件（跨文件歧义或非唯一则保留在 css）
 * 找不到 owner / 非纯 #id 规则 / 注释 → 保留在 css
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cssArg = (process.argv.find((a) => a.endsWith('.css')) ?? 'command.css').replace(
	/^.*[\\/]/,
	''
);
const cssFile = path.join(root, 'Project/css', cssArg);
const srcDir = path.join(root, 'src');

const dryRun = process.argv.includes('--dry-run');
const pagesMode = process.argv.includes('--pages');

function log(msg) {
	process.stdout.write(msg + '\n');
}

/* ---------- 通用 ---------- */
function walk(dir) {
	const out = [];
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) out.push(...walk(full));
		else if (name.endsWith('.vue') || name.endsWith('.ts')) out.push(full);
	}
	return out;
}

/* ---------- 1. 归属索引 ---------- */
const windowList = []; // WindowFrame id -> file
for (const file of walk(srcDir)) {
	if (!file.endsWith('.vue')) continue;
	const text = fs.readFileSync(file, 'utf8');
	const rel = path.relative(root, file).replace(/\\/g, '/');
	const re = /<WindowFrame\b[^>]*?\bid="([^"]+)"/g;
	let m;
	while ((m = re.exec(text)) !== null) windowList.push({ id: m[1], file: rel });
}
const windowSorted = windowList.slice().sort((a, b) => b.id.length - a.id.length);
function findWindowOwner(id) {
	for (const w of windowSorted) {
		if (id === w.id || id.startsWith(w.id + '-')) return w.file;
	}
	return null;
}

const attrOwners = new Map(); // 模板 id 字面量 -> files
if (pagesMode) {
	for (const file of walk(srcDir)) {
		if (!file.endsWith('.vue')) continue;
		const text = fs.readFileSync(file, 'utf8');
		const rel = path.relative(root, file).replace(/\\/g, '/');
		const re = /id="([A-Za-z0-9_-]+)"|:id="'([A-Za-z0-9_-]+)'"/g;
		let m;
		while ((m = re.exec(text)) !== null) {
			const id = m[1] || m[2];
			if (!attrOwners.has(id)) attrOwners.set(id, []);
			attrOwners.get(id).push(rel);
		}
	}
}
const attrSorted = [...attrOwners].sort((a, b) => b[0].length - a[0].length);
function findAttrOwner(id) {
	for (const [attr, files] of attrSorted) {
		if (files.length !== 1) continue;
		if (id === attr || id.startsWith(attr + '-')) return files[0];
	}
	return null;
}

/* ---------- 2. 扫描 css 顶层规则块 ---------- */
const cssText = fs.readFileSync(cssFile, 'utf8');
function skipWsAndComments(pos) {
	while (pos < cssText.length) {
		const ch = cssText[pos];
		if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') pos++;
		else if (cssText.startsWith('/*', pos)) {
			const end = cssText.indexOf('*/', pos + 2);
			pos = end < 0 ? cssText.length : end + 2;
		} else break;
	}
	return pos;
}
const rules = [];
let i = 0;
while (i < cssText.length) {
	i = skipWsAndComments(i);
	if (i >= cssText.length) break;
	const brace = cssText.indexOf('{', i);
	if (brace < 0) break;
	const selText = cssText.slice(i, brace).trim();
	const close = cssText.indexOf('}', brace + 1);
	if (close < 0) break;
	rules.push({
		selectors: selText,
		body: cssText.slice(brace + 1, close),
		start: i,
		end: close + 1
	});
	i = close + 1;
}

/* ---------- 3. 归属判定 ---------- */
const plan = new Map(); // ownerFile -> rules[]
const skipped = []; // { selectors, reason }
for (const rule of rules) {
	if (rule.body.trim() === '') {
		if (rule.selectors !== '') skipped.push({ selectors: rule.selectors, reason: '空规则体' });
		continue;
	}
	const sels = rule.selectors
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	if (sels.some((s) => !/^#[A-Za-z0-9_-]+$/.test(s))) {
		skipped.push({ selectors: rule.selectors, reason: '非纯 #id 规则' });
		continue;
	}
	const windowFiles = sels.map((s) => findWindowOwner(s.slice(1)));
	let file = windowFiles[0] ?? null;
	if (windowFiles.some((f) => f !== file)) file = null;
	if (file === null && pagesMode) {
		const attrFiles = sels.map((s) => findAttrOwner(s.slice(1)));
		if (attrFiles.every((f) => f !== null && f === attrFiles[0])) file = attrFiles[0];
	}
	if (file === null) {
		skipped.push({
			selectors: rule.selectors,
			reason: pagesMode ? '无唯一 Vue 归属' : '无对应 Vue 窗口'
		});
		continue;
	}
	if (!plan.has(file)) plan.set(file, []);
	plan.get(file).push(rule);
}

/* ---------- 4. 报告 ---------- */
const files = [...plan.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
let moved = 0;
for (const f of files) moved += plan.get(f).length;
const one = (s) => s.replace(/\s+/g, ' ').trim();
log(`${cssArg} 顶层规则块: ${rules.length}`);
log(
	`可迁移(归属单一 Vue 组件): ${moved} 块 / ${files.length} 个组件${pagesMode ? '（页面模式）' : ''}`
);
log(`保留在 css: ${skipped.length} 块\n`);
log('=== 保留在 css 的块（需人工复核） ===');
for (const s of skipped) log(`- [${s.reason}] ${one(s.selectors)}`);
log('\n=== 各组件将新增的规则块数（前 30） ===');
for (const f of files.slice(0, 30)) log(`  ${plan.get(f).length}\t${f}`);
if (files.length > 30) log(`  ... 其余 ${files.length - 30} 个组件`);
log(`\n新增 <style> 的组件数: ${files.length}`);
if (dryRun) return;

/* ---------- 5. 执行：写入组件 ---------- */
const styleNote = `/* 样式迁移：由 Project/css/${cssArg} 迁入组件（选择器为全局 id，不能用 scoped） */`;
for (const f of files) {
	const full = path.join(root, f);
	let text = fs.readFileSync(full, 'utf8');
	const blockRules = plan.get(f);
	let css = styleNote + '\n';
	for (const r of blockRules) {
		const body = r.body.replace(/^\n+/, '').replace(/\s+$/, '');
		css += `${r.selectors} {\n${body}\n}\n\n`;
	}
	css = css.trimEnd() + '\n';
	if (text.includes('<style')) {
		const idx = text.indexOf('</style>');
		if (idx < 0) throw new Error(`样式块解析失败: ${f}`);
		text = text.slice(0, idx) + '\n' + css.trimEnd() + '\n' + text.slice(idx);
	} else {
		const tag = '</script>';
		const ai = text.lastIndexOf(tag);
		if (ai < 0) throw new Error(`未找到 ${tag}: ${f}`);
		const head = text.slice(0, ai + tag.length);
		const headNL = head.endsWith('\n') ? head : head + '\n';
		text =
			headNL + '\n<style>\n' + css.trimEnd() + '\n</style>\n' + text.slice(ai + tag.length);
	}
	fs.writeFileSync(full, text);
	log(`+ <style> 写入 ${f}`);
}

/* ---------- 6. 从 css 删除已迁移块并清理孤立注释 ---------- */
const deletions = [];
for (const f of files) for (const r of plan.get(f)) deletions.push(r);
deletions.sort((a, b) => b.start - a.start);
let out = cssText;
for (const r of deletions) out = out.slice(0, r.start) + out.slice(r.end);
out = out.replace(/\n{3,}/g, '\n\n');

function dropOrphanComments(css) {
	const spans = [];
	let p = 0;
	while (p < css.length) {
		const st = css.indexOf('/*', p);
		if (st < 0) break;
		const en = css.indexOf('*/', st + 2);
		const e = en < 0 ? css.length : en + 2;
		spans.push({ st, e });
		p = e;
	}
	const drop = spans.map(() => false);
	for (let k = 0; k < spans.length; k++) {
		const after = spans[k].e;
		const next = k + 1 < spans.length ? spans[k + 1].st : css.length;
		if (css.slice(after, next).trim() === '') drop[k] = true;
	}
	let res = '';
	let pos = 0;
	let count = 0;
	for (let k = 0; k < spans.length; k++) {
		if (!drop[k]) continue;
		res += css.slice(pos, spans[k].st);
		pos = spans[k].e;
		count++;
	}
	res += css.slice(pos);
	res = res.replace(/\n{4,}/g, '\n\n\n');
	return { css: res, count };
}
const clean = dropOrphanComments(out);
fs.writeFileSync(cssFile, clean.css);
log(`\n${cssArg} 已删除 ${deletions.length} 块，清理孤立注释 ${clean.count} 条`);
