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

/**
 * P1b 第 7 刀回归：CallEvent 的参数标签与返回值标签
 * ① 过去是 `document.createElement('div')` + `render()` 造节点 → 现在 clone 模板节点
 *    （`callEvent-label-template`），文本用 textContent 写；
 * ② 显隐过去按类名 `document.querySelectorAll('.call-event-component')` 反查 → 现在直接从
 *    `parameters` / `eventResult` 数据面取（这些元素本来就是本模块创建的）。
 *
 * 驱动方式刻意走 **SFC 自己的实例**（`@write` → composable）：`useCallEventCommandSchema()`
 * 每次调用都会新建一份实例状态，直接调它的 `typeWrite` 会作用在空 `parameters` 上。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} })
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

describe('CallEvent 参数标签与显隐（P1b 第 7 刀）', () => {
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
		expect(labels.length).toBeGreaterThanOrEqual(3); // 两个参数 + 返回值
		const texts = labels.map((el) => el.textContent?.trim());
		expect(texts).toContain('Msg');
		expect(texts).toContain('Obj');
		// 标签是模板节点的克隆（带 text/call-event-component 类），参数标签文本非空
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

		// 2 个参数各 1 标签 + 1 输入，返回值 1 标签 + 1 输入 —— 正是旧代码
		// `querySelectorAll('.call-event-component')` 会找到的那批（显隐循环现在直接遍历这份数据）
		const all = Array.from(gridBox().querySelectorAll('.call-event-component')) as HTMLElement[];
		expect(all.length).toBe(6);
		expect(labelsInGrid().length).toBe(3);

		wrapper.unmount();
	});
});
