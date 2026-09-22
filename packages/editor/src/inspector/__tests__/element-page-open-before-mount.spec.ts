import { describe, expect, it, vi } from 'vitest';

// `vitest.setup.ts` 把所有 legacy inspector 页面统一 mock 成空模块（避免顶层副作用覆盖各用例的
// 挂载点 mock）——但本用例要测的**正是** element-page 的真实行为，所以先解除 mock。
// `vi.unmock` 会被提升到 import 之前，这里的顺序只是给人看的。
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

		// 回到「尚未初始化」的状态，模拟首次 open 早于挂载
		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement.pointerEvents = null;

		Inspector.uiElement.open(openNode('enabled'));
		// 重试是 setTimeout(0) ⇒ 等两轮宏任务确保跑完
		await new Promise((r) => setTimeout(r, 0));
		await new Promise((r) => setTimeout(r, 0));

		expect(Inspector.uiElement.pointerEvents).toBe(pointerEvents);
		expect(pointerEvents.classList.contains('hidden')).toBe(false);
	});

	it('控件在首次 open 时**确实还没登记** ⇒ 必须安排重试（旧代码 `?? NaN` 让这条路径恒不执行）', async () => {
		Inspector.manager = document.createElement('div');
		// 关键差别：这一例里 `uiElement-name` **没有**被登记，于是 `initialize()` 在
		// `element-page.ts:114` 早退、且**不**置 `_elementInitialized`，`pointerEvents` 保持 null，
		// 首次 open 必然落进「重试」分支 —— 这正是上面第二例覆盖不到的那条路径。
		inspectorEls.set('uiElement-name', null);
		inspectorEls.set('uiElement-pointerEvents', null);
		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement._openRetry = undefined;
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;

		Inspector.uiElement.open(openNode('enabled'));

		// 旧代码：`(undefined ?? NaN) < 10` ≡ `NaN < 10` 恒假 ⇒ 一次重试都不排（读数为 undefined）。
		// 修好后：与下一行 `(this._openRetry ?? 0) + 1` 的意图一致，首次 open 就进入重试。
		expect(Inspector.uiElement._openRetry).toBe(1);

		// 控件随后登记（模拟 SFC 挂载完成），那次重试应当把状态补齐。
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
