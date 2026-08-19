import { reactive } from 'vue';
import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { Window } from '@app/legacy/tools/window-object.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Log } from '@app/legacy/log/log-window.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { t, createGetter, tObject } from '@app/i18n';
import { AttributeListInterface } from '@app/legacy/tools/property-list.ts';
import { getFocus, on, read, write } from '@app/utils/element-utils.ts';
import '@app/utils/object';
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
	if (!document.getElementById('config-window-display')) return;
	document.getElementById('config-window-display')!.loadItems([
		{ name: 'Windowed', value: 'windowed' },
		{ name: 'Maximized', value: 'maximized' },
		{ name: 'Fullscreen', value: 'fullscreen' }
	]);

	document.getElementById('config-collision-actor-enabled')!.loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	document.getElementById('config-collision-scene-enabled')!.loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	document
		.getElementById('config-collision-scene-enabled')!
		.enableHiddenMode()
		.relate([
			{ case: true, targets: [document.getElementById('config-collision-scene-actorSize')!] }
		]);

	document.getElementById('config-collision-trigger-collideWithActorShape')!.loadItems([
		{ name: "Collide With Actor's Shape", value: true },
		{ name: "Collide With Actor's Anchor", value: false }
	]);

	document.getElementById('config-text-importedFonts')!.bind(importedFonts);

	document.getElementById('config-text-highDefinition')!.loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	document.getElementById('config-actor-tempAttributes')!.bind(new AttributeListInterface());

	document.getElementById('config-webgl-desynchronized')!.loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	document.getElementById('config-webgl-textureMagFilter')!.loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	document.getElementById('config-webgl-textureMinFilter')!.loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	document.getElementById('config-script-autoCompile')!.loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	document.getElementById('config-save-location')!.loadItems([
		{ name: 'App Data', value: 'app-data' },
		{ name: 'Documents', value: 'documents' },
		{ name: 'Local Directory', value: 'local' }
	]);

	document
		.getElementById('config-save-location')!
		.enableHiddenMode()
		.relate([
			{
				case: ['app-data', 'documents'],
				targets: [document.getElementById('config-save-subdir')!]
			}
		]);

	document.getElementById('config-localization-languages')!.bind(languages);

	document.getElementById('config-preload')!.loadItems([
		{ name: 'Never', value: 'never' },
		{ name: 'Always', value: 'always' },
		{ name: 'Only on Deployment', value: 'deployed' }
	]);

	window.addEventListener('datachange', projectChange as EventListener);
	on(document.getElementById('project-settings'), 'close', windowClose);
	on(document.getElementById('project-settings'), 'closed', windowClosed);
	on(document.getElementById('project-settings'), 'change', dataChange);
	on(document.getElementById('project-confirm'), 'click', confirm);
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

	document
		.getElementById('config-soundAttenuation-easingId')!
		.loadItems(Data.createEasingItems());

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
		const get = createGetter('confirmation');
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
		on(document.getElementById('language-confirm'), 'click', () => {
			if (list.inserting) {
				const languages = getProjectStore().data!.localization.languages;
				const langName = read(document.getElementById('language-name'));
				if (languages.find((lang: { name: string }) => lang.name === langName)) {
					return getFocus(document.getElementById('language-name'));
				}
			}
			this.target?.save?.();
			Window.close!('language');
		});
	},
	parse: function (this: LanguagesInterface, language: { name: string }) {
		return [
			{ content: t('languages.' + language.name) },
			{ content: language.name, class: 'weak' }
		];
	},
	open: function (language = { name: '', font: '', scale: 1 }) {
		document.getElementById('language-name')!.loadItems(this.createAllItems());
		document.getElementById('language-name')!.write2(language.name);
		write(document.getElementById('language-font'), language.font);
		write(document.getElementById('language-scale'), language.scale);
		getFocus(document.getElementById('language-name'));
		Window.open!('language');
	},
	save: function () {
		return {
			name: read(document.getElementById('language-name')),
			font: read(document.getElementById('language-font')),
			scale: read(document.getElementById('language-scale'))
		};
	},
	update: function () {
		const selectBox = document.getElementById('config-localization-default')!;
		const defaultLang = read(selectBox);
		selectBox.loadItems(languages.createValidItems());
		if (defaultLang) write(selectBox, defaultLang);
	},
	createAllItems: function () {
		const items: Array<{ name: string; value: string }> = [];
		const languages = tObject<Record<string, string>>('languages');
		if (languages) {
			for (const [value, name] of Object.entries(languages)) {
				if (value !== 'auto') {
					items.push({ name, value });
				}
			}
		}
		return items;
	},
	createValidItems: function () {
		const items: Array<{ name: string; value: string }> = [];
		const languages = tObject<Record<string, string>>('languages');
		if (languages) {
			const langList = new Set(
				getProjectStore().data!.localization.languages.map(
					(lang: { name: string }) => lang.name
				)
			);
			for (const [value, name] of Object.entries(languages)) {
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
