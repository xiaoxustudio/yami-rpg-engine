import { ipcRenderer } from 'electron';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { Window } from '@/tools/window-object.ts';
import { $, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Data } from './data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Log } from '@/log/log-window.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { getFocus, on, read, write } from '@/util/element-utils.ts';

type ProjectData = {
	window: { title: string };
	localization: { languages: Array<{ name: string; font: string; scale: number }> };
	[k: string]: any;
};
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

export const Project = {
	data: null as ProjectData | null,
	changed: false,
	importedFonts: null as ImportedFonts | null,
	languages: null as LanguagesInterface | null,
	tscStarted: false,
	initialize: null as unknown as () => void,
	open: null as unknown as () => void,
	startTSC: null as unknown as () => void,
	stopTSC: null as unknown as () => void,
	windowClose: null as unknown as (event: Event) => void,
	windowClosed: null as unknown as (event: Event) => void,
	projectChange: null as unknown as (
		event: Event & { key?: string; last: { script: { autoCompile?: boolean } } }
	) => void,
	dataChange: null as unknown as (event: Event) => void,
	paramInput: null as unknown as (event: Event) => void,
	confirm: null as unknown as (event: Event) => void,
	state: null as string | null,
	target: null as { save?: () => void } | null,
	close: null as (() => void) | null
};

Project.initialize = function (this: typeof Project) {
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

	$('#config-text-importedFonts').bind(this.importedFonts);

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

	$('#config-localization-languages').bind(this.languages);

	$('#config-preload').loadItems([
		{ name: 'Never', value: 'never' },
		{ name: 'Always', value: 'always' },
		{ name: 'Only on Deployment', value: 'deployed' }
	]);

	window.addEventListener('datachange', this.projectChange as EventListener);
	on($('#project-settings'), 'close', this.windowClose);
	on($('#project-settings'), 'closed', this.windowClosed);
	on($('#project-settings'), 'change', this.dataChange);
	on($('#project-confirm'), 'click', this.confirm);
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
		.forEach((el) => on(el, 'input', this.paramInput));
};

Project.open = function (this: typeof Project) {
	Window.open!('project-settings');

	this.data = Object.clone(Data.config);

	$('#config-soundAttenuation-easingId').loadItems(Data.createEasingItems());

	const write = getElementWriter('config', this.data!);
	write('window-title');
	write('window-width');
	write('window-height');
	write('window-display');
	write('resolution-width');
	write('resolution-height');
	write('resolution-sceneScale');
	write('resolution-uiScale');
	write('scene-padding');
	write('scene-animationInterval');
	write('tileArea-expansionTop');
	write('tileArea-expansionLeft');
	write('tileArea-expansionRight');
	write('tileArea-expansionBottom');
	write('animationArea-expansionTop');
	write('animationArea-expansionLeft');
	write('animationArea-expansionRight');
	write('animationArea-expansionBottom');
	write('lightArea-expansionTop');
	write('lightArea-expansionLeft');
	write('lightArea-expansionRight');
	write('lightArea-expansionBottom');
	write('virtualAxis-up');
	write('virtualAxis-down');
	write('virtualAxis-left');
	write('virtualAxis-right');
	write('collision-actor-enabled');
	write('collision-scene-enabled');
	write('collision-scene-actorSize');
	write('collision-trigger-collideWithActorShape');
	write('text-importedFonts');
	write('text-fontFamily');
	write('text-highDefinition');
	write('actor-tempAttributes');
	write('animation-frameRate');
	write('soundAttenuation-distance');
	write('soundAttenuation-easingId');
	write('webgl-desynchronized');
	write('webgl-textureMagFilter');
	write('webgl-textureMinFilter');
	write('script-autoCompile');
	write('save-location');
	write('save-subdir');
	write('localization-languages');
	write('localization-default');
	write('preload');
	write('deadzone');
};

Project.startTSC = function (this: typeof Project) {
	if (!this.tscStarted) {
		this.tscStarted = true;
		ipcRenderer.send('start-tsc', File.root);
	}
};

Project.stopTSC = function (this: typeof Project) {
	if (this.tscStarted) {
		this.tscStarted = false;
		ipcRenderer.send('stop-tsc');
		Log.clear!();
	}
};

Project.windowClose = function (this: typeof Project, event: Event) {
	if (Project.changed) {
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
						Project.changed = false;
						Window.close!('project-settings');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Project.windowClosed = function (this: typeof Project, event: Event) {
	Project.data = null;
};

Project.projectChange = function (
	this: typeof Project,
	event: Event & { key?: string; last: { script: { autoCompile?: boolean } } }
) {
	if (event.key === 'config') {
		const last = event.last.script;
		const current = Data.config.script;
		if (current.autoCompile !== last.autoCompile) {
			if (current.autoCompile) {
				Project.startTSC();
			} else {
				Project.stopTSC();
			}
		}
	}
};

Project.dataChange = function (this: typeof Project, event: Event) {
	this.changed = true;
}.bind(Project);

Project.paramInput = function (this: typeof Project, event: Event) {
	const key = Inspector.getKey(this);
	const value = read(this as unknown as HTMLElement);
	const keys = key.split('-');
	const end = keys.length - 1;
	let node = Project.data!;
	for (let i = 0; i < end; i++) {
		node = node[keys[i]];
	}
	const property = keys[end];
	if (node[property] !== value) {
		node[property] = value;
	}
};

(
	Project as unknown as { filterDuplicateLanguages: (this: typeof Project) => void }
).filterDuplicateLanguages = function (this: typeof Project) {
	const local = this.data!.localization;
	const languages: Array<{ name: string; font: string; scale: number }> = [];
	for (const language of local.languages) {
		languages.push(language);
	}
	local.languages = languages;
};

Project.confirm = function (this: typeof Project, event: Event) {
	if (this.changed) {
		this.changed = false;
		(
			this as typeof Project & { filterDuplicateLanguages: () => void }
		).filterDuplicateLanguages();
		const last = Data.config;
		const title1 = Data.config.window.title;
		const title2 = this.data!.window.title;
		Data.config = this.data;
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
}.bind(Project);

Project.importedFonts = {
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

Project.languages = {
	initialize: function (this: LanguagesInterface, list: { inserting?: boolean }) {
		on($('#language-confirm'), 'click', () => {
			if (list.inserting) {
				const languages = Project.data!.localization.languages;
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
		selectBox.loadItems(Project.languages!.createValidItems());
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
				Project.data!.localization.languages.map((lang: { name: string }) => lang.name)
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
