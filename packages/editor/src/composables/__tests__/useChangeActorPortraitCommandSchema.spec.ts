import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorPortrait from '@app/components/commands/ChangeActorPortrait.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

describe('useChangeActorPortraitCommandSchema（changeActorPortrait 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 mode 选项', async () => {
		const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const mode = document.getElementById('changeActorPortrait-mode') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(mode.dataItems).toHaveLength(3);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'changeActorPortrait');
		expect(Window.open).toHaveBeenCalledWith('changeActorPortrait');
		expect(getControl('changeActorPortrait-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorPortrait-mode').read()).toBe('full');
		expect(getControl('changeActorPortrait-portrait').read()).toBe('');
		expect(getControl('changeActorPortrait-clip').read()).toEqual([0, 0, 64, 64]);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'changeActorPortrait',
			params: {
				actor: { type: 'player' },
				mode: 'portrait',
				portrait: 'portrait1'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorPortrait');
		expect(getControl('changeActorPortrait-mode').read()).toBe('portrait');
		expect(getControl('changeActorPortrait-portrait').read()).toBe('portrait1');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.changeActorPortrait.save 保存', async () => {
		const wrapper = mount(ChangeActorPortrait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorPortrait.customLoad!({
			actor: { type: 'trigger' },
			mode: 'full',
			portrait: '',
			clip: [0, 0, 64, 64]
		});
		getControl('changeActorPortrait-mode').input('clip');
		getControl('changeActorPortrait-clip').input([10, 20, 30, 40]);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorPortrait.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			mode: 'clip',
			clip: [10, 20, 30, 40]
		});
		wrapper.unmount();
	});
});
