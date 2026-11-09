import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SceneLightPage from '@app/components/inspector/SceneLightPage.vue';
import UIImagePage from '@app/components/inspector/UIImagePage.vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { sceneLightNodes } from '@app/composables/inspector-page-nodes';
import { registryElements, registerElement } from '@app/utils/element-registry';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

const mountWithHost = async (
	component: Parameters<typeof mount>[0],
	hostId: string,
	extraIds: string[] = []
) => {
	const host = document.createElement('div');
	host.id = hostId;
	document.body.appendChild(host);
	registerElement(inspectorEls, hostId, host);
	for (const id of extraIds) {
		const el = document.createElement('div');
		el.id = id;
		document.body.appendChild(el);
		registerElement(inspectorEls, id, el);
	}
	const wrapper = mount(component, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	return wrapper;
};

describe('inspector 页批量取控件走注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		inspectorEls.clear();
	});

	it('SceneLightPage：bindInput/bindSliders 用到的控件由节点表交出（不再进注册表）', async () => {
		const ids = [
			'sceneLight-name',
			'sceneLight-type',
			'sceneLight-blend',
			'sceneLight-x',
			'sceneLight-y',
			'sceneLight-range-slider',
			'sceneLight-intensity-slider'
		];
		const wrapper = await mountWithHost(SceneLightPage, 'sceneLight-vue-mount');

		for (const id of ids) {
			expect(inspectorEls.get(id), `${id} 不该再登记`).toBeFalsy();
			expect(document.getElementById(id), `${id} 模板里应存在`).toBeTruthy();
		}
		// 表里的每个 key 都指向真实元素（bindInput 才有东西可绑）
		for (const key of Object.keys(sceneLightNodes.ids) as Array<
			keyof typeof sceneLightNodes.ids
		>) {
			expect(sceneLightNodes.pick(key), `sceneLightNodes.${key} 应可读`).toBeTruthy();
		}

		wrapper.unmount();
	});

	it('UIImagePage：滑杆与显示控件都已登记（本刀补的 41 个自由 :ref 之一）', async () => {
		const wrapper = await mountWithHost(UIImagePage, 'uiImage-vue-mount', ['uiImage-image']);

		for (const id of ['uiImage-tint-0-slider', 'uiImage-tint-1-slider', 'uiImage-display']) {
			expect(inspectorEls.get(id), `${id} 未登记`).toBeTruthy();
		}

		wrapper.unmount();
	});

	it('registryElements 会跳过未登记的 id（与旧选择器"取不到就不绑"语义一致）', () => {
		const el = document.createElement('div');
		el.id = 'only-one';
		registerElement(inspectorEls, 'only-one', el);

		expect(registryElements(inspectorEls, ['only-one', 'nope', 'missing'])).toEqual([el]);
	});
});
