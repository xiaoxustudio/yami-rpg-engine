import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPropertyWindow } from '../property-window-factory.ts';
import { TransformProperty } from '../move-element-property-window.ts';
import { LightProperty } from '../move-light-property-window.ts';
import { AnimationProperty } from '../set-animation-property-window.ts';
import { ButtonProperty } from '../set-button-property-window.ts';
import { DialogBoxProperty } from '../set-dialog-property-window.ts';
import { ImageProperty } from '../set-image-property-window.ts';
import { ProgressBarProperty } from '../set-progress-property-window.ts';
import { TextProperty } from '../set-text-property-window.ts';
import { TextBoxProperty } from '../set-textbox-property-window.ts';
import { VideoProperty } from '../set-video-property-window.ts';
import { WindowProperty } from '../set-window-property-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Command } from '@app/commands/command-object.ts';
import { Color } from '@app/tools/color-picker-window.ts';

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({
		global: {
			t: (key: string) => key.split('.').slice(2).join('.')
		}
	})
}));

vi.mock('@app/commands/token.ts', () => ({
	Token: (key: string) => key
}));

vi.mock('@app/commands/command-object.ts', () => ({
	Command: {
		parseVariableTemplate: vi.fn((value: unknown) => `<tmpl:${String(value)}>`),
		parseVariableString: vi.fn((value: unknown) => `<str:${String(value)}>`),
		parseVariableNumber: vi.fn((value: unknown) => `<num:${String(value)}>`),
		setNumberColor: vi.fn((value: unknown) => `<num:${String(value)}>`),
		setStringColor: vi.fn((value: unknown) => `<str:${String(value)}>`),
		parseHexColor: vi.fn((value: unknown) => `<hex:${String(value)}>`),
		parseBlend: vi.fn((value: unknown) => `<blend:${String(value)}>`),
		parseFileName: vi.fn((value: unknown) => `<file:${String(value)}>`),
		parseActor: vi.fn((value: { type: string }) => `<actor:${value.type}>`),
		parseEnumString: vi.fn((value: unknown) => `<enum:${String(value)}>`),
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

describe('createPropertyWindow（属性窗口工厂核心契约）', () => {
	const makeConfig = () => ({
		prefix: 'tp',
		locale: 'command.testProp',
		keys: [
			{ name: 'Name', value: 'name', default: 'John' },
			{ name: 'Count', value: 'count', default: 10 },
			{ name: 'Flag', value: 'flag', uiName: 'flagUi', default: false }
		],
		parsers: {
			name: (value: unknown): string => `name:${String(value)}`,
			count: (value: unknown): string => `cnt:${String(value)}`
		}
	});

	const makeValueConfig = () => ({
		prefix: 'vp',
		locale: 'command.testValue',
		keys: [{ name: 'X', value: 'x', default: 0 }],
		parseValue: (key: string, value: unknown): string => `parse:${key}:${String(value)}`
	});

	const makeOpenSaveConfig = () => ({
		prefix: 'os',
		locale: 'command.testOpenSave',
		keys: [
			{ name: 'Effect', value: 'effect', default: 'none' },
			{ name: 'Color', value: 'color', default: 0 }
		],
		openData: (defaults: Record<string, unknown>, key: string, value: unknown) => {
			if (key === 'effect') {
				defaults.effectType = (value as { type: string }).type;
			} else {
				defaults[key] = value;
			}
		},
		saveData: (key: string, read: (k: string) => unknown) => {
			if (key === 'effect') return { type: read('effectType') };
			return read(key);
		}
	});

	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.removeTextTags!).mockClear();
	});

	it('生成对象接口完整：initialize/parse/open/save/confirm/form/target', () => {
		const win = createPropertyWindow(makeConfig());
		expect(win.target).toBeNull();
		expect(win.form).toBeDefined();
		expect(win.initialize).toEqual(expect.any(Function));
		expect(win.parse).toEqual(expect.any(Function));
		expect(win.open).toEqual(expect.any(Function));
		expect(win.save).toEqual(expect.any(Function));
		expect(win.confirm).toEqual(expect.any(Function));
	});

	it('open(data) 用 defaults+数据覆盖 form 并携带 key', () => {
		const win = createPropertyWindow(makeConfig());
		win.open!({ key: 'count', value: 42 });
		expect(Window.open).toHaveBeenCalledWith('tp-property');
		expect(win.form).toEqual(
			expect.objectContaining({
				key: 'count',
				name: 'John',
				count: 42,
				flagUi: false
			})
		);
	});

	it('open 无 data 时使用第一个 key 的默认值', () => {
		const win = createPropertyWindow(makeConfig());
		win.open!();
		expect(win.form).toEqual(
			expect.objectContaining({
				key: 'name',
				name: 'John',
				count: 10,
				flagUi: false
			})
		);
	});

	it('openData 路径：通过 openData 改写 defaults', () => {
		const win = createPropertyWindow(makeOpenSaveConfig());
		win.open!({ key: 'effect', value: { type: 'shadow' } });
		expect(win.form).toEqual(
			expect.objectContaining({
				key: 'effect',
				effectType: 'shadow'
			})
		);
	});

	it('save() 读取 form 并返回 { key, value }，关闭窗口', () => {
		const win = createPropertyWindow(makeConfig());
		win.open!({ key: 'count', value: 42 });
		expect(win.save!()).toEqual({ key: 'count', value: 42 });
		expect(Window.close).toHaveBeenCalledWith('tp-property');
	});

	it('saveData 路径：save 经 saveData 返回结构化值', () => {
		const win = createPropertyWindow(makeOpenSaveConfig());
		win.open!({ key: 'effect', value: { type: 'shadow' } });
		win.form.effectType = 'stroke';
		expect(win.save!()).toEqual({ key: 'effect', value: { type: 'stroke' } });
	});

	it('confirm() 调用 target.save 并返回其值', () => {
		const win = createPropertyWindow(makeConfig());
		const target = { save: vi.fn(() => ({ key: 'count', value: 99 })) };
		win.target = target as never;
		expect(win.confirm!(new Event('click'))).toEqual({ key: 'count', value: 99 });
		expect(target.save).toHaveBeenCalledTimes(1);
	});

	it('parse 命中 parsers 时直接返回 parser 渲染结果', () => {
		const win = createPropertyWindow(makeConfig());
		expect(win.parse!({ key: 'name', value: 'abc' })).toBe('name:abc');
		expect(win.parse!({ key: 'count', value: 7 })).toBe('cnt:7');
	});

	it('parse 未命中 parsers 用 parseValue 渲染 name(param)', () => {
		const win = createPropertyWindow(makeValueConfig());
		expect(win.parse!({ key: 'x', value: 5 })).toBe('x(parse:x:5)');
	});

	it('parse listData=true 时经 Command.removeTextTags 清理', () => {
		const win = createPropertyWindow(makeValueConfig());
		expect(win.parse!({ key: 'x', value: 5 }, true)).toBe('<clean:x(parse:x:5)>');
		expect(Command.removeTextTags).toHaveBeenCalledWith('x(parse:x:5)');
	});

	it('parse parser 接收 get 与 name', () => {
		const win = createPropertyWindow({
			prefix: 'pg',
			locale: 'command.testPg',
			keys: [{ name: 'Effect', value: 'effect', default: 'none' }],
			parsers: {
				effect: (value: unknown, get: (key: string) => string, name: string): string =>
					`${name}|${get('effect.xx')}|${String(value)}`
			}
		});
		expect(win.parse!({ key: 'effect', value: 'shadow' })).toBe('effect|effect.xx|shadow');
	});

	it('initialize 无对应 DOM 元素时安全返回', () => {
		const win = createPropertyWindow(makeConfig());
		expect(() => win.initialize!()).not.toThrow();
	});
});

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

describe('WindowProperty（set-window 属性窗口）', () => {
	beforeEach(() => {
		vi.mocked(Window.open!).mockClear();
		vi.mocked(Window.close!).mockClear();
		vi.mocked(Command.parseVariableNumber!).mockClear();
	});

	it('open 写入数据并保留默认值', () => {
		WindowProperty.open!({ key: 'gridWidth', value: 8 });
		expect(Window.open).toHaveBeenCalledWith('setWindow-property');
		expect(WindowProperty.form).toEqual(
			expect.objectContaining({
				key: 'gridWidth',
				scrollX: 0,
				scrollY: 0,
				gridWidth: 8,
				gridHeight: 0,
				gridGapX: 0,
				gridGapY: 0,
				paddingX: 0,
				paddingY: 0
			})
		);
	});

	it('save 直接读回 form 值', () => {
		WindowProperty.open!({ key: 'paddingX', value: 4 });
		WindowProperty.form.paddingX = 12;
		expect(WindowProperty.save!()).toEqual({ key: 'paddingX', value: 12 });
		expect(Window.close).toHaveBeenCalledWith('setWindow-property');
	});

	it('parse 各 key 经 parseVariableNumber 渲染 name(param)', () => {
		expect(WindowProperty.parse!({ key: 'scrollX', value: 2 })).toBe('scrollX(<num:2>)');
		expect(WindowProperty.parse!({ key: 'gridGapY', value: 16 })).toBe('gridGapY(<num:16>)');
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(2);
		expect(Command.parseVariableNumber).toHaveBeenCalledWith(16);
	});
});
