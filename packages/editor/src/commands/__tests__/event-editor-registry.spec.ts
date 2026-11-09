import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import EventWindow from '@app/components/tools/Event.vue';
import { EventEditor } from '@app/commands/event-editor.ts';
import { eventEditorNodes } from '@app/composables/editor-window-nodes';
// 绑定方法由这两个模块挂到 EventEditor 上（应用入口按同样顺序 import）
import '@app/commands/event-editor-initialize.ts';
import '@app/commands/event-editor-commands.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const clearNodes = () => {
	for (const key of Object.keys(eventEditorNodes.ids) as Array<
		keyof typeof eventEditorNodes.ids
	>) {
		eventEditorNodes.set(key, null);
	}
};

describe('事件编辑器节点表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		EventEditor.list = undefined as unknown as typeof EventEditor.list;
		EventEditor.commandList = undefined as unknown as typeof EventEditor.commandList;
		EventEditor._initialized = false;
		clearNodes();
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

	it('initialize 从节点表绑定 list / commandList / 两侧 gutter', async () => {
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

		expect(EventEditor.list).toBe(eventEditorNodes.get('openList'));
		expect(EventEditor.commandList).toBe(eventEditorNodes.get('commands'));
		expect(EventEditor.outerGutter).toBe(eventEditorNodes.get('gutterOuter'));
		expect(EventEditor.innerGutter).toBe(eventEditorNodes.get('gutterInner'));

		wrapper.unmount();
	});

	it('initialize 之后 list 上的建项能力可用（旧代码从空注册表取 list，运行期在 createGlobalEventItem 上崩）', async () => {
		const wrapper = mount(EventWindow, { attachTo: document.body });
		await nextTick();

		EventEditor.initialize!();

		const list = EventEditor.list as unknown as {
			createLocalEventItem?: unknown;
			createGlobalEventItem?: unknown;
		};
		expect(list).toBeInstanceOf(HTMLElement);
		expect(typeof list.createLocalEventItem).toBe('function');
		expect(typeof list.createGlobalEventItem).toBe('function');

		wrapper.unmount();
	});

	it('节点表为空时（未挂载）initialize 不改动既有绑定且不抛错', () => {
		clearNodes();
		const saved = EventEditor.list;
		expect(() => EventEditor.initialize!()).not.toThrow();
		expect(EventEditor.list).toBe(saved);
	});
});
