import { beforeEach, describe, expect, it, vi } from 'vitest';

const localizedOptions = vi.fn();

vi.mock('@app/composables/useLocalizedOptions', () => ({
	useLocalizedOptions: (...args: unknown[]) => localizedOptions(...args)
}));

import { setupIfConditionFields, type FieldControl } from '../useIfConditionFields';

/** 假控件：只记录被调用的装配动作。 */
function makeControl<T extends FieldControl>(extra: Partial<T> = {}) {
	const relate = vi.fn();
	const control = {
		loadItems: vi.fn(),
		enableHiddenMode: vi.fn(() => ({ relate })),
		root: null,
		on: vi.fn(),
		...extra
	} as unknown as FieldControl & { on: unknown };
	return { control, relate };
}

describe('setupIfConditionFields（元素契约：控件表是入参，函数本身不寻址）', () => {
	beforeEach(() => {
		localizedOptions.mockClear();
	});

	it('缺 if-condition-type 控件时整体跳过，且不抛错', () => {
		expect(() => setupIfConditionFields({})).not.toThrow();
		expect(localizedOptions).not.toHaveBeenCalled();
	});

	it('type 控件：灌入 11 种条件类型', () => {
		const { control } = makeControl({});
		setupIfConditionFields({ 'if-condition-type': control });

		const items = (control.loadItems as unknown as { mock: { calls: unknown[][] } }).mock
			.calls[0][0] as { value: string }[];
		expect(items).toHaveLength(11);
		expect(items.map((item) => item.value)).toEqual([
			'boolean',
			'number',
			'string',
			'object',
			'actor',
			'element',
			'keyboard',
			'gamepad',
			'mouse',
			'list',
			'other'
		]);
	});

	it('隐藏行关系按条件类型分组（缺控件时目标为 undefined，不炸）', () => {
		const { control, relate } = makeControl({});
		setupIfConditionFields({ 'if-condition-type': control });

		expect(control.enableHiddenMode).toHaveBeenCalledTimes(1);
		expect(relate).toHaveBeenCalledTimes(1);
		const cases = relate.mock.calls[0][0] as { case: string; targets: unknown[] }[];
		expect(cases.map((entry) => entry.case)).toEqual([
			'boolean',
			'number',
			'string',
			'object',
			'actor',
			'element',
			'keyboard',
			'gamepad',
			'mouse',
			'list',
			'other'
		]);
		// 这一批只给了 type 控件：其它目标允许是 undefined，函数不该因此中断
		expect(cases.every((entry) => Array.isArray(entry.targets))).toBe(true);
	});

	it('本地化选项按控件 id 落到对应控件（证明入参表就是唯一寻址来源）', () => {
		const { control: typeEl } = makeControl({});
		const { control: booleanOperation } = makeControl({});
		setupIfConditionFields({
			'if-condition-type': typeEl,
			'if-condition-boolean-operation': booleanOperation
		});

		expect(localizedOptions).toHaveBeenCalled();
		const firstCall = localizedOptions.mock.calls[0] as [string, string[]];
		expect(firstCall[0]).toBe('if-condition-boolean-operation');
		expect(Array.isArray(firstCall[1])).toBe(true);
	});
});
