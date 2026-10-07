import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { YMCommandList } from '@ui-kit';
import { clear } from '@app/utils/element-utils';

const options = {
	command: {
		parse: (item: Record<string, unknown>) => [{ color: 'normal' }, { text: String(item.id) }],
		fetchVariables: () => [],
		insert: () => {},
		edit: () => {},
		parseUnlinkedId: (id: string) => id,
		colorizeCodeLines: () => {}
	},
	clipboard: { write: () => {}, read: () => [], has: () => false },
	commandHistory: class {
		save(): void {}
		restore(): void {}
		canUndo(): boolean {
			return false;
		}
		canRedo(): boolean {
			return false;
		}
	},
	localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
} as never;

interface CommandListEl extends HTMLElement {
	write: (data: unknown[]) => void;
	elements: { count: number };
	getRowModel: () => { keys: string[] };
}

const cmd = (id: string) => ({ id, params: {}, commands: [] });

const mountList = async (): Promise<CommandListEl> => {
	const wrapper = mount(YMCommandList, { props: { options }, attachTo: document.body });
	const el = wrapper.element as unknown as CommandListEl;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
	el.scroll = (() => {}) as never;
	await nextTick();
	return el;
};

afterEach(() => {
	document.body.innerHTML = '';
});

describe('clear()：Vue 渲染的列表不能被命令式 wipe', () => {
	it('命令列表：clear() 走 api（清数据 + 模板重渲染），之后再次更新不再崩', async () => {
		const el = await mountList();
		el.write([cmd('a'), cmd('b')]);
		await nextTick();
		expect(el.querySelectorAll('.command-item').length).toBeGreaterThan(0);

		clear(el);
		await nextTick();
		expect(el.querySelectorAll('.command-item').length).toBe(0);

		el.write([cmd('a'), cmd('c')]);
		await nextTick();
		await nextTick();
		expect(el.querySelectorAll('.command-item').length).toBeGreaterThan(0);
	});

	it('自带 clear 的元素：委托给它，不碰子节点', () => {
		let called = 0;
		const host = document.createElement('div');
		const child = document.createElement('span');
		child.textContent = 'keep';
		host.appendChild(child);
		(host as unknown as { clear: () => void }).clear = () => {
			called++;
		};
		clear(host);
		expect(called).toBe(1);
		expect(host.querySelector('span')?.textContent).toBe('keep');
	});

	it('没有 clear 的元素：保持原语义（清空文本）', () => {
		const host = document.createElement('div');
		host.textContent = 'x';
		clear(host);
		expect(host.textContent).toBe('');
	});
});
