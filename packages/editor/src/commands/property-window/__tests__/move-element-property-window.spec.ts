import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransformProperty } from '../move-element-property-window.ts';
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

describe('TransformProperty（move-element 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留默认值（scale/opacity 非 0）', () => {
		TransformProperty.open!({ key: 'x', value: 100 });
		expect(Window.open).toHaveBeenCalledWith('moveElement-property');
		expect(TransformProperty.form).toEqual(
			expect.objectContaining({
				key: 'x',
				x: 100,
				y: 0,
				width: 0,
				height: 0,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				opacity: 1
			})
		);
	});

	it('save 直接读回 form 值', () => {
		TransformProperty.open!({ key: 'rotation', value: 45 });
		TransformProperty.form.rotation = 90;
		expect(TransformProperty.save!()).toEqual({ key: 'rotation', value: 90 });
		expect(Window.close).toHaveBeenCalledWith('moveElement-property');
	});

	it('parse 各 key 经 parseVariableNumber 渲染 name(param)', () => {
		expect(TransformProperty.parse!({ key: 'anchorX', value: 0.5 })).toBe('anchorX(<num:0.5>)');
		expect(TransformProperty.parse!({ key: 'scaleX', value: 2 })).toBe('scaleX(<num:2>)');
	});

	it('parse 变量表达式值', () => {
		expect(TransformProperty.parse!({ key: 'x', value: 10 })).toBe('x(<num:10>)');
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(10);
	});
});
