import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CastSkill from '@app/components/commands/CastSkill.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { useCastSkillCommandSchema } from '@app/composables/commands/useCastSkillCommandSchema';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useCastSkillCommandSchema（castSkill 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getStringItems = vi.fn(() => [{ name: 'Key 1', value: 'key1' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'key1') as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	const mountWindow = async () => {
		const wrapper = mount(CastSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted loadItems 填充 mode/wait 选项', async () => {
		const wrapper = await mountWindow();
		const mode = document.getElementById('castSkill-mode') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('castSkill-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(mode.dataItems).toHaveLength(4);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useCastSkillCommandSchema();
		CommandSchema.insert(target, 'castSkill');
		expect(Window.open).toHaveBeenCalledWith('castSkill');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.mode).toBe('by-key');
		expect(form.key).toBe('key1');
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useCastSkillCommandSchema();
		CommandSchema.edit(target, {
			id: 'castSkill',
			params: {
				actor: { type: 'player' },
				mode: 'by-variable',
				keyVar: 'var1',
				wait: true
			}
		});
		expect(Window.open).toHaveBeenCalledWith('castSkill');
		expect(form.mode).toBe('by-variable');
		expect(form.keyVar).toBe('var1');
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.castSkill.save 保存', async () => {
		const wrapper = await mountWindow();
		const { form } = useCastSkillCommandSchema();
		Command.cases.castSkill.customLoad!({
			actor: { type: 'trigger' },
			mode: 'by-key',
			key: 'key1',
			wait: false
		});
		form.mode = 'by-skill';
		form.skill = { type: 'skill' };
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.castSkill.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			mode: 'by-skill',
			skill: { type: 'skill' },
			wait: true
		});
		wrapper.unmount();
	});
});
