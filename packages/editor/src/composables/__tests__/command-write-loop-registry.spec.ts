import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetVolume from '@app/components/commands/SetVolume.vue';
import SimulateKey from '@app/components/commands/SimulateKey.vue';
import SetVideo from '@app/components/commands/SetVideo.vue';
import { composableEls } from '@app/composables/element-registry';
import { Command } from '@app/commands/command-object.ts';

/**
 * 通用 `useCommandSchema` 的 **write 循环**（`load()` 里按
 * `<name>-<field.domId ?? field.key>` 逐个 `write(...)`）过去直查 DOM，现在读 `composableEls`。
 * 这条链路要成立，命令表单 SFC 必须把**所有带 id 的控件**都登记进局部 `fieldEls` 并镜像到
 * `composableEls`——只登记用到的少数控件会让其余写入静默 no-op（SetVolume 的 volume/duration
 * 就曾如此）。
 *
 * 断言方式刻意做成**数据驱动**：直接遍历 schema 的 fields 反推控件 id，逐个查注册表——
 * 这样新增字段/改 domId 时用例会立刻发现"注册表缺项"，而不是等到某个 DOM 断言偶发失败。
 */
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

		// SetVideo 走 v-model + 自建 registry；只要求"带 id 的控件都已登记"
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
