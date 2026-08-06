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

// Phase 10——逐步补齐类型（宽类型起步——随迁移细化）
export interface DataShape {
	manifest: ManifestShape | null;
	scenePresets: any | null;
	uiPresets: any | null;
	actors: any | null;
	skills: any | null;
	triggers: any | null;
	items: any | null;
	equipments: any | null;
	states: any | null;
	events: any | null;
	scripts: any | null;
	easings: any | null;
	teams: any | null;
	autotiles: any | null;
	variables: any | null;
	attribute: any | null;
	enumeration: any | null;
	localization: any | null;
	plugins: any | null;
	commands: any | null;
	config: any | null;
	scenes: any | null;
	ui: any | null;
	animations: any | null;
	particles: any | null;
	tilesets: any | null;
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
