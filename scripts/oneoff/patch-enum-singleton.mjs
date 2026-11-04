import { readFileSync, writeFileSync } from 'node:fs';

/** `enum-window.ts`：把 7 处按 id 取元素换成读窗口交出的句柄表。 */
const file = 'packages/editor/src/enum/enum-window.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { createElementRegistry } from '@app/utils/element-registry';",
	"import { getEnumHandles } from '@app/composables/enum-handles';"
);
text = text.replace('export const enumEls = createElementRegistry();\n\n', '');

text = text.replace(
	/function ensureDomBound\(\) \{\n\tif \(Enum\.list\) return;\n\tconst list = enumEls\.get\('enum-list'\);\n\tif \(!list\) return;\n\tEnum\.list = list as TreeListElement;\n\tEnum\.panel = enumEls\.get\('enum-properties-flex'\) as YamiElement;\n\thide\(Enum\.panel!\);\n\tEnum\.searcher = enumEls\.get\('enum-searcher'\) as YamiElement;\n\tEnum\.inputs\.name = enumEls\.get\('enum-name'\) as YamiElement;\n\tEnum\.inputs\.value = enumEls\.get\('enum-value'\) as YamiElement;\n\tEnum\.inputs\.note = enumEls\.get\('enum-note'\) as YamiElement;/,
	[
		'function ensureDomBound() {',
		'\tif (Enum.list) return;',
		'\tconst handles = getEnumHandles();',
		'\tif (!handles) return;',
		'\tEnum.list = handles.list as TreeListElement;',
		'\tEnum.panel = handles.panel;',
		'\thide(Enum.panel!);',
		'\tEnum.searcher = handles.searcher;',
		'\tEnum.inputs.name = handles.name;',
		'\tEnum.inputs.value = handles.value;',
		'\tEnum.inputs.note = handles.note;'
	].join('\n')
);

text = text.replace(
	"\ton(enumEls.get('enum'), 'close', this.windowClose);\n\ton(enumEls.get('enum'), 'closed', this.windowClosed);",
	"\tconst handles = getEnumHandles();\n\tif (handles) {\n\t\ton(handles.root, 'close', this.windowClose);\n\t\ton(handles.root, 'closed', this.windowClosed);\n\t}"
);

writeFileSync(file, text);
console.log(/enumEls/.test(text) ? '! 仍有 enumEls 引用' : '✓ enum 单例已改');
