import { beforeEach, describe, expect, it, vi } from 'vitest';

const localizedOptions = vi.fn();

vi.mock('@app/composables/useLocalizedOptions', () => ({
	useLocalizedOptions: (...args: unknown[]) => localizedOptions(...args)
}));

import { setupSetStringFields, type SetStringFieldTable } from '../useSetStringFields';

/** 假控件：只记录被调用的装配动作。 */
function makeControl() {
	return { loadItems: vi.fn(), enableHiddenMode: vi.fn(), relate: vi.fn() };
}

function makeFields(ids: string[]): {
	fields: SetStringFieldTable;
	controls: ReturnType<typeof makeControl>[];
} {
	const controls = ids.map(() => makeControl());
	const fields: SetStringFieldTable = {};
	ids.forEach((id, index) => {
		fields[id] = controls[index];
	});
	return { fields, controls };
}

describe('setupSetStringFields（控件表入参：函数本身不寻址）', () => {
	beforeEach(() => {
		localizedOptions.mockClear();
	});

	it('空表不抛错（懒挂载窗口首帧就是这样）', () => {
		expect(() => setupSetStringFields({})).not.toThrow();
	});

	it('联动只挂在「有控件的」那几组上：operand-type 的 relate 收到全部 case', () => {
		const { fields, controls } = makeFields([
			'setString-operation',
			'setString-operand-type',
			'setString-operand-common-value',
			'setString-operand-common-variable'
		]);
		setupSetStringFields(fields);
		const relate = controls[1].relate;
		expect(relate).toHaveBeenCalledTimes(1);
		const entries = relate.mock.calls[0][0] as Array<{ case: unknown; targets: unknown[] }>;
		expect(entries.map((entry) => entry.case)).toEqual(
			expect.arrayContaining([
				'constant',
				'variable',
				'object',
				'element',
				'list',
				'script',
				'other'
			])
		);
		// targets 是 DOM 语义：没有根元素的假控件进来是 null，不该被过滤掉或抛错
		expect(entries.every((entry) => Array.isArray(entry.targets))).toBe(true);
	});

	it('下拉候选项经 useLocalizedOptions 灌到对应控件（不是走注册表）', () => {
		const { fields, controls } = makeFields(['setString-operation']);
		setupSetStringFields(fields);
		expect(localizedOptions).toHaveBeenCalledWith(
			'setString-operation',
			['set', 'add'],
			expect.any(Function)
		);
		const load = localizedOptions.mock.calls[0][2] as (items: unknown[]) => void;
		load(['a']);
		expect(controls[0].loadItems).toHaveBeenCalledWith(['a']);
	});
});
