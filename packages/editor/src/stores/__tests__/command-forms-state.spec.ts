import { beforeEach, describe, expect, it } from 'vitest';
import { isReactive } from 'vue';
import { getCommandFormsStore } from '@app/stores/command-forms';
import { getPaletteStore } from '@app/stores/palette';
import { indexForm } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { requestKeyValueForm } from '@app/composables/commands/useRequestURLCommandSchema';
import { form as switchConditionForm } from '@app/composables/useSwitchConditionSchema';
import { FrameGenerator } from '@app/palette/tile-frame-generator.ts';

// 回归：三份「命令工具弹窗」表单 + 生成帧窗口表单，从模块级 `reactive` 升进 Pinia。
// 共同契约：调用方拿到的仍是**同一个 reactive 对象/可读写属性**，且读写都落在 store 上
// （模板 v-model 依赖前者，DevTools/隔离依赖后者）。

describe('command-forms 三份表单 → stores/commandForms', () => {
	beforeEach(() => {
		const s = getCommandFormsStore();
		s.indexForm.name = '';
		s.requestKeyValueForm.key = '';
		s.requestKeyValueForm.value = '';
		s.switchConditionForm.type = 'number';
		s.switchConditionForm.numberValue = 0;
		s.switchConditionForm.variable = { type: 'local', key: '' };
	});

	it('indexForm：v-model 写回 store', () => {
		indexForm.name = 'index-1';
		expect(getCommandFormsStore().indexForm.name).toBe('index-1');
		getCommandFormsStore().indexForm.name = 'index-2';
		expect(indexForm.name).toBe('index-2');
	});

	it('requestKeyValueForm：key/value 双向一致', () => {
		requestKeyValueForm.key = 'token';
		requestKeyValueForm.value = 'abc';
		const stored = getCommandFormsStore().requestKeyValueForm;
		expect(stored.key).toBe('token');
		expect(stored.value).toBe('abc');
	});

	it('switchConditionForm：普通字段与嵌套 variable 都落在 store 上', () => {
		switchConditionForm.type = 'variable';
		switchConditionForm.numberValue = 42;
		switchConditionForm.variable.type = 'global';

		const stored = getCommandFormsStore().switchConditionForm;
		expect(stored.type).toBe('variable');
		expect(stored.numberValue).toBe(42);
		// 嵌套对象是同一引用：就地改也能被 store 看见
		expect(stored.variable.type).toBe('global');
	});

	it('objectPropertyForm（setForm 的真源）：字段与 list 都落在 store', () => {
		const stored = getCommandFormsStore().objectPropertyForm;
		stored.variable = { type: 'global', key: 'hp' };
		stored.valueVariable = { type: 'local', key: 'x' };
		stored.list = [{ text: 'a' }];
		expect(stored.variable).toEqual({ type: 'global', key: 'hp' });
		expect(stored.valueVariable).toEqual({ type: 'local', key: 'x' });
		expect(stored.list).toEqual([{ text: 'a' }]);
		// `useGetObjectPropertyCommandSchema.ts` 的 `setForm` 是它的访问器；
		// 那条链路由既有 command-schemas 系列 spec（走 customLoad → Object.assign(setForm, …)）覆盖。
	});

	it('四份切片都是 reactive（模板 v-model 依赖深层响应性）', () => {
		const s = getCommandFormsStore();
		expect(isReactive(s.indexForm)).toBe(true);
		expect(isReactive(s.requestKeyValueForm)).toBe(true);
		expect(isReactive(s.switchConditionForm)).toBe(true);
		expect(isReactive(s.objectPropertyForm)).toBe(true);
	});
});

describe('FrameGenerator.form → stores/palette.frameGeneratorForm', () => {
	beforeEach(() => {
		FrameGenerator.form.strideX = 0;
		FrameGenerator.form.strideY = 0;
		FrameGenerator.form.count = 1;
	});

	it('FrameGenerator.form 就是 store 里那个 reactive 对象（同一引用）', () => {
		expect(FrameGenerator.form).toBe(getPaletteStore().frameGeneratorForm);
		expect(isReactive(FrameGenerator.form)).toBe(true);
	});

	it('经 FrameGenerator.form 就地改值，store 立刻可见（v-model 靠这条）', () => {
		FrameGenerator.form.strideX = 16;
		FrameGenerator.form.count = 4;
		const stored = getPaletteStore().frameGeneratorForm;
		expect(stored.strideX).toBe(16);
		expect(stored.count).toBe(4);
	});

	it('initialize 复位的是 store 里的表单', () => {
		const stored = getPaletteStore().frameGeneratorForm;
		stored.strideX = 8;
		stored.strideY = 8;
		stored.count = 3;

		FrameGenerator.initialize!();

		expect(stored.strideX).toBe(0);
		expect(stored.strideY).toBe(0);
		expect(stored.count).toBe(1);
	});
});
