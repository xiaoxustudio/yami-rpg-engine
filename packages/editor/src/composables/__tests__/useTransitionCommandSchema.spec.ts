import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TransitionWindow from '@app/components/commands/Transition.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
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

describe('useTransitionCommandSchema (transition command insert/edit/save paths)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Data.easings = [{ id: 'ease0' }, { id: 'ease1' }] as never;
		Data.createEasingItems = vi.fn(() => [
			{ name: 'Ease 0', value: 'ease0' },
			{ name: 'Ease 1', value: 'ease1' }
		]) as never;
	});

	const mountWindow = async () => {
		const wrapper = mount(TransitionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('insert path: CommandSchema.insert opens transition window and loads default form', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'transition');
		expect(Window.open).toHaveBeenCalledWith('transition');
		expect(getControl('transition-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('transition-start').read()).toBe(0);
		expect(getControl('transition-end').read()).toBe(1);
		expect(getControl('transition-easingId').read()).toBe('ease0');
		expect(getControl('transition-duration').read()).toBe(1000);
		wrapper.unmount();
	});

	it('edit path: CommandSchema.edit maps params to form, customSave saves with commands', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.edit(target, {
			id: 'transition',
			params: {
				variable: { type: 'local', key: 'v' },
				start: 10,
				end: 20,
				easingId: 'ease1',
				duration: 500,
				commands: [{ id: 'comment' }]
			}
		});
		expect(Window.open).toHaveBeenCalledWith('transition');
		expect(getControl('transition-variable').read()).toEqual({ type: 'local', key: 'v' });
		expect(getControl('transition-duration').read()).toBe(500);
		getControl('transition-end').write(30);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.transition.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'v' },
			start: 10,
			end: 30,
			easingId: 'ease1',
			duration: 500,
			commands: [{ id: 'comment' }]
		});
		wrapper.unmount();
	});

	it('save validation: empty variable or zero duration do not save', async () => {
		const wrapper = await mountWindow();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.transition.customLoad!({
			variable: { type: 'local', key: '' },
			start: 0,
			end: 1,
			easingId: 'ease0',
			duration: 1000
		});
		await wrapper.vm.$nextTick();
		Command.cases.transition.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.transition.customLoad!({
			variable: { type: 'local', key: 'v' },
			start: 0,
			end: 1,
			easingId: 'ease0',
			duration: 0
		});
		await wrapper.vm.$nextTick();
		Command.cases.transition.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('open loads easing items, windowClosed clears commands and easing items', async () => {
		const wrapper = await mountWindow();
		const { useTransitionCommandSchema } =
			await import('@app/composables/commands/useTransitionCommandSchema');
		const { open, windowClosed } = useTransitionCommandSchema();
		open();
		await wrapper.vm.$nextTick();
		const easing = document.getElementById('transition-easingId') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(easing.dataItems).toHaveLength(2);
		Command.cases.transition.customLoad!({
			variable: { type: 'local', key: 'v' },
			start: 0,
			end: 1,
			easingId: 'ease0',
			duration: 1000,
			commands: [{ id: 'comment' }]
		});
		await wrapper.vm.$nextTick();
		windowClosed(new Event('closed'));
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.transition.customLoad!({
			variable: { type: 'local', key: 'v' },
			start: 0,
			end: 1,
			easingId: 'ease0',
			duration: 1000
		});
		await wrapper.vm.$nextTick();
		Command.cases.transition.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'v' },
			start: 0,
			end: 1,
			easingId: 'ease0',
			duration: 1000,
			commands: []
		});
		wrapper.unmount();
	});
});
