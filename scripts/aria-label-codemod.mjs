#!/usr/bin/env node
// 可访问名接线（一次性 codemod，可重复执行）：把控件**紧邻前面**的
// `<div class="text">…</div>` 的内容复制成该控件的 `:label`。
//
// ## 为什么需要它
// 本仓的可见标签与控件在 DOM 上并无关联，两者是 detail-grid 里的两个相邻格子：
//
//     <div class="text">{{ t('components.x-name.label') }}</div>
//     <TextBox id="x-name" v-model="form.name" />
//
// 读屏聚焦到输入框时只会念「编辑框」，不知道是哪一项。ui-kit 的输入原语已支持
// `label`（落到原生控件的 `aria-label` 上），但调用点有数百处，只能机械化。
//
// ## 口径（刻意保守：宁可少改，不可改错）
//   - 只处理 `.vue` 的 `<template>` 段；
//   - 只认「前一个元素恰好是 `<div class="text" …>EXPR</div>`、且两者之间只有空白」；
//   - EXPR 允许两种形态：唯一的 `{{ … }}` 插值（原样搬运，因此在切语言时会跟着重算），
//     或不含 `<`/`{`/`"` 的纯文本（包成单引号字面量）；其余一律跳过；
//   - 目标控件已经有 `:label` / `v-bind:label` 时跳过（幂等，可反复跑）。
//
// 跳过即「不接线」，不会写坏任何东西；接错的唯一可能是「那个 `.text` 不是这个控件的标签」，
// 所以脚本会把每一处改动连同**来源文本**打印出来供人工过目。
//
// ## 用法
//   node scripts/aria-label-codemod.mjs           dry-run（默认，只报数 + 明细）
//   node scripts/aria-label-codemod.mjs --write   落盘
//   node scripts/aria-label-codemod.mjs --quiet   dry-run 且不打明细
//
// 退出码：0 = 正常（含 0 处改动）；2 = 内部错误。

import { writeFileSync } from 'node:fs';
import { collectFiles, readSource } from './lib/scan.mjs';

/** 已支持 `label` → `aria-label` 的输入原语（ui-kit 组件在模板里的标签名） */
const TARGETS = ['TextBox', 'TextArea', 'NumberBox', 'SliderBox', 'KeyboardBox', 'GamepadBox'];

const TEXT_BLOCK_RE = /<div\s+class="text"[^>]*>([\s\S]*?)<\/div>/g;
// 三个捕获组都要用：`lead` 是缩进，`wrapperTag` 是 flex-box 自己的开标签，
// 只有把它们都算进偏移才能定位到里面的控件（第一版只跳过 `<div` 四个字符，
// 结果把 :label 插进了属性值中间 —— 已实测踩到并回滚）。
const FLEX_BOX_RE = /^(\s*)(<div\s+class="flex-box"[^>]*>)([\s\S]*?)<\/div>/;
const ALREADY_LABELLED_RE = /(?:^|\s)(?::|v-bind:)label\s*=|(?:^|\s)label\s*=/;

/**
 * 把 `.text` 块的内容转成可写进 `:label="…"` 的表达式。
 * @returns {string | null} null = 口径外，跳过
 */
function toExpression(inner) {
	const trimmed = inner.trim();
	const interpolation = trimmed.match(/^\{\{\s*([\s\S]*?)\s*\}\}$/);
	if (interpolation) {
		const expr = interpolation[1].trim();
		// 表达式里出现双引号会破坏 :label="…" 的引号配对；这类写法跳过不猜
		return expr === '' || expr.includes('"') ? null : expr;
	}
	// 纯文本标签：必须包成字面量，否则 Vue 会把中文当成标识符
	if (/[<{}"]/.test(trimmed)) return null;
	if (trimmed === '') return null;
	return `'${trimmed.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** 在 `attrs` 区里已有 label 就跳过（幂等） */
function needsLabel(src, tagStart) {
	const tagEnd = src.indexOf('>', tagStart);
	if (tagEnd === -1) return null;
	return ALREADY_LABELLED_RE.test(src.slice(tagStart, tagEnd)) ? null : tagEnd;
}

/**
 * `.text` 后面是 `<div class="flex-box">` 时（滑块与数字框成对出现），
 * 标签描述的是**这一对**。选择落到哪个控件上：
 *   - 有 `NumberBox` 就用它 —— `YMSliderBox` 的 range 输入带 `tabindex="-1"`，本来就不可聚焦，
 *     把可访问名放在滑块上没有任何效果；
 *   - 否则用里面第一个目标控件。
 * @returns {{ relIndex: number, component: string } | null} relIndex = `<Comp` 在 inner 里的下标
 */
function pickInsideFlexBox(inner) {
	const found = [];
	const re = new RegExp(`<(${TARGETS.join('|')})\\b`, 'g');
	let m;
	while ((m = re.exec(inner)) !== null) found.push({ relIndex: m.index, component: m[1] });
	if (found.length === 0) return null;
	return found.find((c) => c.component === 'NumberBox') ?? found[0];
}

/** 处理单个文件，返回改动列表（不落盘） */
function planFile(src) {
	const template = src.match(/<template>[\s\S]*?<\/template>/);
	if (!template) return [];
	const changes = [];
	TEXT_BLOCK_RE.lastIndex = 0;
	let m;
	while ((m = TEXT_BLOCK_RE.exec(src)) !== null) {
		const expr = toExpression(m[1]);
		if (expr === null) continue;
		const textEnd = m.index + m[0].length;
		const after = src.slice(textEnd);

		// 情形一：控件紧邻其后（只允许空白）
		const next = after.match(/^(\s*)<([A-Za-z][-\w]*)\b/);
		if (next && TARGETS.includes(next[2])) {
			const tagStart = textEnd + next[1].length;
			if (needsLabel(src, tagStart) !== null) {
				changes.push({
					index: tagStart + 1 + next[2].length,
					component: next[2],
					expr,
					from: m[1].trim()
				});
			}
			continue;
		}

		// 情形二：标签描述的是 flex-box 里的滑块 + 数字框这一对
		const flex = after.match(FLEX_BOX_RE);
		if (!flex) continue;
		const [, lead, wrapperTag, inner] = flex;
		const pick = pickInsideFlexBox(inner);
		if (pick === null) continue;
		const tagStart = textEnd + lead.length + wrapperTag.length + pick.relIndex;
		if (needsLabel(src, tagStart) === null) continue;
		changes.push({
			index: tagStart + 1 + pick.component.length,
			component: pick.component,
			expr,
			from: m[1].trim()
		});
	}
	return changes;
}

function main() {
	const write = process.argv.includes('--write');
	const quiet = process.argv.includes('--quiet');
	const files = collectFiles({ dirs: [join('packages', 'editor', 'src')] });
	let filesChanged = 0;
	let totalChanges = 0;
	for (const { full, rel } of files) {
		const src = readSource(full);
		if (src === '' || !src.includes('class="text"')) continue;
		const changes = planFile(src);
		if (changes.length === 0) continue;
		// 自检两条（都属于「工具算错了」，必须当场停下而不是写出去）：
		//   1) 同一个标签上两次插入 ⇒ 开标签写成两个 :label（Vue 编译期报重复属性）；
		//   2) 插入点不在标签名之后 ⇒ 会插进属性值中间（第一版实测把
		//      `id="sceneActor-angle-slider"` 劈成了 `id="sceneActor-angle- :label=…slider"`）。
		const seen = new Set();
		for (const c of changes) {
			if (seen.has(c.index)) {
				console.error(`\n✗ ${rel}：同一位置被规划了两次插入（index=${c.index}），已中止。`);
				process.exit(2);
			}
			seen.add(c.index);
			const head = src.slice(c.index - 1 - c.component.length, c.index);
			if (head !== `<${c.component}`) {
				console.error(
					`\n✗ ${rel}：插入点不在 <${c.component}> 标签名之后（上下文 ${JSON.stringify(
						src.slice(Math.max(0, c.index - 40), c.index + 10)
					)}），已中止。`
				);
				process.exit(2);
			}
		}
		filesChanged++;
		totalChanges += changes.length;
		if (!quiet) {
			console.log(`\n${rel}  (${changes.length} 处)`);
			for (const c of changes) {
				console.log(`  <${c.component}>  :label="${c.expr}"   ← ${c.from}`);
			}
		}
		if (write) {
			let out = src;
			// 从后往前插，避免前面插入影响后面的下标
			for (const c of [...changes].sort((a, b) => b.index - a.index)) {
				out = `${out.slice(0, c.index)} :label="${c.expr}"${out.slice(c.index)}`;
			}
			writeFileSync(full, out, 'utf8');
		}
	}
	console.log(
		`\n${write ? '已写入' : 'dry-run'}：${totalChanges} 处 / ${filesChanged} 个文件` +
			(write ? '' : '（加 --write 落盘）')
	);
}

function join(...parts) {
	return parts.join('/');
}

try {
	main();
} catch (error) {
	console.error('aria-label-codemod: 内部错误', error);
	process.exit(2);
}
