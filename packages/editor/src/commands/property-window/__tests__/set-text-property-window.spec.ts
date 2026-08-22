import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextProperty } from '../set-text-property-window.ts';
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

describe('TextProperty（set-text 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseVariableTemplate!).mockClear();
		vi.mocked(Command.setNumberColor!).mockClear();
		vi.mocked(Command.setStringColor!).mockClear();
		vi.mocked(Command.parseHexColor!).mockClear();
		vi.mocked(Command.parseBlend!).mockClear();
		vi.mocked(Color.simplifyHexColor!).mockClear();
	});

	it('open 非 effect 字段：写入数据并保留其余默认值', () => {
		TextProperty.open!({ key: 'size', value: 20 });
		expect(Window.open).toHaveBeenCalledWith('setText-property');
		expect(TextProperty.form).toEqual(
			expect.objectContaining({
				key: 'size',
				content: '',
				size: 20,
				lineSpacing: 0,
				letterSpacing: 0,
				color: 'ffffffff',
				font: '',
				effect: 'none',
				blend: 'normal'
			})
		);
	});

	it('open effect：拆分 shadow 子字段到 form', () => {
		TextProperty.open!({
			key: 'effect',
			value: { type: 'shadow', shadowOffsetX: 2, shadowOffsetY: 3, color: 'ff0000ff' }
		});
		expect(TextProperty.form).toEqual(
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

	it('save effect shadow：从子字段重组结构化值', () => {
		TextProperty.open!({
			key: 'effect',
			value: { type: 'shadow', shadowOffsetX: 2, shadowOffsetY: 3, color: 'ff0000ff' }
		});
		expect(TextProperty.save!()).toEqual({
			key: 'effect',
			value: { type: 'shadow', shadowOffsetX: 2, shadowOffsetY: 3, color: 'ff0000ff' }
		});
		expect(Window.close).toHaveBeenCalledWith('setText-property');
	});

	it('save effect 各分支：none/stroke/outline/回车空值', () => {
		TextProperty.open!({ key: 'effect', value: { type: 'shadow' } });
		TextProperty.form['effect-type'] = 'none';
		expect(TextProperty.save!()).toEqual({ key: 'effect', value: { type: 'none' } });
		vi.mocked(Window.close!).mockClear();
		TextProperty.open!({ key: 'effect', value: { type: 'shadow' } });
		TextProperty.form['effect-type'] = 'stroke';
		TextProperty.form['effect-strokeWidth'] = 5;
		TextProperty.form['effect-color'] = '00ff00ff';
		expect(TextProperty.save!()).toEqual({
			key: 'effect',
			value: { type: 'stroke', strokeWidth: 5, color: '00ff00ff' }
		});
		vi.mocked(Window.close!).mockClear();
		TextProperty.open!({ key: 'effect', value: { type: 'shadow' } });
		TextProperty.form['effect-type'] = 'outline';
		TextProperty.form['effect-color'] = '0000ffff';
		expect(TextProperty.save!()).toEqual({
			key: 'effect',
			value: { type: 'outline', color: '0000ffff' }
		});
	});

	it('save 普通字段直接读回 form 值', () => {
		TextProperty.open!({ key: 'content', value: 'hello' });
		expect(TextProperty.save!()).toEqual({ key: 'content', value: 'hello' });
	});

	it('parse content：parseVariableTemplate', () => {
		expect(TextProperty.parse!({ key: 'content', value: 'Hi' })).toBe('<tmpl:Hi>');
		expect(Command.parseVariableTemplate).toHaveBeenCalledWith('Hi');
	});

	it('parse size/lineSpacing/letterSpacing：setNumberColor', () => {
		expect(TextProperty.parse!({ key: 'size', value: 16 })).toBe('<num:16>');
		expect(TextProperty.parse!({ key: 'lineSpacing', value: 2 })).toBe('<num:2>');
		expect(TextProperty.parse!({ key: 'letterSpacing', value: 3 })).toBe('<num:3>');
	});

	it('parse color：simplifyHexColor + parseHexColor', () => {
		expect(TextProperty.parse!({ key: 'color', value: 'ffffffff' })).toBe('<hex:ffffffff>');
		expect(Command.parseHexColor).toHaveBeenCalledWith('ffffffff');
	});

	it('parse font：有值 setStringColor，空值回退默认文案', () => {
		expect(TextProperty.parse!({ key: 'font', value: 'arial' })).toBe('<str:arial>');
		expect(TextProperty.parse!({ key: 'font', value: '' })).toBe('font.default');
	});

	it('parse effect：none', () => {
		expect(TextProperty.parse!({ key: 'effect', value: { type: 'none' } })).toBe(
			'effect(effect.none)'
		);
	});

	it('parse effect：shadow 渲染偏移与颜色', () => {
		expect(
			TextProperty.parse!({
				key: 'effect',
				value: { type: 'shadow', shadowOffsetX: 2, shadowOffsetY: 3, color: 'ff0000ff' }
			})
		).toBe('effect(effect.shadow, <num:2>, <num:3>, <hex:ff0000ff>)');
		expect(Command.setNumberColor).toHaveBeenCalledWith(2);
		expect(Command.setNumberColor).toHaveBeenCalledWith(3);
		expect(Command.parseHexColor).toHaveBeenCalledWith('ff0000ff');
	});

	it('parse effect：stroke 渲染宽度与颜色', () => {
		expect(
			TextProperty.parse!({
				key: 'effect',
				value: { type: 'stroke', strokeWidth: 5, color: '00ff00ff' }
			})
		).toBe('effect(effect.stroke, <num:5>, <hex:00ff00ff>)');
	});

	it('parse effect：outline 渲染颜色', () => {
		expect(
			TextProperty.parse!({
				key: 'effect',
				value: { type: 'outline', color: '0000ffff' }
			})
		).toBe('effect(effect.outline, <hex:0000ffff>)');
	});

	it('parse blend：parseBlend', () => {
		expect(TextProperty.parse!({ key: 'blend', value: 'additive' })).toBe('<blend:additive>');
	});

	it('parse listData=true 时清理文本标签', () => {
		expect(TextProperty.parse!({ key: 'size', value: 8 }, true)).toBe('<clean:<num:8>>');
	});
});
