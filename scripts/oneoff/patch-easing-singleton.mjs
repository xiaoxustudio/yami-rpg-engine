import { readFileSync, writeFileSync } from 'node:fs';

/** `transition-window.ts`：`dataEls` 的读写全部换成两份句柄表。 */
const file = 'packages/editor/src/data/transition-window.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { dataEls } from '@app/data/element-registry';",
	"import {\n\tgetEasingPointsHandles,\n\tgetEasingWindowHandles\n} from '@app/composables/easing-handles';"
);
text = text.replace(
	"import { registryElement, registryElements } from '@app/utils/element-registry';\n",
	''
);

// ensureDomBound
text = text.replace(
	/function ensureDomBound\(\) \{\n\tif \(Easing\.list\) return;\n\tconst list = dataEls\.get\('easing-list'\) as YamiElement;\n\tif \(!list\) return;\n\tEasing\.list = list as NonNullable<typeof Easing\.list>;\n\tEasing\.curve = registryElement<EasingCanvasShape>\(dataEls, 'easing-curve-canvas'\);\n\tEasing\.preview = registryElement<EasingCanvasShape>\(dataEls, 'easing-preview-canvas'\);/,
	[
		'function ensureDomBound() {',
		'\tif (Easing.list) return;',
		'\tconst handles = getEasingWindowHandles();',
		'\tif (!handles) return;',
		'\tconst list = handles.list;',
		'\tEasing.list = list as NonNullable<typeof Easing.list>;',
		'\tEasing.curve = handles.curve as unknown as EasingCanvasShape;',
		'\tEasing.preview = handles.preview as unknown as EasingCanvasShape;'
	].join('\n')
);

// 本地化候选项
text = text.replace(
	/\t\tdataEls\.get\('easing-mode'\)\?\.loadItems\?\.\(items\)/,
	'\t\tgetEasingPointsHandles()?.mode?.loadItems?.(items)'
);
text = text.replace(
	/\t\tdataEls\.get\('easing-preview-reverse'\)\?\.loadItems\?\.\(items\)/,
	'\t\tgetEasingWindowHandles()?.previewReverse?.loadItems?.(items)'
);

// 事件监听：窗口根 / 点网格 / 模式下拉
text = text.replace(
	"\ton(dataEls.get('easing') as YamiElement, 'close', Easing.windowClose);\n\ton(dataEls.get('easing') as YamiElement, 'closed', Easing.windowClosed);\n\ton(dataEls.get('easing-points-grid') as YamiElement, 'change', Easing.dataChange);",
	[
		'\tconst windowHandles = getEasingWindowHandles();',
		'\tif (windowHandles) {',
		"\t\ton(windowHandles.root, 'close', Easing.windowClose);",
		"\t\ton(windowHandles.root, 'closed', Easing.windowClosed);",
		'\t}',
		'\tconst pointsHandles = getEasingPointsHandles();',
		"\tif (pointsHandles) on(pointsHandles.grid, 'change', Easing.dataChange);"
	].join('\n')
);
text = text.replace(
	"\ton(dataEls.get('easing-mode') as YamiElement, 'input', Easing.modeSelect);",
	"\tif (pointsHandles) on(pointsHandles.mode, 'input', Easing.modeSelect);"
);

// 16 个控制点
const pointsBlockRe =
	/\tregistryElements\(dataEls, \[[\s\S]*?\]\)\.forEach\(\(el\) => on\(el, 'input', Easing\.pointInput\)\);/;
text = text.replace(
	pointsBlockRe,
	[
		'\tfor (const el of Object.values(pointsHandles?.points ?? {})) {',
		"\t\ton(el, 'input', Easing.pointInput);",
		'\t}'
	].join('\n')
);

writeFileSync(file, text);
console.log(
	/dataEls|registryElement/.test(text) ? '! 单例仍有注册表引用' : '✓ transition-window 已改'
);
