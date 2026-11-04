import { readFileSync, writeFileSync } from 'node:fs';

/**
 * `deferred-window-ready.spec.ts`：`textCaptureEls` 已删除，InsertImage 的断言改为按 DOM id 取控件
 * （控件仍在 DOM 里，只是不再进注册表）。`conditionEls` 这类仍然存在的注册表调用保持不变。
 */
const file = 'packages/editor/src/tools/__tests__/deferred-window-ready.spec.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { Selection, textCaptureEls } from '@app/tools/text-capture';",
	"import { Selection } from '@app/tools/text-capture';"
);

text = text.replace(
	'const controlOf = (registry: Map<string, unknown>, id: string): DataControl =>\n\tregistry.get(id) as DataControl;',
	`/** 注册表为空时按 DOM id 兜底：控件仍在 DOM 里，只是不再进注册表（textCaptureEls 已删除）。 */
const controlOf = (registry: Map<string, unknown> | null, id: string): DataControl =>
	((registry?.get(id) ?? document.getElementById(id)) as DataControl) ?? ({} as DataControl);`
);

text = text.replace(
	'const rowOf = (registry: Map<string, unknown>, id: string): { control: string; label: string } => {\n\tconst control = registry.get(id) as HTMLElement | null;',
	`const rowOf = (
	registry: Map<string, unknown> | null,
	id: string
): { control: string; label: string } => {
	const control = (registry?.get(id) ?? document.getElementById(id)) as HTMLElement | null;`
);

text = text.replace(/controlOf\(textCaptureEls, '/g, "controlOf(null, '");
text = text.replace(/rowOf\(textCaptureEls, '/g, "rowOf(null, '");

writeFileSync(file, text);
console.log(text.includes('textCaptureEls') ? '! 仍有引用' : '✓ ready spec 已改');

const smoke = 'packages/editor/src/tools/__tests__/deferred-window-smoke.spec.ts';
let s = readFileSync(smoke, 'utf8');
s = s.replace("import { textCaptureEls } from '@app/tools/text-capture';\n", '');
s = s.replace(/\tcomposableEls,\n\ttextCaptureEls,\n/, '\tcomposableEls,\n');
writeFileSync(smoke, s);
console.log(s.includes('textCaptureEls') ? '! smoke 仍有引用' : '✓ smoke spec 已改');
