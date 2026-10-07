import { File } from '@app/file/file-system-core.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { AttributeContext } from '@app/attribute/attribute-context.ts';
import type { AttributeItem } from '@app/attribute/attribute-window.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { Manifest, type FileMeta, type ProjectMeta } from './metadata-manifest.ts';
import { EnumerationContext } from '@app/enum/enum-context.ts';
import type { EnumItem } from '@app/enum/enum-window.ts';
import type { LocalizationItem } from '@app/local/local-window.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Log } from '@app/log/log-window.ts';
import { Reference } from '@app/log/related-references.ts';

import { PluginManager } from '@app/plugin/plugin.ts';
import { dataKeys, getDataStore, type VariableNodeShape } from '@app/stores/data';
import { computeIndexDigits } from '@app/utils/number';
import { clone as deepClone } from '@app/utils/object';

type DataEntry = { guid?: string; name?: string; [k: string]: unknown };

type GUIDItem = { id: string };
export type VariableNode = {
	id?: string;
	class: string;
	name: string;
	value?: unknown;
	note?: string;
	expanded?: boolean;
	children?: VariableNode[];
};
type LocalizationNode = { id?: string; children?: LocalizationNode[] };
type PresetNode = { class?: string; children: PresetNode[]; presetId: string };
type ScriptFile = {
	meta?: { guid: string; code?: string };
	promise?: Promise<unknown> | null;
	path: string;
};

interface DataModule {
	// oxlint-disable-next-line no-explicit-any
	loadAll: () => Promise<any>;
	// oxlint-disable-next-line no-explicit-any
	loadMeta: () => Promise<any>;
	// oxlint-disable-next-line no-explicit-any
	loadFile: (filename: string) => Promise<any>;
	// oxlint-disable-next-line no-explicit-any
	loadScene: (guid: string) => Promise<any>;
	close: () => void;
	createEasingItems: () => Array<{ name: string; value: string }>;
	createTeamItems: () => Array<{ name: string; value: string }>;
	createDataMaps: () => void;
	createGUIDMap: (list: Array<GUIDItem>) => void;
	createTeamMap: () => void;
	createVariableMap: () => void;
	createAttributeContext: () => void;
	createEnumerationContext: () => void;
	createLocalizationMap: () => void;
	createReferencedFileIDMap: () => Record<string, boolean>;
	generateVariableEnumScript: () => void;
	registerScenePresets: (sceneId: string) => void;
	unregisterScenePresets: (sceneId: string) => void;
	registerUiPresets: (uiId: string) => void;
	unregisterUiPresets: (uiId: string) => void;
	createManifest: () => void;
	saveManifest: () => Promise<void> | null;
	filterManifest: (manifest: Manifest & Record<string, unknown>) => Record<string, unknown>;
	inheritMetaData: () => void;
	parseGUID: (meta: { path: string }) => string;
	loadScript: (file: ScriptFile) => Promise<void>;
	jsonReplacer: (key: string, value: unknown) => unknown;
	manifest: Manifest;
	variables: VariableNode[] & {
		scrollTop?: number;
		mapById?: Record<string, VariableNodeShape>;
	};
	localization: {
		list: LocalizationItem[];
		map: Record<string, LocalizationItem>;
		scrollTop: number;
		[k: string]: unknown;
	};
	attribute: {
		context: AttributeContext;
		keys: AttributeItem[] | null;
		settings: Record<string, string> | null;
		scrollTop: number;
		[k: string]: unknown;
	};
	enumeration: {
		context: EnumerationContext;
		keys: EnumItem[] | null;
		strings: EnumItem[] | null;
		settings: Record<string, string> | null;
		scrollTop: number;
		[k: string]: unknown;
	};
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export const Data = {
	manifest: null!,
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
	variables: null!,
	attribute: null!,
	enumeration: null!,
	localization: null!,
	plugins: null,
	commands: null,
	config: null,
	scenes: null,
	ui: null,
	animations: null,
	particles: null,
	tilesets: null
} satisfies Partial<DataModule> as Partial<DataModule> as DataModule;

Data.loadAll = function (this: typeof Data) {
	this.createDataMaps();

	this.createManifest();

	return Promise.all([
		this.loadMeta(),
		this.loadFile('easings'),
		this.loadFile('teams'),
		this.loadFile('autotiles'),
		this.loadFile('variables'),
		this.loadFile('attribute'),
		this.loadFile('enumeration'),
		this.loadFile('localization'),
		this.loadFile('plugins'),
		this.loadFile('commands'),
		this.loadFile('config')
	]).then(() => {
		Data.createGUIDMap(this.easings);
		Data.createGUIDMap(this.autotiles);
		Data.createTeamMap();
		Data.createVariableMap();
		Data.createAttributeContext();
		Data.createEnumerationContext();
		Data.createLocalizationMap();
	});
};

Data.loadMeta = function (this: typeof Data) {
	const path = 'Data/manifest.json';
	return File.get!({
		path: path,
		type: 'json'
	}).then(
		(data: unknown) => {
			if (data === null) return;
			Object.defineProperty(this.manifest, 'last', {
				configurable: true,
				value: data
			});
		},
		(error: Error) => {
			error.message = path;
			throw error;
		}
	);
};

Data.loadFile = function (this: typeof Data, filename: string) {
	const path = `Data/${filename}.json`;
	return File.get!({
		path: path,
		type: 'json'
	}).then((data: unknown) => {
		if (!data) {
			throw new SyntaxError(path);
		}
		const meta: ProjectMeta = {
			guid: filename,
			path: path,
			dataMap: this
		};
		this.manifest.project[filename] = meta;
		this.manifest.guidMap[meta.guid] = meta as FileMeta;
		return (this[filename] = data);
	});
};

Data.loadScene = function (this: typeof Data, guid: string) {
	const { scenes } = this;
	if (scenes[guid]) {
		return new Promise<unknown>((resolve) => {
			resolve(Codec.decodeScene!(scenes[guid]));
		});
	}

	const meta = this.manifest.guidMap[guid];
	if (!meta) {
		return new Promise<never>((_resolve, reject) => {
			reject(new URIError('Metadata is undefined.'));
		});
	}
	const path = meta.path;
	return File.get!({
		path: path,
		type: 'text'
	}).then((code: string) => {
		try {
			// oxlint-disable-next-line no-explicit-any
			return Codec.decodeScene!((scenes[guid] = code as any));
		} catch (error: unknown) {
			(error as Error).message = `${path}\n${(error as Error).message}`;
			throw error;
		}
	});
};

Data.close = function (this: typeof Data) {
	Reflect.set(this, 'manifest', null);
	Reflect.set(this, 'scenePresets', null);
	Reflect.set(this, 'uiPresets', null);
	Reflect.set(this, 'actors', null);
	Reflect.set(this, 'skills', null);
	Reflect.set(this, 'triggers', null);
	Reflect.set(this, 'items', null);
	Reflect.set(this, 'equipments', null);
	Reflect.set(this, 'states', null);
	Reflect.set(this, 'events', null);
	Reflect.set(this, 'scripts', null);
	Reflect.set(this, 'easings', null);
	Reflect.set(this, 'teams', null);
	Reflect.set(this, 'autotiles', null);
	Reflect.set(this, 'variables', null);
	Reflect.set(this, 'attribute', null);
	Reflect.set(this, 'plugins', null);
	Reflect.set(this, 'commands', null);
	Reflect.set(this, 'config', null);
	Reflect.set(this, 'scenes', null);
	Reflect.set(this, 'ui', null);
	Reflect.set(this, 'animations', null);
	Reflect.set(this, 'particles', null);
	Reflect.set(this, 'tilesets', null);
};

Data.createEasingItems = function (this: typeof Data) {
	let items = this.easings.items;
	if (items === undefined) {
		items = this.easings.items = [];
		const easings = this.easings;
		const length = easings.length;
		const digits = computeIndexDigits(length);
		for (let i = 0; i < length; i++) {
			const index = i.toString().padStart(digits, '0');
			const easing = easings[i];
			items.push({
				name: `${index}:${easing.name}`,
				value: easing.id
			});
		}
	}
	return items;
};

Data.createTeamItems = function (this: typeof Data) {
	let items = this.teams.list.items;
	if (items === undefined) {
		items = this.teams.list.items = [];
		const teams = this.teams.list;
		const length = teams.length;
		const digits = computeIndexDigits(length);
		for (let i = 0; i < length; i++) {
			const index = i.toString().padStart(digits, '0');
			const team = teams[i];
			items.push({
				name: `${index}:${team.name}`,
				value: team.id
			});
		}
	}
	return items;
};

Data.createDataMaps = function (this: typeof Data) {
	this.scenePresets = {} as Record<string, { sceneId: string; data: Record<string, unknown> }>;
	this.uiPresets = {} as Record<string, { uiId: string; data: Record<string, unknown> }>;
	this.actors = {} as Record<string, DataEntry>;
	this.skills = {} as Record<string, DataEntry>;
	this.triggers = {} as Record<string, DataEntry>;
	this.items = {} as Record<string, DataEntry>;
	this.equipments = {} as Record<string, DataEntry>;
	this.states = {} as Record<string, DataEntry>;
	this.events = {} as Record<string, DataEntry>;
	this.scripts = {} as Record<string, DataEntry>;
	this.scenes = {} as Record<string, DataEntry>;
	this.ui = {} as Record<string, DataEntry>;
	this.animations = {} as Record<string, DataEntry>;
	this.particles = {} as Record<string, DataEntry>;
	this.tilesets = {} as Record<string, DataEntry>;
};

Data.createGUIDMap = function (this: typeof Data, list: Array<GUIDItem>) {
	const map = {} as Record<string, GUIDItem>;
	for (const item of list) {
		map[item.id!] = item;
	}
	Object.defineProperty(list, 'map', {
		configurable: true,
		value: map
	});
};

Data.createTeamMap = function (this: typeof Data) {
	const map = {} as Record<string, GUIDItem>;
	const teams = this.teams;
	for (const item of teams.list) {
		map[item.id!] = item;
	}
	Object.defineProperty(teams, 'map', {
		configurable: true,
		value: map
	});
};

Data.createVariableMap = (function IIFE() {
	const set = (items: VariableNode[], map: Record<string, VariableNode>) => {
		for (const item of items) {
			if (item.children) {
				set(item.children, map);
			} else {
				map[item.id!] = item;
			}
		}
	};
	return function (this: typeof Data) {
		const map = {} as Record<string, VariableNode>;
		set(this.variables, map);
		Object.defineProperty(this.variables, 'mapById', {
			configurable: true,
			value: map
		});
	};
})();

Data.createAttributeContext = function (this: typeof Data) {
	Object.defineProperty(this.attribute, 'context', {
		configurable: true,
		value: new AttributeContext(this.attribute)
	});
};

Data.createEnumerationContext = function (this: typeof Data) {
	Object.defineProperty(this.enumeration, 'context', {
		configurable: true,
		value: new EnumerationContext(this.enumeration)
	});
};

Data.createLocalizationMap = function (this: typeof Data) {
	const map = {} as Record<string, LocalizationNode>;
	const set = (items: LocalizationNode[]) => {
		for (const item of items) {
			if (item.children) {
				set(item.children);
			} else {
				map[item.id!] = item;
			}
		}
	};
	set(this.localization.list);
	Object.defineProperty(this.localization, 'map', {
		configurable: true,
		value: map
	});
};

Data.createReferencedFileIDMap = function (this: typeof Data) {
	const usedMap = {} as Record<string, boolean>;
	const list = [
		Object.values(this.ui),
		Object.values(this.scenes),
		Object.values(this.actors),
		Object.values(this.skills),
		Object.values(this.triggers),
		Object.values(this.items),
		Object.values(this.equipments),
		Object.values(this.states),
		Object.values(this.events),
		Object.values(this.scripts),
		Object.values(this.animations),
		Object.values(this.particles),
		Object.values(this.tilesets),
		this.plugins,
		this.commands,
		this.config
	];
	const { scenePresets, uiPresets } = Data;
	const markToMap = (guid: string) => {
		usedMap[guid] = true;
		if (guid in scenePresets) {
			usedMap[scenePresets[guid].sceneId] = true;
		}
		if (guid in uiPresets) {
			usedMap[uiPresets[guid].uiId] = true;
		}
	};
	let match;
	const guid = /"([0-9a-f]{16})\\?"/g;
	const code = JSON.stringify(list);
	while ((match = guid.exec(code))) {
		markToMap(match[1]);
	}
	// oxlint-disable-next-line no-explicit-any
	for (const event of Object.values<any>(this.events)) {
		if (event.type !== 'common') {
			markToMap(event.guid);
		}
	}
	const guidInScript = /"[0-9a-f]{16}"|'[0-9a-f]{16}'/g;
	// oxlint-disable-next-line no-explicit-any
	for (const meta of Object.values<any>(this.scripts)) {
		if (meta.guid in usedMap) {
			const code = meta.code;
			while ((match = guidInScript.exec(code))) {
				markToMap(match[0].slice(1, -1));
			}
		}
	}
	return usedMap;
};

Data.generateVariableEnumScript = function (this: typeof Data) {
	const regexp = /^[\p{ID_Start}][\p{ID_Continue}]*$/u;
	const spaces = / +/g;
	const wraps = /\n+/g;
	const validItems: Array<{ id: string; name: string; value: unknown; note?: string }> = [];
	const invalidItems: VariableNode[] = [];
	const duplicateItems: VariableNode[] = [];
	const flags = {} as Record<string, boolean>;
	const set = (items: VariableNode[]) => {
		for (const item of items) {
			if (item.children) {
				set(item.children);
				continue;
			}
			let name = item.name;
			if (name.indexOf(' ') !== -1) {
				name = name.replace(spaces, '');
			}
			if (name in flags) {
				duplicateItems.push(item);
				continue;
			}
			if (regexp.test(name)) {
				flags[name] = true;
				validItems.push({
					id: item.id!,
					name: name,
					value: item.value,
					note: item.note
				});
				continue;
			}
			invalidItems.push(item);
		}
	};
	set(this.variables);
	if (validItems.length + invalidItems.length + duplicateItems.length !== 0) {
		const contents = [
			'/** This script is generated and defines the IDs of global variables. */\n',
			'enum VAR {'
		];
		if (validItems.length !== 0) {
			for (const item of validItems) {
				const value = item.value;
				const type = typeof value;
				let init;
				switch (typeof value) {
					case 'boolean':
						init = ` = ${value.toString()}`;
						break;
					case 'number':
						init = ` = ${value.toString()}`;
						break;
					case 'string':
						init = ` = '${value.trim().replace(wraps, ' ')}'`;
						if (init.length > 40) {
							init = `${init.slice(0, 40)}...'`;
						}
						break;
					case 'object':
						init = '';
						break;
				}
				let note = item.note!.trim();
				if (note !== '') {
					note = '\n   *  \n   *  ' + note.replace(wraps, '  \n   *  ');
				}
				contents.push(`  /** ${type}${init}${note} */`);
				contents.push(`  ${item.name} = '${item.id}',`);
			}
		}
		if (invalidItems.length !== 0) {
			contents.push(`  // Invalid variable names:`);
			for (const item of invalidItems) {
				contents.push(`  // ${item.name} = '${item.id}',`);
			}
		}
		if (duplicateItems.length !== 0) {
			contents.push(`  // Duplicate variable names:`);
			for (const item of duplicateItems) {
				contents.push(`  // ${item.name} = '${item.id}',`);
			}
		}
		contents.push('}');
		const code = contents.join('\n');
		const path = 'Script/yami.ts';
		const route = File.path!(path);
		FSP.writeFile(route, code).catch((error: unknown) => {
			console.warn(error);
		});
	}
};

Data.registerScenePresets = function (this: typeof Data, sceneId: string) {
	const scene = this.scenes[sceneId];
	if (scene) {
		let changed = false;
		const { scenePresets } = this;
		const generatePresetId = () => {
			let id;
			do {
				id = GUID.generate64bit();
			} while (id in scenePresets);
			return id;
		};
		const setMap = (nodes: PresetNode[]) => {
			for (const node of nodes) {
				if (node.class === 'folder') {
					setMap(node.children);
				} else {
					if (scenePresets[node.presetId]) {
						node.presetId = generatePresetId();
						changed = true;
					}
					scenePresets[node.presetId] = {
						sceneId: sceneId,
						data: node
					};
				}
			}
		};
		setMap(scene.objects);
		if (changed) {
			File.planToSave!(Data.manifest.guidMap[sceneId]);
			File.save!(false);
		}
	}
};

Data.unregisterScenePresets = function (this: typeof Data, sceneId: string) {
	const scene = this.scenes[sceneId];
	if (scene) {
		const { scenePresets } = this;
		const unlink = (nodes: PresetNode[]) => {
			for (const node of nodes) {
				const { presetId } = node;
				if (scenePresets[presetId]?.sceneId === sceneId) {
					delete scenePresets[presetId];
				}
				if (node.children) {
					unlink(node.children);
				}
			}
		};
		unlink(scene.objects);
	}
};

Data.registerUiPresets = function (this: typeof Data, uiId: string) {
	const ui = this.ui[uiId];
	if (ui) {
		let changed = false;
		const { uiPresets } = this;
		const generatePresetId = () => {
			let id;
			do {
				id = GUID.generate64bit();
			} while (id in uiPresets);
			return id;
		};
		const setMap = (nodes: PresetNode[]) => {
			for (const node of nodes) {
				if (uiPresets[node.presetId]) {
					node.presetId = generatePresetId();
					changed = true;
				}
				uiPresets[node.presetId] = {
					uiId: uiId,
					data: node
				};
				if (node.children.length !== 0) {
					setMap(node.children);
				}
			}
		};
		setMap(ui.nodes);
		if (changed) {
			File.planToSave!(Data.manifest.guidMap[uiId]);
			File.save!(false);
		}
	}
};

Data.unregisterUiPresets = function (this: typeof Data, uiId: string) {
	const ui = this.ui[uiId];
	if (ui) {
		const { uiPresets } = this;
		const unlink = (nodes: PresetNode[]) => {
			for (const node of nodes) {
				const { presetId } = node;
				if (uiPresets[presetId]?.uiId === uiId) {
					delete uiPresets[presetId];
				}
				if (node.children.length !== 0) {
					unlink(node.children);
				}
			}
		};
		unlink(ui.nodes);
	}
};

Data.createManifest = function (this: typeof Data) {
	this.manifest = new Manifest();
};

Data.saveManifest = function (this: typeof Data) {
	const manifest = this.manifest as Manifest | null;
	if (manifest?.changed) {
		manifest.changed = false;
		const copy = Data.filterManifest(manifest as Manifest & Record<string, unknown>);
		const json = JSON.stringify(copy, Data.jsonReplacer, 2);
		const last = manifest.code;
		if (json && json !== last) {
			const path = File.path!('Data/manifest.json');
			return FSP.writeFile(path, json)
				.then(() => {
					manifest.code = json;
				})
				.catch((error: unknown) => {
					Log.throw!(error);
				});
		}
	}
	return null;
};

Data.jsonReplacer = function (key: string, value: unknown) {
	switch (key) {
		case 'dataMap':
		case 'file':
		case 'group':
		case 'manifest':
		case 'code':
		case 'meta':
		case 'project':
		case 'changes':
		case 'metaList':
			return undefined;
	}
	return value;
};

Data.filterManifest = function (this: typeof Data, manifest: Manifest & Record<string, unknown>) {
	const copy: Record<string, unknown> = {};
	for (const key of Object.keys(manifest)) {
		copy[key] = manifest[key];
	}
	copy.images = deepClone(manifest.images);
	copy.audio = deepClone(manifest.audio);
	const { usedMap } = Reference.findAllGuids!();
	for (const list of [copy.images, copy.audio] as Array<Array<{ path: string; size: number }>>) {
		for (const meta of list) {
			const guid = Data.parseGUID(meta);
			if (usedMap[guid] === undefined) {
				meta.size = 0;
			}
		}
	}
	return copy;
};

Data.inheritMetaData = function (this: typeof Data) {
	const manifest = this.manifest as Manifest & {
		last?: {
			scenes: Array<{ path: string; x: number; y: number }>;
			tilesets: Array<{ path: string; x: number; y: number }>;
		};
	};
	const last = manifest.last;
	const map = manifest.guidMap;
	if (last === undefined) return;
	for (const scene of last.scenes) {
		const guid = this.parseGUID(scene);
		const meta = map[guid];
		if (meta !== undefined) {
			meta.x = scene.x;
			meta.y = scene.y;
		}
	}
	for (const tileset of last.tilesets) {
		const guid = this.parseGUID(tileset);
		const meta = map[guid];
		if (meta !== undefined) {
			meta.x = tileset.x;
			meta.y = tileset.y;
		}
	}
	delete manifest.last;
};

Data.parseGUID = (function IIFE() {
	const regexp = /(?<=\.)[0-9a-f]{16}(?=\.\S+$)/;
	return function (this: typeof Data, meta: { path: string }) {
		const match = meta.path.match(regexp);
		return match ? match[0] : '';
	};
})();

Data.loadScript = async function (this: typeof Data, file: ScriptFile) {
	const meta = file.meta;
	if (meta !== undefined) {
		const { scripts } = this;
		const { guid } = meta;
		await file.promise;
		scripts[guid] = File.get!({
			path: file.path,
			type: 'text'
		})
			.then((code: string) => {
				meta.code = code;
				PluginManager.parseMeta!(meta, code);
				return (scripts[guid] = meta);
			})
			.catch((_error: unknown) => {
				delete scripts[guid];
			});
	}
};

for (const key of dataKeys) {
	Object.defineProperty(Data, key, {
		get: () => getDataStore().data[key],
		set: (value: unknown) => {
			Reflect.set(getDataStore().data, key, value);
		},
		configurable: true
	});
}
