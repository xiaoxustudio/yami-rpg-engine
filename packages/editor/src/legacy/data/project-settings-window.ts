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

export const Project = {
	data: null as any,
	changed: false,
	importedFonts: null as any,
	languages: null as any,
	tscStarted: false,
	initialize: null as any,
	open: null as any,
	startTSC: null as any,
	stopTSC: null as any,
	windowClose: null as any,
	windowClosed: null as any,
	projectChange: null as any,
	dataChange: null as any,
	paramInput: null as any,
	confirm: null as any,
	state: null as string | null,
	target: null as Record<string, any> | null,
	close: null as (() => void) | null
};

Project.initialize = function (this: any) {
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

	window.addEventListener('datachange', this.projectChange);
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

Project.open = function (this: any) {
	Window.open!('project-settings');

	this.data = Object.clone(Data.config);

	$('#config-soundAttenuation-easingId').loadItems(Data.createEasingItems());

	const write = getElementWriter('config', this.data);
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

Project.startTSC = function (this: any) {
	if (!this.tscStarted) {
		this.tscStarted = true;
		ipcRenderer.send('start-tsc', File.root);
	}
};

Project.stopTSC = function (this: any) {
	if (this.tscStarted) {
		this.tscStarted = false;
		ipcRenderer.send('stop-tsc');
		Log.clear!();
	}
};

Project.windowClose = function (this: any, event: any) {
	if (Project.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
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

Project.windowClosed = function (this: any, event: any) {
	Project.data = null;
};

Project.projectChange = function (this: any, event: any) {
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

Project.dataChange = function (this: any, event: any) {
	this.changed = true;
}.bind(Project);

Project.paramInput = function (this: any, event: any) {
	const key = Inspector.getKey(this);
	const value = read(this);
	const keys = key.split('-');
	const end = keys.length - 1;
	let node = Project.data;
	for (let i = 0; i < end; i++) {
		node = node[keys[i]];
	}
	const property = keys[end];
	if (node[property] !== value) {
		node[property] = value;
	}
};

(Project as any).filterDuplicateLanguages = function (this: any) {
	const local = this.data.localization;
	const languages = [] as any[];
	for (const language of local.languages) {
		languages.push(language);
	}
	local.languages = languages;
};

Project.confirm = function (this: any, event: any) {
	if (this.changed) {
		this.changed = false;
		this.filterDuplicateLanguages();
		const last = Data.config;
		const title1 = Data.config.window.title;
		const title2 = this.data.window.title;
		Data.config = this.data;
		File.planToSave!(Data.manifest.project.config);
		if (title1 !== title2) {
			Title.updateTitleName!();
		}
		const datachange = new Event('datachange');
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
	parse: function (this: any, fontId: any) {
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
	input: function (this: any, fontId: any) {
		this.fontId = fontId;
		this.target?.save?.();
	}
};

Project.languages = {
	initialize: function (this: any, list: any) {
		on($('#language-confirm'), 'click', () => {
			if (list.inserting) {
				const languages = Project.data.localization.languages;
				const langName = read($('#language-name'));
				if (languages.find((lang: any) => lang.name === langName)) {
					return getFocus($('#language-name'));
				}
			}
			this.target?.save?.();
			Window.close!('language');
		});
	},
	parse: function (this: any, language: any) {
		return [
			{ content: Local.get('languages.' + language.name) },
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
		selectBox.loadItems(Project.languages.createValidItems());
		if (defaultLang) write(selectBox, defaultLang);
	},
	createAllItems: function () {
		const items = [] as any[];
		const languages = Local.get('languages');
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
		const items = [] as any[];
		const languages = Local.get('languages');
		if (languages) {
			const langList = new Set(
				Project.data.localization.languages.map((lang: any) => lang.name)
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
