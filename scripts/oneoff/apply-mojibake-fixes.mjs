// 一次性脚本（第 125 轮）：把 17 处 mojibake 换成**写坏之前**的原文。
//
// 纪律：脚本自己校验三件事，任一条不成立就报错退出（不静默改坏）——
//   1. 目标行**现在**确实是 mojibake（用判据验，不靠硬编码乱码字面量 —— 那会把乱码又写进仓库）；
//   2. 替换前记录旧行，替换后旧行必须变；
//   3. 替换后该行**不再是** mojibake。
// 原文来源逐条写在 `source` 上（git 提交 + 行号，或推论依据），便于复核。
//
// 运行：node scripts/oneoff/apply-mojibake-fixes.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../lib/scan.mjs';
import { detectMojibake } from '../lib/gbk-mojibake.mjs';

/** `{ file, line, text, source }` —— line 是 1 基行号。 */
const FIXES = [
	{
		file: 'packages/editor/src/components/inspector/SceneTilemapPage.vue',
		line: 339,
		text: '\t\t\t// 语言切换中间态：t()/DOM 访问可能失败，跳过本次刷新',
		source: '1ebf7427^ 同文件第 284 行（逐字）'
	},
	{
		file: 'packages/editor/src/components/tools/TextPosition.vue',
		line: 2,
		text: '\t<!-- 设置文字位置 -->',
		source: '1ebf7427^ 同文件第 2 行（逐字）'
	},
	{
		file: 'packages/editor/src/components/tools/Variable.vue',
		line: 2,
		text: '\t<!-- 变量窗口 -->',
		source: '96303b39^ 同文件第 2 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/animation-action-page.ts',
		line: 60,
		text: '\t\t\t// 此处不能unselect并update Animation.list.unselect(this.target) Animation.updateTarget!()',
		source: '54a7d809^ legacy/inspector/animation-action-page.ts 第 88 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/element-button-page.ts',
		line: 207,
		text: '\t\t\t\t// 直接复制，更新语言包中的内容',
		source: '54a7d809^ legacy/inspector/element-button-page.ts 第 353 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/element-dialog-page.ts',
		line: 92,
		text: '\t\t\t\t// 直接复制，更新语言包中的内容',
		source: '54a7d809^ legacy/inspector/element-dialog-page.ts 第 154 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/element-text-page.ts',
		line: 156,
		text: '\t\t\t\t// 直接复制，更新语言包中的内容',
		source: '54a7d809^ legacy/inspector/element-text-page.ts 第 218 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/file-audio-page.ts',
		line: 131,
		text: '\t\t\t\t// 保留对返回的原始promise的引用 以便可以取消解码音频数据的操作',
		source: '54a7d809^ legacy/inspector/file-audio-page.ts 第 104 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/file-audio-page.ts',
		line: 327,
		text: '\t\t\t// 取最近150ms的强度平均值(平滑过渡)',
		source: '54a7d809^ legacy/inspector/file-audio-page.ts 第 298 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/inspector.ts',
		line: 386,
		text: '\t\t\t// 如果是滑动框类型则跳到default',
		source: '54a7d809^ legacy/inspector/inspector.ts 第 294 行（逐字）'
	},
	{
		file: 'packages/editor/src/inspector/inspector.ts',
		line: 475,
		text: '\t\t\t// 因此需要判断manager.focusing',
		source: '54a7d809^ legacy/inspector/inspector.ts 第 382 行（逐字）'
	},
	{
		file: 'packages/editor/src/palette/palette-pointer.ts',
		line: 38,
		text: '\t\t\t// 如果正在修改图块组宽高，让它立即生效',
		source: '4e15d838^ 同文件第 37 行（逐字）'
	},
	{
		file: 'packages/editor/src/scene/scene-events-list.ts',
		line: 92,
		text: '\t\t\t// 正在编辑图块时直接打开瓦片地图 图块组关闭时打开瓦片地图检查器',
		source: '223cc4c0^ packages/editor/src/scene/scene-events.ts 第 1339 行（逐字）'
	},
	{
		file: 'packages/editor/src/tools/property-list.ts',
		line: 225,
		text: '\t\t// key write 经 Vue 模板转发（ObjectAttribute.vue @write → AttributeListInterface.keyWrite）',
		source: 'd087d0cd 新写入即是乱码（父提交无此行）；按同族约定还原（attribute-window.ts:353「name/key input 经 Vue 模板转发（…）」+ element-page.ts:124）'
	},
	{
		file: 'packages/ui-kit/src/components/basic/YMScrollBar/__tests__/scroll-bar-api.spec.ts',
		line: 20,
		text: "\tit('drag dispatches userscroll on target（9.48 回归——marquee 同步链）', () => {",
		source: 'f5e9607c^ 同文件第 17 行（逐字）'
	},
	{
		file: 'packages/ui-kit/src/components/basic/YMScrollBar/__tests__/scroll-bar-api.spec.ts',
		line: 60,
		text: "\tit('drag works when bar size is 0 (denom fallback——9.46 回归)', () => {",
		source: 'f5e9607c^ 同文件第 54 行（逐字）'
	},
	{
		file: 'packages/ui-kit/src/components/business/YMTitleBar/YMTitleBar.vue',
		line: 34,
		text: '\t\t// 防模块级 dragging 残留（拖拽中 pointerup 丢失时阻断后续所有窗口拖拽）',
		source: 'f7d16bd2^ 同文件第 34 行（逐字）'
	}
];

// 按文件分组，一次读写一个文件
const byFile = new Map();
for (const fix of FIXES) {
	if (!byFile.has(fix.file)) byFile.set(fix.file, []);
	byFile.get(fix.file).push(fix);
}

let applied = 0;
const problems = [];
for (const [file, fixes] of byFile) {
	const abs = join(ROOT, file);
	const original = readFileSync(abs, 'utf8');
	const lines = original.split('\n');
	for (const fix of fixes) {
		const at = fix.line - 1;
		const before = lines[at];
		if (before === undefined) {
			problems.push(`${file}:${fix.line} 不存在`);
			continue;
		}
		if (detectMojibake(before, { minChars: 2 }) === null) {
			problems.push(`${file}:${fix.line} 现在并不是 mojibake —— 拒绝改（可能已经修过）`);
			continue;
		}
		if (detectMojibake(fix.text, { minChars: 2 }) !== null) {
			problems.push(`${file}:${fix.line} 的替换文本本身是 mojibake —— 拒绝写`);
			continue;
		}
		lines[at] = fix.text;
		applied++;
		console.log(`  ✓ ${file}:${fix.line}`);
		console.log(`      旧 ${JSON.stringify(before)}`);
		console.log(`      新 ${JSON.stringify(fix.text)}`);
		console.log(`      据 ${fix.source}`);
	}
	writeFileSync(abs, lines.join('\n'), 'utf8');
}

console.log(`\n=== 应用 ${applied}/${FIXES.length} 处 ===`);
if (problems.length > 0) {
	console.log('问题：');
	for (const p of problems) console.log(`  ✗ ${p}`);
	process.exit(1);
}
