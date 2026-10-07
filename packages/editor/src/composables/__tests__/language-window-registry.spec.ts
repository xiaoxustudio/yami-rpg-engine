import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Language from '@app/components/tools/Language.vue';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import { composableEls } from '@app/composables/element-registry';
import { getProjectStore } from '@app/stores/project';
import { Window } from '@app/tools/window-object.ts';
import { focusTarget } from '@app/directives/focus';

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

const LANGUAGE_IDS = ['language-name', 'language-font', 'language-scale'];

describe('语言窗口注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		focusTarget.current = null;
	});

	it('Language.vue 登记 3 个控件，确认按钮走 SFC 的 @confirm（重复语言 → 聚焦且不关窗）', async () => {
		const wrapper = mount(Language, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		for (const id of LANGUAGE_IDS) {
			expect(composableEls.get(id)?.id, `${id} 未登记`).toBe(id);
		}

		getProjectStore().data = {
			localization: { languages: [{ name: 'zh', font: '', scale: 1 }], default: 'zh' }
		} as never;
		const settings = useProjectSettingsWindow();
		const save = vi.fn();
		settings.languages.target = { save };
		settings.languages.initialize({ inserting: true });

		const nameControl = composableEls.get('language-name') as unknown as HTMLElement & {
			loadItems(items: unknown[]): void;
			write2(value: unknown): void;
		};
		nameControl.loadItems([
			{ name: '中文', value: 'zh' },
			{ name: 'English', value: 'en' }
		]);

		nameControl.write2('zh');
		document
			.getElementById('language-confirm')!
			.dispatchEvent(new Event('click', { bubbles: true }));
		expect(focusTarget.current?.id).toBe('language-name');
		expect(save).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();

		nameControl.write2('en');
		document
			.getElementById('language-confirm')!
			.dispatchEvent(new Event('click', { bubbles: true }));
		expect(save).toHaveBeenCalledTimes(1);
		expect(Window.close).toHaveBeenCalledWith('language');

		wrapper.unmount();
	});
});
