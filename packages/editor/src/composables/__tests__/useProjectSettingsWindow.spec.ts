import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ProjectSettings from '@app/components/tools/ProjectSettings.vue';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import { getProjectStore } from '@app/stores/project';
import { Window } from '@app/legacy/tools/window-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Log } from '@app/legacy/log/log-window.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { ipcRenderer } from 'electron';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('electron', () => ({
	ipcRenderer: { send: vi.fn() },
	shell: {}
}));

vi.mock('@app/legacy/file/file-system-core.ts', () => ({
	File: { planToSave: vi.fn(), root: '/mock/project' }
}));

vi.mock('@app/i18n', () => ({
	t: () => '',
	createGetter: () => (key: string) => key,
	getLabel: () => '',
	getTip: () => '',
	getContent: () => ''
}));

vi.mock('@app/legacy/log/log-window.ts', () => ({
	Log: { clear: vi.fn() }
}));

vi.mock('@app/legacy/title/title-bar.ts', () => ({
	Title: { updateTitleName: vi.fn() }
}));

vi.mock('@app/legacy/command/command-object.ts', () => ({
	Command: { removeTextTags: (text: string) => text, parseFileName: (text: string) => text }
}));

vi.mock('@app/stores/selector.ts', () => ({
	getSelectorInstance: () => null
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		getKey: (el: { key?: string; id: string }): string =>
			el.key ?? el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/legacy/tools/property-list.ts', () => ({
	AttributeListInterface: class {
		initialize(): void {}
	}
}));

vi.mock('@app/legacy/data/data-object.ts', () => ({
	Data: {
		config: null,
		manifest: { project: { config: 'Data/config.json' } },
		createEasingItems: () => [{ name: 'Linear', value: 'linear' }]
	}
}));

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

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

const mountAndInit = async (): Promise<{
	wrapper: ReturnType<typeof mount>;
	settings: ReturnType<typeof useProjectSettingsWindow>;
}> => {
	const wrapper = mount(ProjectSettings, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	const settings = useProjectSettingsWindow();
	settings.initialize();
	return { wrapper, settings };
};

describe('useProjectSettingsWindow（项目设置窗口 composable：表单填充 + 保存 + TSC）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.confirm = vi.fn();
		vi.mocked(Data).config = null;
		vi.mocked(File.planToSave!).mockClear();
		vi.mocked(Log.clear!).mockClear();
		vi.mocked(Title.updateTitleName!).mockClear();
		vi.mocked(ipcRenderer.send).mockClear();
		useProjectSettingsWindow().stopTSC();
	});

	it('open 克隆配置、填充 45 控件与 store 并打开窗口', async () => {
		const { wrapper, settings } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		settings.open();
		expect(Window.open).toHaveBeenCalledWith('project-settings');
		const store = getProjectStore();
		expect(store.state).toBe('open');
		expect(store.data).toEqual(makeConfig());
		expect(store.target).toBe(store.data);
		expect(getControl('config-window-title').read()).toBe('YAMI');
		expect(getControl('config-window-width').read()).toBe(960);
		expect(getControl('config-script-autoCompile').read()).toBe(true);
		expect(getControl('config-localization-languages').read()).toEqual([
			{ name: 'zh', font: '', scale: 1 }
		]);
		wrapper.unmount();
	});

	it('控件 input 经 paramInput 实时写入 store.data', async () => {
		const { wrapper, settings } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		settings.open();
		getControl('config-window-title').write('Edited');
		document
			.getElementById('config-window-title')!
			.dispatchEvent(new Event('input', { bubbles: true }));
		expect(getProjectStore().data?.window.title).toBe('Edited');
		getControl('config-script-autoCompile').write(false);
		document
			.getElementById('config-script-autoCompile')!
			.dispatchEvent(new Event('input', { bubbles: true }));
		expect(getProjectStore().data?.script.autoCompile).toBe(false);
		wrapper.unmount();
	});

	it('confirm 保存变更到 Data.config、计划保存并关闭窗口', async () => {
		const { wrapper, settings } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		settings.open();
		getControl('config-window-title').write('Edited');
		document
			.getElementById('config-window-title')!
			.dispatchEvent(new Event('input', { bubbles: true }));
		document
			.getElementById('project-settings')!
			.dispatchEvent(new Event('change', { bubbles: true }));
		const onDataChange = vi.fn();
		window.addEventListener('datachange', onDataChange);
		settings.confirm();
		const store = getProjectStore();
		expect(vi.mocked(Data).config).toBe(store.data);
		expect((vi.mocked(Data).config as { window: { title: string } }).window.title).toBe(
			'Edited'
		);
		expect(File.planToSave).toHaveBeenCalledWith('Data/config.json');
		expect(Title.updateTitleName).toHaveBeenCalled();
		expect(onDataChange).toHaveBeenCalledWith(expect.objectContaining({ key: 'config' }));
		expect(Window.close).toHaveBeenCalledWith('project-settings');
		wrapper.unmount();
	});

	it('confirm 无变更时仅关闭窗口', async () => {
		const { wrapper, settings } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		settings.open();
		settings.confirm();
		expect(File.planToSave).not.toHaveBeenCalled();
		expect(Window.close).toHaveBeenCalledWith('project-settings');
		wrapper.unmount();
	});

	it('windowClose 有未保存变更时阻止关闭并弹确认', async () => {
		const { wrapper, settings } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		settings.open();
		document
			.getElementById('project-settings')!
			.dispatchEvent(new Event('change', { bubbles: true }));
		const event = new Event('close', { cancelable: true });
		settings.windowClose(event);
		expect(event.defaultPrevented).toBe(true);
		expect(Window.confirm).toHaveBeenCalled();
		const items = (Window.confirm as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1];
		items[0].click();
		expect(Window.close).toHaveBeenCalledWith('project-settings');
		wrapper.unmount();
	});

	it('windowClosed 清空 store 状态', async () => {
		const { wrapper, settings } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		settings.open();
		settings.windowClosed(new Event('closed'));
		const store = getProjectStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
		wrapper.unmount();
	});

	it('projectChange 在 autoCompile 变化时启停 TSC', async () => {
		const settings = useProjectSettingsWindow();
		vi.mocked(Data).config = { script: { autoCompile: true } } as never;
		settings.projectChange({
			key: 'config',
			last: { script: { autoCompile: false } }
		} as never);
		expect(ipcRenderer.send).toHaveBeenCalledWith('start-tsc', '/mock/project');
		vi.mocked(Data).config = { script: { autoCompile: false } } as never;
		settings.projectChange({
			key: 'config',
			last: { script: { autoCompile: true } }
		} as never);
		expect(ipcRenderer.send).toHaveBeenCalledWith('stop-tsc');
		expect(Log.clear).toHaveBeenCalled();
		vi.mocked(ipcRenderer.send).mockClear();
		settings.projectChange({ key: 'other', last: {} } as never);
		expect(ipcRenderer.send).not.toHaveBeenCalled();
	});

	it('legacy Project 入口 open/confirm/startTSC/stopTSC 转发 composable', async () => {
		const { Project: ProjectController } =
			await import('@app/legacy/data/project-settings-window.ts');
		const { wrapper } = await mountAndInit();
		vi.mocked(Data).config = makeConfig() as never;
		ProjectController.initialize();
		ProjectController.open();
		expect(Window.open).toHaveBeenCalledWith('project-settings');
		expect(getProjectStore().state).toBe('open');
		expect(getControl('config-window-title').read()).toBe('YAMI');
		ProjectController.startTSC();
		expect(ipcRenderer.send).toHaveBeenCalledWith('start-tsc', '/mock/project');
		ProjectController.stopTSC();
		expect(ipcRenderer.send).toHaveBeenCalledWith('stop-tsc');
		ProjectController.confirm(new Event('click'));
		expect(Window.close).toHaveBeenCalledWith('project-settings');
		wrapper.unmount();
	});
});
