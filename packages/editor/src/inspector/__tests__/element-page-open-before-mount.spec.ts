import { describe, expect, it, vi } from 'vitest';

vi.unmock('@app/inspector/element-page.ts');

import { Inspector } from '@app/inspector/inspector.ts';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import '@app/inspector/element-page.ts';
import type { YamiElement } from '@app/types/element-api';

/**
 * 回归：inspector 的控件由 SFC **挂载时**登记（`element-registry.ts`），而 inspector 页面按需渲染
 * ⇒ 首次 `open()` 常常早于挂载。旧代码在那种情况下会走到
 * `this.pointerEvents.previousElementSibling`（`pointerEvents` 还是初始的 `null`）而抛
 * `Cannot read properties of null (reading 'previousElementSibling')`。
 *
 * 真机栈（2026-09-19）：`UI.listSelect → UI.setTarget → Inspector.open → UIButton.open → UIElement.open`。
 */
const makeEl = (extra: Record<string, unknown> = {}): YamiElement => {
	const el = document.createElement('div') as unknown as YamiElement & Record<string, unknown>;
	el.loadItems = () => {};
	el.bind = () => {};
	Object.assign(el, extra);
	return el;
};

const openNode = (pointerEvents: string | undefined): never =>
	({ name: 'X', pointerEvents, transform: {}, instances: {} }) as never;

describe('UIElement.open 与「控件尚未登记」', () => {
	it('控件还没登记时 open() 不抛错（旧代码正是在这里炸）', () => {
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;
		expect(() => Inspector.uiElement.open(openNode('enabled'))).not.toThrow();
	});

	it('控件登记后，重试会在下一个宏任务里把状态补齐（show/hide 生效）', async () => {
		Inspector.manager = document.createElement('div');
		const pointerEvents = makeEl();
		pointerEvents.classList.add('hidden');
		inspectorEls.set('uiElement-name', makeEl());
		inspectorEls.set('uiElement-pointerEvents', pointerEvents);
		inspectorEls.set('uiElement-general-group', makeEl());
		inspectorEls.set('uiElement-transform-group', makeEl());
		inspectorEls.set('uiElement-events-group', makeEl());
		inspectorEls.set('uiElement-scripts-group', makeEl());
		inspectorEls.set('uiElement-parameter-pane', makeEl());

		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement.pointerEvents = null;

		Inspector.uiElement.open(openNode('enabled'));
		await new Promise((r) => setTimeout(r, 0));
		await new Promise((r) => setTimeout(r, 0));

		expect(Inspector.uiElement.pointerEvents).toBe(pointerEvents);
		expect(pointerEvents.classList.contains('hidden')).toBe(false);
	});

	it('控件在首次 open 时**确实还没登记** ⇒ 必须安排重试（旧代码 `?? NaN` 让这条路径恒不执行）', async () => {
		Inspector.manager = document.createElement('div');
		inspectorEls.set('uiElement-name', null);
		inspectorEls.set('uiElement-pointerEvents', null);
		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement._openRetry = undefined;
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;

		Inspector.uiElement.open(openNode('enabled'));

		expect(Inspector.uiElement._openRetry).toBe(1);

		const pointerEvents = makeEl();
		pointerEvents.classList.add('hidden');
		inspectorEls.set('uiElement-name', makeEl());
		inspectorEls.set('uiElement-pointerEvents', pointerEvents);
		inspectorEls.set('uiElement-general-group', makeEl());
		inspectorEls.set('uiElement-transform-group', makeEl());
		inspectorEls.set('uiElement-events-group', makeEl());
		inspectorEls.set('uiElement-scripts-group', makeEl());
		inspectorEls.set('uiElement-parameter-pane', makeEl());

		await new Promise((r) => setTimeout(r, 0));
		await new Promise((r) => setTimeout(r, 0));

		expect(Inspector.uiElement.pointerEvents).toBe(pointerEvents);
		expect(pointerEvents.classList.contains('hidden')).toBe(false);
	});
});
