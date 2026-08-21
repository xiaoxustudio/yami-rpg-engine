import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import JumpToWindow from '@app/components/commands/JumpTo.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

describe('useJumpToCommandSchema (jumpTo command insert/edit/save paths and label suggestions)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	const mountWindow = async () => {
		const wrapper = mount(JumpToWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('insert path: CommandSchema.insert opens jumpTo window and loads default form', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'jumpTo');
		expect(Window.open).toHaveBeenCalledWith('jumpTo');
		expect(getControl('jumpTo-operation').read()).toBe('jump');
		expect(getControl('jumpTo-label').read()).toBe('');
		wrapper.unmount();
	});

	it('edit path: CommandSchema.edit maps params to form, save-jump saves with label', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.edit(target, {
			id: 'jumpTo',
			params: { operation: 'save-jump', label: 'boss' }
		});
		expect(Window.open).toHaveBeenCalledWith('jumpTo');
		expect(getControl('jumpTo-operation').read()).toBe('save-jump');
		expect(getControl('jumpTo-label').read()).toBe('boss');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.jumpTo.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'save-jump', label: 'boss' });
		wrapper.unmount();
	});

	it('save validation: jump with empty label does not save, return saves directly', async () => {
		const wrapper = await mountWindow();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.jumpTo.customLoad!({ operation: 'jump', label: '  ' });
		await wrapper.vm.$nextTick();
		Command.cases.jumpTo.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.jumpTo.customLoad!({ operation: 'return', label: '' });
		await wrapper.vm.$nextTick();
		Command.cases.jumpTo.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'return' });
		wrapper.unmount();
	});

	it('loadLabels collects label commands from the event list and sorts by name', async () => {
		const wrapper = await mountWindow();
		const { useJumpToCommandSchema } =
			await import('@app/composables/commands/useJumpToCommandSchema');
		const { loadLabels } = useJumpToCommandSchema();
		Command.forEachCommand = ((
			commands: unknown,
			fn: (command: { id: string; params: { name: string } }) => void
		) => {
			for (const command of commands as Array<{ id: string; params: { name: string } }>) {
				fn(command);
			}
		}) as never;
		EventEditor.commandList = {
			read: () => [
				{ id: 'label', params: { name: 'boss' } },
				{ id: 'comment', params: {} },
				{ id: 'label', params: { name: 'start' } }
			]
		} as never;
		expect(loadLabels()).toEqual([
			{ name: 'boss', icon: 'icon-label' },
			{ name: 'start', icon: 'icon-label' }
		]);
		wrapper.unmount();
	});
});
