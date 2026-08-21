import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ForEach from '@app/components/commands/ForEach.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
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

describe('useForEachCommandSchema (forEach command insert/edit/save paths)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	const mountWindow = async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('insert path: CommandSchema.insert opens forEach window and loads default form', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'forEach');
		expect(Window.open).toHaveBeenCalledWith('forEach');
		expect(getControl('forEach-data').read()).toBe('list');
		expect(getControl('forEach-variable').read()).toEqual({ type: 'local', key: '' });
		wrapper.unmount();
	});

	it('edit path: CommandSchema.edit maps params to form, customSave saves via getForm with commands', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.edit(target, {
			id: 'forEach',
			params: {
				data: 'list',
				list: { type: 'local', key: 'items' },
				variable: { type: 'local', key: 'item' },
				commands: [{ id: 'comment' }]
			}
		});
		expect(Window.open).toHaveBeenCalledWith('forEach');
		expect(getControl('forEach-list').read()).toEqual({ type: 'local', key: 'items' });
		expect(getControl('forEach-variable').read()).toEqual({ type: 'local', key: 'item' });
		getControl('forEach-variable').input({ type: 'local', key: 'elem' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.forEach.save!();
		expect(saved).toHaveBeenCalledWith({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'elem' },
			commands: [{ id: 'comment' }]
		});
		wrapper.unmount();
	});

	it('save data branches: attribute/enum/save/touch saved through form', async () => {
		const wrapper = await mountWindow();
		Command.cases.forEach.customLoad!({
			data: 'attribute',
			groupId: 'g1',
			variable: { type: 'local', key: 'k' }
		});
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.forEach.customSave!();
		expect(saved).toHaveBeenCalledWith({
			data: 'attribute',
			groupId: 'g1',
			variable: { type: 'local', key: 'k' },
			commands: []
		});
		Command.cases.forEach.customLoad!({
			data: 'save',
			saveIndex: { type: 'local', key: 's' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.forEach.customSave!();
		expect(saved).toHaveBeenLastCalledWith({
			data: 'save',
			saveIndex: { type: 'local', key: 's' },
			commands: []
		});
		wrapper.unmount();
	});

	it('save validation: missing variable focuses control and does not save', async () => {
		const wrapper = await mountWindow();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.forEach.customLoad!({
			data: 'member',
			variable: { type: 'local', key: '' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.forEach.customSave!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('windowClosed clears commands state', async () => {
		const wrapper = await mountWindow();
		const { useForEachCommandSchema } =
			await import('@app/composables/commands/useForEachCommandSchema');
		const { windowClosed } = useForEachCommandSchema();
		Command.cases.forEach.customLoad!({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'item' },
			commands: [{ id: 'comment' }]
		});
		await wrapper.vm.$nextTick();
		windowClosed(new Event('closed'));
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.forEach.customLoad!({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'item' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.forEach.customSave!();
		expect(saved).toHaveBeenCalledWith({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'item' },
			commands: []
		});
		wrapper.unmount();
	});
});
