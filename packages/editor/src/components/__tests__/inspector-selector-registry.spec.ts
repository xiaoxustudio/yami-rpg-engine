import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SceneLightPage from '@app/components/inspector/SceneLightPage.vue';
import UIImagePage from '@app/components/inspector/UIImagePage.vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements, registerElement } from '@app/utils/element-registry';

/**
 * P1b 第 5 刀回归：inspector 页里「一次批量取多个控件再挂焦点/滑杆监听」的写法，过去是
 * `document.querySelectorAll('#a, #b, …')`，现在读 `inspectorEls`（`registryElements`）。
 *
 * 这条链路要求页面把这些控件**全部登记**——少登记一个，`bindInput`/`bindSliders` 就静默少绑一个控件
 * （输入框失焦不提交历史、滑杆拖完不写回）。本文件锁"页面登记覆盖了它自己要绑的 id 列表"。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} })
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

describe('inspector 页批量取控件走注册表（P1b 第 5 刀）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		inspectorEls.clear();
	});

	it('SceneLightPage：bindInput/bindSliders 用到的 id 全部已登记', async () => {
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
			expect(inspectorEls.get(id), `${id} 未登记（会静默少绑监听）`).toBeTruthy();
			expect(inspectorEls.get(id)?.id).toBe(id);
		}
		// registryElements 保持顺序、不缺项
		expect(registryElements(inspectorEls, ids).map((el) => el.id)).toEqual(ids);
		expect(registryElements(inspectorEls, ids).length).toBe(ids.length);

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
