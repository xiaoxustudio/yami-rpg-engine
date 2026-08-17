import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import StopEvent from '@app/components/commands/StopEvent.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
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

describe('useStopEventCommandSchema（stopEvent 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getMergedItems = vi.fn((source: unknown, group: string) => [
			{ name: group, value: group + '-type1' }
		]) as never;
		EventEditor.types = { actor: { autorun: {} } } as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 type 选项', async () => {
		const wrapper = mount(StopEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('stopEvent-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(type.dataItems).toHaveLength(10);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(StopEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'stopEvent');
		expect(Window.open).toHaveBeenCalledWith('stopEvent');
		expect(getControl('stopEvent-type').read()).toBe('current');
		expect(getControl('stopEvent-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('stopEvent-eventId').read()).toBe('');
		expect(getControl('stopEvent-eventType').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(StopEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'stopEvent',
			params: {
				type: 'global',
				eventId: 'event1'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('stopEvent');
		expect(getControl('stopEvent-type').read()).toBe('global');
		expect(getControl('stopEvent-eventId').read()).toBe('event1');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.stopEvent.save 保存', async () => {
		const wrapper = mount(StopEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.stopEvent.customLoad!({
			type: 'current'
		});
		getControl('stopEvent-type').input('scene');
		getControl('stopEvent-eventType').input('scene-type1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.stopEvent.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'scene',
			eventType: 'scene-type1'
		});
		wrapper.unmount();
	});

	it('save 路径：global 空 eventId 校验失败不保存', async () => {
		const wrapper = mount(StopEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.stopEvent.customLoad!({
			type: 'global',
			eventId: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.stopEvent.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('type write 时按类型加载 eventType 选项并写入首个', async () => {
		const wrapper = mount(StopEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		getControl('stopEvent-type').write('actor');
		expect(getControl('stopEvent-eventType').read()).toBe('actor-event-type1');
		wrapper.unmount();
	});
});
