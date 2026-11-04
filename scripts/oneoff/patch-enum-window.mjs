import { readFileSync, writeFileSync } from 'node:fs';

/** `Enum.vue`：7 个 `registryRef` → 模板 ref；挂载时把句柄表交给单例。 */
const file = 'packages/editor/src/components/tools/Enum.vue';
let text = readFileSync(file, 'utf8');

const ids = [
	['enum', 'frame'],
	['enum-list', 'listRef'],
	['enum-properties-flex', 'panelRef'],
	['enum-name', 'nameRef'],
	['enum-value', 'valueRef'],
	['enum-note', 'noteRef'],
	['enum-searcher', 'searcherRef']
];
for (const [id, refName] of ids) {
	text = text.replace(`:ref="registryRef(enumEls, '${id}')"`, `ref="${refName}"`);
}
text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
text = text.replace(
	"import { Enum, enumEls } from '@app/enum/enum-window.ts';",
	[
		"import { Enum } from '@app/enum/enum-window.ts';",
		'import {',
		'\tprovideEnumHandles,',
		'\tresetEnumHandles,',
		'\ttype EnumWindowHandles',
		"} from '@app/composables/enum-handles';"
	].join('\n')
);
text = text.replace(
	"import { h, onMounted, type VNode } from 'vue';",
	"import { h, onMounted, onUnmounted, ref, type VNode } from 'vue';"
);
text = text.replace(
	"import { GameLocal } from '@app/local/local-object.ts';",
	"import { GameLocal } from '@app/local/local-object.ts';\nimport type { YamiElement } from '@app/types/element-api';"
);

const wiring = `
/**
 * 长期持有的 7 个节点一次交给单例（它把 list/panel/searcher/inputs 存成字段并跨 open/close 复用）。
 * 组件 ref 要取根元素：单例把它们当「带元素 API 的元素」用。
 */
const listRef = ref<unknown>(null);
const panelRef = ref<unknown>(null);
const nameRef = ref<unknown>(null);
const valueRef = ref<unknown>(null);
const noteRef = ref<unknown>(null);
const searcherRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: EnumWindowHandles | null = null;

onMounted(() => {
	const root = rootOf(frame.value);
	const list = rootOf(listRef.value);
	const panel = rootOf(panelRef.value);
	const searcher = rootOf(searcherRef.value);
	const name = rootOf(nameRef.value);
	const value = rootOf(valueRef.value);
	const note = rootOf(noteRef.value);
	if (!root || !list || !panel || !searcher || !name || !value || !note) return;
	handles = { root, list, panel, searcher, name, value, note };
	provideEnumHandles(handles);
	onUnmounted(() => {
		if (handles) resetEnumHandles(handles);
	});
});
`;

text = text.replace(/\n<\/script>/, `\n${wiring}</script>`);
writeFileSync(file, text);
console.log(
	/registryRef|enumEls/.test(text) ? '! 仍有 registryRef/enumEls 引用' : '✓ Enum.vue 已改'
);
