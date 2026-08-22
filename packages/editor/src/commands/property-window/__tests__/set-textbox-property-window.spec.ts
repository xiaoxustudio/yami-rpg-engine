import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextBoxProperty } from '../set-textbox-property-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Command } from '@app/commands/command-object.ts';
import { Color } from '@app/tools/color-picker-window.ts';

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
		parseVariableString: vi.fn((value: unknown) => `<str:${value}>`),
		parseVariableNumber: vi.fn((value: unknown) => `<num:${value}>`),
		setNumberColor: vi.fn((value: unknown) => `<num:${value}>`),
		parseHexColor: vi.fn((value: unknown) => `<hex:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

vi.mock('@app/tools/color-picker-window.ts', () => ({
	Color: { simplifyHexColor: vi.fn((hex: unknown) => String(hex)) }
}));

describe('TextBoxProperty（set-textbox 属性窗口）', () => {
	const longText = 'a'.repeat(85);

	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseVariableString!).mockClear();
		vi.mocked(Color.simplifyHexColor!).mockClear();
	});

	it('open 写入数据并保留默认值', () => {
		TextBoxProperty.open!({ key: 'number', value: 10 });
		expect(Window.open).toHaveBeenCalledWith('setTextBox-property');
		expect(TextBoxProperty.form).toEqual(
			expect.objectContaining({
				key: 'number',
				type: 'text',
				text: '',
				number: 10,
				min: 0,
				max: 0,
				decimals: 0,
				color: 'ffffffff'
			})
		);
	});

	it('save 直接读回 form 值', () => {
		TextBoxProperty.open!({ key: 'min', value: 1 });
		TextBoxProperty.form.min = 3;
		expect(TextBoxProperty.save!()).toEqual({ key: 'min', value: 3 });
		expect(Window.close).toHaveBeenCalledWith('setTextBox-property');
	});

	it('parse type：经 get 渲染文案', () => {
		expect(TextBoxProperty.parse!({ key: 'type', value: 'number' })).toBe('type.number');
	});

	it('parse text：短文本直接 parseVariableString', () => {
		expect(TextBoxProperty.parse!({ key: 'text', value: 'hello' })).toBe('<str:hello>');
	});

	it('parse text：超过 80 字符截断并追加省略号', () => {
		expect(TextBoxProperty.parse!({ key: 'text', value: longText })).toBe(
			`<str:${'a'.repeat(80)}...>`
		);
	});

	it('parse number/min/max：parseVariableNumber', () => {
		expect(TextBoxProperty.parse!({ key: 'number', value: 7 })).toBe('<num:7>');
		expect(TextBoxProperty.parse!({ key: 'max', value: 100 })).toBe('<num:100>');
	});

	it('parse decimals：setNumberColor', () => {
		expect(TextBoxProperty.parse!({ key: 'decimals', value: 2 })).toBe('<num:2>');
	});

	it('parse color：simplifyHexColor + parseHexColor', () => {
		expect(TextBoxProperty.parse!({ key: 'color', value: 'ffffffff' })).toBe('<hex:ffffffff>');
		expect(Color.simplifyHexColor).toHaveBeenCalledWith('ffffffff');
		expect(Command.parseHexColor).toHaveBeenCalledWith('ffffffff');
	});
});
