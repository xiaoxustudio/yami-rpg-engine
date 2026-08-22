import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogBoxProperty } from '../set-dialog-property-window.ts';
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
		parseVariableTemplate: vi.fn((value: unknown) => `<tmpl:${value}>`),
		setNumberColor: vi.fn((value: unknown) => `<num:${value}>`),
		setStringColor: vi.fn((value: unknown) => `<str:${value}>`),
		parseHexColor: vi.fn((value: unknown) => `<hex:${value}>`),
		parseBlend: vi.fn((value: unknown) => `<blend:${value}>`),
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

describe('DialogBoxProperty（set-dialog 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.setNumberColor!).mockClear();
		vi.mocked(Command.parseHexColor!).mockClear();
		vi.mocked(Color.simplifyHexColor!).mockClear();
	});

	it('open effect：拆分 shadow 子字段到 form', () => {
		DialogBoxProperty.open!({
			key: 'effect',
			value: { type: 'shadow', shadowOffsetX: 2, shadowOffsetY: 3, color: 'ff0000ff' }
		});
		expect(Window.open).toHaveBeenCalledWith('setDialogBox-property');
		expect(DialogBoxProperty.form).toEqual(
			expect.objectContaining({
				key: 'effect',
				'effect-type': 'shadow',
				'effect-shadowOffsetX': 2,
				'effect-shadowOffsetY': 3,
				'effect-strokeWidth': 1,
				'effect-color': 'ff0000ff'
			})
		);
	});

	it('save effect stroke：重组结构化值', () => {
		DialogBoxProperty.open!({ key: 'effect', value: { type: 'shadow' } });
		DialogBoxProperty.form['effect-type'] = 'stroke';
		DialogBoxProperty.form['effect-strokeWidth'] = 5;
		DialogBoxProperty.form['effect-color'] = '00ff00ff';
		expect(DialogBoxProperty.save!()).toEqual({
			key: 'effect',
			value: { type: 'stroke', strokeWidth: 5, color: '00ff00ff' }
		});
		expect(Window.close).toHaveBeenCalledWith('setDialogBox-property');
	});

	it('save 普通字段直接读回 form 值', () => {
		DialogBoxProperty.open!({ key: 'content', value: 'hello' });
		DialogBoxProperty.form.interval = 10;
		expect(DialogBoxProperty.save!()).toEqual({ key: 'content', value: 'hello' });
	});

	it('parse content：parseVariableTemplate', () => {
		expect(DialogBoxProperty.parse!({ key: 'content', value: 'Hi' })).toBe('<tmpl:Hi>');
	});

	it('parse interval/size/lineSpacing/letterSpacing：setNumberColor', () => {
		expect(DialogBoxProperty.parse!({ key: 'interval', value: 6 })).toBe('<num:6>');
		expect(DialogBoxProperty.parse!({ key: 'lineSpacing', value: 2 })).toBe('<num:2>');
	});

	it('parse color：simplifyHexColor + parseHexColor', () => {
		expect(DialogBoxProperty.parse!({ key: 'color', value: 'ffffffff' })).toBe(
			'<hex:ffffffff>'
		);
		expect(Color.simplifyHexColor).toHaveBeenCalledWith('ffffffff');
	});

	it('parse font：有值 setStringColor，空值回退默认文案', () => {
		expect(DialogBoxProperty.parse!({ key: 'font', value: 'arial' })).toBe('<str:arial>');
		expect(DialogBoxProperty.parse!({ key: 'font', value: '' })).toBe('font.default');
	});

	it('parse effect：none', () => {
		expect(DialogBoxProperty.parse!({ key: 'effect', value: { type: 'none' } })).toBe(
			'effect(effect.none)'
		);
	});

	it('parse effect：shadow 渲染偏移与颜色', () => {
		expect(
			DialogBoxProperty.parse!({
				key: 'effect',
				value: { type: 'shadow', shadowOffsetX: 2, shadowOffsetY: 3, color: 'ff0000ff' }
			})
		).toBe('effect(effect.shadow, <num:2>, <num:3>, <hex:ff0000ff>)');
	});

	it('parse effect：outline 渲染颜色', () => {
		expect(
			DialogBoxProperty.parse!({
				key: 'effect',
				value: { type: 'outline', color: '0000ffff' }
			})
		).toBe('effect(effect.outline, <hex:0000ffff>)');
	});

	it('parse blend：parseBlend', () => {
		expect(DialogBoxProperty.parse!({ key: 'blend', value: 'subtract' })).toBe(
			'<blend:subtract>'
		);
	});
});
