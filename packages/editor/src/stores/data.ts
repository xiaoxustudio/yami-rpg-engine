import { defineStore } from 'pinia';
import { shallowReactive, shallowRef } from 'vue';
import { pinia } from './pinia';

// Manifest 结构类型（对齐 legacy metadata-manifest.ts 字段——宽类型起步，随迁移细化）
export interface ManifestShape {
	actors: any[];
	skills: any[];
	triggers: any[];
	items: any[];
	equipments: any[];
	states: any[];
	events: any[];
	scenes: any[];
	tilesets: any[];
	ui: any[];
	animations: any[];
	particles: any[];
	images: any[];
	metaList: any[];
	guidMap: Record<string, any>;
	pathMap: Record<string, any>;
	changed: boolean;
	audio: any[];
	videos: any[];
	fonts: any[];
	script: any[];
	others: any[];
	project: Record<string, any>;
	changes: any[];
	code: string;
}

// 场景预设映射（registerScenePresets 写入：sceneId + 数据节点）
export interface ScenePresetShape {
	sceneId: string;
	data: any;
}

// UI 预设映射（registerUiPresets 写入：uiId + 数据节点）
export interface UiPresetShape {
	uiId: string;
	data: any;
}

// guid → 数据对象映射（createDataMaps 初始化为 {}）
export interface DataMapShape {
	[guid: string]: any;
}

// 数组列表类数据（loadFile 从 Data/xxx.json 加载——运行期附加 map 等属性，legacy 经 Data:any 访问）
export interface DataListShape extends Array<any> {
	items?: { name: string; value: any }[];
}

// 变量树节点（createVariableMap 递归 map——children 表示分组）
export interface VariableNodeShape {
	id: string;
	name: string;
	value?: any;
	note?: string;
	sort?: number;
	children?: VariableNodeShape[];
}

// 变量列表（树形——运行期附加 map）
export interface VariablesShape extends Array<VariableNodeShape> {}

// 队伍数据（createTeamMap：list 数组 + map）
export interface TeamsShape {
	list: any[];
	map?: Record<string, any>;
}

// 本地化数据（createLocalizationMap：list 数组 + map）
export interface LocalizationShape {
	list: any[];
	map?: Record<string, any>;
}

// 属性/枚举数据（createAttributeContext/createEnumerationContext：数组 + context）
export interface ContextDataShape extends Array<any> {
	context?: any;
}

export interface DataShape {
	manifest: ManifestShape | null;
	scenePresets: Record<string, ScenePresetShape> | null;
	uiPresets: Record<string, UiPresetShape> | null;
	actors: DataMapShape | null;
	skills: DataMapShape | null;
	triggers: DataMapShape | null;
	items: DataMapShape | null;
	equipments: DataMapShape | null;
	states: DataMapShape | null;
	events: DataMapShape | null;
	scripts: DataMapShape | null;
	scenes: DataMapShape | null;
	ui: DataMapShape | null;
	animations: DataMapShape | null;
	particles: DataMapShape | null;
	tilesets: DataMapShape | null;
	easings: DataListShape | null;
	teams: TeamsShape | null;
	autotiles: DataListShape | null;
	variables: VariablesShape | null;
	attribute: ContextDataShape | null;
	enumeration: ContextDataShape | null;
	localization: LocalizationShape | null;
	plugins: any | null;
	commands: any | null;
	config: any | null;
}

export const dataKeys: (keyof DataShape)[] = [
	'manifest',
	'scenePresets',
	'uiPresets',
	'actors',
	'skills',
	'triggers',
	'items',
	'equipments',
	'states',
	'events',
	'scripts',
	'easings',
	'teams',
	'autotiles',
	'variables',
	'attribute',
	'enumeration',
	'localization',
	'plugins',
	'commands',
	'config',
	'scenes',
	'ui',
	'animations',
	'particles',
	'tilesets'
];

export const useDataStore = defineStore('data', () => {
	const data = shallowReactive<DataShape>({
		manifest: null,
		scenePresets: null,
		uiPresets: null,
		actors: null,
		skills: null,
		triggers: null,
		items: null,
		equipments: null,
		states: null,
		events: null,
		scripts: null,
		easings: null,
		teams: null,
		autotiles: null,
		variables: null,
		attribute: null,
		enumeration: null,
		localization: null,
		plugins: null,
		commands: null,
		config: null,
		scenes: null,
		ui: null,
		animations: null,
		particles: null,
		tilesets: null
	});
	const manifest = shallowRef<ManifestShape | null>(null);

	function setManifest(value: ManifestShape | null) {
		manifest.value = value;
		data.manifest = value;
	}

	function setData(key: keyof DataShape, value: any) {
		data[key] = value;
	}

	return { data, manifest, setManifest, setData };
});

export function getDataStore() {
	return useDataStore(pinia);
}
