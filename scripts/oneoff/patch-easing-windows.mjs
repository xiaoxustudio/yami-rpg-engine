import { readFileSync, writeFileSync } from 'node:fs';

/**
 * 把 `Easing.vue`（5 个 id）与 `EasingPointsSection.vue`（18 个 id）改成句柄表接线。
 * 单例侧同步改（`transition-window.ts`）。
 */

// ── Easing.vue ───────────────────────────────────────────────
const easingFile = 'packages/editor/src/components/tools/Easing.vue';
let easing = readFileSync(easingFile, 'utf8');
const easingIds = [
	['easing', 'frame'],
	['easing-list', 'listRef'],
	['easing-curve-canvas', 'curveRef'],
	['easing-preview-canvas', 'previewRef'],
	['easing-preview-reverse', 'previewReverseRef']
];
for (const [id, refName] of easingIds) {
	easing = easing.replace(`:ref="registryRef(dataEls, '${id}')"`, `ref="${refName}"`);
}
easing = easing.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
easing = easing.replace(
	/import \{ h, onMounted, type VNode \} from 'vue';/,
	"import { h, onMounted, onUnmounted, ref, type VNode } from 'vue';"
);
if (!easing.includes('easing-handles')) {
	easing = easing.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport {\n\tprovideEasingWindowHandles,\n\tresetEasingWindowHandles,\n\ttype EasingWindowHandles\n} from '@app/composables/easing-handles';\nimport type { YamiElement } from '@app/types/element-api';"
	);
}
const easingWiring = `
/** 窗口根 / 列表 / 两条画布 / 预览开关一次交给单例（它长期持有这些节点）。 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const listRef = ref<unknown>(null);
const curveRef = ref<unknown>(null);
const previewRef = ref<unknown>(null);
const previewReverseRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: EasingWindowHandles | null = null;

onMounted(() => {
	const root = rootOf(frame.value);
	const list = rootOf(listRef.value);
	const curve = rootOf(curveRef.value);
	const preview = rootOf(previewRef.value);
	const previewReverse = rootOf(previewReverseRef.value);
	if (!root || !list || !curve || !preview || !previewReverse) return;
	handles = { root, list, curve, preview, previewReverse };
	provideEasingWindowHandles(handles);
	onUnmounted(() => {
		if (handles) resetEasingWindowHandles(handles);
	});
});
`;
easing = easing.replace(/onMounted\(\(\) => \{\}\);\n/, easingWiring);
if (!easing.includes('provideEasingWindowHandles(handles)')) {
	easing = easing.replace(/\n<\/script>/, `\n${easingWiring}</script>`);
}
if (!easing.includes('WindowFrame from')) {
	easing = easing.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport WindowFrame from '@app/components/common/WindowFrame.vue';"
	);
}
writeFileSync(easingFile, easing);
console.log(
	/registryRef|dataEls/.test(easing) ? '! Easing.vue 仍有注册表引用' : '✓ Easing.vue 已改'
);

// ── EasingPointsSection.vue ─────────────────────────────────
const sectionFile = 'packages/editor/src/components/tools/easing/EasingPointsSection.vue';
let section = readFileSync(sectionFile, 'utf8');

// 16 个控制点：easing-points-<n>-<x|y> → pointRefs
const POINTS = [];
for (let i = 0; i < 8; i += 1) {
	for (const axis of ['x', 'y']) {
		const id = `easing-points-${i}-${axis}`;
		POINTS.push(id);
		section = section.replace(
			`:ref="registryRef(dataEls, '${id}')"`,
			`:ref="(el: unknown) => setPoint('${id}', el)"`
		);
	}
}
section = section.replace(':ref="registryRef(dataEls, \'easing-points-grid\')"', 'ref="gridRef"');
section = section.replace(':ref="registryRef(dataEls, \'easing-mode\')"', 'ref="modeRef"');
section = section.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
if (!section.includes('easing-handles')) {
	section = section.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport {\n\tprovideEasingPointsHandles,\n\tresetEasingPointsHandles,\n\ttype EasingPointsHandles\n} from '@app/composables/easing-handles';\nimport type { YamiElement } from '@app/types/element-api';"
	);
}
const sectionWiring = `
/** 网格 / 模式下拉 / 16 个控制点一次交给单例。 */
const gridRef = ref<unknown>(null);
const modeRef = ref<unknown>(null);
const pointEls: Record<string, HTMLElement> = {};

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

const setPoint = (id: string, target: unknown): void => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	if (el instanceof HTMLElement) pointEls[id] = el;
	else delete pointEls[id];
};

let pointsHandles: EasingPointsHandles | null = null;

onMounted(() => {
	const grid = rootOf(gridRef.value);
	const mode = rootOf(modeRef.value);
	if (!grid || !mode || Object.keys(pointEls).length === 0) return;
	pointsHandles = { grid, mode, points: pointEls };
	provideEasingPointsHandles(pointsHandles);
	onUnmounted(() => {
		if (pointsHandles) resetEasingPointsHandles(pointsHandles);
	});
});
`;
section = section.replace(/onMounted\(\(\) => \{\}\);\n/, sectionWiring);
if (!section.includes('provideEasingPointsHandles(pointsHandles)')) {
	section = section.replace(/\n<\/script>/, `\n${sectionWiring}</script>`);
}
writeFileSync(sectionFile, section);
console.log(
	/registryRef|dataEls/.test(section)
		? '! EasingPointsSection 仍有注册表引用'
		: '✓ EasingPointsSection.vue 已改'
);
