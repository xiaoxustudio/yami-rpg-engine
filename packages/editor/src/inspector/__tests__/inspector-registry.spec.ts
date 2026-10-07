import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import UIImagePage from '@app/components/inspector/UIImagePage.vue';
import FileActorPage from '@app/components/inspector/FileActorPage.vue';
import { inspectorEls } from '../element-registry.ts';

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiElement: { target: null, update: vi.fn() },
		uiImage: { target: null, update: vi.fn() },
		fileActor: { target: null, update: vi.fn() },
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const missingOf = (ids: string[]): string[] =>
	ids.filter((id) => !(inspectorEls.get(id) instanceof HTMLElement));

describe('inspector 元素注册表', () => {
	beforeEach(() => {
		inspectorEls.clear();
	});

	it('UIImagePage：模板 :ref 登记的控件进入 inspectorEls', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		expect(
			missingOf([
				'uiElement-name',
				'uiElement-pointerEvents',
				'uiElement-general-group',
				'uiElement-transform-group',
				'uiElement-events-group',
				'uiElement-scripts-group',
				'uiElement-parameter-pane',
				'uiElement-events',
				'uiElement-scripts'
			])
		).toEqual([]);

		wrapper.unmount();
	});

	it('FileActorPage：已有具名 ref 的控件在 onMounted 里被命令式登记', async () => {
		const wrapper = mount(FileActorPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		expect(
			missingOf([
				'fileActor-sprites',
				'fileActor-attributes',
				'fileActor-skills',
				'fileActor-equipments',
				'fileActor-inventory',
				'fileActor-events',
				'fileActor-scripts',
				'fileActor-parameter-pane'
			])
		).toEqual([]);

		wrapper.unmount();
	});

	it('注册表登记的是元素本身（id 与注册键一致），不是组件实例', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		const el = inspectorEls.get('uiElement-name');
		expect(el).toBeInstanceOf(HTMLElement);
		expect(el?.id).toBe('uiElement-name');

		wrapper.unmount();
	});

	it('卸载后注册表项被清空（registryRef 收到 null）', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();
		expect(inspectorEls.get('uiElement-name')).toBeInstanceOf(HTMLElement);

		wrapper.unmount();
		await nextTick();
		expect(inspectorEls.get('uiElement-name') ?? null).toBeNull();
	});
});
