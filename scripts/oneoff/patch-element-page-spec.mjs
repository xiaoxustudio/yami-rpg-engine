import { readFileSync, writeFileSync } from 'node:fs';

/**
 * `element-page-open-before-mount.spec.ts`：控件来源从 `inspectorEls` 换成页面控件表
 * （`provideUiElementControls`）。断言的语义不变：没登记 → 不抛错；登记后 → 下个宏任务补齐。
 */
const file = 'packages/editor/src/inspector/__tests__/element-page-open-before-mount.spec.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { inspectorEls } from '@app/inspector/element-registry.ts';",
	"import { provideUiElementControls } from '@app/composables/ui-element-page-controls';"
);
text = text.replace(
	/\t\tinspectorEls\.set\('uiElement-name', makeEl\(\)\);/g,
	"\t\tcontrols['uiElement-name'] = makeEl();"
);
text = text.replace(/inspectorEls\.set\('([^']+)', ([^)]+)\);/g, "controls['$1'] = $2;");
text = text.replace(
	/\t\tInspector\.uiElement\._elementInitialized = false;/,
	'\t\tprovideUiElementControls(controls);\n\t\tInspector.uiElement._elementInitialized = false;'
);

// 每个用例开头建表
text = text.replace(
	/(describe\('UIElement\.open 与「控件尚未登记」', \(\) => \{\n)/,
	'$1\tlet controls: Record<string, unknown> = {};\n\n\tbeforeEach(() => {\n\t\tcontrols = {};\n\t});\n\n'
);
text = text.replace(
	"import { describe, expect, it, vi } from 'vitest';",
	"import { beforeEach, describe, expect, it, vi } from 'vitest';"
);

// 「控件还没登记」用例：显式给空表
text = text.replace(
	/\tit\('控件还没登记时 open\(\) 不抛错（旧代码正是在这里炸）', \(\) => \{\n/,
	"\tit('控件还没登记时 open() 不抛错（旧代码正是在这里炸）', () => {\n\t\tprovideUiElementControls(controls);\n"
);

writeFileSync(file, text);
console.log(/inspectorEls/.test(text) ? '! 仍有 inspectorEls 引用' : '✓ spec 已改');
