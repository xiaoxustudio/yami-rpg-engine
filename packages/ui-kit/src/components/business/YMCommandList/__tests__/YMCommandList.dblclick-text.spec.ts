import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMCommandList from '../YMCommandList.vue';

/** 回归：双击指令行的文本也要能打开指令窗口。 */
const makeOptions = (edit: (list: unknown, command: unknown) => void) => ({
	command: {
		parse: (item: Record<string, unknown>) => [
			{ color: 'normal' },
			{ text: String(item.id), color: 'normal' }
		],
		fetchVariables: () => [],
		insert: () => {},
		edit,
		parseUnlinkedId: (id: string) => id,
		colorizeCodeLines: () => {}
	},
	clipboard: { write: () => {}, read: () => [], has: () => false },
	commandHistory: class {},
	localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
});

interface Api extends HTMLElement {
	write: (d: unknown[]) => void;
	elements: { count: number };
}

const cmd = (id: string, params: Record<string, unknown> = {}) => ({ id, params, commands: [] });

if (typeof globalThis.PointerEvent === 'undefined') {
	class PointerEventShim extends MouseEvent {}
	(globalThis as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventShim;
}

afterEach(() => {
	document.body.innerHTML = '';
});

async function setup() {
	const edit = vi.fn();
	const wrapper = mount(YMCommandList, {
		props: { options: makeOptions(edit) as never },
		attachTo: document.body
	});
	const el = wrapper.element as unknown as Api;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 400, configurable: true });
	Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
	el.scroll = (() => {}) as never;
	await nextTick();
	el.write([cmd('exitGame'), cmd('showText'), cmd('showText')]);
	await nextTick();
	return { el, edit, wrapper };
}

/** 模拟一次真实按下：事件从命中的那个节点冒泡到列表根 */
const press = (target: Element, x = 60, y = 10): void => {
	target.dispatchEvent(
		new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: x, clientY: y })
	);
};

describe('YMCommandList 双击行内文本', () => {
	it('连按两次文本 → 打开编辑（options.command.edit 被调用）', async () => {
		const { el, edit, wrapper } = await setup();
		const row = el.querySelector('.command-item') as HTMLElement;
		expect(row).toBeTruthy();

		press(row.querySelector('.command-text') as HTMLElement);
		await nextTick();
		press((row.querySelector('.command-text') as HTMLElement | null) ?? row);
		await nextTick();

		expect(edit).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it('连按两次行本身 → 打开编辑（空白处的原有行为不变）', async () => {
		const { el, edit, wrapper } = await setup();
		const row = el.querySelector('.command-item') as HTMLElement;

		press(row);
		await nextTick();
		press(el.querySelector('.command-item') as HTMLElement);
		await nextTick();

		expect(edit).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it('刷新（update/scroll 回写桥）后行内文本节点仍在原地', async () => {
		const { el, wrapper } = await setup();
		const row = el.querySelector('.command-item') as HTMLElement;
		const text = row.querySelector('.command-text') as HTMLElement;

		press(text);
		await nextTick();

		expect(row.querySelector('.command-text')).toBe(text);
		expect(text.isConnected).toBe(true);
		wrapper.unmount();
	});
});
