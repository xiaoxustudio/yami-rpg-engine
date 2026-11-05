import { readFileSync, writeFileSync } from 'node:fs';

/** `AutoTile.vue`：5 个 `registryRef` → 模板 ref；挂载时交出句柄表。 */
const autoTileFile = 'packages/editor/src/components/tools/AutoTile.vue';
let text = readFileSync(autoTileFile, 'utf8');

const ids = [
	['autoTile', 'frame'],
	['autoTile-templates', 'templatesRef'],
	['autoTile-nodes', 'nodesRef'],
	['autoTile-canvas', 'canvasRef'],
	['autoTile-frames', 'framesRef']
];
for (const [id, refName] of ids) {
	text = text.replace(`:ref="registryRef(paletteEls, '${id}')"`, `ref="${refName}"`);
}
text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
text = text.replace(
	/import \{ h, onMounted, type VNode \} from 'vue';/,
	"import { h, onMounted, onUnmounted, ref, type VNode } from 'vue';"
);
if (!text.includes('import type { YamiElement }')) {
	text = text.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport type { YamiElement } from '@app/types/element-api';"
	);
}
if (!text.includes('auto-tile-handles')) {
	text = text.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport {\n\tprovideAutoTileHandles,\n\tresetAutoTileHandles,\n\ttype AutoTileHandles\n} from '@app/composables/auto-tile-handles';"
	);
}

const wiring = `
/** 长期持有的 5 个节点一次交给单例（模板 / 节点 / 帧三张列表 + 画布 + 根元素）。 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const templatesRef = ref<unknown>(null);
const nodesRef = ref<unknown>(null);
const canvasRef = ref<unknown>(null);
const framesRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: AutoTileHandles | null = null;

onMounted(() => {
	const root = rootOf(frame.value);
	const templates = rootOf(templatesRef.value);
	const nodes = rootOf(nodesRef.value);
	const canvas = canvasRef.value as HTMLCanvasElement | null;
	const frames = rootOf(framesRef.value);
	if (!root || !templates || !nodes || !canvas || !frames) return;
	handles = { root, canvas, templates, nodes, frames };
	provideAutoTileHandles(handles);
	onUnmounted(() => {
		if (handles) resetAutoTileHandles(handles);
	});
});
`;

text = text.replace(/onMounted\(\(\) => \{\}\);\n/, wiring);
if (!text.includes('provideAutoTileHandles(handles)')) {
	text = text.replace(/\n<\/script>/, `\n${wiring}</script>`);
}
if (!text.includes('WindowFrame from')) {
	text = text.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport WindowFrame from '@app/components/common/WindowFrame.vue';"
	);
}
writeFileSync(autoTileFile, text);
console.log(
	/registryRef|paletteEls/.test(text) ? '! AutoTile.vue 仍有注册表引用' : '✓ AutoTile.vue 已改'
);

/** `AutoTileSelectNode.vue`：3 个 `registryRef` → 模板 ref；交出 TileNodeHandles。 */
const nodeFile = 'packages/editor/src/components/tools/AutoTileSelectNode.vue';
let node = readFileSync(nodeFile, 'utf8');
node = node.replace(
	':ref="registryRef(composableEls, \'autoTile-selectNode-canvas\')"',
	'ref="canvasRef"'
);
node = node.replace(
	':ref="registryRef(composableEls, \'autoTile-selectNode-screen\')"',
	'ref="screenRef"'
);
node = node.replace(
	':ref="registryRef(composableEls, \'autoTile-selectNode-marquee\')"',
	'ref="marqueeRef"'
);
node = node.replace("import { composableEls } from '@app/composables/element-registry';\n", '');
node = node.replace(
	"import { registryRef, registerElement } from '@app/utils/element-registry';\n",
	"import {\n\tprovideTileNodeHandles,\n\tresetTileNodeHandles,\n\ttype TileNodeHandles\n} from '@app/composables/auto-tile-handles';\n"
);
node = node.replace(
	"import { onMounted, ref } from 'vue';",
	"import { onMounted, onUnmounted, ref } from 'vue';"
);

const nodeWiring = `
/** 画布 / 容器 / 选框三个节点一次交给 \`useTileNodeWindow\`。 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const canvasRef = ref<unknown>(null);
const screenRef = ref<unknown>(null);
const marqueeRef = ref<unknown>(null);

let handles: TileNodeHandles | null = null;

onMounted(() => {
	const root = frame.value?.root ?? null;
	const canvas = canvasRef.value as HTMLCanvasElement | null;
	const screen = screenRef.value as HTMLElement | null;
	const marquee = (marqueeRef.value as { root?: unknown } | null)?.root ?? null;
	if (!root || !canvas || !screen || !(marquee instanceof HTMLElement)) return;
	handles = { root, canvas, screen, marquee };
	provideTileNodeHandles(handles);
	onUnmounted(() => {
		if (handles) resetTileNodeHandles(handles);
	});
});
`;

node = node.replace(/onMounted\(\(\) => \{\}\);\n/, nodeWiring);
if (!node.includes('provideTileNodeHandles(handles)')) {
	node = node.replace(/\n<\/script>/, `\n${nodeWiring}</script>`);
}
writeFileSync(nodeFile, node);
console.log(
	/registryRef|composableEls/.test(node)
		? '! AutoTileSelectNode 仍有注册表引用'
		: '✓ AutoTileSelectNode.vue 已改'
);
