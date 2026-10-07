import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CallEvent from '@app/components/commands/CallEvent.vue';
import { composableEls } from '@app/composables/element-registry';
import { Command } from '@app/commands/command-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

const gridBox = (): HTMLElement =>
	composableEls.get('callEvent')!.querySelector('.grid-box') as HTMLElement;

/** 标签元素：类名是 `text call-event-component`（输入控件只有 call-event-component） */
const labelsInGrid = (): HTMLElement[] =>
	Array.from(gridBox().querySelectorAll('.text.call-event-component')) as HTMLElement[];

const loadGlobalEvent = () => {
	Data.events = {
		evt1: {
			parameters: [
				{ type: 'string', key: 'msg', note: 'Message' },
				{ type: 'object', key: 'obj' }
			],
			returnType: 'string',
			description: ''
		}
	} as never;
	Command.cases.callEvent.customLoad!({
		type: 'global',
		eventId: 'evt1',
		eventArgs: [],
		eventResult: { type: 'string', variable: { type: 'local', key: 'r' } }
	});
};

describe('CallEvent 参数标签与显隐', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getMergedItems = vi.fn(() => [{ name: 'On Start', value: 'onStart' }]) as never;
		EventEditor.types = { all: [{ name: 'On Start', value: 'onStart' }] } as never;
	});

	it('global 事件：参数标签与返回值标签由模板节点 clone 出来并进入 grid-box', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		loadGlobalEvent();

		const labels = labelsInGrid();
		expect(labels.length).toBeGreaterThanOrEqual(3);
		const texts = labels.map((el) => el.textContent?.trim());
		expect(texts).toContain('Msg');
		expect(texts).toContain('Obj');
		for (const label of labels) {
			expect(label.classList.contains('call-event-component')).toBe(true);
			expect(label.classList.contains('text')).toBe(true);
		}
		expect(texts.filter((text) => text !== '').length).toBeGreaterThanOrEqual(2);

		wrapper.unmount();
	});

	it('grid-box 里 call-event-component 元素恰好是模块创建的那批（旧选择器口径一致）', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		loadGlobalEvent();

		const all = Array.from(
			gridBox().querySelectorAll('.call-event-component')
		) as HTMLElement[];
		expect(all.length).toBe(6);
		expect(labelsInGrid().length).toBe(3);

		wrapper.unmount();
	});
});
