import { defineStore } from 'pinia';
import type { FileMeta } from '@/data/metadata-manifest.ts';
import { shallowReactive, shallowRef } from 'vue';
import { pinia } from './pinia';

export interface FileMetaShape {
	guid: string;
	path: string;
	file?: { basename: string; aliasPath: string };
	overview?: { plugin?: string; [k: string]: any };
	[k: string]: any;
}

export interface DataEntryShape {
	guid?: string;
	name?: string;
	[k: string]: any;
}

export interface ProjectMetaShape {
	guid: string;
	path: string;
	[k: string]: any;
}

// Manifest 结构类型（对齐 legacy metadata-manifest.ts 字段——宽类型起步，随迁移细化）
export interface ManifestShape {
	actors: FileMeta[];
	skills: FileMeta[];
	triggers: FileMeta[];
	items: FileMeta[];
	equipments: FileMeta[];
	states: FileMeta[];
	events: FileMeta[];
	scenes: FileMeta[];
	tilesets: FileMeta[];
	ui: FileMeta[];
	animations: FileMeta[];
	particles: FileMeta[];
	images: FileMeta[];
	metaList: FileMeta[];
	guidMap: Record<string, FileMetaShape>;
	pathMap: Record<string, FileMetaShape>;
	changed: boolean;
	audio: FileMeta[];
	videos: FileMeta[];
	fonts: FileMeta[];
	script: FileMeta[];
	others: FileMeta[];
	project: Record<string, ProjectMetaShape>;
	changes: FileMeta[];
	code: string;
}

// 场景预设映射（registerScenePresets 写入：sceneId + 数据节点）
export interface ScenePresetShape {
	sceneId: string;
	data: { [k: string]: any };
}

// UI 预设映射（registerUiPresets 写入：uiId + 数据节点）
export interface UiPresetShape {
	uiId: string;
	data: { [k: string]: any };
}

// guid → 数据对象映射（createDataMaps 初始化为 {}）
export interface DataMapShape {
	[guid: string]: DataEntryShape;
}

// 数组列表类数据（loadFile 从 Data/xxx.json 加载——运行期附加 map 等属性，legacy 经 Data:any 访问）
export interface DataListShape extends Array<DataEntryShape> {
	items?: { name: string; value: unknown }[];
}

// 变量树节点（createVariableMap 递归 map——children 表示分组）
export interface VariableNodeShape {
	id: string;
	name: string;
	value?: unknown;
	note?: string;
	sort?: number;
	children?: VariableNodeShape[];
}

// 变量列表（树形——运行期附加 map）
export interface VariablesShape extends Array<VariableNodeShape> {}

// 队伍数据（createTeamMap：list 数组 + map）
export interface TeamShape {
	id: string;
	name?: string;
	color?: string;
	[k: string]: any;
}

export interface TeamsShape {
	list: TeamShape[];
	map?: Record<string, TeamShape>;
}

// 本地化数据（createLocalizationMap：list 数组 + map）
export interface LocalizationItemShape {
	id: string;
	contents?: Record<string, string>;
	[k: string]: any;
}

export interface LocalizationShape {
	list: LocalizationItemShape[];
	map?: Record<string, LocalizationItemShape>;
}

// 属性/枚举数据（createAttributeContext/createEnumerationContext：数组 + context）
export interface ContextDataShape extends Array<DataEntryShape> {
	context?: Record<string, any>;
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
	config: Record<string, any> | null;
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

	function setData(key: keyof DataShape, value: DataShape[keyof DataShape]) {
		data[key] = value;
	}

	return { data, manifest, setManifest, setData };
});

export function getDataStore() {
	return useDataStore(pinia);
}
