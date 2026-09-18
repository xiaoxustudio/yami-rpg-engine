import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMCommandList from '../YMCommandList.vue';

/**
 * 回归：**双击指令行的"文本"也要能打开指令窗口**。
 *
 * 用户实机症状是"双击有的指令没反应，点行内空白处却可以"。原因不在编辑器侧，而在这里：
 * 双击判定（`utils/doubleclick.ts`）用的是 `event.target === last.target`——**必须是同一个节点**。
 * 而点文本时 `event.target` 是行内的 `.command-text`（`div`，不是 `span`，所以
 * `.command-item > span { pointer-events: none }` 那条规则盖不到它）；
 * 旧 `bindRowElement` 每次挂行都"先清干净再重建"，第一次按下引发的 `select → update → 回写桥`
 * 就把那个文本节点换成了新节点 ⇒ 第二次按下落在新节点上，判定失配 ⇒ 合成不出双击事件。
 * 点行本身（空白处）能work，是因为行元素由 Vue 复用、身份稳定。
 *
 * 这个用例**照实机的方式**按两次：第二下按在"此刻那个位置上存在的节点"上（重新查询），
 * 而不是复用第一次的节点引用——否则就绕过了这个 bug。
 */
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

// jsdom 里 `PointerEvent` 可能缺席，而生产代码（`doubleclick.ts`）会构造它
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
	// `isInContent` 要读尺寸（jsdom 默认全 0）与 `scrollTop`
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
		// 实机的第二下按在"现在这个位置上的节点"上
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

		// 一次按下会走 `select → update → 回写桥`
		press(text);
		await nextTick();

		// 内容没变 ⇒ 行内 DOM 不该被重建（这正是双击能连按两次命中的前提）
		expect(row.querySelector('.command-text')).toBe(text);
		expect(text.isConnected).toBe(true);
		wrapper.unmount();
	});
});
