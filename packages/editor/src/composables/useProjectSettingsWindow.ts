import { getWindowFormsStore } from '@app/stores/window-forms';
import { composableEls } from '@app/composables/element-registry';
import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getWindowStore } from '@app/stores/window';
import { removeTextTags, parseFileName } from '@app/composables/useCommandParse.ts';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Log } from '@app/log/log-window.ts';
import { Title } from '@app/title/title-bar.ts';
import { getLoadedLocaleData, getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

function getLanguageMap(): Record<string, string> {
	const properties = getLoadedLocaleData(getYamiI18n().global.locale.value)?.properties as
		| Record<string, unknown>
		| undefined;
	return (properties?.languages ?? {}) as Record<string, string>;
}
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { on, read, write } from '@app/utils/element-utils.ts';
import { requestFocus } from '@app/directives/focus';
import '@app/utils/object';
import { getProjectStore } from '@app/stores/project';
import { createPayloadEvent } from '@ui-kit';
import type { YamiElement } from '@app/types/element-api';
import { clone as deepClone } from '@app/utils/object';

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
	confirm(): void;
	target?: { save: () => void };
};

export interface ProjectSettingsForm {
	window: {
		title: string;
		width: number;
		height: number;
		display: string;
	};
	resolution: {
		width: number;
		height: number;
		sceneScale: number;
		uiScale: number;
	};
	scene: {
		padding: number;
		animationInterval: number;
	};
	tileArea: {
		expansionTop: number;
		expansionLeft: number;
		expansionRight: number;
		expansionBottom: number;
	};
	animationArea: {
		expansionTop: number;
		expansionLeft: number;
		expansionRight: number;
		expansionBottom: number;
	};
	lightArea: {
		expansionTop: number;
		expansionLeft: number;
		expansionRight: number;
		expansionBottom: number;
	};
	virtualAxis: {
		up: number;
		down: number;
		left: number;
		right: number;
	};
	collision: {
		actor: {
			enabled: boolean;
		};
		scene: {
			enabled: boolean;
			actorSize: number;
		};
		trigger: {
			collideWithActorShape: boolean;
		};
	};
	text: {
		importedFonts: unknown[];
		fontFamily: string;
		highDefinition: boolean;
	};
	actor: {
		tempAttributes: unknown[];
	};
	animation: {
		frameRate: number;
	};
	soundAttenuation: {
		distance: number;
		easingId: string;
	};
	webgl: {
		desynchronized: boolean;
		textureMagFilter: string;
		textureMinFilter: string;
	};
	script: {
		autoCompile: boolean;
	};
	save: {
		location: string;
		subdir: string;
	};
	localization: {
		languages: Array<{ name: string; font: string; scale: number }>;
		default: string;
	};
	preload: string;
	deadzone: number;
}

interface ProjectSettingsWindow {
	form: ProjectSettingsForm;
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

// 表单真源在 `stores/window-forms.ts`（原先是本模块的模块级 reactive）。
// 每个键对应一个嵌套对象；就地改值（如 form.window.title）直接落在 store 上。
const form: ProjectSettingsForm = {
	get window(): ProjectSettingsForm['window'] {
		return getWindowFormsStore().projectSettingsForm.window;
	},
	set window(value: ProjectSettingsForm['window']) {
		getWindowFormsStore().projectSettingsForm.window = value;
	},
	get resolution(): ProjectSettingsForm['resolution'] {
		return getWindowFormsStore().projectSettingsForm.resolution;
	},
	set resolution(value: ProjectSettingsForm['resolution']) {
		getWindowFormsStore().projectSettingsForm.resolution = value;
	},
	get scene(): ProjectSettingsForm['scene'] {
		return getWindowFormsStore().projectSettingsForm.scene;
	},
	set scene(value: ProjectSettingsForm['scene']) {
		getWindowFormsStore().projectSettingsForm.scene = value;
	},
	get tileArea(): ProjectSettingsForm['tileArea'] {
		return getWindowFormsStore().projectSettingsForm.tileArea;
	},
	set tileArea(value: ProjectSettingsForm['tileArea']) {
		getWindowFormsStore().projectSettingsForm.tileArea = value;
	},
	get animationArea(): ProjectSettingsForm['animationArea'] {
		return getWindowFormsStore().projectSettingsForm.animationArea;
	},
	set animationArea(value: ProjectSettingsForm['animationArea']) {
		getWindowFormsStore().projectSettingsForm.animationArea = value;
	},
	get lightArea(): ProjectSettingsForm['lightArea'] {
		return getWindowFormsStore().projectSettingsForm.lightArea;
	},
	set lightArea(value: ProjectSettingsForm['lightArea']) {
		getWindowFormsStore().projectSettingsForm.lightArea = value;
	},
	get virtualAxis(): ProjectSettingsForm['virtualAxis'] {
		return getWindowFormsStore().projectSettingsForm.virtualAxis;
	},
	set virtualAxis(value: ProjectSettingsForm['virtualAxis']) {
		getWindowFormsStore().projectSettingsForm.virtualAxis = value;
	},
	get collision(): ProjectSettingsForm['collision'] {
		return getWindowFormsStore().projectSettingsForm.collision;
	},
	set collision(value: ProjectSettingsForm['collision']) {
		getWindowFormsStore().projectSettingsForm.collision = value;
	},
	get text(): ProjectSettingsForm['text'] {
		return getWindowFormsStore().projectSettingsForm.text;
	},
	set text(value: ProjectSettingsForm['text']) {
		getWindowFormsStore().projectSettingsForm.text = value;
	},
	get actor(): ProjectSettingsForm['actor'] {
		return getWindowFormsStore().projectSettingsForm.actor;
	},
	set actor(value: ProjectSettingsForm['actor']) {
		getWindowFormsStore().projectSettingsForm.actor = value;
	},
	get animation(): ProjectSettingsForm['animation'] {
		return getWindowFormsStore().projectSettingsForm.animation;
	},
	set animation(value: ProjectSettingsForm['animation']) {
		getWindowFormsStore().projectSettingsForm.animation = value;
	},
	get soundAttenuation(): ProjectSettingsForm['soundAttenuation'] {
		return getWindowFormsStore().projectSettingsForm.soundAttenuation;
	},
	set soundAttenuation(value: ProjectSettingsForm['soundAttenuation']) {
		getWindowFormsStore().projectSettingsForm.soundAttenuation = value;
	},
	get webgl(): ProjectSettingsForm['webgl'] {
		return getWindowFormsStore().projectSettingsForm.webgl;
	},
	set webgl(value: ProjectSettingsForm['webgl']) {
		getWindowFormsStore().projectSettingsForm.webgl = value;
	},
	get script(): ProjectSettingsForm['script'] {
		return getWindowFormsStore().projectSettingsForm.script;
	},
	set script(value: ProjectSettingsForm['script']) {
		getWindowFormsStore().projectSettingsForm.script = value;
	},
	get save(): ProjectSettingsForm['save'] {
		return getWindowFormsStore().projectSettingsForm.save;
	},
	set save(value: ProjectSettingsForm['save']) {
		getWindowFormsStore().projectSettingsForm.save = value;
	},
	get localization(): ProjectSettingsForm['localization'] {
		return getWindowFormsStore().projectSettingsForm.localization;
	},
	set localization(value: ProjectSettingsForm['localization']) {
		getWindowFormsStore().projectSettingsForm.localization = value;
	},
	get preload(): ProjectSettingsForm['preload'] {
		return getWindowFormsStore().projectSettingsForm.preload;
	},
	set preload(value: ProjectSettingsForm['preload']) {
		getWindowFormsStore().projectSettingsForm.preload = value;
	},
	get deadzone(): ProjectSettingsForm['deadzone'] {
		return getWindowFormsStore().projectSettingsForm.deadzone;
	},
	set deadzone(value: ProjectSettingsForm['deadzone']) {
		getWindowFormsStore().projectSettingsForm.deadzone = value;
	}
};
let changed = false;
let tscStarted = false;
/** 语言列表控件（`bind()` 时由 ParamList 传入），供语言窗口的确认动作读取 */
let languageList: { inserting?: boolean } = {};

/** 取注册表里的控件元素（沿用原先 `document.getElementById(id)!` 的非空断言语义） */
const el = (id: string): YamiElement => composableEls.get(id) as YamiElement;

/** 参数控件 id：`initialize()` 给它们统一挂 `input` 监听（渲染方 ProjectSettings.vue 逐个 `:ref` 登记） */
const PARAM_IDS = [
	'config-window-title',
	'config-window-width',
	'config-window-height',
	'config-window-display',
	'config-resolution-width',
	'config-resolution-height',
	'config-resolution-sceneScale',
	'config-resolution-uiScale',
	'config-scene-padding',
	'config-scene-animationInterval',
	'config-tileArea-expansionTop',
	'config-tileArea-expansionLeft',
	'config-tileArea-expansionRight',
	'config-tileArea-expansionBottom',
	'config-animationArea-expansionTop',
	'config-animationArea-expansionLeft',
	'config-animationArea-expansionRight',
	'config-animationArea-expansionBottom',
	'config-lightArea-expansionTop',
	'config-lightArea-expansionLeft',
	'config-lightArea-expansionRight',
	'config-lightArea-expansionBottom',
	'config-virtualAxis-up',
	'config-virtualAxis-down',
	'config-virtualAxis-left',
	'config-virtualAxis-right',
	'config-collision-actor-enabled',
	'config-collision-scene-enabled',
	'config-collision-scene-actorSize',
	'config-collision-trigger-collideWithActorShape',
	'config-text-fontFamily',
	'config-text-highDefinition',
	'config-animation-frameRate',
	'config-soundAttenuation-distance',
	'config-soundAttenuation-easingId',
	'config-webgl-desynchronized',
	'config-webgl-textureMagFilter',
	'config-webgl-textureMinFilter',
	'config-script-autoCompile',
	'config-save-location',
	'config-save-subdir',
	'config-localization-languages',
	'config-localization-default',
	'config-preload',
	'config-deadzone'
];

function initialize(): void {
	if (!composableEls.get('config-window-display')) return;
	el('config-window-display').loadItems([
		{ name: 'Windowed', value: 'windowed' },
		{ name: 'Maximized', value: 'maximized' },
		{ name: 'Fullscreen', value: 'fullscreen' }
	]);

	el('config-collision-actor-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	el('config-collision-scene-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	el('config-collision-scene-enabled')
		.enableHiddenMode()
		.relate([{ case: true, targets: [el('config-collision-scene-actorSize')] }]);

	el('config-collision-trigger-collideWithActorShape').loadItems([
		{ name: "Collide With Actor's Shape", value: true },
		{ name: "Collide With Actor's Anchor", value: false }
	]);

	el('config-text-importedFonts').bind(importedFonts);

	el('config-text-highDefinition').loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	el('config-actor-tempAttributes').bind(new AttributeListInterface());

	el('config-webgl-desynchronized').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	el('config-webgl-textureMagFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	el('config-webgl-textureMinFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	el('config-script-autoCompile').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	el('config-save-location').loadItems([
		{ name: 'App Data', value: 'app-data' },
		{ name: 'Documents', value: 'documents' },
		{ name: 'Local Directory', value: 'local' }
	]);

	el('config-save-location')
		.enableHiddenMode()
		.relate([{ case: ['app-data', 'documents'], targets: [el('config-save-subdir')] }]);

	el('config-localization-languages').bind(languages);

	el('config-preload').loadItems([
		{ name: 'Never', value: 'never' },
		{ name: 'Always', value: 'always' },
		{ name: 'Only on Deployment', value: 'deployed' }
	]);

	window.addEventListener('datachange', projectChange as EventListener);
	on(composableEls.get('project-settings'), 'close', windowClose);
	on(composableEls.get('project-settings'), 'closed', windowClosed);
	on(composableEls.get('project-settings'), 'change', dataChange);
	// 确认按钮由 WindowFrame → YMFormButtons 生成（模板里没有、注册表取不到）→ 走 SFC 的 @confirm
	for (const id of PARAM_IDS) {
		const control = composableEls.get(id);
		if (control) on(control, 'input', paramInput);
	}
}

function open(): void {
	getWindowStore().open('project-settings');

	getProjectStore().data = deepClone(Data.config);
	getProjectStore().target = getProjectStore().data;

	getProjectStore().state = 'open';

	el('config-soundAttenuation-easingId').loadItems(Data.createEasingItems());

	const data = getProjectStore().data;
	if (data) {
		Object.assign(form, data);
		write(composableEls.get('config-virtualAxis-up'), data.virtualAxis.up);
		write(composableEls.get('config-virtualAxis-down'), data.virtualAxis.down);
		write(composableEls.get('config-virtualAxis-left'), data.virtualAxis.left);
		write(composableEls.get('config-virtualAxis-right'), data.virtualAxis.right);
	}
}

function startTSC(): void {
	if (!tscStarted) {
		tscStarted = true;
		YamiIpc.send.startTsc(File.root);
	}
}

function stopTSC(): void {
	if (tscStarted) {
		tscStarted = false;
		YamiIpc.send.stopTsc();
		Log.clear!();
	}
}

function windowClose(event: Event): void {
	if (changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		getWindowStore().confirm(
			{
				message: get('closeUnsavedProjectSettings')
			},
			[
				{
					label: get('yes'),
					click: () => {
						changed = false;
						getWindowStore().close('project-settings');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}

function windowClosed(_event: Event): void {
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

function dataChange(_event: Event): void {
	changed = true;
}

function paramInput(this: HTMLElement, _event: Event): void {
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

function confirm(_event?: Event): void {
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
		const datachange = createPayloadEvent('datachange', {} as { key: string; last: unknown });
		datachange.key = 'config';
		datachange.last = last;
		window.dispatchEvent(datachange);
	}
	getWindowStore().close('project-settings');
}

const importedFonts: ImportedFonts = {
	fontId: null,
	filter: 'font',
	initialize: function () {},
	parse: function (this: ImportedFonts, fontId: string) {
		return removeTextTags(parseFileName(fontId));
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
		languageList = list;
	},
	parse: function (this: LanguagesInterface, language: { name: string }) {
		return [
			{ content: t('languages.' + language.name) },
			{ content: language.name, class: 'weak' }
		];
	},
	open: function (language = { name: '', font: '', scale: 1 }) {
		el('language-name').loadItems(this.createAllItems());
		el('language-name').write2(language.name);
		write(composableEls.get('language-font'), language.font);
		write(composableEls.get('language-scale'), language.scale);
		requestFocus('language-name');
		getWindowStore().open('language');
	},
	/**
	 * 语言窗口的确认：按钮由 WindowFrame → YMFormButtons 生成（模板里没有、注册表取不到），
	 * 故由 `Language.vue` 的 `@confirm` 调用本方法（原先是在 `initialize` 里按 id 给按钮挂 click）。
	 */
	confirm: function (this: LanguagesInterface) {
		if (languageList.inserting) {
			const langList = getProjectStore().data!.localization.languages;
			const langName = read(composableEls.get('language-name'));
			if (langList.find((lang: { name: string }) => lang.name === langName)) {
				return requestFocus('language-name');
			}
		}
		this.target?.save?.();
		getWindowStore().close('language');
	},
	save: function () {
		return {
			name: read(composableEls.get('language-name')),
			font: read(composableEls.get('language-font')),
			scale: read(composableEls.get('language-scale'))
		};
	},
	update: function () {
		const selectBox = el('config-localization-default');
		const defaultLang = read(selectBox);
		selectBox.loadItems(languages.createValidItems());
		if (defaultLang) write(selectBox, defaultLang);
	},
	createAllItems: function () {
		const items: Array<{ name: string; value: string }> = [];
		const languages = getLanguageMap();
		if (Object.keys(languages).length > 0) {
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
		const languages = getLanguageMap();
		if (Object.keys(languages).length > 0) {
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
