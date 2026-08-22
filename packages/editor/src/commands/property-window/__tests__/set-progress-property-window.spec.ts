import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressBarProperty } from '../set-progress-property-window.ts';
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

describe('ProgressBarProperty（set-progress 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseFileName!).mockClear();
		vi.mocked(Command.parseBlend!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留 clip/color 默认值', () => {
		ProgressBarProperty.open!({ key: 'progress', value: 50 });
		expect(Window.open).toHaveBeenCalledWith('setProgressBar-property');
		expect(ProgressBarProperty.form).toEqual(
			expect.objectContaining({
				key: 'progress',
				image: '',
				display: 'stretch',
				blend: 'normal',
				progress: 50,
				'clip-0': 0,
				'clip-3': 0,
				'color-0': 0,
				'color-3': 0
			})
		);
	});

	it('save 直接读回 form 值', () => {
		ProgressBarProperty.open!({ key: 'display', value: 'clip' });
		ProgressBarProperty.form['color-2'] = 200;
		expect(ProgressBarProperty.save!()).toEqual({ key: 'display', value: 'clip' });
		expect(Window.close).toHaveBeenCalledWith('setProgressBar-property');
	});

	it('parse image：parseFileName', () => {
		expect(ProgressBarProperty.parse!({ key: 'image', value: 'hp.png' })).toBe('<file:hp.png>');
	});

	it('parse display：经 get 渲染文案', () => {
		expect(ProgressBarProperty.parse!({ key: 'display', value: 'clip' })).toBe('display.clip');
	});

	it('parse blend：parseBlend', () => {
		expect(ProgressBarProperty.parse!({ key: 'blend', value: 'additive' })).toBe(
			'<blend:additive>'
		);
	});

	it('parse progress/clip/color：parseVariableNumber', () => {
		expect(ProgressBarProperty.parse!({ key: 'progress', value: 25 })).toBe('<num:25>');
		expect(ProgressBarProperty.parse!({ key: 'clip-1', value: 4 })).toBe('<num:4>');
		expect(ProgressBarProperty.parse!({ key: 'color-0', value: 255 })).toBe('<num:255>');
	});
});
