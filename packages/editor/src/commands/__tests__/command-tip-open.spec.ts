import { afterEach, describe, expect, it, vi } from 'vitest';
import { Command } from '@app/commands/command-object.ts';
import { CommandSuggestion } from '@app/commands/command-tip';
import { Window } from '@app/tools/window-object.ts';

/**
 * 回归：插入指令的**选择面板**（command-widget）在拿不到定位点时也必须打开。
 *
 * `getSelectionPosition()` 只负责把面板放到活动行旁边；活动行尚未物化（模板换源后常见）
 * 时它返回 null —— 旧实现 `if (point)` 直接吞掉整条链路，表现为"双击空白行/插入指令没反应"。
 */
describe('CommandSuggestion.open：定位点缺失不得静默不打开', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		Command.target = null as never;
	});

	it('getSelectionPosition 返回 null 时仍然打开 command-widget', () => {
		Window.open = vi.fn();
		const list = document.createElement('div') as unknown as HTMLElement & {
			scrollAndResize: () => void;
			getSelectionPosition: () => null;
			updateCommandNames: () => void;
			update: () => void;
			selectDefaultCommand: () => void;
			resize: () => void;
		};
		list.scrollAndResize = vi.fn();
		list.getSelectionPosition = () => null;
		list.updateCommandNames = vi.fn();
		list.update = vi.fn();
		list.selectDefaultCommand = vi.fn();
		list.resize = vi.fn();
		document.body.appendChild(list);
		Command.target = list as never;

		CommandSuggestion.widget = { style: {} } as never;
		CommandSuggestion.searcher = { input: {} } as never;
		CommandSuggestion.list = list as never;

		expect(() => CommandSuggestion.open!()).not.toThrow();
		expect(Window.open).toHaveBeenCalledWith('command-widget');
	});
});
