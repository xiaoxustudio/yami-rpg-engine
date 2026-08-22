import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoProperty } from '../set-video-property-window.ts';
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
		parseVariableNumber: vi.fn((value: unknown) => `<num:${value}>`),
		parseBlend: vi.fn((value: unknown) => `<blend:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

describe('VideoProperty（set-video 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseFileName!).mockClear();
		vi.mocked(Command.parseBlend!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留默认值', () => {
		VideoProperty.open!({ key: 'playbackRate', value: 2 });
		expect(Window.open).toHaveBeenCalledWith('setVideo-property');
		expect(VideoProperty.form).toEqual(
			expect.objectContaining({
				key: 'playbackRate',
				video: '',
				playbackRate: 2,
				loop: false,
				flip: 'none',
				blend: 'normal'
			})
		);
	});

	it('save 直接读回 form 值', () => {
		VideoProperty.open!({ key: 'loop', value: true });
		VideoProperty.form.loop = false;
		expect(VideoProperty.save!()).toEqual({ key: 'loop', value: false });
		expect(Window.close).toHaveBeenCalledWith('setVideo-property');
	});

	it('parse video：parseFileName', () => {
		expect(VideoProperty.parse!({ key: 'video', value: 'intro.mp4' })).toBe('<file:intro.mp4>');
	});

	it('parse playbackRate：parseVariableNumber', () => {
		expect(VideoProperty.parse!({ key: 'playbackRate', value: 0.5 })).toBe('<num:0.5>');
	});

	it('parse loop/flip：经 get 渲染文案', () => {
		expect(VideoProperty.parse!({ key: 'loop', value: true })).toBe('loop.true');
		expect(VideoProperty.parse!({ key: 'flip', value: 'both' })).toBe('flip.both');
	});

	it('parse blend：parseBlend', () => {
		expect(VideoProperty.parse!({ key: 'blend', value: 'normal' })).toBe('<blend:normal>');
	});
});
