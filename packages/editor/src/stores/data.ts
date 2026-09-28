import { defineStore } from 'pinia';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { shallowReactive, shallowRef } from 'vue';
import { pinia } from './pinia';

export interface FileMetaShape {
	guid: string;
	path: string;
	file?: { basename: string; aliasPath: string };
	overview?: { plugin?: string; [k: string]: unknown };
	[k: string]: unknown;
}

export interface DataEntryShape {
	guid?: string;
	name?: string;
	[k: string]: unknown;
}

export interface ProjectMetaShape {
	guid: string;
	path: string;
	[k: string]: unknown;
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
	data: { [k: string]: unknown };
}

// UI 预设映射（registerUiPresets 写入：uiId + 数据节点）
export interface UiPresetShape {
	uiId: string;
	data: { [k: string]: unknown };
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
	[k: string]: unknown;
}

export interface TeamsShape {
	list: TeamShape[];
	map?: Record<string, TeamShape>;
	collisions?: string;
	relations?: string;
}

// 本地化数据（createLocalizationMap：list 数组 + map）
export interface LocalizationItemShape {
	id: string;
	contents?: Record<string, string>;
	[k: string]: unknown;
}

export interface LocalizationShape {
	list: LocalizationItemShape[];
	map?: Record<string, LocalizationItemShape>;
}

// 属性/枚举数据（createAttributeContext/createEnumerationContext：数组 + context）
export interface ContextDataShape extends Array<DataEntryShape> {
	context?: Record<string, unknown>;
}

/** 语言条目：`config.localization.languages` 的元素
 * （`services/updater/config.ts` 的 1.0.115 迁移把旧的**字符串**形态升级成它，故联合里两种都在） */
export interface LanguageSettingsShape {
	name: string;
	font: string;
	scale: number;
}

/**
 * 工程配置（`Data/config.json`，即 `DataShape.config`）。
 *
 * 具名部分是**本仓类型化读到**的字段（`services/updater/config.ts` 的版本迁移逐个字段读写，
 * `useProjectSettingsWindow` 的表单与之一一对应）。末尾的索引签名是 `unknown` 而非 `any`
 * （第 152 轮起本仓的统一写法，见 `composables/useCommandParse.ts` 的 `CommandNode`）：
 * 迁移循环要按 `Object.keys()` 逐键搬运，配置本身也是可扩展的（插件可加键）——
 * 但读侧必须先收窄，拼错键不会静默变成 `any`。
 */
export type GameConfigShape = {
	gameId: string;
	/** 旧形态：1.0.54 迁移把它改名成 `text` */
	font?: { imports: unknown; default: unknown };
	text: {
		highDefinition?: boolean;
		importedFonts?: unknown;
		fontFamily?: unknown;
		wordWrap?: unknown;
		/** 1.0.52 迁移删掉的旧字段 */
		pixelated?: unknown;
		threshold?: unknown;
	};
	collision?: {
		trigger?: { collideWithActorShape: boolean };
		actor?: { ignoreTeamMember?: unknown };
	};
	resolution: { sceneScale: number; uiScale: number };
	localization?: { languages: Array<string | LanguageSettingsShape>; default?: string };
	deployed?: boolean;
	window: { display: string };
	virtualAxis?: { up: string; down: string; left: string; right: string };
	actor: {
		playerTeam?: unknown;
		playerActor?: unknown;
		partyMembers?: unknown;
		partyInventory?: unknown;
	};
	webgl: {
		desynchronized: boolean;
		textureMagFilter?: string;
		textureMinFilter?: string;
	};
	script: { language?: unknown; outDir?: unknown; autoCompile: boolean };
	save: { location: string; subdir: string | undefined };
	event?: {
		startup: string;
		loadGame: string;
		initScene: string;
		showText: string;
		showChoices: string;
	};
	preload?: string;
	[k: string]: unknown;
};

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
	plugins: Record<string, unknown> | null;
	commands: DataListShape | null;
	config: GameConfigShape | null;
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
		Reflect.set(data, key, value);
	}

	return { data, manifest, setManifest, setData };
});

export function getDataStore() {
	return useDataStore(pinia);
}
