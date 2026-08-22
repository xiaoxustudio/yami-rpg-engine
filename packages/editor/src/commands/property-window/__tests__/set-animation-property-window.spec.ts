import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimationProperty } from '../set-animation-property-window.ts';
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
		parseActor: vi.fn((value: { type: string }) => `<actor:${value.type}>`),
		parseEnumString: vi.fn((value: unknown) => `<enum:${value}>`),
		parseVariableNumber: vi.fn((value: unknown) => `<num:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

describe('AnimationProperty（set-animation 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseFileName!).mockClear();
		vi.mocked(Command.parseActor!).mockClear();
		vi.mocked(Command.parseEnumString!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留默认值', () => {
		AnimationProperty.open!({ key: 'motion', value: 'walk' });
		expect(Window.open).toHaveBeenCalledWith('setAnimation-property');
		expect(AnimationProperty.form).toEqual(
			expect.objectContaining({
				key: 'motion',
				animation: '',
				actor: { type: 'trigger' },
				motion: 'walk',
				angle: 0,
				frame: 0
			})
		);
	});

	it('save 直接读回 form 值', () => {
		AnimationProperty.open!({ key: 'angle', value: 30 });
		AnimationProperty.form.angle = 60;
		expect(AnimationProperty.save!()).toEqual({ key: 'angle', value: 60 });
		expect(Window.close).toHaveBeenCalledWith('setAnimation-property');
	});

	it('parse animation：parseFileName', () => {
		expect(AnimationProperty.parse!({ key: 'animation', value: 'idle.anim' })).toBe(
			'<file:idle.anim>'
		);
	});

	it('parse animation-from-actor：parseActor', () => {
		expect(
			AnimationProperty.parse!({
				key: 'animation-from-actor',
				value: { type: 'trigger' }
			})
		).toBe('<actor:trigger>');
	});

	it('parse motion：parseEnumString', () => {
		expect(AnimationProperty.parse!({ key: 'motion', value: 'walk' })).toBe('<enum:walk>');
	});

	it('parse angle/frame：parseVariableNumber', () => {
		expect(AnimationProperty.parse!({ key: 'angle', value: 45 })).toBe('<num:45>');
		expect(AnimationProperty.parse!({ key: 'frame', value: 3 })).toBe('<num:3>');
	});
});
