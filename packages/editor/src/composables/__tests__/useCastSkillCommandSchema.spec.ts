import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CastSkill from '@app/components/commands/CastSkill.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

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

	it('onMounted loadItems 填充 mode/wait 选项', async () => {
		const wrapper = mount(CastSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
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

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(CastSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'castSkill');
		expect(Window.open).toHaveBeenCalledWith('castSkill');
		expect(getControl('castSkill-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('castSkill-mode').read()).toBe('by-key');
		expect(getControl('castSkill-key').read()).toBe('key1');
		expect(getControl('castSkill-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(CastSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
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
		expect(getControl('castSkill-mode').read()).toBe('by-variable');
		expect(getControl('castSkill-keyVar').read()).toBe('var1');
		expect(getControl('castSkill-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.castSkill.save 保存', async () => {
		const wrapper = mount(CastSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.castSkill.customLoad!({
			actor: { type: 'trigger' },
			mode: 'by-key',
			key: 'key1',
			wait: false
		});
		getControl('castSkill-mode').input('by-skill');
		getControl('castSkill-skill').input({ type: 'skill' });
		getControl('castSkill-wait').input(true);
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
