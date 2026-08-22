import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LightProperty } from '../move-light-property-window.ts';
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

describe('LightProperty（move-light 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留非 0 默认值', () => {
		LightProperty.open!({ key: 'x', value: 5 });
		expect(Window.open).toHaveBeenCalledWith('moveLight-property');
		expect(LightProperty.form).toEqual(
			expect.objectContaining({
				key: 'x',
				x: 5,
				y: 0,
				range: 1,
				intensity: 0.5,
				anchorX: 0.5,
				anchorY: 0.5,
				width: 1,
				height: 1,
				angle: 0,
				red: 0,
				green: 0,
				blue: 0
			})
		);
	});

	it('save 直接读回 form 值', () => {
		LightProperty.open!({ key: 'intensity', value: 0.8 });
		LightProperty.form.intensity = 1;
		expect(LightProperty.save!()).toEqual({ key: 'intensity', value: 1 });
		expect(Window.close).toHaveBeenCalledWith('moveLight-property');
	});

	it('parse 各 key 经 parseVariableNumber 渲染 name(param)', () => {
		expect(LightProperty.parse!({ key: 'red', value: 255 })).toBe('red(<num:255>)');
		expect(LightProperty.parse!({ key: 'range', value: 4 })).toBe('range(<num:4>)');
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(255);
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(4);
	});
});
