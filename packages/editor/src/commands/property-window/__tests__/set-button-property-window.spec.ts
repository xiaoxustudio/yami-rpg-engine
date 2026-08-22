import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ButtonProperty } from '../set-button-property-window.ts';
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
		parseFileName: vi.fn((value: unknown) => `<file:${value}>`),
		setNumberColor: vi.fn((value: unknown) => `<num:${value}>`),
		parseVariableTemplate: vi.fn((value: unknown) => `<tmpl:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

describe('ButtonProperty（set-button 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseFileName!).mockClear();
		vi.mocked(Command.setNumberColor!).mockClear();
		vi.mocked(Command.parseVariableTemplate!).mockClear();
	});

	it('open image 系列：写入 defaults.image', () => {
		ButtonProperty.open!({ key: 'hoverImage', value: 'btn-hover.png' });
		expect(Window.open).toHaveBeenCalledWith('setButton-property');
		expect(ButtonProperty.form).toEqual(
			expect.objectContaining({
				key: 'hoverImage',
				image: 'btn-hover.png',
				imageOpacity: 1,
				content: '',
				size: 16,
				letterSpacing: 0
			})
		);
	});

	it('save image 系列：从 image 控件读回', () => {
		ButtonProperty.open!({ key: 'normalImage', value: 'btn.png' });
		ButtonProperty.form.image = 'btn-new.png';
		expect(ButtonProperty.save!()).toEqual({
			key: 'normalImage',
			value: 'btn-new.png'
		});
		expect(Window.close).toHaveBeenCalledWith('setButton-property');
	});

	it('open/save clip 系列：数组与 4 个 clip 控件互转', () => {
		ButtonProperty.open!({ key: 'activeClip', value: [1, 2, 3, 4] });
		expect(ButtonProperty.form).toEqual(
			expect.objectContaining({
				key: 'activeClip',
				'clip-0': 1,
				'clip-1': 2,
				'clip-2': 3,
				'clip-3': 4
			})
		);
		ButtonProperty.form['clip-2'] = 9;
		expect(ButtonProperty.save!()).toEqual({
			key: 'activeClip',
			value: [1, 2, 9, 4]
		});
	});

	it('open/save tint 系列：数组与 4 个 tint 控件互转', () => {
		ButtonProperty.open!({ key: 'normalTint', value: [10, 20, 30, 40] });
		expect(ButtonProperty.form).toEqual(
			expect.objectContaining({
				key: 'normalTint',
				'tint-0': 10,
				'tint-1': 20,
				'tint-2': 30,
				'tint-3': 40
			})
		);
		ButtonProperty.form['tint-3'] = 255;
		expect(ButtonProperty.save!()).toEqual({
			key: 'normalTint',
			value: [10, 20, 30, 255]
		});
	});

	it('save 普通字段直接读回 form 值', () => {
		ButtonProperty.open!({ key: 'size', value: 18 });
		expect(ButtonProperty.save!()).toEqual({ key: 'size', value: 18 });
	});

	it('parse image 系列：parseFileName', () => {
		expect(ButtonProperty.parse!({ key: 'normalImage', value: 'a.png' })).toBe('<file:a.png>');
		expect(ButtonProperty.parse!({ key: 'activeImage', value: 'c.png' })).toBe('<file:c.png>');
	});

	it('parse clip/tint 系列：setNumberColor 以 Token(", ") 拼接', () => {
		expect(ButtonProperty.parse!({ key: 'normalClip', value: [1, 2, 3, 4] })).toBe(
			'<num:1>, <num:2>, <num:3>, <num:4>'
		);
		expect(ButtonProperty.parse!({ key: 'hoverTint', value: [5, 6, 7, 8] })).toBe(
			'<num:5>, <num:6>, <num:7>, <num:8>'
		);
	});

	it('parse content：parseVariableTemplate', () => {
		expect(ButtonProperty.parse!({ key: 'content', value: 'OK' })).toBe('<tmpl:OK>');
	});

	it('parse imageOpacity/size/letterSpacing：setNumberColor', () => {
		expect(ButtonProperty.parse!({ key: 'imageOpacity', value: 0.5 })).toBe('<num:0.5>');
		expect(ButtonProperty.parse!({ key: 'letterSpacing', value: 2 })).toBe('<num:2>');
	});
});
