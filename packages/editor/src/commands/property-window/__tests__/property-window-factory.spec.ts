import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPropertyWindow } from '../property-window-factory.ts';
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
		parseVariableTemplate: vi.fn((value: unknown) => `<tmpl:${value}>`),
		parseVariableString: vi.fn((value: unknown) => `<str:${value}>`),
		parseVariableNumber: vi.fn((value: unknown) => `<num:${value}>`),
		setNumberColor: vi.fn((value: unknown) => `<num:${value}>`),
		setStringColor: vi.fn((value: unknown) => `<str:${value}>`),
		parseHexColor: vi.fn((value: unknown) => `<hex:${value}>`),
		parseBlend: vi.fn((value: unknown) => `<blend:${value}>`),
		parseFileName: vi.fn((value: unknown) => `<file:${value}>`),
		removeTextTags: vi.fn((value: string) => `<clean:${value}>`)
	},
	commandState: {}
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: { open: vi.fn(), close: vi.fn() }
}));

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

describe('createPropertyWindow（属性窗口工厂核心契约）', () => {
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
