import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import EventWindow from '@app/components/tools/Event.vue';
import { EventEditor } from '@app/commands/event-editor.ts';
import { eventEditorEls } from '@app/commands/event-editor-initialize.ts';
import { eventEditorNodes } from '@app/composables/editor-window-nodes';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('事件编辑器元素注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		EventEditor.list = undefined as unknown as typeof EventEditor.list;
		EventEditor.commandList = undefined as unknown as typeof EventEditor.commandList;
		EventEditor._initialized = false;
		eventEditorEls.clear();
	});

	it('Event.vue 把 7 个元素交出到 eventEditorNodes（键的 id 与元素 id 一致）', async () => {
		const wrapper = mount(EventWindow, { attachTo: document.body });
		await nextTick();

		const missing: string[] = [];
		const mismatched: string[] = [];
		for (const key of Object.keys(eventEditorNodes.ids) as Array<
			keyof typeof eventEditorNodes.ids
		>) {
			const element = eventEditorNodes.get(key);
			const id = eventEditorNodes.ids[key];
			if (!(element instanceof HTMLElement)) {
				missing.push(id);
				continue;
			}
			if (element.id !== id) mismatched.push(`${id} → ${element.id}`);
		}
		expect({ missing, mismatched }).toEqual({ missing: [], mismatched: [] });

		wrapper.unmount();
	});

	it('initialize 从注册表绑定 list / commandList / 两侧 gutter', async () => {
		const wrapper = mount(EventWindow, { attachTo: document.body });
		await nextTick();

		const handlers = [
			'windowLocalize',
			'windowClose',
			'windowClosed',
			'windowResize',
			'listPointerdown',
			'listSelect',
			'listPopup',
			'typeInput',
			'commandListChange',
			'commandListUpdate',
			'commandListScroll'
		] as const;
		for (const name of handlers) {
			(EventEditor as unknown as Record<string, unknown>)[name] = vi.fn();
		}

		EventEditor.initialize!();

		expect(EventEditor.list).toBe(eventEditorEls.get('event-open-list'));
		expect(EventEditor.commandList).toBe(eventEditorEls.get('event-commands'));
		expect(EventEditor.outerGutter).toBe(eventEditorEls.get('event-commands-gutter-outer'));
		expect(EventEditor.innerGutter).toBe(eventEditorEls.get('event-commands-gutter-inner'));

		wrapper.unmount();
	});

	it('注册表为空时（未挂载）initialize 不改动既有绑定且不抛错', () => {
		eventEditorEls.clear();
		const saved = EventEditor.list;
		expect(() => EventEditor.initialize!()).not.toThrow();
		expect(EventEditor.list).toBe(saved);
	});
});
