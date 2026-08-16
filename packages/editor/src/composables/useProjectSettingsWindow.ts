import { reactive } from 'vue';
import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { Window } from '@/tools/window-object.ts';
import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Log } from '@/log/log-window.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { getFocus, on, read, write } from '@/util/element-utils.ts';
import '@/util/object.ts';
import { getProjectStore } from '@app/stores/project';

type ImportedFonts = {
	fontId: string | null;
	filter: string;
	initialize(): void;
	parse(fontId: string): string;
	open(fontId?: string): void;
	save(): string | null;
	read(): string | null;
	input(fontId: string): void;
	target?: { save: () => void };
};
type LanguagesInterface = {
	initialize(list: { inserting?: boolean }): void;
	parse(language: { name: string }): Array<{ content: unknown; class?: string }>;
	open(language?: { name: string; font: string; scale: number }): void;
	save(): { name: string; font: string; scale: number };
	update(): void;
	createAllItems(): Array<{ name: string; value: string }>;
	createValidItems(): Array<{ name: string; value: string }>;
	target?: { save: () => void };
};

interface ProjectSettingsWindow {
	form: Record<string, unknown>;
	changed: boolean;
	tscStarted: boolean;
	importedFonts: ImportedFonts;
	languages: LanguagesInterface;
	initialize: () => void;
	open: () => void;
	startTSC: () => void;
	stopTSC: () => void;
	windowClose: (event: Event) => void;
	windowClosed: (event: Event) => void;
	setChanged: (value: boolean) => void;
	projectChange: (
		event: Event & { key?: string; last: { script: { autoCompile?: boolean } } }
	) => void;
	dataChange: (event: Event) => void;
	paramInput: (event: Event) => void;
	confirm: (event?: Event) => void;
}

const form = reactive<Record<string, unknown>>({});
let changed = false;
let tscStarted = false;

function initialize(): void {
	if (!$('#config-window-display')) return;
	$('#config-window-display').loadItems([
		{ name: 'Windowed', value: 'windowed' },
		{ name: 'Maximized', value: 'maximized' },
		{ name: 'Fullscreen', value: 'fullscreen' }
	]);

	$('#config-collision-actor-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-collision-scene-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-collision-scene-enabled')
		.enableHiddenMode()
		.relate([{ case: true, targets: [$('#config-collision-scene-actorSize')] }]);

	$('#config-collision-trigger-collideWithActorShape').loadItems([
		{ name: "Collide With Actor's Shape", value: true },
		{ name: "Collide With Actor's Anchor", value: false }
	]);

	$('#config-text-importedFonts').bind(importedFonts);

	$('#config-text-highDefinition').loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	$('#config-actor-tempAttributes').bind(new AttributeListInterface());

	$('#config-webgl-desynchronized').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-webgl-textureMagFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	$('#config-webgl-textureMinFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	$('#config-script-autoCompile').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-save-location').loadItems([
		{ name: 'App Data', value: 'app-data' },
		{ name: 'Documents', value: 'documents' },
		{ name: 'Local Directory', value: 'local' }
	]);

	$('#config-save-location')
		.enableHiddenMode()
		.relate([
			{
				case: ['app-data', 'documents'],
				targets: [$('#config-save-subdir')]
			}
		]);

	$('#config-localization-languages').bind(languages);

	$('#config-preload').loadItems([
		{ name: 'Never', value: 'never' },
		{ name: 'Always', value: 'always' },
		{ name: 'Only on Deployment', value: 'deployed' }
	]);

	window.addEventListener('datachange', projectChange as EventListener);
	on($('#project-settings'), 'close', windowClose);
	on($('#project-settings'), 'closed', windowClosed);
	on($('#project-settings'), 'change', dataChange);
	on($('#project-confirm'), 'click', confirm);
	document
		.querySelectorAll(`#config-window-title, #config-window-width, #config-window-height,
    #config-window-display, #config-resolution-width, #config-resolution-height,
    #config-resolution-sceneScale, #config-resolution-uiScale,
    #config-scene-padding, #config-scene-animationInterval,
    #config-tileArea-expansionTop, #config-tileArea-expansionLeft,
    #config-tileArea-expansionRight, #config-tileArea-expansionBottom,
    #config-animationArea-expansionTop, #config-animationArea-expansionLeft,
    #config-animationArea-expansionRight, #config-animationArea-expansionBottom,
    #config-lightArea-expansionTop, #config-lightArea-expansionLeft,
    #config-lightArea-expansionRight, #config-lightArea-expansionBottom,
    #config-virtualAxis-up, #config-virtualAxis-down, #config-virtualAxis-left, #config-virtualAxis-right,
    #config-collision-actor-enabled, #config-collision-scene-enabled, #config-collision-scene-actorSize,
    #config-collision-trigger-collideWithActorShape, #config-text-fontFamily,
    #config-text-highDefinition, #config-animation-frameRate,
    #config-soundAttenuation-distance, #config-soundAttenuation-easingId,
    #config-webgl-desynchronized, #config-webgl-textureMagFilter, #config-webgl-textureMinFilter,
    #config-script-autoCompile, #config-save-location, #config-save-subdir,
    #config-localization-languages, #config-localization-default, #config-preload, #config-deadzone`)
		.forEach((el) => on(el, 'input', paramInput));
}

function open(): void {
	Window.open!('project-settings');

	getProjectStore().data = Object.clone(Data.config);
	getProjectStore().target = getProjectStore().data;

	getProjectStore().state = 'open';

	$('#config-soundAttenuation-easingId').loadItems(Data.createEasingItems());

	const data = getProjectStore().data;
	const setForm = (
		document.getElementById('project-settings') as
			| (HTMLElement & { setForm?: (data: Record<string, unknown>) => void })
			| null
	)?.setForm;
	setForm?.(data);
}

function startTSC(): void {
	if (!tscStarted) {
		tscStarted = true;
		ipcRenderer.send(CHANNELS.on.startTsc, File.root);
	}
}

function stopTSC(): void {
	if (tscStarted) {
		tscStarted = false;
		ipcRenderer.send(CHANNELS.on.stopTsc);
		Log.clear!();
	}
}

function windowClose(event: Event): void {
	if (changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedProjectSettings')
			},
			[
				{
					label: get('yes'),
					click: () => {
						changed = false;
						Window.close!('project-settings');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}

function windowClosed(event: Event): void {
	getProjectStore().state = 'closed';
	getProjectStore().target = null;
	getProjectStore().data = null;
}

function setChanged(value: boolean): void {
	changed = value;
}

function projectChange(
	event: Event & { key?: string; last: { script: { autoCompile?: boolean } } }
): void {
	if (event.key === 'config') {
		const last = event.last.script;
		const current = Data.config.script;
		if (current.autoCompile !== last.autoCompile) {
			if (current.autoCompile) {
				startTSC();
			} else {
				stopTSC();
			}
		}
	}
}

function dataChange(event: Event): void {
	changed = true;
}

function paramInput(this: HTMLElement, event: Event): void {
	const key = Inspector.getKey(this);
	const value = read(this);
	const keys = key.split('-');
	const end = keys.length - 1;
	let node = getProjectStore().data;
	for (let i = 0; i < end; i++) {
		node = node[keys[i]];
	}
	const property = keys[end];
	if (node[property] !== value) {
		node[property] = value;
	}
}

function filterDuplicateLanguages(): void {
	const local = getProjectStore().data!.localization;
	const languages: Array<{ name: string; font: string; scale: number }> = [];
	for (const language of local.languages) {
		languages.push(language);
	}
	local.languages = languages;
}

function confirm(event?: Event): void {
	if (changed) {
		changed = false;
		filterDuplicateLanguages();
		const last = Data.config;
		const title1 = Data.config.window.title;
		const title2 = getProjectStore().data!.window.title;
		Data.config = getProjectStore().data;
		File.planToSave!(Data.manifest.project.config);
		if (title1 !== title2) {
			Title.updateTitleName!();
		}
		const datachange = new Event('datachange') as Event & { key: string; last: unknown };
		datachange.key = 'config';
		datachange.last = last;
		window.dispatchEvent(datachange);
	}
	Window.close!('project-settings');
}

const importedFonts: ImportedFonts = {
	fontId: null,
	filter: 'font',
	initialize: function () {},
	parse: function (this: ImportedFonts, fontId: string) {
		return Command.removeTextTags(Command.parseFileName(fontId));
	},
	open: function (fontId = '') {
		this.fontId = fontId;
		getSelectorInstance()?.open?.(this, false);
	},
	save: function () {
		return this.fontId;
	},
	read: function () {
		return this.fontId;
	},
	input: function (this: ImportedFonts, fontId: string) {
		this.fontId = fontId;
		this.target?.save?.();
	}
};

const languages: LanguagesInterface = {
	initialize: function (this: LanguagesInterface, list: { inserting?: boolean }) {
		on($('#language-confirm'), 'click', () => {
			if (list.inserting) {
				const languages = getProjectStore().data!.localization.languages;
				const langName = read($('#language-name'));
				if (languages.find((lang: { name: string }) => lang.name === langName)) {
					return getFocus($('#language-name'));
				}
			}
			this.target?.save?.();
			Window.close!('language');
		});
	},
	parse: function (this: LanguagesInterface, language: { name: string }) {
		return [
			{ content: Local.get!('languages.' + language.name) },
			{ content: language.name, class: 'weak' }
		];
	},
	open: function (language = { name: '', font: '', scale: 1 }) {
		$('#language-name').loadItems(this.createAllItems());
		$('#language-name').write2(language.name);
		write($('#language-font'), language.font);
		write($('#language-scale'), language.scale);
		getFocus($('#language-name'));
		Window.open!('language');
	},
	save: function () {
		return {
			name: read($('#language-name')),
			font: read($('#language-font')),
			scale: read($('#language-scale'))
		};
	},
	update: function () {
		const selectBox = $('#config-localization-default');
		const defaultLang = read(selectBox);
		selectBox.loadItems(languages.createValidItems());
		if (defaultLang) write(selectBox, defaultLang);
	},
	createAllItems: function () {
		const items: Array<{ name: string; value: string }> = [];
		const languages = Local.get!('languages');
		if (languages) {
			for (const [value, name] of Object.entries(
				languages as unknown as Record<string, string>
			)) {
				if (value !== 'auto') {
					items.push({ name, value });
				}
			}
		}
		return items;
	},
	createValidItems: function () {
		const items: Array<{ name: string; value: string }> = [];
		const languages = Local.get!('languages');
		if (languages) {
			const langList = new Set(
				getProjectStore().data!.localization.languages.map(
					(lang: { name: string }) => lang.name
				)
			);
			for (const [value, name] of Object.entries(
				languages as unknown as Record<string, string>
			)) {
				if (value === 'auto' || langList.has(value)) {
					items.push({ name, value });
				}
			}
		}
		return items;
	}
};

export function useProjectSettingsWindow(): ProjectSettingsWindow {
	return {
		form,
		get changed() {
			return changed;
		},
		get tscStarted() {
			return tscStarted;
		},
		importedFonts,
		languages,
		initialize,
		open,
		startTSC,
		stopTSC,
		windowClose,
		windowClosed,
		setChanged,
		projectChange,
		dataChange,
		paramInput,
		confirm
	};
}
