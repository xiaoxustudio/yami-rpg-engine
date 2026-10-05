import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';
import { setTreeItemClass } from '../tree-api';
import { getListConfig } from '../../../../utils/list-config';

/**
 * 「更新路径里写行状态」不得触发自我递归更新。
 *
 * 复现路径（与实机一致）：`list.update()` → 派生行 → Vue patch → `onUpdated` →
 * `applyRowUpdaters()` → 消费方 updater / updateNodeElement 写行状态（class / 文本 / 重派生）。
 * 只要该写入**无条件**让组件渲染 effect 失效，就会在同一个 flush 里反复排队自己，
 * Vue 随即报 `Maximum recursive updates exceeded in component <YMTreeList>`
 * （实测 101 次后中止该组件的渲染）。
 *
 * 两个已修的历史现场：
 * - `setItemClass`：无条件 `bump()`（`tree-render.ts`）；
 * - `updateItemName`：无条件 `syncRenderRows()`（`tree-api.ts`）——实机触发点是
 *   `animation-initialize.ts` 把 `list.updateItemName(item)` 直接挂进 `updaters`。
 */

interface TreeData {
	id: string;
	name: string;
	class: string;
	parent?: TreeData | null;
	children?: TreeData[];
}

interface TreeListElement extends HTMLElement {
	bind: (fn: () => TreeData[]) => void;
	update: () => void;
	updateItemName: (item: unknown) => void;
	renderState: { rows: { value: unknown[] } };
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

const makeData = (): TreeData[] => [
	{ id: 'n0', name: 'Node 0', class: 'file' },
	{ id: 'n1', name: 'Node 1', class: 'file' },
	{ id: 'n2', name: 'Node 2', class: 'file' }
];

const mountList = async (
	data: TreeData[]
): Promise<{ el: TreeListElement; unmount: () => void }> => {
	const wrapper = mount(YMTreeList, { attachTo: document.body });
	const el = wrapper.element as unknown as TreeListElement;
	mockHeight(el);
	el.bind(() => data);
	el.update();
	await nextTick();
	return { el, unmount: () => wrapper.unmount() };
};

let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

const recursionWarnings = (): string[] =>
	[...warnSpy.mock.calls, ...errorSpy.mock.calls]
		.map((call) => call.map(String).join(' '))
		.filter((text) => text.includes('Maximum recursive updates'));

beforeEach(() => {
	document.body.innerHTML = '';
	warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
	warnSpy.mockRestore();
	errorSpy.mockRestore();
	document.body.innerHTML = '';
});

describe('YMTreeList 更新路径幂等性', () => {
	it('updater 每次注册同一个 class 不会造成递归更新', async () => {
		const data = makeData();
		const { el, unmount } = await mountList(data);

		// 消费方 updater：与 text-tip / command-tip 一致——在更新路径里注册行 class
		getListConfig(el).updaters.push((item) => setTreeItemClass(item, 'marked', true));

		el.update();
		await nextTick();
		await nextTick();

		expect(recursionWarnings()).toEqual([]);
		expect(el.querySelectorAll('.node-item.marked')).toHaveLength(3);
		unmount();
	});

	it('updater 每次调用 updateItemName（animation-initialize 现场）不会造成递归更新', async () => {
		const data = makeData();
		const { el, unmount } = await mountList(data);

		// 实机写法：`getListConfig(list).updaters.push((item) => list.updateItemName(item))`
		getListConfig(el).updaters.push((item) => el.updateItemName(item));

		el.update();
		await nextTick();
		await nextTick();

		expect(recursionWarnings()).toEqual([]);
		// 文本仍然是派生出来的（幂等 ≠ 不刷新）
		expect(Array.from(el.querySelectorAll('.node-text')).map((n) => n.textContent)).toEqual([
			'Node 0',
			'Node 1',
			'Node 2'
		]);
		unmount();
	});

	it('updateItemName 在名字真的变了时仍然重派生（幂等不能吃掉刷新）', async () => {
		const data = makeData();
		const { el, unmount } = await mountList(data);

		data[0].name = 'Renamed 0';
		el.updateItemName(data[0]);
		await nextTick();

		expect(recursionWarnings()).toEqual([]);
		expect(el.querySelectorAll('.node-text')[0].textContent).toBe('Renamed 0');
		unmount();
	});

	it('creator 注册行 class（command-tip 语义）不会造成递归更新', async () => {
		const data = makeData();
		let creatorCalls = 0;
		const wrapper = mount(YMTreeList, { attachTo: document.body });
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		el.bind(() => data);
		// 与 command-tip（`creators.push(list.createCommandTip)`）一致：绑定期注册行 class
		getListConfig(el).creators.push((item) => {
			creatorCalls += 1;
			setTreeItemClass(item, 'command-suggestion-item', true);
		});

		el.update();
		await nextTick();
		await nextTick();

		expect(creatorCalls).toBeGreaterThan(0);
		expect(recursionWarnings()).toEqual([]);
		expect(el.querySelectorAll('.node-item.command-suggestion-item')).toHaveLength(3);
		wrapper.unmount();
	});

	it('idle 状态下重复 update 不产生递归更新', async () => {
		const data = makeData();
		const { el, unmount } = await mountList(data);

		for (let i = 0; i < 5; i++) {
			el.update();
			// 必须逐轮串行：每轮都要等上一轮的 flush 结算完，才能判断是否自激
			// oxlint-disable-next-line no-await-in-loop
			await nextTick();
		}

		expect(recursionWarnings()).toEqual([]);
		unmount();
	});
});
