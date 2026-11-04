import { readFileSync, writeFileSync } from 'node:fs';

/** `attribute-window.ts`：9 处按 id 取元素 → 读窗口交出的句柄表。 */
const file = 'packages/editor/src/attribute/attribute-window.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { createElementRegistry } from '@app/utils/element-registry';\n",
	"import { getAttributeHandles } from '@app/composables/attribute-handles';\n"
);
text = text.replace('export const attributeEls = createElementRegistry();\n\n', '');

text = text.replace(
	/function ensureDomBound\(\) \{\n\tif \(Attribute\.list\) return;\n\tconst list = attributeEls\.get\('attribute-list'\);\n\tif \(!list\) return;\n\tAttribute\.list = list as TreeListElement;\n\tAttribute\.panel = attributeEls\.get\('attribute-properties-flex'\) as YamiElement;\n\thide\(Attribute\.panel\);\n\tAttribute\.searcher = attributeEls\.get\('attribute-searcher'\) as YamiElement;\n\tAttribute\.inputs\.name = attributeEls\.get\('attribute-name'\) as YamiElement;\n\tAttribute\.inputs\.key = attributeEls\.get\('attribute-key'\) as YamiElement;\n\tAttribute\.inputs\.note = attributeEls\.get\('attribute-note'\) as YamiElement;\n\tAttribute\.inputs\.enum = attributeEls\.get\('attribute-enum'\) as YamiElement;\n\tAttribute\.inputs\.enumBox = attributeEls\.get\('attribute-enum-box'\) as YamiElement;\n/,
	[
		'function ensureDomBound() {',
		'\tif (Attribute.list) return;',
		'\tconst handles = getAttributeHandles();',
		'\tif (!handles) return;',
		'\tconst list = handles.list;',
		'\tAttribute.list = list as TreeListElement;',
		'\tAttribute.panel = handles.panel;',
		'\thide(Attribute.panel);',
		'\tAttribute.searcher = handles.searcher;',
		'\tAttribute.inputs.name = handles.name;',
		'\tAttribute.inputs.key = handles.key;',
		'\tAttribute.inputs.note = handles.note;',
		'\tAttribute.inputs.enum = handles.enum;',
		'\tAttribute.inputs.enumBox = handles.enumBox;',
		''
	].join('\n')
);

text = text.replace(
	"\ton(attributeEls.get('attribute'), 'close', this.windowClose);\n\ton(attributeEls.get('attribute'), 'closed', this.windowClosed);",
	"\tconst handles = getAttributeHandles();\n\tif (handles) {\n\t\ton(handles.root, 'close', this.windowClose);\n\t\ton(handles.root, 'closed', this.windowClosed);\n\t}"
);

writeFileSync(file, text);
console.log(/attributeEls/.test(text) ? '! 仍有 attributeEls 引用' : '✓ attribute 单例已改');
