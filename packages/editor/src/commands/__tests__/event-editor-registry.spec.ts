import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import EventWindow from '@app/components/tools/Event.vue';
import { EventEditor } from '@app/commands/event-editor.ts';
import { eventEditorEls } from '@app/commands/event-editor-initialize.ts';

/**
 * P5b 批次 2 回归：事件编辑器窗口不再用 `$('#id')` 查 DOM，而由 `Event.vue` 在模板里
 * 通过 `registryRef(eventEditorEls, id)` 登记元素，`event-editor-*` 模块从注册表取。
 * 本用例锁住「登记 → ensureDomBound 绑定」这条链路（此前无覆盖）。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const REGISTERED_IDS = [
	'event',
	'event-open-list',
	'event-commands',
	'event-commands-fieldset',
	'event-commands-gutter-outer',
	'event-commands-gutter-inner',
	'event-type'
];

describe('事件编辑器元素注册表（P5b 批次 2）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		EventEditor.list = undefined as unknown as typeof EventEditor.list;
		EventEditor.commandList = undefined as unknown as typeof EventEditor.commandList;
		EventEditor._initialized = false;
		eventEditorEls.clear();
	});

	it('Event.vue 登记 7 个元素（元素本身，且 id 与注册键一致）', async () => {
		const wrapper = mount(EventWindow, { attachTo: document.body });
		await nextTick();

		for (const id of REGISTERED_IDS) {
			const element = eventEditorEls.get(id);
			expect(element, `注册表缺少 ${id}`).toBeInstanceOf(HTMLElement);
			expect(element?.id, `${id} 的元素 id 不一致`).toBe(id);
		}

		wrapper.unmount();
	});

	it('initialize 从注册表绑定 list / commandList / 两侧 gutter', async () => {
		const wrapper = mount(EventWindow, { attachTo: document.body });
		await nextTick();

		// initialize 会挂这些处理器（正常启动时由其它模块赋值），用例里补桩以便走到绑定段
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
