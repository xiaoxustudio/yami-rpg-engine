import { Easing } from '@app/data/transition-window.ts';

export interface PluginItemShape {
	id: string;
	enabled: boolean;
	parameters?: Record<string, unknown>;
	element?: HTMLElement & { textNode: Text };
}

export type ParameterShape = {
	key: string;
	type: string;
	value: unknown;
	group: string | null;
	options?: (string | number | boolean)[];
	dataItems?: { name: string; value: unknown }[];
	min?: number;
	max?: number;
	decimals?: number;
	filter?: string;
	alias?: string;
	desc?: string;
	validate?: {
		pattern: RegExp | null;
		notEmpty: boolean | null;
		minLength?: number;
		maxLength?: number;
	};
	[k: string]: unknown;
};

export type OverviewShape = {
	requires: { plugin: string; version: string }[];
	plugin?: string;
	author?: string;
	link?: string;
	version?: string;
	deprecated?: string | boolean;
	desc?: string;
	code?: string;
};

export type PluginMetaShape = {
	overview: OverviewShape;
	parameters: ParameterShape[];
	manager: {
		states: Record<string, boolean>;
		update: (parameters: Record<string, unknown>) => void;
		[k: string]: unknown;
	};
	langMap: { update(): { get(key: string | undefined): string } };
	[k: string]: unknown;
};

export type OptionParameterShape = {
	key: string;
	type: string;
	value?: unknown;
	options?: (string | number | boolean)[];
	parent?: OptionParameterShape | null;
	wrap?: { priority: number };
	[k: string]: unknown;
};

export type PluginScriptShape = {
	id: string;
	parameters: Record<string, unknown> | null;
} & Record<string, unknown>;

export interface ClipboardShape {
	has(format: string): boolean;
	read(format: string): unknown;
	write(format: string, object: unknown): void;
}

export interface PluginManagerShape {
	list: HTMLElement | null;
	overviewPane: HTMLElement | null;
	overview: HTMLElement | null;
	parameterPane: HTMLElement | null;
	data: PluginItemShape[] | null;
	meta: PluginMetaShape | null;
	symbol: symbol | null;
	detailed: boolean;
	changed: boolean;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: ((item?: PluginItemShape) => Promise<void>) | null;
	unload: (() => void) | null;
	loadOverview: (() => void) | null;
	createData: (...args: unknown[]) => PluginItemShape;
	getItemById: ((...args: unknown[]) => ReturnType<typeof Easing.getItemById>) | null;
	switchOverviewMode: (() => void) | null;
	parseMeta: ((...args: unknown[]) => void) | null;
	reconstruct: (...args: unknown[]) => boolean;
	saveToProject: ((...args: unknown[]) => void) | null;
	loadFromProject: ((...args: unknown[]) => void) | null;
	windowClose: ((...args: unknown[]) => void) | null;
	windowClosed: ((...args: unknown[]) => void) | null;
	keydown: ((...args: unknown[]) => void) | null;
	pointerdown: ((...args: unknown[]) => void) | null;
	scriptChange: ((...args: unknown[]) => void) | null;
	listKeydown: ((...args: unknown[]) => void) | null;
	listSelect: ((...args: unknown[]) => void) | null;
	listUnselect: ((...args: unknown[]) => void) | null;
	listChange: ((...args: unknown[]) => void) | null;
	listPopup: ((...args: unknown[]) => void) | null;
	listOpen: ((...args: unknown[]) => void) | null;
	overviewPointerdown: ((...args: unknown[]) => void) | null;
	parameterPaneUpdate: ((...args: unknown[]) => void) | null;
	confirm: ((...args: unknown[]) => void) | null;
	apply: ((...args: unknown[]) => void) | null;
	checkValidate: ((...args: unknown[]) => boolean) | null;
	list_edit: ((item: PluginItemShape) => void) | null;
	list_insert: ((dItem: PluginItemShape) => void) | null;
	list_toggle: ((item: PluginItemShape) => void) | null;
	list_copy: ((item: PluginItemShape) => void) | null;
	list_paste: ((dItem: PluginItemShape) => void) | null;
	list_delete: (item: PluginItemShape) => void;
	list_saveSelection: (() => void) | null;
	list_restoreSelection: (() => void) | null;
	list_updateTextNode: ((item: PluginItemShape) => void) | null;
	reload: (() => void) | null;
	plugins: PluginItemShape[] | Record<string, PluginItemShape>;
}

const pluginManager = {
	list: null,
	overviewPane: null,
	overview: null,
	parameterPane: null,
	data: null,
	meta: null,
	symbol: null,
	detailed: false,
	changed: false,
	initialize: null,
	open: null,
	load: null,
	unload: null,
	loadOverview: null,
	getItemById: null,
	switchOverviewMode: null,
	parseMeta: null,
	saveToProject: null,
	loadFromProject: null,
	windowClose: null,
	windowClosed: null,
	keydown: null,
	pointerdown: null,
	scriptChange: null,
	listKeydown: null,
	listSelect: null,
	listUnselect: null,
	listChange: null,
	listPopup: null,
	listOpen: null,
	overviewPointerdown: null,
	parameterPaneUpdate: null,
	confirm: null,
	apply: null,
	checkValidate: null,
	list_edit: null,
	list_insert: null,
	list_toggle: null,
	list_copy: null,
	list_paste: null,
	list_saveSelection: null,
	list_restoreSelection: null,
	list_updateTextNode: null,
	reload: null
} satisfies Partial<Omit<PluginManagerShape, 'plugins'>> as Omit<PluginManagerShape, 'plugins'>;

export const PluginManager = pluginManager as PluginManagerShape;

const pluginBridgeKeys = ['plugins'] as const;
import { getPluginStore } from '@app/stores/plugin';

for (const key of pluginBridgeKeys) {
	Object.defineProperty(PluginManager, key, {
		get: () => getPluginStore()[key],
		set: (value: unknown) => {
			// oxlint-disable-next-line no-explicit-any
			(getPluginStore() as Record<(typeof pluginBridgeKeys)[number], any>)[key] = value;
		},
		configurable: true
	});
}
