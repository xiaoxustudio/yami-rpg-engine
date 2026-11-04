import { readFileSync, writeFileSync } from 'node:fs';

/**
 * 从 `text-capture` 单例里摘掉「按 id 装配窗口控件」的部分：
 * 四个 `initialize`（textPosition / textEffect / image / localVariable）已搬进各自窗口，
 * `Selection.initialize` 不再需要「Font 窗口登记过」这个就绪门，也不再有 `textCaptureEls`。
 */
const file = 'packages/editor/src/tools/text-capture.ts';
let text = readFileSync(file, 'utf8');

// ① 注册表与两个 WeakSet
text = text.replace(
	/export const textCaptureEls = createElementRegistry\(composableEls\);\n\n?/,
	''
);
text = text.replace(
	/\/\*\* 已装配的控件元素（每个窗口每次挂载都是新元素，WeakSet 天然支持重新装配）。 \*\/\nconst initializedImageModes = new WeakSet<Element>\(\);\nconst initializedSuggestionKeys = new WeakSet<Element>\(\);\n\n?/,
	''
);

// ② Selection.initialize：去掉就绪门与四个窗口装配调用
text = text.replace(
	/Selection\.initialize = function \(this: SelectionShape\) \{\n\tif \(!textCaptureEls\.get\('font'\)\) return;\n/,
	'Selection.initialize = function (this: SelectionShape) {\n'
);
text = text.replace(
	/\n\tthis\.textPosition\.initialize!\(\);\n\tthis\.textEffect\.initialize!\(\);\n\tthis\.image\.initialize!\(\);\n\tthis\.localVariable\.initialize!\(\);/,
	''
);

// ③ 四个 initialize 实现
text = text.replace(
	/\tinitialize: function \(\) \{\n\t\tconst axis = textCaptureEls\.get\('textPosition-axis'\);\n[\s\S]*?\n\t\},\n\topen: function \(\{ axis = 'x'/,
	"\topen: function ({ axis = 'x'"
);
text = text.replace(
	/\tinitialize: function \(\) \{\n\t\tconst type = textCaptureEls\.get\('textEffect-type'\);\n[\s\S]*?\n\t\},\n\topen: function \(\{\n\t\ttype = 'shadow'/,
	"\topen: function ({\n\t\ttype = 'shadow'"
);
text = text.replace(
	/\tinitialize: function \(\) \{\n\t\tconst apply = \(\): void => \{\n\t\t\tconst mode = textCaptureEls\.get\('insertImage-mode'\);\n[\s\S]*?\n\t\tonToolWindowMounted\('insertImage', apply\);\n\t\},\n\topen: function \(\{\n\t\tmode = 'image'/,
	"\topen: function ({\n\t\tmode = 'image'"
);
text = text.replace(
	/\tfilter: 'all',\n\tinitialize: function \(\) \{\n\t\tconst apply = \(\): void => \{\n\t\t\tconst key = textCaptureEls\.get\('localVariable-key'\);\n[\s\S]*?\n\t\tonToolWindowMounted\('localVariable', apply\);\n\t\},\n\topen: function \(\{ key = '' \} = \{\}\)/,
	"\tfilter: 'all',\n\topen: function ({ key = '' } = {})"
);

// ④ 不再使用的 import
text = text.replace("import { composableEls } from '@app/composables/element-registry';\n", '');
text = text.replace("import { createElementRegistry } from '@app/utils/element-registry';\n", '');
text = text.replace("import type { TextSuggestionTarget } from '@app/commands/text-tip.ts';\n", '');
text = text.replace("import { onToolWindowMounted } from '@app/tools/tool-window-host';\n", '');
text = text.replace("import { TextSuggestion } from '@app/commands/text-tip.ts';\n", '');
text = text.replace(
	"import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';\n",
	''
);

writeFileSync(file, text);

const leftovers = [
	...text.matchAll(
		/textCaptureEls|initializedImageModes|initializedSuggestionKeys|onToolWindowMounted/g
	)
];
console.log(leftovers.length ? `! 仍有 ${leftovers.length} 处引用` : '✓ 已清干净');
