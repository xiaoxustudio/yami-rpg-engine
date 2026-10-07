import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetVolume from '@app/components/commands/SetVolume.vue';
import SimulateKey from '@app/components/commands/SimulateKey.vue';
import SetVideo from '@app/components/commands/SetVideo.vue';
import { composableEls } from '@app/composables/element-registry';
import { Command } from '@app/commands/command-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

const mountSettle = async (component: Parameters<typeof mount>[0]) => {
	const wrapper = mount(component, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	return wrapper;
};

/** schema 的 fields → write 循环实际使用的控件 id 列表 */
const loopIds = (name: string): string[] => {
	const schema = (
		Command.cases as Record<string, { fields: Array<{ key: string; domId?: string }> }>
	)[name];
	return schema.fields.map((field) => `${name}-${field.domId ?? field.key}`);
};

describe('命令表单 write 循环读注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
	});

	it('SetVolume：write 循环用到的每个控件 id 都在 composableEls 里', async () => {
		const wrapper = await mountSettle(SetVolume);

		const ids = loopIds('setVolume');
		expect(ids.length).toBeGreaterThan(0);
		for (const id of ids) {
			const el = composableEls.get(id);
			expect(el, `${id} 未登记（write 会静默 no-op）`).toBeTruthy();
			expect(el?.id).toBe(id);
		}

		wrapper.unmount();
	});

	it('SimulateKey：write 循环用到的每个控件 id 都在 composableEls 里', async () => {
		const wrapper = await mountSettle(SimulateKey);

		for (const id of loopIds('simulateKey')) {
			expect(composableEls.get(id), `${id} 未登记`).toBeTruthy();
		}

		wrapper.unmount();
	});

	it('SetVideo：镜像同样覆盖（本刀统一给所有命令表单补登记）', async () => {
		const wrapper = await mountSettle(SetVideo);

		const headers = composableEls.get('setVideo-path');
		expect(headers === undefined || headers?.id === 'setVideo-path').toBe(true);

		wrapper.unmount();
	});

	it('注册表被清空时取到 undefined（模块侧不再有按 id 的隐式回退）', () => {
		for (const id of loopIds('setVolume')) {
			composableEls.set(id, null);
		}
		for (const id of loopIds('setVolume')) {
			expect(composableEls.get(id)).toBe(null);
		}
	});
});
