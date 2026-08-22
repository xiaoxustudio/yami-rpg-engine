import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

const mockWindow = {
	initialize: vi.fn(),
	open: vi.fn(),
	isNone: vi.fn((variable: { key: string }) => variable.key === ''),
	loadPresetKeys: vi.fn(),
	checkDataForPlugin: vi.fn((data: { getter?: string }) => data?.getter === 'variable'),
	createDefaultForPlugin: vi.fn(() => ({ getter: 'variable', type: 'local', key: '' })),
	createVarListGenerator: vi.fn(),
	typeWrite: vi.fn(),
	typeInput: vi.fn(),
	confirm: vi.fn(),
	confirm2: vi.fn()
};

vi.mock('@app/composables/useVariableGetterWindow', () => ({
	useVariableGetterWindow: () => mockWindow
}));

const makeTarget = (overrides: Record<string, unknown> = {}) => ({
	filter: 'all',
	dataValue: { type: 'local', key: '' },
	input: vi.fn(),
	...overrides
});

describe('VariableGetter（变量访问器窗口转发契约）', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Window.isWindowOpen = vi.fn(() => false);
	});

	it('open 主窗口关闭时转发到 variableGetter 并传入 filter 与 prefix', () => {
		const target = makeTarget();
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'all',
			prefix: 'variableGetter'
		});
	});

	it('open 主窗口已打开时转发叠加窗口 variableGetter2', () => {
		Window.isWindowOpen = vi.fn(() => true);
		const target = makeTarget();
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'all',
			prefix: 'variableGetter2'
		});
	});

	it('open 未指定 filter 时默认为 all', () => {
		const target = makeTarget({ filter: undefined });
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'all',
			prefix: 'variableGetter'
		});
	});

	it('open 传入显式 filter 时透传', () => {
		const target = makeTarget({ filter: 'number' });
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'number',
			prefix: 'variableGetter'
		});
	});

	it('_openCore 转发 open 并透传 filter 与 prefix', () => {
		const target = makeTarget();
		VariableGetter._openCore!(target as never, 'object', 'variableGetter2');
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'object',
			prefix: 'variableGetter2'
		});
	});

	it('confirm 转发 confirm', () => {
		VariableGetter.confirm!({} as Event);
		expect(mockWindow.confirm).toHaveBeenCalled();
	});

	it('confirm2 转发 confirm2', () => {
		VariableGetter.confirm2!({} as Event);
		expect(mockWindow.confirm2).toHaveBeenCalled();
	});

	it('_confirmCore 按 prefix 转发 confirm/confirm2', () => {
		VariableGetter._confirmCore!('variableGetter2');
		expect(mockWindow.confirm2).toHaveBeenCalled();
		VariableGetter._confirmCore!('variableGetter');
		expect(mockWindow.confirm).toHaveBeenCalled();
	});

	it('initialize 转发 initialize', () => {
		VariableGetter.initialize!();
		expect(mockWindow.initialize).toHaveBeenCalled();
	});

	it('loadPresetKeys 转发 loadPresetKeys', () => {
		VariableGetter.loadPresetKeys!('number');
		expect(mockWindow.loadPresetKeys).toHaveBeenCalledWith('number');
	});

	it('isNone 透传空 key 判断', () => {
		expect(VariableGetter.isNone!({ key: '' })).toBe(true);
		expect(VariableGetter.isNone!({ key: 'v1' })).toBe(false);
		expect(mockWindow.isNone).toHaveBeenCalledWith({ key: '' });
	});

	it('checkDataForPlugin 透传 getter 判断', () => {
		expect(VariableGetter.checkDataForPlugin!({ getter: 'variable' })).toBe(true);
		expect(VariableGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(VariableGetter.createDefaultForPlugin!()).toEqual({
			getter: 'variable',
			type: 'local',
			key: ''
		});
	});

	it('typeWrite/typeInput 转发', () => {
		const ev = { value: 'actor' } as Event & { value: string };
		VariableGetter.typeWrite!(ev);
		VariableGetter.typeInput!(ev);
		expect(mockWindow.typeWrite).toHaveBeenCalledWith(ev);
		expect(mockWindow.typeInput).toHaveBeenCalledWith(ev);
	});
});
