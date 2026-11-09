import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPageManagerElement } from '@ui-kit';

vi.unmock('@app/inspector/element-page.ts');

import { Inspector } from '@app/inspector/inspector.ts';
import { inspectorPageSync } from '@app/composables/inspector-page-sync';
import {
	provideUiElementControls,
	type UiElementControlTable
} from '@app/composables/ui-element-page-controls';
import '@app/inspector/element-page.ts';
import type { YamiElement } from '@app/types/element-api';

/**
 * 回归：inspector 的控件由 SFC **挂载时**登记（`element-registry.ts`），而 inspector 页面按需渲染
 * ⇒ 首次 `open()` 常常早于挂载。
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
	let controls: UiElementControlTable = {};

	beforeEach(() => {
		controls = {};
		// 每个用例都换一张空表并登记给单例，避免上一条用例的键残留
		provideUiElementControls(controls);
	});

	it('控件还没登记时 open() 不抛错（旧代码正是在这里炸）', () => {
		provideUiElementControls(controls);
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;
		expect(() => Inspector.uiElement.open(openNode('enabled'))).not.toThrow();
	});

	it('控件登记后，重试会在下一个宏任务里把状态补齐（show/hide 生效）', async () => {
		Inspector.manager = document.createElement('div');
		const pointerEvents = makeEl();
		pointerEvents.classList.add('hidden');
		controls['uiElement-name'] = makeEl() as never;
		controls['uiElement-pointerEvents'] = pointerEvents as never;
		controls['uiElement-general-group'] = makeEl() as never;
		controls['uiElement-transform-group'] = makeEl() as never;
		controls['uiElement-events-group'] = makeEl() as never;
		controls['uiElement-scripts-group'] = makeEl() as never;
		controls['uiElement-parameter-pane'] = makeEl() as never;

		provideUiElementControls(controls);
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
		controls['uiElement-name'] = null as never;
		controls['uiElement-pointerEvents'] = null as never;
		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement._openRetry = undefined;
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;

		Inspector.uiElement.open(openNode('enabled'));

		expect(Inspector.uiElement._openRetry).toBe(1);

		const pointerEvents = makeEl();
		pointerEvents.classList.add('hidden');
		controls['uiElement-name'] = makeEl() as never;
		controls['uiElement-pointerEvents'] = pointerEvents as never;
		controls['uiElement-general-group'] = makeEl() as never;
		controls['uiElement-transform-group'] = makeEl() as never;
		controls['uiElement-events-group'] = makeEl() as never;
		controls['uiElement-scripts-group'] = makeEl() as never;
		controls['uiElement-parameter-pane'] = makeEl() as never;

		await new Promise((r) => setTimeout(r, 0));
		await new Promise((r) => setTimeout(r, 0));

		expect(Inspector.uiElement.pointerEvents).toBe(pointerEvents);
		expect(pointerEvents.classList.contains('hidden')).toBe(false);
	});

	it('open() 通过页桥触发 sync：UI 元素切换后属性页跟着刷新', () => {
		Inspector.manager = document.createElement('div');
		const pageSync = { sync: vi.fn() };
		inspectorPageSync.uiImage.provide(pageSync);

		for (const id of [
			'uiElement-name',
			'uiElement-pointerEvents',
			'uiElement-general-group',
			'uiElement-transform-group',
			'uiElement-events-group',
			'uiElement-scripts-group',
			'uiElement-parameter-pane'
		]) {
			controls[id] = makeEl() as never;
		}
		provideUiElementControls(controls);
		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;
		Inspector.uiElement._openRetry = undefined;

		Inspector.uiElement.open(openNode('enabled'));

		expect(pageSync.sync).toHaveBeenCalledTimes(1);
		inspectorPageSync.uiImage.reset(pageSync);
	});

	it('首次 open 前已经 switch 过：initialize 会把事件/脚本/参数分组搬进当前页', () => {
		const manager = createPageManagerElement();
		const imagePage = document.createElement('div');
		imagePage.className = 'page-frame';
		imagePage.setAttribute('value', 'uiImage');
		const windowPage = document.createElement('div');
		windowPage.className = 'page-frame';
		windowPage.setAttribute('value', 'uiWindow');
		manager.append(imagePage, windowPage);
		Inspector.manager = manager as never;

		const eventsGroup = makeEl();
		const scriptsGroup = makeEl();
		const parameterPane = makeEl();
		const generalGroup = makeEl();
		const transformGroup = makeEl();
		imagePage.append(eventsGroup, scriptsGroup, parameterPane, generalGroup, transformGroup);

		controls['uiElement-name'] = makeEl() as never;
		controls['uiElement-pointerEvents'] = makeEl() as never;
		controls['uiElement-general-group'] = generalGroup as never;
		controls['uiElement-transform-group'] = transformGroup as never;
		controls['uiElement-events-group'] = eventsGroup as never;
		controls['uiElement-scripts-group'] = scriptsGroup as never;
		controls['uiElement-parameter-pane'] = parameterPane as never;
		controls['uiElement-events'] = makeEl() as never;
		controls['uiElement-scripts'] = makeEl() as never;

		Inspector.uiElement._elementInitialized = false;
		Inspector.uiElement.pointerEvents = null;
		Inspector.uiElement.target = null;
		Inspector.uiElement._openRetry = undefined;

		// 真机顺序：`Inspector.open` 先 manager.switch(type)，这时 UIElement 还没注册 switch 监听
		manager.switch('uiWindow');
		Inspector.type = 'uiWindow';

		Inspector.uiElement.open(openNode('enabled'));

		expect(windowPage.contains(eventsGroup)).toBe(true);
		expect(windowPage.contains(scriptsGroup)).toBe(true);
		expect(windowPage.contains(parameterPane)).toBe(true);
	});
});
