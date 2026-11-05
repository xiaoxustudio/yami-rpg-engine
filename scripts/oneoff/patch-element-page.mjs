import { readFileSync, writeFileSync } from 'node:fs';

/** `element-page.ts`：`inspectorEls` 的读写换成「页面控件表」，取值统一经 `elOf` / `elsOf`。 */
const file = 'packages/editor/src/inspector/element-page.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { inspectorEls } from './element-registry.ts';",
	"import { getUiElementControls } from '@app/composables/ui-element-page-controls';"
);

// 1) `inspectorEls.get('x') as YamiElement` / 裸 get → elOf('x')
text = text.replace(/inspectorEls\.get\('([^']+)'\)\s*as\s+YamiElement/g, "elOf('$1')");
text = text.replace(/inspectorEls\.get\('([^']+)'\)/g, "elOf('$1')");

// 2) `registryElements(inspectorEls, [...])` → elsOf([...])
text = text.replace(/registryElements\(inspectorEls, (\[[\s\S]*?\])\)/g, 'elsOf($1)');

// 3) 助手
if (!text.includes('function elOf')) {
	text = text.replace(
		/(\n)(export const UIElement)/,
		[
			'',
			'/** 页面控件表（section 挂载时填进来）；未挂载时返回空，调用点照旧判空。 */',
			'const elOf = (id: string): YamiElement | null =>',
			'\t(getUiElementControls()?.[id] as YamiElement | null | undefined) ?? null;',
			'',
			'const elsOf = (ids: string[]): YamiElement[] =>',
			'\tids.map((id) => elOf(id)).filter((el): el is YamiElement => el != null);',
			'$2'
		].join('\n')
	);
}

writeFileSync(file, text);
const leftovers = [...text.matchAll(/inspectorEls|registryElements/g)];
console.log(leftovers.length ? `! 仍有 ${leftovers.length} 处注册表引用` : '✓ element-page 已改');
