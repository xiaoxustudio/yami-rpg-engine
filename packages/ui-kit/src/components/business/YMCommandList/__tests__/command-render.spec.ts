import { describe, expect, it } from 'vitest';
import {
	computePageDownScrollTop,
	computePageDownTargetIndex,
	computePageUpScrollTop,
	computePageUpTargetIndex,
	deriveCommandRows,
	pageScrollLines,
	ROW_HEIGHT,
	rowIndents,
	rowKeyOf,
	type CommandRenderCommand
} from '../command-render';

/**
 * P6/M2 派生层用例：只验证「命令树 → 可见行」的纯数据推导。
 * 这些断言是 M3 把渲染换成 `v-for` 时的对照物（渲染怎么变都行，派生结果不许变）。
 */
const command = (
	id: string,
	extra: Partial<CommandRenderCommand> = {}
): CommandRenderCommand => ({ id, params: {}, commands: [], ...extra });

describe('command-render（M2 派生层：可见行推导）', () => {
	it('扁平列表：按顺序出全部行，indent 全 0', () => {
		const list = [command('a'), command('b'), command('c')];
		const rows = deriveCommandRows(list);
		expect(rows.map((row) => row.command.id)).toEqual(['a', 'b', 'c']);
		expect(rowIndents(rows)).toEqual([0, 0, 0]);
		expect(rows.every((row) => row.list === list && row.index === rows.indexOf(row))).toBe(true);
	});

	it('嵌套：深度优先展开，子行 indent = 父 + 1', () => {
		const child = command('child');
		const grandChild = command('grand');
		const parent = command('parent', { commands: [child, command('sibling')] });
		child.commands = [grandChild];
		const rows = deriveCommandRows([command('first'), parent]);
		expect(rows.map((row) => row.command.id)).toEqual(['first', 'parent', 'child', 'grand', 'sibling']);
		expect(rowIndents(rows)).toEqual([0, 0, 1, 2, 1]);
	});

	it('折叠：折叠的命令只出自己那一行，子命令不进可见集', () => {
		const parent = command('parent', {
			commands: [command('child')],
			folded: true
		});
		const rows = deriveCommandRows([parent, command('after')]);
		expect(rows.map((row) => row.command.id)).toEqual(['parent', 'after']);
		expect(rows[0].folded).toBe(true);
		expect(rows[1].folded).toBe(false);
	});

	it('没有子命令的命令：即使 folded=true 也不算折叠（folded 只对真有子命令的行成立）', () => {
		const rows = deriveCommandRows([command('leaf', { folded: true })]);
		expect(rows[0].folded).toBe(false);
	});

	it('选区：按可见行下标区间标 selected（含首尾）', () => {
		const rows = deriveCommandRows([command('a'), command('b'), command('c')], {
			selection: [1, 2]
		});
		expect(rows.map((row) => row.selected)).toEqual([false, true, true]);
	});

	it('搜索命中：命中集可以是 Set 或数组', () => {
		const list = [command('a'), command('b')];
		expect(deriveCommandRows(list, { hits: new Set([1]) }).map((row) => row.hit)).toEqual([
			false,
			true
		]);
		expect(deriveCommandRows(list, { hits: [0] }).map((row) => row.hit)).toEqual([true, false]);
	});

	it('禁用态：disabled 透传到行', () => {
		const rows = deriveCommandRows([command('a', { disabled: true }), command('b')]);
		expect(rows.map((row) => row.disabled)).toEqual([true, false]);
	});

	it('行 key 稳定：同一 command 多次派生拿到同一个 key，且重复 id 也不冲突', () => {
		const a1 = command('same');
		const a2 = command('same');
		const list = [a1, a2];
		const first = deriveCommandRows(list);
		const second = deriveCommandRows(list);
		expect(first.map((row) => row.key)).toEqual(second.map((row) => row.key));
		expect(first[0].key).not.toBe(first[1].key);
		expect(rowKeyOf(a1)).toBe(first[0].key);
	});

	it('空输入与默认参数：不抛错、返回空数组', () => {
		expect(deriveCommandRows()).toEqual([]);
		expect(deriveCommandRows([])).toEqual([]);
	});
});

/**
 * M2 切片 2：翻页数学从 `pageUp`/`pageDown` 抽出来的纯函数。
 * 这几条是**逐字对照原实现**写的（原实现散在 api 里，`content-api.ts` 改调这些函数后行为不许变）。
 */
describe('command-render（M2 切片 2：翻页数学）', () => {
	const context = (over: Partial<Parameters<typeof computePageUpScrollTop>[0]> = {}) => ({
		scrollTop: 0,
		viewportHeight: 400,
		rowCount: 100,
		anchor: 10,
		...over
	});

	it('行高与翻页行数：20px，scrollLines = floor(viewport/20) - 1（下限 0）', () => {
		expect(ROW_HEIGHT).toBe(20);
		expect(pageScrollLines(400)).toBe(19);
		expect(pageScrollLines(39)).toBe(0);
		expect(pageScrollLines(0)).toBe(0);
	});

	it('pageUp：scrollTop 减一页且不越过顶部', () => {
		expect(computePageUpScrollTop(context({ scrollTop: 400 }))).toBe(400 - 19 * 20);
		expect(computePageUpScrollTop(context({ scrollTop: 100 }))).toBe(0);
	});

	it('pageUp：目标行 = min(anchor, 底行) - 一页行数', () => {
		// scrollTop 400 / innerHeight 400 ⇒ bottomIndex = floor(800/20) - 1 = 39；anchor 100 ⇒ min = 39
		expect(computePageUpTargetIndex(context({ scrollTop: 400, anchor: 100 }))).toBe(39 - 19);
		// anchor 更小则取 anchor
		expect(computePageUpTargetIndex(context({ scrollTop: 400, anchor: 5 }))).toBe(5 - 19);
	});

	it('pageDown：不夹取时只加一页，但仍取 max(scrollTop, next)', () => {
		expect(computePageDownScrollTop(context({ scrollTop: 200 }), false)).toBe(200 + 19 * 20);
	});

	it('pageDown：夹取时不超过 rowCount*20 - viewportHeight', () => {
		const ctx = context({ scrollTop: 0, rowCount: 5, viewportHeight: 400 }); // 内容 100px < 视口
		expect(computePageDownScrollTop(ctx, true)).toBe(0);
		const ctx2 = context({ scrollTop: 0, rowCount: 100, viewportHeight: 400 });
		expect(computePageDownScrollTop(ctx2, true)).toBe(19 * 20);
	});

	it('pageDown：目标行 = max(anchor, 顶行) + 一页行数', () => {
		expect(
			computePageDownTargetIndex(context({ scrollTop: 40, anchor: 1, viewportHeight: 400 }))
		).toBe(Math.max(1, 2) + 19);
		expect(
			computePageDownTargetIndex(context({ scrollTop: 0, anchor: 30, viewportHeight: 400 }))
		).toBe(30 + 19);
	});
});
