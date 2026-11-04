import { readFileSync, writeFileSync } from 'node:fs';

/** `AutoTileFrameIndex.vue`：7 个 `registryRef` → 模板 ref；挂载时交出句柄表。 */
const file = 'packages/editor/src/components/tools/AutoTileFrameIndex.vue';
let text = readFileSync(file, 'utf8');

const ids = [
	['autoTile-frameIndex', 'frame'],
	['autoTile-frameIndex-screen', 'screenRef'],
	['autoTile-frameIndex-image-clip', 'clipRef'],
	['autoTile-frameIndex-image', 'imageRef'],
	['autoTile-frameIndex-mask', 'maskRef'],
	['autoTile-frameIndex-marquee', 'marqueeRef'],
	['autoTile-frameIndex-info', 'infoRef']
];
for (const [id, refName] of ids) {
	text = text.replace(`:ref="registryRef(paletteEls, '${id}')"`, `ref="${refName}"`);
}
text = text.replace("import { paletteEls } from '@app/palette/element-registry';\n", '');
text = text.replace(
	"import { registryRef } from '@app/utils/element-registry';\n",
	"import {\n\tprovideFrameIndexHandles,\n\tresetFrameIndexHandles,\n\ttype FrameIndexHandles\n} from '@app/composables/frame-index-handles';\nimport type { YamiElement } from '@app/types/element-api';\n"
);
text = text.replace(
	"import { onMounted } from 'vue';",
	"import { onMounted, onUnmounted, ref } from 'vue';"
);

const wiring = `
/** 7 个节点一次交给单例（它用 getter 按需读，跨 open/close 复用）。 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const screenRef = ref<unknown>(null);
const clipRef = ref<unknown>(null);
const imageRef = ref<unknown>(null);
const maskRef = ref<unknown>(null);
const marqueeRef = ref<unknown>(null);
const infoRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: FrameIndexHandles | null = null;

onMounted(() => {
	const win = rootOf(frame.value);
	const screen = rootOf(screenRef.value);
	const clip = rootOf(clipRef.value);
	const image = rootOf(imageRef.value);
	const mask = rootOf(maskRef.value);
	const marquee = rootOf(marqueeRef.value);
	const info = rootOf(infoRef.value);
	if (!win || !screen || !clip || !image || !mask || !marquee || !info) return;
	handles = { win, screen, clip, mask, image, marquee, info };
	provideFrameIndexHandles(handles);
	onUnmounted(() => {
		if (handles) resetFrameIndexHandles(handles);
	});
});
`;

// 原来的空 onMounted 占位替换成真的接线
text = text.replace(/onMounted\(\(\) => \{\}\);\n/, `${wiring}`);
if (!text.includes('provideFrameIndexHandles(handles)')) {
	text = text.replace(/\n<\/script>/, `\n${wiring}</script>`);
}
writeFileSync(file, text);
console.log(
	/registryRef|paletteEls/.test(text) ? '! 窗口仍有注册表引用' : '✓ AutoTileFrameIndex.vue 已改'
);
