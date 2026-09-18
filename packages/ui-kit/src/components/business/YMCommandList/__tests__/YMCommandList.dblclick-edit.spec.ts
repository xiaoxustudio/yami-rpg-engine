import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMCommandList from '../YMCommandList.vue';

// 双击已存在的行必须把 `options.command.edit` 派发出去（编辑器侧据此开参数窗口）。
// 这里覆盖用户报的"双击没反应"最常见的两个 id：无参数的脚本指令（退出游戏）与内置指令（创建元素）。
const makeOptions = (edit: (list: unknown, command: unknown) => void) => ({
	command: {
		parse: (item: Record<string, unknown>) => [{ color: 'normal' }, { text: String(item.id) }],
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
	select: (i: number) => void;
	doubleclick: (event: unknown) => void;
	elements: { count: number };
}

const cmd = (id: string, params: Record<string, unknown> = {}) => ({ id, params, commands: [] });

afterEach(() => {
	document.body.innerHTML = '';
});

describe('YMCommandList 双击行 → options.command.edit', () => {
	it.each(['exitGame', 'createElement', 'showText'])('id=%s', async (id) => {
		const edit = vi.fn();
		const wrapper = mount(YMCommandList, {
			props: { options: makeOptions(edit) as never },
			attachTo: document.body
		});
		const el = wrapper.element as unknown as Api;
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
		el.scroll = (() => {}) as never;
		await nextTick();

		el.write([cmd(id)]);
		await nextTick();
		el.select(0);
		await nextTick();

		const row = el.querySelector('.command-item') as HTMLElement;
		expect(row).toBeTruthy();
		el.doubleclick({ target: row } as unknown as MouseEvent);
		await nextTick();

		expect(edit).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});
});
