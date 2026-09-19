/**
 * 技法 5f（预览/应用）：**无类型标注**的单例字面量
 *
 * 形态（本仓 3 个文件：transition-window / color-picker-window / image-crop-window）：
 *
 *   export const Easing = {
 *     data: null as EasingData[] | null,     // ← 这些 cast 在**定义导出类型**
 *     scale: null as unknown as number,
 *     changed: false,                        // ← 真实值，类型靠推断
 *   };
 *
 * 这跟 5a/5e 不是一回事：字面量没有标注，类型是**从 cast 推断出来的**，
 * 所以不能靠 `satisfies Partial<T>` —— 得先把槽位类型**具名化**：
 *
 *   const EasingBase = {
 *     changed: false,
 *   };
 *
 *   /** 延迟绑定槽：initialize() 之后才有值 *\/
 *   interface EasingSlots {
 *     data: EasingData[] | null;
 *     scale: number;
 *   }
 *
 *   export const Easing = EasingBase as typeof EasingBase & EasingSlots;
 *
 * 关键点：
 *   - 槽位那几行**原地搬进 interface**，只去掉 `null as [unknown as] `、把结尾 `,` 换成 `;`
 *     ⇒ 多行类型、类型里的注释、缩进全部原样保留。
 *   - 真实值那部分不写类型，靠 `typeof EasingBase` 推断 ⇒ 与改动前逐属性一致，
 *     不需要人工抄写几十个成员类型。
 *   - `as` 方向是「交集 → 其成员」，必然可赋值 ⇒ **合法且不需要 `unknown` 中转**。
 *   - 真实值与槽位两个成员集**互不相交**（cast 行全部搬走），否则交集会把属性收窄成 never。
 *
 * 用法：node scripts/lazy-slot-untyped-codemod.mjs --preview --file=<rel>
 *       node scripts/lazy-slot-untyped-codemod.mjs --apply   --file=<rel>
 *   （或 pnpm migration:lazy-slots-untyped）
 *   默认就是 --preview（只打印生成结果，不写盘）；必须显式加 --apply。
 *   一次只处理一个文件：这个形态需要先看清 `真实值成员` 有哪些、以及有没有
 *   `this.槽位` 读取（脚本会告警），不适合无脑批量。
 *
 * ⚠️ 按逗号切属性时，**最后一个属性是以闭合括号结尾的**，终止判定必须在括号更新之前做，
 *    否则最后一个槽位会被静默吞掉（实测踩过：`close: null as (() => void) | null` 消失，
 *    直到别处读 `Easing.close` 才由 tsc 报 TS2339 暴露）。
 */
import { writeFileSync } from 'node:fs';
import { readSource } from './lib/scan.mjs';
import { join } from 'node:path';
import { ROOT } from './lib/scan.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const preview = args.includes('--preview') || !apply;
const only = args.find((a) => a.startsWith('--file='))?.slice(7);
if (!only) {
	console.error('需要 --file=<rel>');
	process.exit(2);
}

/** 长度保持的「代码视图」：注释与字符串置空，用于括号/逗号配平 */
function codeOnly(src) {
	const out = src.split('');
	let i = 0;
	const n = src.length;
	while (i < n) {
		const ch = src[i];
		const next = src[i + 1];
		if (ch === '/' && next === '/') {
			const end = src.indexOf('\n', i);
			const stop = end === -1 ? n : end;
			for (let k = i; k < stop; k++) if (out[k] !== '\n') out[k] = ' ';
			i = stop;
			continue;
		}
		if (ch === '/' && next === '*') {
			const end = src.indexOf('*/', i + 2);
			const stop = end === -1 ? n : end + 2;
			for (let k = i; k < stop; k++) if (out[k] !== '\n') out[k] = ' ';
			i = stop;
			continue;
		}
		if (ch === "'" || ch === '"' || ch === '`') {
			let k = i + 1;
			while (k < n) {
				if (src[k] === '\\') {
					k += 2;
					continue;
				}
				if (src[k] === ch) break;
				k++;
			}
			const stop = Math.min(k + 1, n);
			for (let j = i; j < stop; j++) if (out[j] !== '\n') out[j] = ' ';
			i = stop;
			continue;
		}
		i++;
	}
	return out.join('');
}

const full = join(ROOT, only);
const src = readSource(full);
const code = codeOnly(src);
const lines = src.split('\n');

const m = /^([ \t]*)(export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*\{\s*$/m.exec(code);
if (!m) throw new Error('找不到 `const NAME = {` 形态');
const indent = m[1];
const exported = Boolean(m[2]);
const name = m[3];
const declLineIdx = code.slice(0, m.index).split('\n').length - 1;
const vOpen = code.indexOf('{', m.index);
let depth = 0;
let vClose = -1;
for (let k = vOpen; k < code.length; k++) {
	if (code[k] === '{') depth++;
	else if (code[k] === '}') {
		depth--;
		if (depth === 0) {
			vClose = k;
			break;
		}
	}
}

// 按顶层逗号切分属性。
// ⚠️ 最后一个属性是以**闭合括号**结尾的，不是逗号 ⇒ 终止判定必须在括号更新**之前**做，
//    否则 `}` 会被当成「深度减一」而把最后一个属性整个丢掉
//    （本轮实测：`close: null as (() => void) | null` 被静默吞掉，靠 tsc 在
//     `stores/easing.ts` 的 `Easing.close` 处才暴露出来）。
const props = [];
let start = vOpen + 1;
let d = 0;
const pushProp = (from, to) => {
	const text = src.slice(from, to);
	if (text.trim()) props.push({ start: from, end: to, text });
};
for (let k = vOpen + 1; k < vClose; k++) {
	const c = code[k];
	if (c === ',' && d === 0) {
		pushProp(start, k);
		start = k + 1;
		continue;
	}
	if (c === '{' || c === '[' || c === '(') d++;
	else if (c === '}' || c === ']' || c === ')') d--;
}
pushProp(start, vClose);
void declLineIdx;

function isCast(rhs) {
	return /^null\s+as\s+(?:unknown\s+as\s+)?/.test(rhs.trim());
}
/** 返回顶层 `:` 的位置（getter/setter/简写没有）；depth 以属性文本自身为基准 */
function topColon(text) {
	const c = codeOnly(text);
	let dd = 0;
	for (let i = 0; i < c.length; i++) {
		const ch = c[i];
		if (ch === '{' || ch === '[' || ch === '(') dd++;
		else if (ch === '}' || ch === ']' || ch === ')') dd--;
		else if (ch === ':' && dd === 0) return i;
	}
	return -1;
}

const slots = [];
const real = [];
for (const p of props) {
	// 去掉属性前后多余的换行/空白（分隔逗号已排除）
	const text = p.text.replace(/^[\r\n]+/, '').replace(/[\s]+$/, '');
	const ci = topColon(text);
	if (ci < 0) {
		real.push({ ...p, text, name: null, rhs: null });
		continue;
	}
	const nm = text.slice(0, ci).trim();
	const rhs = text.slice(ci + 1).trim();
	if (isCast(rhs)) slots.push({ ...p, text, name: nm, rhs });
	else real.push({ ...p, text, name: nm, rhs });
}

// 槽位行：去掉 `null as [unknown as] `，结尾补 `;`
// 注意不能把 cast 前缀后面的空白一起吃掉：类型换行写的那种（`list: null as\n\t\t| …`）
// 一旦被压成一行就变成 `list: | (…)` ——合法但很难看。
// 所以只在「类型与名字同行」时补一个空格。
function toSlotMember(p) {
	const ci = topColon(p.text);
	const head = p.text.slice(0, ci + 1);
	// `as` 后面只允许**空格/制表符**，不能用 `\s+`：类型换行写时 `\s+` 会把换行一起吃掉
	let rhs = p.text.slice(ci + 1).replace(/^\s*null\s+as[ \t]*(?:unknown[ \t]+as[ \t]*)?/, '');
	if (!/^[\r\n]/.test(rhs)) rhs = ` ${rhs.replace(/^\s+/, '')}`;
	return `${head}${rhs};`;
}

const slotText = slots.map(toSlotMember).join('\n');
const realText = real.map((p) => p.text).join(',\n');

// 字面量内部是否用 `this.槽位` 读槽位：真值部分搬进 `NAMESlots` 后，
// 字面量里 `this` 的类型只剩 base ⇒ 这类读取会报错，需要人工加 `this` 标注。
const bodySrc = src.slice(vOpen, vClose);
const thisReads = slots
	.map((s) => s.name)
	.filter((n2) => new RegExp(`\\bthis\\.${n2}\\b`).test(bodySrc));

// 真实值部分为空时不必造一个空 base：`{}` 直接断言到槽位形状即可
// （`NAMESlots` 可赋给 `{}` ⇒ 这个断言合法，且不需要 `unknown` 中转）。
const head =
	real.length === 0
		? `${indent}export const ${name} = {} as ${name}Slots;` +
			`\n\n${indent}/**\n${indent} * 延迟绑定槽：由 \`initialize()\` 填充（此前读到的是 undefined）。\n${indent} */\n${indent}interface ${name}Slots {\n${slotText}\n${indent}}`
		: `${indent}const ${name}Base = {\n${realText}\n${indent}};\n\n${indent}/**\n${indent} * 延迟绑定槽：由 \`initialize()\` 填充（此前读到的是 undefined）。\n${indent} */\n${indent}interface ${name}Slots {\n${slotText}\n${indent}}\n\n${indent}export const ${name} = ${name}Base as typeof ${name}Base & ${name}Slots;`;

console.log(`文件：${only}`);
console.log(`  声明：${exported ? 'export ' : ''}const ${name} = {  (L${declLineIdx + 1})`);
console.log(`  槽位 ${slots.length} 个，真实值 ${real.length} 个`);
console.log(`  真实值成员：${real.map((r) => r.name ?? '<getter/method>').join(', ')}`);
if (thisReads.length) {
	console.log(`  ⚠️ 字面量内部用 this 读了槽位（需人工加 this 标注）：${thisReads.join(', ')}`);
}
if (preview) {
	console.log('');
	console.log('--- 生成结果 ---');
	console.log(head);
	console.log('--- 生成结果结束 ---');
}

if (apply) {
	// 原字面量的结尾 `};` 里那个分号要**吃掉**：head 自己已经收了尾，
	// 否则会写成 `…EasingSlots;;`（真实值非空）或给 interface 后面挂一个 `};`（真实值为空）。
	let tail = src.slice(vClose + 1);
	if (tail.startsWith(';')) tail = tail.slice(1);
	const out = src.slice(0, m.index) + head + tail;
	writeFileSync(full, out, 'utf8');
	console.log(`  ✅ 已写入（-${slots.length} 处 cast）`);
}
