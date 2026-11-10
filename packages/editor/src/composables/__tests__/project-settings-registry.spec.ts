import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElementRegistry } from '@app/utils/element-registry';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ProjectSettings from '@app/components/tools/ProjectSettings.vue';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
const composableEls = createElementRegistry();
import { getProjectStore } from '@app/stores/project';
import { Window } from '@app/tools/window-object.ts';
import { focusTarget } from '@app/directives/focus';
import { Data } from '@app/data/data-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('electron', () => ({
	ipcRenderer: { send: vi.fn() },
	shell: {}
}));

vi.mock('@app/file/file-system-core.ts', () => ({
	File: { planToSave: vi.fn(), root: '/mock/project' }
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } }),
	getLoadedLocaleData: () => ({ properties: { languages: {} } })
}));

vi.mock('@app/log/log-window.ts', () => ({
	Log: { clear: vi.fn() }
}));

vi.mock('@app/title/title-bar.ts', () => ({
	Title: { updateTitleName: vi.fn() }
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	removeTextTags: (text: string) => text,
	parseFileName: (text: string) => text
}));

vi.mock('@app/stores/selector.ts', () => ({
	getSelectorInstance: () => null
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		getKey: (el: { key?: string; id: string }): string =>
			el.key ?? el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/tools/property-list.ts', () => ({
	AttributeListInterface: class {
		initialize(): void {}
	}
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: {
		config: null,
		manifest: { project: { config: 'Data/config.json' } },
		createEasingItems: () => [{ name: 'Linear', value: 'linear' }]
	}
}));

const CONFIG_IDS = [
	'config-window-title',
	'config-window-display',
	'config-virtualAxis-up',
	'config-collision-actor-enabled',
	'config-collision-scene-enabled',
	'config-collision-scene-actorSize',
	'config-text-importedFonts',
	'config-actor-tempAttributes',
	'config-save-location',
	'config-save-subdir',
	'config-localization-languages',
	'config-localization-default',
	'config-preload',
	'config-deadzone'
];

type LoadableEl = HTMLElement & { loadItems?: (items: unknown[]) => void };

const makeConfig = () => ({
	window: { title: 'YAMI', width: 960, height: 540, display: 'windowed' },
	resolution: { width: 960, height: 540, sceneScale: 1, uiScale: 1 },
	scene: { padding: 0, animationInterval: 100 },
	tileArea: { expansionTop: 0, expansionLeft: 0, expansionRight: 0, expansionBottom: 0 },
	animationArea: { expansionTop: 0, expansionLeft: 0, expansionRight: 0, expansionBottom: 0 },
	lightArea: { expansionTop: 0, expansionLeft: 0, expansionRight: 0, expansionBottom: 0 },
	virtualAxis: { up: '', down: '', left: '', right: '' },
	collision: {
		actor: { enabled: true },
		scene: { enabled: true, actorSize: 1 },
		trigger: { collideWithActorShape: true }
	},
	text: { importedFonts: [], fontFamily: '', highDefinition: true },
	actor: { tempAttributes: [] },
	animation: { frameRate: 60 },
	soundAttenuation: { distance: 50, easingId: 'linear' },
	webgl: { desynchronized: true, textureMagFilter: 'nearest', textureMinFilter: 'linear' },
	script: { autoCompile: true },
	save: { location: 'app-data', subdir: '' },
	localization: { languages: [{ name: 'zh', font: '', scale: 1 }], default: 'zh' },
	preload: 'never',
	deadzone: 0
});

describe('项目设置窗口注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.confirm = vi.fn();
		focusTarget.current = null;
		vi.mocked(Data).config = null;
	});

	it('ProjectSettings.vue 的控件不再进注册表，但都在 DOM 里', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		expect(composableEls.get('project-settings'), '帧不该再登记').toBeFalsy();
		expect(document.getElementById('project-settings')).toBeTruthy();
		for (const id of CONFIG_IDS) {
			expect(composableEls.get(id), `${id} 不该再登记`).toBeFalsy();
			expect(document.getElementById(id), `${id} 模板里应存在`).toBeTruthy();
		}

		wrapper.unmount();
	});

	it('initialize 经窗口控件表给参数控件挂 loadItems / relate（不是静默 no-op）', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const display = document.getElementById('config-window-display') as unknown as LoadableEl;
		const loadItems = vi.fn();
		display.loadItems = loadItems;

		const sceneEnabled = document.getElementById(
			'config-collision-scene-enabled'
		) as unknown as HTMLElement & {
			enableHiddenMode(): { relate(cases: unknown[]): void };
			relate?(cases: unknown[]): void;
		};
		const relate = vi.fn();
		sceneEnabled.enableHiddenMode = () => ({ relate });
		sceneEnabled.relate = relate;

		useProjectSettingsWindow().initialize();

		expect(loadItems).toHaveBeenCalledTimes(1);
		expect(
			(loadItems.mock.calls[0][0] as Array<{ value: string }>).map((i) => i.value)
		).toEqual(['windowed', 'maximized', 'fullscreen']);
		expect(relate).toHaveBeenCalledTimes(1);
		const cases = relate.mock.calls[0][0] as Array<{ case: unknown; targets: unknown[] }>;
		expect(cases[0].targets[0]).toBe(
			document.getElementById('config-collision-scene-actorSize')
		);

		wrapper.unmount();
	});

	it('参数控件的 input 经窗口控件表接到 paramInput（写入 store.data）', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		vi.mocked(Data).config = makeConfig() as never;
		const settings = useProjectSettingsWindow();
		settings.initialize();
		settings.open();

		const control = document.getElementById('config-window-title') as unknown as HTMLElement & {
			write(value: unknown): void;
		};
		control.write('From registry');
		control.dispatchEvent(new Event('input', { bubbles: true }));

		expect(getProjectStore().data?.window.title).toBe('From registry');
		expect(settings.form.window.title).toBe('From registry');

		wrapper.unmount();
	});

	it('确认按钮走 SFC 的 @confirm（点击 #project-confirm → composable.confirm）', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		vi.mocked(Data).config = makeConfig() as never;
		const settings = useProjectSettingsWindow();
		settings.initialize();
		settings.open();

		const button = document.getElementById('project-confirm');
		expect(button).toBeTruthy();
		button!.dispatchEvent(new Event('click', { bubbles: true }));

		expect(Window.close).toHaveBeenCalledWith('project-settings');

		wrapper.unmount();
	});
});
