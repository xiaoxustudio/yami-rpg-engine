import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetTarget from '@app/components/commands/GetTarget.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { useGetTargetCommandSchema } from '@app/composables/commands/useGetTargetCommandSchema';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useGetTargetCommandSchema（getTarget 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Attribute.getDefAttributeId = vi.fn(() => 'atk') as never;
		Attribute.getAttributeItems = vi.fn(() => [
			{ name: 'Attack', value: 'atk' },
			{ name: 'Defense', value: 'def' }
		]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	const mountWindow = async () => {
		const wrapper = mount(GetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted loadItems 填充 selector/condition 选项', async () => {
		const wrapper = await mountWindow();
		const selector = document.getElementById('getTarget-selector') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const condition = document.getElementById('getTarget-condition') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(selector.dataItems).toHaveLength(6);
		expect(condition.dataItems).toHaveLength(8);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetTargetCommandSchema();
		CommandSchema.insert(target, 'getTarget');
		expect(Window.open).toHaveBeenCalledWith('getTarget');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.selector).toBe('enemy');
		expect(form.condition).toBe('max-threat');
		expect(form.attribute).toBe('atk');
		expect(form.divisor).toBe('atk');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetTargetCommandSchema();
		CommandSchema.edit(target, {
			id: 'getTarget',
			params: {
				actor: { type: 'player' },
				selector: 'team',
				condition: 'max-attribute-ratio',
				attribute: 'atk',
				divisor: 'def'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('getTarget');
		expect(form.selector).toBe('team');
		expect(form.condition).toBe('max-attribute-ratio');
		expect(form.attribute).toBe('atk');
		expect(form.divisor).toBe('def');
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.getTarget.save 保存', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetTargetCommandSchema();
		Command.cases.getTarget.customLoad!({
			actor: { type: 'trigger' },
			selector: 'enemy',
			condition: 'max-threat'
		});
		form.selector = 'friend';
		form.condition = 'min-attribute-value';
		form.attribute = 'def';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getTarget.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			selector: 'friend',
			condition: 'min-attribute-value',
			attribute: 'def'
		});
		wrapper.unmount();
	});

	it('save 路径：attribute 为空校验失败不保存', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetTargetCommandSchema();
		Command.cases.getTarget.customLoad!({
			actor: { type: 'trigger' },
			selector: 'enemy',
			condition: 'max-attribute-value',
			attribute: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getTarget.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
