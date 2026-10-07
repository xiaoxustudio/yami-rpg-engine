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

export const inspectorSpecialTargets = new Set([
	'fileImage',
	'fileFont',
	'fileScript',
	'fileAudio',
	'fileVideo',
	'fileTileset'
]);

export const inspectorImperativeOnly = ['uiContainer'] as const;

const inspectorComposableFrames = new Set(['animSoundLayer', 'animSoundFrame']);

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
