import { readFileSync, writeFileSync } from 'node:fs';

/** `Attribute.vue`：9 个 `registryRef` → 模板 ref；挂载时把句柄表交给单例。 */
const file = 'packages/editor/src/components/tools/Attribute.vue';
let text = readFileSync(file, 'utf8');

const ids = [
	['attribute', 'frame'],
	['attribute-list', 'listRef'],
	['attribute-properties-flex', 'panelRef'],
	['attribute-name', 'nameRef'],
	['attribute-key', 'keyRef'],
	['attribute-note', 'noteRef'],
	['attribute-enum', 'enumRef'],
	['attribute-enum-box', 'enumBoxRef'],
	['attribute-searcher', 'searcherRef']
];
for (const [id, refName] of ids) {
	text = text.replace(`:ref="registryRef(attributeEls, '${id}')"`, `ref="${refName}"`);
}
text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
text = text.replace(
	/import \{ Attribute, attributeEls \} from '@app\/attribute\/attribute-window.ts';?/,
	[
		"import { Attribute } from '@app/attribute/attribute-window.ts';",
		'import {',
		'\tprovideAttributeHandles,',
		'\tresetAttributeHandles,',
		'\ttype AttributeWindowHandles',
		"} from '@app/composables/attribute-handles';"
	].join('\n')
);

const vueImport = /import \{ ([^}]*)\} from 'vue';/;
const match = vueImport.exec(text);
if (match) {
	const names = match[1]
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
	for (const extra of ['onMounted', 'onUnmounted', 'ref']) {
		if (!names.includes(extra)) names.push(extra);
	}
	text = text.replace(match[0], `import { ${names.join(', ')} } from 'vue';`);
} else {
	text = text.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { onMounted, onUnmounted, ref } from 'vue';\nimport { useI18n } from 'vue-i18n';"
	);
}
if (!text.includes('import type { YamiElement }')) {
	text = text.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport type { YamiElement } from '@app/types/element-api';"
	);
}
if (!text.includes('WindowFrame from')) {
	text = text.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport WindowFrame from '@app/components/common/WindowFrame.vue';"
	);
}

const wiring = `
/**
 * 长期持有的 9 个节点一次交给单例（它把 list/panel/searcher/inputs 存成字段并跨 open/close 复用）。
 * 组件 ref 统一取根元素：单例把它们当「带元素 API 的元素」用。
 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const listRef = ref<unknown>(null);
const panelRef = ref<unknown>(null);
const nameRef = ref<unknown>(null);
const keyRef = ref<unknown>(null);
const noteRef = ref<unknown>(null);
const enumRef = ref<unknown>(null);
const enumBoxRef = ref<unknown>(null);
const searcherRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: AttributeWindowHandles | null = null;

onMounted(() => {
	const root = rootOf(frame.value);
	const list = rootOf(listRef.value);
	const panel = rootOf(panelRef.value);
	const searcher = rootOf(searcherRef.value);
	const name = rootOf(nameRef.value);
	const key = rootOf(keyRef.value);
	const note = rootOf(noteRef.value);
	const enumControl = rootOf(enumRef.value);
	const enumBox = rootOf(enumBoxRef.value);
	if (!root || !list || !panel || !searcher || !name || !key || !note || !enumControl || !enumBox) {
		return;
	}
	handles = { root, list, panel, searcher, name, key, note, enum: enumControl, enumBox };
	provideAttributeHandles(handles);
	onUnmounted(() => {
		if (handles) resetAttributeHandles(handles);
	});
});
`;

text = text.replace(/\n<\/script>/, `\n${wiring}</script>`);
writeFileSync(file, text);
console.log(
	/registryRef|attributeEls/.test(text)
		? '! 仍有 registryRef/attributeEls 引用'
		: '✓ Attribute.vue 已改'
);
