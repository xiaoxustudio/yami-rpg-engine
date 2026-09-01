import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, withDirectives } from 'vue';
import { mount } from '@vue/test-utils';
import { focusTarget, requestFocus, vFocus } from '@app/directives/focus';

const flushFocus = async (): Promise<void> => {
	await nextTick();
	await new Promise((resolve) => setTimeout(resolve, 0));
};

const mountWithFocus = (id: string, tagName = 'input', props: Record<string, unknown> = {}) => {
	const component = defineComponent({
		setup() {
			return () => withDirectives(h(tagName, { id, ...props }), [[vFocus]]);
		}
	});
	return mount(component, { attachTo: document.body });
};

describe('v-focus 指令与 requestFocus 基建', () => {
	beforeEach(() => {
		focusTarget.current = null;
	});

	it('requestFocus 命中 id 时优先调用元素 getFocus API', async () => {
		const wrapper = mountWithFocus('api-target', 'div');
		const el = document.getElementById('api-target') as HTMLElement;
		const getFocus = vi.fn();
		el.getFocus = getFocus;
		requestFocus('api-target');
		await flushFocus();
		expect(getFocus).toHaveBeenCalledTimes(1);
		expect(getFocus).toHaveBeenCalledWith(undefined);
		wrapper.unmount();
	});

	it('getFocus 接收到透传的 mode 参数', async () => {
		const wrapper = mountWithFocus('api-mode-target', 'div');
		const el = document.getElementById('api-mode-target') as HTMLElement;
		const getFocus = vi.fn();
		el.getFocus = getFocus;
		requestFocus('api-mode-target', 'all');
		await flushFocus();
		expect(getFocus).toHaveBeenCalledWith('all');
		wrapper.unmount();
	});

	it('原生回退路径：requestFocus 后 input 获得焦点', async () => {
		const wrapper = mountWithFocus('native-target');
		const el = document.getElementById('native-target') as HTMLInputElement;
		requestFocus('native-target');
		await flushFocus();
		expect(document.activeElement).toBe(el);
		wrapper.unmount();
	});

	it('mode 为 all 时原生 input 全选', async () => {
		const wrapper = mountWithFocus('select-target', 'input', { value: 'hello' });
		const el = document.getElementById('select-target') as HTMLInputElement;
		requestFocus('select-target', 'all');
		await flushFocus();
		expect(document.activeElement).toBe(el);
		expect(el.selectionStart).toBe(0);
		expect(el.selectionEnd).toBe(5);
		wrapper.unmount();
	});

	it('token 递增保证重复聚焦同一 id 再次触发', async () => {
		const wrapper = mountWithFocus('repeat-target', 'div');
		const el = document.getElementById('repeat-target') as HTMLElement;
		const getFocus = vi.fn();
		el.getFocus = getFocus;
		requestFocus('repeat-target');
		await flushFocus();
		const firstToken = focusTarget.current?.token;
		requestFocus('repeat-target');
		await flushFocus();
		expect(focusTarget.current?.token).toBeGreaterThan(firstToken ?? 0);
		expect(getFocus).toHaveBeenCalledTimes(2);
		wrapper.unmount();
	});

	it('requestFocus 先于元素挂载发出时由 mounted 处理', async () => {
		requestFocus('late-target');
		const wrapper = mountWithFocus('late-target');
		const el = document.getElementById('late-target') as HTMLInputElement;
		await flushFocus();
		expect(document.activeElement).toBe(el);
		wrapper.unmount();
	});

	it('id 不匹配时不聚焦', async () => {
		const wrapper = mountWithFocus('other-target');
		requestFocus('not-this-one');
		await flushFocus();
		expect(document.activeElement).not.toBe(document.getElementById('other-target'));
		wrapper.unmount();
	});

	it('unmounted 后不再响应 requestFocus', async () => {
		const wrapper = mountWithFocus('gone-target');
		const el = document.getElementById('gone-target') as HTMLInputElement;
		wrapper.unmount();
		requestFocus('gone-target');
		await flushFocus();
		expect(document.body.contains(el)).toBe(false);
		expect(document.activeElement).not.toBe(el);
	});
});
