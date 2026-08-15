import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetString from '@app/components/commands/SetString.vue';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import '@/module/command/setString.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface SetStringFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (): SetStringFrame =>
	document.getElementById('setString') as unknown as SetStringFrame;

describe('setString 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
	});

	it('窗口根元素暴露 setForm/getForm 桥接，setForm 写入控件 DOM', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({
			commonValue: 'hello',
			operation: 'add',
			operandType: 'string',
			stringMethod: 'slice',
			stringSliceBegin: 1,
			stringSliceEnd: 3,
			screenshotWidth: 640
		});
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.commonValue).toBe('hello');
		expect(form.operation).toBe('add');
		expect(form.operandType).toBe('string');
		expect(form.stringMethod).toBe('slice');
		expect(form.stringSliceBegin).toBe(1);
		expect(form.stringSliceEnd).toBe(3);
		expect(form.screenshotWidth).toBe(640);
		const textarea = document.getElementById(
			'setString-operand-common-value'
		) as unknown as HTMLElement & { read(): unknown };
		expect(textarea.read()).toBe('hello');
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（TextBox/StringVar/NumberVar）', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const scriptBox = document.getElementById(
			'setString-operand-script'
		) as unknown as HTMLElement & {
			write(value: string): void;
		};
		scriptBox.write('console.log(1)');
		const patternBox = document.getElementById(
			'setString-operand-string-replace-pattern'
		) as unknown as HTMLElement & {
			write(value: string): void;
		};
		patternBox.write('ab');
		const indexBox = document.getElementById(
			'setString-operand-string-char-index'
		) as unknown as HTMLElement & {
			write(value: number): void;
		};
		indexBox.write(7);
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.script).toBe('console.log(1)');
		expect(form.stringReplacePattern).toBe('ab');
		expect(form.stringCharIndex).toBe(7);
		wrapper.unmount();
	});

	it('SelectBox/CustomBox 值变更在 getForm 时读回（含无冒泡 change 的 CustomBox）', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const operation = document.getElementById(
			'setString-operation'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		operation.input('add');
		const commonVariable = document.getElementById(
			'setString-operand-common-variable'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		commonVariable.input({ type: 'local', key: 'myVar' });
		const commonActor = document.getElementById(
			'setString-operand-common-actor'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		commonActor.input({ type: 'trigger' });
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.operation).toBe('add');
		expect(form.commonVariable).toEqual({ type: 'local', key: 'myVar' });
		expect(form.commonActor).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('customLoad 经 setForm 填充表单，customSave 经 getForm 保存', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setString.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'add',
			operand: {
				type: 'string',
				method: 'slice',
				variable: { type: 'global', key: 'bar' },
				begin: 1,
				end: 3
			}
		});
		await wrapper.vm.$nextTick();
		const form = getFrame().getForm();
		expect(form.variable).toEqual({ type: 'local', key: 'foo' });
		expect(form.operation).toBe('add');
		expect(form.operandType).toBe('string');
		expect(form.stringMethod).toBe('slice');
		expect(form.commonVariable).toEqual({ type: 'global', key: 'bar' });
		expect(form.stringSliceBegin).toBe(1);
		expect(form.stringSliceEnd).toBe(3);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setString.customSave!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'add',
			operand: {
				type: 'string',
				method: 'slice',
				variable: { type: 'global', key: 'bar' },
				begin: 1,
				end: 3
			}
		});
		wrapper.unmount();
	});

	it('customLoad 其他数据类（screenshot/other）映射', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setString.customLoad!({
			variable: { type: 'local', key: 'ts' },
			operation: 'set',
			operand: { type: 'other', data: 'screenshot', width: 640, height: 360 }
		});
		await wrapper.vm.$nextTick();
		const form = getFrame().getForm();
		expect(form.otherData).toBe('screenshot');
		expect(form.screenshotWidth).toBe(640);
		expect(form.screenshotHeight).toBe(360);
		wrapper.unmount();
	});

	it('setForm 显式 write 触发 relate 联动（enableHiddenMode 条件显示）', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setString.initialize!();
		const frame = getFrame();
		const commonValue = document.getElementById(
			'setString-operand-common-value'
		) as HTMLElement;
		const stringMethod = document.getElementById(
			'setString-operand-string-method'
		) as HTMLElement;
		frame.setForm({ operandType: 'constant' });
		expect(commonValue.style.display).toBe('');
		expect(stringMethod.style.display).toBe('none');
		frame.setForm({ operandType: 'string', stringMethod: 'slice' });
		expect(commonValue.style.display).toBe('none');
		expect(stringMethod.style.display).toBe('');
		wrapper.unmount();
	});
});
