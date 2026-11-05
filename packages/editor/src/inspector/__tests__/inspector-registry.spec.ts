import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import UIImagePage from '@app/components/inspector/UIImagePage.vue';
import FileActorPage from '@app/components/inspector/FileActorPage.vue';
import { inspectorEls } from '../element-registry.ts';
import { getUiElementControls } from '@app/composables/ui-element-page-controls';
import { getFileActorMeta } from '@app/composables/file-actor-page-bridge';

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiElement: { target: null, update: vi.fn() },
		uiImage: { target: null, update: vi.fn() },
		fileActor: { target: null, update: vi.fn() },
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const FILE_ACTOR_LIST_IDS = [
	'fileActor-sprites',
	'fileActor-attributes',
	'fileActor-skills',
	'fileActor-equipments',
	'fileActor-inventory',
	'fileActor-events',
	'fileActor-scripts',
	'fileActor-parameter-pane'
];

const missingOf = (ids: string[]): string[] =>
	ids.filter((id) => !(inspectorEls.get(id) instanceof HTMLElement));

describe('inspector 元素注册表', () => {
	beforeEach(() => {
		inspectorEls.clear();
	});

	it('UIImagePage：模板 :ref 的控件进入页面控件表（不再进 inspectorEls）', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		const table = getUiElementControls();
		expect(table).toBeTruthy();
		for (const id of [
			'uiElement-name',
			'uiElement-pointerEvents',
			'uiElement-general-group',
			'uiElement-transform-group',
			'uiElement-events-group',
			'uiElement-scripts-group',
			'uiElement-parameter-pane',
			'uiElement-events',
			'uiElement-scripts'
		]) {
			expect(table?.[id], `控件表缺少 ${id}`).toBeTruthy();
			expect(inspectorEls.get(id), `${id} 不该再进 inspectorEls`).toBeFalsy();
		}

		wrapper.unmount();
		expect(getUiElementControls(), '卸载后应注销').toBeNull();
	});

	it('FileActorPage：元信息 section 交出 clearLists，8 张列表不再进注册表', async () => {
		const wrapper = mount(FileActorPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		expect(missingOf([...FILE_ACTOR_LIST_IDS])).toEqual(FILE_ACTOR_LIST_IDS);
		const meta = getFileActorMeta();
		// 只断言接缝在：clearLists() 要在真实 Inspector 绑定后才安全，这里用不到副作用
		expect(typeof meta?.clearLists).toBe('function');

		wrapper.unmount();
		expect(getFileActorMeta(), '卸载后应注销').toBeNull();
	});

	it('控件表存的是控件本身（组件实例），不再是注册表里的裸元素', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		const control = getUiElementControls()?.['uiElement-name'];
		expect(control).toBeTruthy();
		// 迁移后拿到的是控件实例（defineExpose），不再是 `#uiElement-name` 那个元素
		expect(control).not.toBeInstanceOf(HTMLElement);

		wrapper.unmount();
	});

	it('卸载后控件表注销（单例读不到任何控件）', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();
		expect(getUiElementControls()).toBeTruthy();

		wrapper.unmount();
		await nextTick();
		expect(getUiElementControls()).toBeNull();
	});
});
