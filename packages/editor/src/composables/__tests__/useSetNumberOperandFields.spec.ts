import { beforeEach, describe, expect, it, vi } from 'vitest';

const localizedOptions = vi.fn();

vi.mock('@app/composables/useLocalizedOptions', () => ({
	useLocalizedOptions: (...args: unknown[]) => localizedOptions(...args)
}));

import { setupSetNumberOperandFields, type FieldControl } from '../useSetNumberOperandFields';

/** 假控件：只记录被调用的装配动作。 */
function makeControl() {
	const relate = vi.fn();
	const control = {
		loadItems: vi.fn(),
		enableHiddenMode: vi.fn(() => ({ relate })),
		restore: vi.fn(),
		root: null
	} as unknown as FieldControl;
	return { control, relate };
}

describe('setupSetNumberOperandFields（元素契约：控件表是入参，函数本身不寻址）', () => {
	beforeEach(() => {
		localizedOptions.mockClear();
	});

	it('缺 setNumber-operation 控件时整体跳过，且不抛错', () => {
		expect(() => setupSetNumberOperandFields({}, null)).not.toThrow();
		expect(localizedOptions).not.toHaveBeenCalled();
	});

	it('operation 控件：灌入 6 种运算符', () => {
		const { control } = makeControl();
		setupSetNumberOperandFields({ 'setNumber-operation': control }, null);

		const calls = (control.loadItems as unknown as { mock: { calls: unknown[][] } }).mock.calls;
		const items = calls[0][0] as { value: string }[];
		expect(items.map((item) => item.value)).toEqual(['set', 'add', 'sub', 'mul', 'div', 'mod']);
	});

	it('隐藏行关系挂在 operand-type 控件上；窗口根元素为 null 时也不炸', () => {
		const { control: op } = makeControl();
		const { control: typeControl, relate } = makeControl();
		setupSetNumberOperandFields(
			{ 'setNumber-operation': op, 'setNumber-operand-type': typeControl },
			null
		);

		expect(typeControl.enableHiddenMode).toHaveBeenCalled();
		expect(relate).toHaveBeenCalled();
	});

	it('窗口根元素存在时会挂 open / closed 两个钩子', () => {
		const { control } = makeControl();
		const frame = document.createElement('div');
		const addEventListener = vi.spyOn(frame, 'addEventListener');

		setupSetNumberOperandFields({ 'setNumber-operation': control }, frame);

		const types = addEventListener.mock.calls.map((call) => call[0]);
		expect(types).toContain('open');
		expect(types).toContain('closed');
	});
});
