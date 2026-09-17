import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';

/**
 * tree 迁移规划 步骤 1 的最后一个缺口：**大数据（1000+ 节点）性能基准**。
 *
 * 口径（与计划「步骤间回归闸门」一致）：不劣于现状 10%。本文件给出可复现的绝对耗时快照，
 * 而不是精确阈值——阈值取观测值的 5~10 倍，只用于拦住"数量级回退"（例如每次 bump 都全树重派生）。
 * 运行：pnpm -F @yami/ui-kit exec vitest run src/components/basic/YMTreeList/__tests__/tree-list-perf.spec.ts
 */

interface PerfItem {
	id: string;
	name: string;
	class: string;
	expanded?: boolean;
	parent?: PerfItem | null;
	element?: HTMLElement;
	children?: PerfItem[];
	[k: string]: unknown;
}

interface PerfListElement extends HTMLElement {
	[k: string]: unknown;
	bind: (fn: () => PerfItem[]) => void;
	update: () => void;
	read: () => PerfItem | null;
	select: (item: PerfItem) => void;
	selectRelative: (direction: string) => void;
	refresh: () => void;
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

/** 1000 节点：10 个 folder × 99 子项 + 10 个顶层文件（覆盖展开/折叠与窗口渲染） */
const makeHugeData = (): PerfItem[] => {
	const root: PerfItem[] = [];
	for (let f = 0; f < 10; f++) {
		const children: PerfItem[] = Array.from({ length: 99 }, (_v, i) => ({
			id: `f${f}-c${i}`,
			name: `Child ${f}-${i}`,
			class: 'file'
		}));
		root.push({
			id: `folder${f}`,
			name: `Folder ${f}`,
			class: 'folder',
			expanded: f < 5,
			children
		});
		root.push({ id: `top${f}`, name: `Top ${f}`, class: 'file' });
	}
	return root;
};

const mountHuge = async (data: PerfItem[]): Promise<PerfListElement> => {
	const wrapper = mount(YMTreeList, { attachTo: document.body });
	const el = wrapper.element as unknown as PerfListElement;
	mockHeight(el);
	el.bind(() => data);
	await nextTick();
	return el;
};

const ms = (start: number): number => Math.round((performance.now() - start) * 100) / 100;

/** 测试内输出统一走 console.warn（仓库 eslint/no-console 仅放行 error/warn） */
const report = (text: string): void => console.warn(text);

describe('YMTreeList 大数据性能基准（1000 节点）', () => {
	it('首次 update（派生 + 窗口渲染）', async () => {
		const data = makeHugeData();
		const el = await mountHuge(data);
		const start = performance.now();
		el.update();
		await nextTick();
		const elapsed = ms(start);
		report(
			`[perf] 1000 节点首次 update: ${elapsed} ms（窗口内行 ${el.querySelectorAll('.node-item').length}）`
		);
		expect(el.querySelectorAll('.node-item').length).toBeGreaterThan(0);
		expect(elapsed).toBeLessThan(2000);
	});

	it('连续 update × 20（bump + 重派生热路径）', async () => {
		const data = makeHugeData();
		const el = await mountHuge(data);
		el.update();
		await nextTick();
		const start = performance.now();
		// 循环内不 await：Vue 的调度器会把 patch 合并到一次 flush，
		// 这里要量的是 20 次「bump + 重派生」的同步开销，patch 只算一次。
		for (let i = 0; i < 20; i++) el.update();
		const elapsed = ms(start);
		await nextTick();
		report(
			`[perf] 20 次 update 合计: ${elapsed} ms（平均 ${Math.round((elapsed / 20) * 100) / 100} ms）`
		);
		expect(el.querySelectorAll('.node-item').length).toBeGreaterThan(0);
		expect(elapsed).toBeLessThan(5000);
	});

	it('键盘导航 × 200（selectRelative）', async () => {
		const data = makeHugeData();
		const el = await mountHuge(data);
		el.update();
		await nextTick();
		el.select(
			el.read() ?? (el as unknown as { rowItemAt: (i: number) => PerfItem }).rowItemAt(0)
		);
		const start = performance.now();
		for (let i = 0; i < 200; i++) el.selectRelative('down');
		const elapsed = ms(start);
		await nextTick();
		report(
			`[perf] 200 次 selectRelative: ${elapsed} ms（平均 ${Math.round((elapsed / 200) * 100) / 100} ms）`
		);
		expect(el.read()).not.toBeNull();
		expect(elapsed).toBeLessThan(5000);
	});

	it('滚动窗口迁移（改 scrollTop 后重派生 + patch）', async () => {
		const data = makeHugeData();
		const el = await mountHuge(data);
		el.update();
		await nextTick();
		const start = performance.now();
		for (let i = 1; i <= 20; i++) {
			el.scrollTop = i * 200;
			el.refresh();
		}
		const elapsed = ms(start);
		await nextTick();
		report(
			`[perf] 20 次滚动窗口迁移: ${elapsed} ms（平均 ${Math.round((elapsed / 20) * 100) / 100} ms）`
		);
		expect(el.querySelectorAll('.node-item').length).toBeGreaterThan(0);
		expect(elapsed).toBeLessThan(5000);
	});
});
