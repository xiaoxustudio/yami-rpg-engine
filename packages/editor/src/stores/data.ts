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

export interface ScenePresetShape {
	sceneId: string;
	data: { [k: string]: unknown };
}

export interface UiPresetShape {
	uiId: string;
	data: { [k: string]: unknown };
}

export interface DataMapShape {
	[guid: string]: DataEntryShape;
}

export interface DataListShape extends Array<DataEntryShape> {
	items?: { name: string; value: unknown }[];
}

export interface VariableNodeShape {
	id: string;
	name: string;
	value?: unknown;
	note?: string;
	sort?: number;
	children?: VariableNodeShape[];
}

export interface VariablesShape extends Array<VariableNodeShape> {}

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

export interface LocalizationItemShape {
	id: string;
	contents?: Record<string, string>;
	[k: string]: unknown;
}

export interface LocalizationShape {
	list: LocalizationItemShape[];
	map?: Record<string, LocalizationItemShape>;
}

export interface ContextDataShape extends Array<DataEntryShape> {
	context?: Record<string, unknown>;
}

export interface LanguageSettingsShape {
	name: string;
	font: string;
	scale: number;
}

export type GameConfigShape = {
	gameId: string;
	font?: { imports: unknown; default: unknown };
	text: {
		highDefinition?: boolean;
		importedFonts?: unknown;
		fontFamily?: unknown;
		wordWrap?: unknown;
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
		/**
		 * manifest 的**唯一存放处**是下面那个 `shallowRef`（见 `setManifest`）。
		 *
		 * 这里把 `data.manifest` 做成访问器，读写都落到 ref 上 —— 历史上它是独立字段、由
		 * `setManifest` 同步写两处：两个存放点迟早会被新写入者写歪，且 `JSON.stringify(data)`
		 * 只认 `data` 那份。用 `get/set` 定义（而不是 `Object.defineProperty` 打在 reactive 代理上）
		 * 是为了让 Vue 在**构造时**就把它当访问器属性处理，属性访问照常参与依赖收集。
		 *
		 * 必须保持可枚举（对象字面量的 get/set 默认就是）—— 否则 `JSON.stringify(data)` /
		 * `Object.keys(data)` 会看不到 manifest；`stores/__tests__/data.spec.ts` 有序列化回归钉住这点。
		 */
		get manifest(): ManifestShape | null {
			return manifest.value;
		},
		set manifest(value: ManifestShape | null) {
			manifest.value = value;
		},
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
	}

	function setData(key: keyof DataShape, value: DataShape[keyof DataShape]) {
		Reflect.set(data, key, value);
	}

	return { data, manifest, setManifest, setData };
});

export function getDataStore() {
	return useDataStore(pinia);
}
