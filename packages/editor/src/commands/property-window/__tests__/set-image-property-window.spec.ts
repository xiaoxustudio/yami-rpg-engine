import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageProperty } from '../set-image-property-window.ts';
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
		parseBlend: vi.fn((value: unknown) => `<blend:${value}>`),
		parseVariableNumber: vi.fn((value: unknown) => `<num:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

describe('ImageProperty（set-image 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseFileName!).mockClear();
		vi.mocked(Command.parseBlend!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留 clip 四个默认值', () => {
		ImageProperty.open!({ key: 'shiftX', value: 12 });
		expect(Window.open).toHaveBeenCalledWith('setImage-property');
		expect(ImageProperty.form).toEqual(
			expect.objectContaining({
				key: 'shiftX',
				image: '',
				display: 'stretch',
				flip: 'none',
				blend: 'normal',
				shiftX: 12,
				shiftY: 0,
				'clip-0': 0,
				'clip-1': 0,
				'clip-2': 0,
				'clip-3': 0
			})
		);
	});

	it('save 直接读回 form 值', () => {
		ImageProperty.open!({ key: 'image', value: 'bg.png' });
		ImageProperty.form['clip-2'] = 32;
		expect(ImageProperty.save!()).toEqual({ key: 'image', value: 'bg.png' });
	});

	it('parse image：parseFileName', () => {
		expect(ImageProperty.parse!({ key: 'image', value: 'bg.png' })).toBe('<file:bg.png>');
	});

	it('parse display/flip：经 get 渲染文案', () => {
		expect(ImageProperty.parse!({ key: 'display', value: 'tile' })).toBe('display.tile');
		expect(ImageProperty.parse!({ key: 'flip', value: 'horizontal' })).toBe('flip.horizontal');
	});

	it('parse blend：parseBlend', () => {
		expect(ImageProperty.parse!({ key: 'blend', value: 'mask' })).toBe('<blend:mask>');
	});

	it('parse shiftX/shiftY/clip：parseVariableNumber', () => {
		expect(ImageProperty.parse!({ key: 'shiftX', value: 4 })).toBe('<num:4>');
		expect(ImageProperty.parse!({ key: 'shiftY', value: 5 })).toBe('<num:5>');
		expect(ImageProperty.parse!({ key: 'clip-0', value: 1 })).toBe('<num:1>');
		expect(ImageProperty.parse!({ key: 'clip-3', value: 48 })).toBe('<num:48>');
	});
});
