import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandSchema } from '@app/commands/schema.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { Command } from '@app/commands/command-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

/**
 * 回归（实机："事件编辑器里有部分指令，双击无法编辑"）：
 *
 * 1. `CommandSchema.edit` 里的 `if (point)` 闸门：`point` 只用于**给窗口定位**，
 *    拿不到时旧实现什么都不做 —— 表现为"双击没反应"。活动行改由模板渲染后，
 *    `getSelectionPosition()` 可能拿不到点（行尚未物化/刚被清空），本用例钉住"仍然开窗"。
 * 2. 脚本指令（插件指令）的 `commandNameMap` 门槛：它只提供窗口标题，
 *    旧实现把它当编辑权限用 ⇒ 指令名表尚未就绪时，插件指令静默不可编辑。
 */
const makeTarget = (point: { x: number; y: number } | null) => ({
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => point,
	save: vi.fn()
});

describe('CommandSchema.edit / open：双击编辑链路不得静默吞掉', () => {
	beforeEach(() => {
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.setPositionMode = vi.fn();
		Window.absolutePos = { x: 0, y: 0 };
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	it('内置指令：定位点拿不到（getSelectionPosition 为 null）也照样开窗并灌参数', () => {
		commandCases.probeBuiltin = new CommandSchema({
			name: 'probeBuiltin',
			fields: [{ key: 'x', default: 0 }]
		});
		CommandSchema.edit(
			makeTarget(null) as never,
			{
				id: 'probeBuiltin',
				params: { x: 7 }
			} as never
		);
		expect(Window.open).toHaveBeenCalledWith('probeBuiltin');
	});

	it('脚本指令：参数 > 0 但没有指令名表（commandNameMap 为空）时也开窗', () => {
		const id = 'customProbe';
		(Data as unknown as { scripts: Record<string, unknown> }).scripts = {
			[id]: { parameters: [{ type: 'number', key: 'count' }] }
		};
		const load = vi.fn();
		(Command as unknown as { custom: unknown }).custom = { load, commandNameMap: null };

		CommandSchema.edit(makeTarget({ x: 1, y: 2 }) as never, { id, params: {} } as never);

		expect(Window.open).toHaveBeenCalledWith('scriptCommand');
		expect(load).toHaveBeenCalledWith(id, {});
	});

	it('脚本指令：没有参数 ⇒ 无可编辑内容（不抛错、给出提示）', () => {
		const id = 'paramlessProbe';
		(Data as unknown as { scripts: Record<string, unknown> }).scripts = {
			[id]: { parameters: [] }
		};
		expect(() =>
			CommandSchema.edit(makeTarget({ x: 1, y: 2 }) as never, { id, params: {} } as never)
		).not.toThrow();
		expect(Window.open).not.toHaveBeenCalledWith('scriptCommand');
	});

	it('未知 id：不抛错、给出提示', () => {
		(Data as unknown as { scripts: Record<string, unknown> }).scripts = {};
		expect(() =>
			CommandSchema.edit(
				makeTarget({ x: 1, y: 2 }) as never,
				{
					id: 'nopeProbe',
					params: {}
				} as never
			)
		).not.toThrow();
		expect(Window.open).not.toHaveBeenCalled();
	});
});
