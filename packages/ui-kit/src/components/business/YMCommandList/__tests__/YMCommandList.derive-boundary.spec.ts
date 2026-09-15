import { describe, expect, it, vi } from 'vitest';
import { createCommandListElement, type CommandListApiOptions } from '../command-api';
import { deriveCommandRows } from '../command-render';

/**
 * M3 换源前的**边界实测**：派生层（`deriveCommandRows`）与 api 实际建出的行序列，
 * 什么时候一致、什么时候必然不一致。
 *
 * 结论（本轮实测，已写入 monolith-render-plan）：
 * - **普通列表**（`parse` 只产出文本）两边**逐项一致**（含末尾空白行）；
 * - 一旦 `parse` 产出 `break` / `script` / `children`，**行集合由 `parse` 决定**——
 *   一条命令可以拆成多行、多行脚本各占一行、子列表只有在 `parse` 给出 `children` 时才展开，
 *   而派生层只看命令树结构，**看不到这些** ⇒ 此时两边必然不同。
 *
 * ⇒ 换源时模板的行来源必须是 **api 自己的行列表**（`getRowModel`），
 *   派生层继续承担"结构推导 / 数学"的角色，不能当作渲染来源。
 */
const build = (
	parse: (item: Record<string, unknown>) => unknown[],
	data: unknown[]
): { keys: string[]; derived: string[] } => {
	const el = createCommandListElement({
		command: {
			parse: parse as never,
			fetchVariables: () => [],
			insert: vi.fn(),
			edit: vi.fn(),
			parseUnlinkedId: (id: string) => id,
			colorizeCodeLines: vi.fn()
		},
		clipboard: { write: vi.fn(), read: () => [], has: () => false },
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
	} as unknown as CommandListApiOptions) as unknown as HTMLElement & { [k: string]: unknown };
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	(el as unknown as { scroll: unknown }).scroll = vi.fn();
	(el as unknown as { write: (d: unknown[]) => void }).write(data);
	const model = (el as unknown as { getRowModel: () => { keys: string[] } }).getRowModel();
	return {
		keys: model.keys,
		derived: deriveCommandRows(data as never[]).map((row) => row.key)
	};
};



describe('command-render ↔ command-api（行序列的已知边界）', () => {
	it('普通列表：派生层与 api 的行序列逐项一致（含末尾空白行）', () => {
		const data = [
			{ id: 'a', params: {}, commands: [] },
			{ id: 'b', params: {}, commands: [] }
		];
		const { keys, derived } = build(() => [{ color: 'normal' }, { text: 'x' }], data);
		expect(keys.length).toBeGreaterThan(0);
		expect(derived).toEqual(keys);
	});

	it('parse 产出 break / script 时：api 的行数**多于**派生层（行集合由 parse 决定）', () => {
		const data = [
			{ id: 'split', params: {}, commands: [] },
			{ id: 'scripted', params: {}, commands: [] }
		];
		const { keys, derived } = build((item) => {
			if (item.id === 'split') {
				return [{ color: 'normal' }, { text: 'x' }, { break: true }, { text: 'y' }];
			}
			return [{ color: 'normal' }, { script: 'l1 \n l2 \n l3' }];
		}, data);
		expect(keys.length).toBeGreaterThan(derived.length);
		// api 侧出现 break 行与脚本行（派生层不产生这些 key）
		expect(keys.some((k) => k.includes('-b'))).toBe(true);
		expect(keys.some((k) => k.includes('-s'))).toBe(true);
		expect(derived.some((k) => k.includes('-b') || k.includes('-s'))).toBe(false);
	});
});
