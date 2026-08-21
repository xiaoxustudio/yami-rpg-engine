import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import RegisterEventWindow from '@app/components/commands/RegisterEvent.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
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

const mockEventTypes = (): void => {
	Enum.getMergedItems = vi.fn(() => [
		{ name: 'Key Down', value: 'keydown' },
		{ name: 'Key Up', value: 'keyup' }
	]) as never;
	EventEditor.types = {
		all: [{ name: 'Autorun', value: 'autorun' }]
	} as never;
};

describe('useRegisterEventCommandSchema (registerEvent target/operation linkage + insert/edit/save paths)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		mockEventTypes();
	});

	const mountWindow = async () => {
		const wrapper = mount(RegisterEventWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('insert path: CommandSchema.insert opens registerEvent window and loads default form', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'registerEvent');
		expect(Window.open).toHaveBeenCalledWith('registerEvent');
		expect(getControl('registerEvent-target').read()).toBe('global');
		expect(getControl('registerEvent-operation').read()).toBe('register');
		expect(getControl('registerEvent-type').read()).toBe('autorun');
		wrapper.unmount();
	});

	it('targetWrite/operationWrite/typeWrite linkage: type items per target, priority enabled for key events', async () => {
		const wrapper = await mountWindow();
		Command.cases.registerEvent.targetWrite!({ value: 'global' });
		const type = document.getElementById('registerEvent-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(type.dataItems).toHaveLength(2);
		expect(getControl('registerEvent-type').read()).toBe('keydown');
		Command.cases.registerEvent.customLoad!({
			target: 'global',
			operation: 'register',
			type: 'keydown',
			priority: true,
			namespace: true,
			tag: 'tag1',
			commands: [{ id: 'comment' }]
		});
		await wrapper.vm.$nextTick();
		Command.cases.registerEvent.operationWrite!();
		Command.cases.registerEvent.typeWrite!();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.registerEvent.save!();
		expect(saved).toHaveBeenCalledWith({
			target: 'global',
			operation: 'register',
			type: 'keydown',
			priority: true,
			namespace: true,
			tag: 'tag1',
			commands: [{ id: 'comment' }]
		});
		wrapper.unmount();
	});

	it('edit path: CommandSchema.edit maps params to form, actor branch saves without namespace', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.edit(target, {
			id: 'registerEvent',
			params: {
				target: 'actor',
				actor: { type: 'player' },
				operation: 'unregister',
				type: 'keydown'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('registerEvent');
		expect(getControl('registerEvent-actor').read()).toEqual({ type: 'player' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.registerEvent.save!();
		expect(saved).toHaveBeenCalledWith({
			target: 'actor',
			actor: { type: 'player' },
			operation: 'unregister',
			type: 'keydown'
		});
		wrapper.unmount();
	});

	it('save validation: global/unregister with empty tag does not save, reset saves directly', async () => {
		const wrapper = await mountWindow();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.registerEvent.customLoad!({
			target: 'global',
			operation: 'unregister',
			tag: '   '
		});
		await wrapper.vm.$nextTick();
		Command.cases.registerEvent.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.registerEvent.customLoad!({
			target: 'global',
			operation: 'reset'
		});
		await wrapper.vm.$nextTick();
		Command.cases.registerEvent.save!();
		expect(saved).toHaveBeenCalledWith({ target: 'global', operation: 'reset' });
		wrapper.unmount();
	});
});
