/**
 * inspector 页面清单的**唯一来源**。
 *
 * 同一份清单此前维护在两处：`AppShell.vue` 用 `import.meta.glob` 从文件名推导
 * `{ value, target }` 并渲染 Teleport；`InspectorPanel.vue` 手写 43 个
 * `<div class="page-frame">` 当挂载点。两边靠人脑保持一致，且**本来就该差一条**：
 *
 * `uiContainer` 没有 `.vue` 页面（由命令式页面 `inspector/element-container-page.ts`
 * 支撑，`Inspector.uiContainer` 被 `engine/ui/ui-initialize.ts` 的
 * `container: 'uiContainer'` 按名取用），所以 glob 推导一定**看不到**它，
 * 而挂载点**必须留着**。
 *
 * 因此这里把 glob 推导与「无 .vue 页面的命令式挂载点」合并成一份 `inspectorMountFrames`：
 * `AppShell` 的 Teleport 目标与 `InspectorPanel` 的挂载点都从它派生，双份清单不再存在。
 */

export type InspectorRegistryName = 'inspector' | 'composable';

export interface InspectorPage {
	value: string;
	target: string;
	loader: () => Promise<unknown>;
}

export interface InspectorMountFrame {
	value: string;
	id: string;
	registry: InspectorRegistryName | null;
}

/** 挂载点 id 不是 `<value>-vue-mount` 的特例页面（`#<value>` 直挂） */
export const inspectorSpecialTargets = new Set([
	'fileImage',
	'fileFont',
	'fileScript',
	'fileAudio',
	'fileVideo',
	'fileTileset'
]);

/** 无 `.vue` 页面、但必须有挂载点的命令式页面（glob 看不到，手工保留） */
export const inspectorImperativeOnly = ['uiContainer'] as const;

/** 挂载点走 `composableEls` 而非 `inspectorEls` 的页面 */
const inspectorComposableFrames = new Set(['animSoundLayer', 'animSoundFrame']);

/** 有挂载点、但无需登记注册表的页面（没有模块侧命令式取用） */
const inspectorUnregisteredFrames = new Set(['fileAnimation', 'uiContainer']);

const inspectorModules = import.meta.glob('./*.vue');

/** 文件名 → 页面 value（大小写与 UI 前缀规则） */
export const deriveInspectorValue = (path: string): string => {
	const name = path
		.split('/')
		.pop()!
		.replace(/\.vue$/, '')
		.replace(/Page$/, '');
	const raw = name.replace(/^UI(?=[A-Z])/, 'ui');
	return raw.charAt(0).toLowerCase() + raw.slice(1);
};

export const inspectorPages: InspectorPage[] = Object.entries(inspectorModules).map(
	([path, loader]) => {
		const value = deriveInspectorValue(path);
		const target = inspectorSpecialTargets.has(value) ? `#${value}` : `#${value}-vue-mount`;
		return { value, target, loader: loader as () => Promise<unknown> };
	}
);

export const inspectorPageCount = inspectorPages.length;

export const inspectorMountFrames: InspectorMountFrame[] = [
	...inspectorPages.map(({ value, target }) => ({
		value,
		id: target.replace(/^#/, ''),
		registry: inspectorUnregisteredFrames.has(value)
			? null
			: inspectorComposableFrames.has(value)
				? ('composable' as const)
				: ('inspector' as const)
	})),
	...inspectorImperativeOnly.map((value) => ({
		value,
		id: `${value}-vue-mount`,
		registry: null
	}))
];
