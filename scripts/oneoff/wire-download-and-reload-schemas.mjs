import { readFileSync, writeFileSync } from 'node:fs';

/** downloadFile 窗口的桥：enable/disable 那个「写入路径」控件（schema 在载入时按 isBackground 开关）。 */
const bridgePath = 'packages/editor/src/composables/download-file-bridge.ts';
writeFileSync(
	bridgePath,
	`/**
 * downloadFile 窗口的**控件级能力桥**（模块级强类型）。
 *
 * schema 载入时要按 \`isBackground\` 开关「写入路径」控件。旧做法是按 id 从 \`composableEls\` 取元素
 * 再 \`enable\` / \`disable\`；窗口迁成模板 ref 后控件不再进注册表，于是开关能力由窗口实现、
 * 经模块桥交出 —— schema 不再知道控件 id。
 *
 * 实现收口在 \`composables/form-bridge.ts\`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface DownloadFileBridge {
	/** 开关「写入路径」控件（false 时置灰）。 */
	setPathEnabled(enabled: boolean): void;
}

const bridge = createFormBridge<DownloadFileBridge>('downloadFile');

/** 组件挂载时登记。 */
export const provideDownloadFileBridge = (api: DownloadFileBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetDownloadFileBridge = (api: DownloadFileBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null。 */
export const getDownloadFileBridge = (): DownloadFileBridge | null => bridge.get();
`
);

// 窗口：import + bridgeApi + onMounted（DownloadFile.vue 已有 onMounted，往里插首行）
const windowFile = 'packages/editor/src/components/commands/DownloadFile.vue';
let text = readFileSync(windowFile, 'utf8');
if (!text.includes('download-file-bridge')) {
	text = text.replace(
		/import \{ ([^}]*useControlRefs[^}]*) \} from '@app\/composables\/control-refs';/,
		(match) =>
			`${match}\nimport {\n\tprovideDownloadFileBridge,\n\tresetDownloadFileBridge,\n\ttype DownloadFileBridge\n} from '@app/composables/download-file-bridge';`
	);
	text = text.replace(/import \{ ([^}]*)\} from 'vue';/, (m, inner) =>
		inner.includes('onUnmounted') ? m : `import { ${inner.trimEnd()}, onUnmounted } from 'vue';`
	);
	if (!text.includes('bridgeApi')) {
		const block = [
			'',
			'/** 控件级能力：schema 载入时按 `isBackground` 开关「写入路径」。 */',
			'const bridgeApi: DownloadFileBridge = {',
			'\tsetPathEnabled: (enabled) => {',
			"\t\tconst control = controls['downloadFile-isBackground-path'];",
			'\t\tif (enabled) control?.enable?.();',
			'\t\telse control?.disable?.();',
			'\t}',
			'};',
			''
		].join('\n');
		text = text.replace(/(\n)(onMounted\()/, `\n${block}\n$2`);
	}
	if (!text.includes('provideDownloadFileBridge(bridgeApi)')) {
		text = text.replace(
			/onMounted\(\(\) => \{\n/,
			'onMounted(() => {\n\tprovideDownloadFileBridge(bridgeApi);\n\tonUnmounted(() => resetDownloadFileBridge(bridgeApi));\n'
		);
	}
	writeFileSync(windowFile, text);
}

// 四个 schema：把按 id 取元素的调用换成桥
const patches = [
	{
		file: 'packages/editor/src/composables/commands/useAddAnimationComponentCommandSchema.ts',
		from: /\t\tconst elMotion = composableEls\.get\('addAnimationComponent-motion'\) as YamiElement;\n\t\telMotion\.loadItems\(Animation\.getMotionListItems!\(event\.value\)\);\n\t\telMotion\.write2\(read\(elMotion\)\);/,
		to: '\t\tgetAddAnimationComponentBridge()?.reloadMotion(Animation.getMotionListItems!(event.value));',
		importFrom: "import { composableEls } from '@app/composables/element-registry';",
		importTo:
			"import { getAddAnimationComponentBridge } from '@app/composables/add-animation-component-bridge';"
	},
	{
		file: 'packages/editor/src/composables/commands/useRemoveAnimationComponentCommandSchema.ts',
		from: /\t\tconst elMotion = composableEls\.get\('removeAnimationComponent-motion'\) as YamiElement;\n\t\telMotion\.loadItems\(Animation\.getMotionListItems!\(event\.value\)\);\n\t\telMotion\.write2\(read\(elMotion\)\);/,
		to: '\t\tgetRemoveAnimationComponentBridge()?.reloadMotion(Animation.getMotionListItems!(event.value));',
		importFrom: "import { composableEls } from '@app/composables/element-registry';",
		importTo:
			"import { getRemoveAnimationComponentBridge } from '@app/composables/remove-animation-component-bridge';"
	},
	{
		file: 'packages/editor/src/composables/commands/useChangeActorSpriteCommandSchema.ts',
		from: /\t\tconst elSpriteId = composableEls\.get\('changeActorSprite-spriteId'\) as YamiElement;\n\t\telSpriteId\.loadItems\(items\);\n\t\twrite\(elSpriteId, read\(elSpriteId\)\);/,
		to: '\t\tgetChangeActorSpriteBridge()?.reloadSprite(items);',
		importFrom: "import { composableEls } from '@app/composables/element-registry';",
		importTo:
			"import { getChangeActorSpriteBridge } from '@app/composables/change-actor-sprite-bridge';"
	},
	{
		file: 'packages/editor/src/composables/commands/useDownloadFileCommandSchema.ts',
		from: /\t\tif \(params\.isBackground\) \{\n\t\t\tenable\(composableEls\.get\('downloadFile-isBackground-path'\) as HTMLElement\);\n\t\t\} else \{\n\t\t\tdisable\(composableEls\.get\('downloadFile-isBackground-path'\) as HTMLElement\);\n\t\t\}/,
		to: '\t\tgetDownloadFileBridge()?.setPathEnabled(Boolean(params.isBackground));',
		importFrom: "import { composableEls } from '@app/composables/element-registry';",
		importTo: "import { getDownloadFileBridge } from '@app/composables/download-file-bridge';"
	}
];

for (const patch of patches) {
	let t = readFileSync(patch.file, 'utf8');
	const before = t;
	t = t.replace(patch.from, patch.to);
	if (t === before) {
		console.warn(`! ${patch.file}: 主替换没命中`);
	}
	t = t.replace(patch.importFrom, patch.importTo);
	writeFileSync(patch.file, t);
	console.log(`✎ ${patch.file}`);
}
