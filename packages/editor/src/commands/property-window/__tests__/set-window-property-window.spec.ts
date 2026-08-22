import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WindowProperty } from '../set-window-property-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Command } from '@app/commands/command-object.ts';

vi.mock('@app/i18n', () => ({
	t: (key: string) => key,
	createGetter: () => (key: string) => key,
	tObject: () => ({}),
	getLabel: () => '',
	getTip: () => '',
	getContent: () => ''
}));

vi.mock('@app/commands/token.ts', () => ({
	Token: (key: string) => key
}));

vi.mock('@app/commands/command-object.ts', () => ({
	Command: {
		parseVariableNumber: vi.fn((value: unknown) => `<num:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

describe('WindowProperty（set-window 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留默认值', () => {
		WindowProperty.open!({ key: 'gridWidth', value: 8 });
		expect(Window.open).toHaveBeenCalledWith('setWindow-property');
		expect(WindowProperty.form).toEqual(
			expect.objectContaining({
				key: 'gridWidth',
				scrollX: 0,
				scrollY: 0,
				gridWidth: 8,
				gridHeight: 0,
				gridGapX: 0,
				gridGapY: 0,
				paddingX: 0,
				paddingY: 0
			})
		);
	});

	it('save 直接读回 form 值', () => {
		WindowProperty.open!({ key: 'paddingX', value: 4 });
		WindowProperty.form.paddingX = 12;
		expect(WindowProperty.save!()).toEqual({ key: 'paddingX', value: 12 });
		expect(Window.close).toHaveBeenCalledWith('setWindow-property');
	});

	it('parse 各 key 经 parseVariableNumber 渲染 name(param)', () => {
		expect(WindowProperty.parse!({ key: 'scrollX', value: 2 })).toBe('scrollX(<num:2>)');
		expect(WindowProperty.parse!({ key: 'gridGapY', value: 16 })).toBe('gridGapY(<num:16>)');
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(2);
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(16);
	});
});
