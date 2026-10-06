import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import UnloadSubscene from '@app/components/commands/UnloadSubscene.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

describe('UnloadSubscene 组件 DOM 完整性', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('渲染 sceneId 控件与 confirm 按钮', async () => {
		const wrapper = mount(UnloadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('unloadSubscene-sceneId')).toBeTruthy();
		expect(document.getElementById('unloadSubscene-confirm')).toBeTruthy();
		wrapper.unmount();
	});
});
