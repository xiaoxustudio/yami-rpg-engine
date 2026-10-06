import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ProjectSettings from '@app/components/tools/ProjectSettings.vue';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import { composableEls } from '@app/composables/element-registry';
import { getProjectStore } from '@app/stores/project';
import { Window } from '@app/tools/window-object.ts';
import { focusTarget } from '@app/directives/focus';
import { Data } from '@app/data/data-object.ts';

/**
 * 窗口注册表回归（`document.getElementById('config-*')` → `composableEls`）。
 *
 * 覆盖三条链路：① 渲染方登记（注册键 ↔ 元素 id）；② 模块侧读注册表（`initialize()` 的
 * `loadItems` / `relate` 目标确实是注册表里的控件，不是静默 no-op）；③ `*-confirm` 按钮改由
 * SFC 的 `@confirm` 驱动（按钮由 WindowFrame 生成、模板与注册表都取不到）。
 */
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

	it('ProjectSettings.vue 登记窗口与控件，注册键与元素 id 一致', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		expect(composableEls.get('project-settings')?.id).toBe('project-settings');
		for (const id of CONFIG_IDS) {
			const el = composableEls.get(id);
			expect(el, `${id} 未登记`).toBeTruthy();
			expect(el?.id).toBe(id);
		}

		wrapper.unmount();
	});

	it('initialize 经注册表给参数控件挂 loadItems / relate（不是静默 no-op）', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const display = composableEls.get('config-window-display') as unknown as LoadableEl;
		const loadItems = vi.fn();
		display.loadItems = loadItems;

		const sceneEnabled = composableEls.get(
			'config-collision-scene-enabled'
		) as unknown as HTMLElement & {
			enableHiddenMode(): { relate(cases: unknown[]): void };
		};
		const relate = vi.fn();
		sceneEnabled.enableHiddenMode = () => ({ relate });

		useProjectSettingsWindow().initialize();

		expect(loadItems).toHaveBeenCalledTimes(1);
		expect(
			(loadItems.mock.calls[0][0] as Array<{ value: string }>).map((i) => i.value)
		).toEqual(['windowed', 'maximized', 'fullscreen']);
		expect(relate).toHaveBeenCalledTimes(1);
		const cases = relate.mock.calls[0][0] as Array<{ case: unknown; targets: unknown[] }>;
		expect(cases[0].targets[0]).toBe(composableEls.get('config-collision-scene-actorSize'));

		wrapper.unmount();
	});

	it('参数控件的 input 经注册表接到 paramInput（写入 store.data）', async () => {
		const wrapper = mount(ProjectSettings, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		vi.mocked(Data).config = makeConfig() as never;
		const settings = useProjectSettingsWindow();
		settings.initialize();
		settings.open();

		const control = composableEls.get('config-window-title') as unknown as HTMLElement & {
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
