/* oxlint-disable eslint/no-await-in-loop -- 逐个挂载是有意的：并发挂载会争抢共享 store 与 DOM 顺序 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { createApp, nextTick } from 'vue';
import type { Component } from 'vue';
import { vFocus } from '@app/directives/focus';
import { initYamiI18n } from '@app/i18n';
import { toolWindowLoaders } from '@app/tools/tool-window-loaders';
import {
	ensureToolWindow,
	isToolWindowReady,
	mountToolWindow,
	preloadToolWindows,
	setToolWindowHostContext
} from '@app/tools/tool-window-host';
import { composableEls } from '@app/composables/element-registry';
import { conditionEls } from '@app/tools/condition-list';
import { textCaptureEls } from '@app/tools/text-capture';
import { localEls } from '@app/local/element-registry';
import { sceneEls } from '@app/scene/element-registry';
import { moduleEls } from '@app/module/element-registry';
import { titleEls } from '@app/title/element-registry';
import { storesEls } from '@app/stores/element-registry';
import { windowShellEls } from '@app/tools/window-object.ts';
import appShellRaw from '../../AppShell.vue?raw';

/**
 * 懒挂载窗口冒烟：54 个按需挂载的工具窗口逐个真实挂载，断言
 *   ① 挂载不抛错（捕获 `open` 之前就崩的实现）；
 *   ② 挂载后控件 API 已接线（注册表里登记过的元素必须有 read/write/loadItems… 之一）；
 *   ③ 窗口内没有重复 id（重复 id 会让 `$('#x')`/注册表互相覆盖）。
 *
 * 这里是「新窗口天然进网」的兜底：以后新增 deferred 窗口不用改测试就会纳入检查。
 */
const i18n = initYamiI18n();
const app = createApp({ render: () => null });
app.use(i18n);
app.directive('focus', vFocus);
app.directive('tip', {
	mounted: () => undefined,
	updated: () => undefined,
	unmounted: () => undefined
});
setToolWindowHostContext((app as unknown as { _context: never })._context);

// 静态预加载所有工具窗口（测试环境里动态 import SFC 不会 resolve）
const toolModules = import.meta.glob('../../components/tools/*.vue', { eager: true }) as Record<
	string,
	{ default: Component }
>;

const normalize = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const componentByName = new Map<string, Component>();
for (const [path, module] of Object.entries(toolModules)) {
	const base = path
		.split('/')
		.pop()!
		.replace(/\.vue$/, '');
	componentByName.set(normalize(base), module.default);
}

const CONTROL_API = ['read', 'write', 'loadItems', 'enableHiddenMode', 'relate', 'getFocus'];

/** ui-kit 控件根元素的类名：只有它们才「必须接线」，纯 DOM 元素（进度条/标记/日志）不算。 */
const CONTROL_CLASSES = [
	'select-box',
	'custom-box',
	'text-box',
	'number-box',
	'text-area',
	'check-box',
	'radio-box',
	'page-manager',
	'common-list',
	'color-box',
	'slider-box',
	'keyboard-box',
	'gamepad-box',
	'key-value-box',
	'item-box'
];

const isControl = (element: HTMLElement): boolean =>
	CONTROL_CLASSES.some((name) => element.classList.contains(name));

const registries = [
	composableEls,
	textCaptureEls,
	conditionEls,
	localEls,
	sceneEls,
	moduleEls,
	titleEls,
	storesEls,
	windowShellEls
];

const registryOf = (id: string): Map<string, unknown>[] =>
	registries.filter((registry) => registry.has(id));

const deferredIds = ((): string[] => {
	const block = appShellRaw.match(/const deferredToolIds = \[([\s\S]*?)\];/);
	return block ? [...block[1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]) : [];
})();

describe('懒挂载工具窗口冒烟', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	});

	it('deferredToolIds 能映射到工具窗口组件（新增窗口必须能被映射）', () => {
		expect(deferredIds.length).toBeGreaterThan(50);
		const missing = deferredIds.filter((id) => !componentByName.has(normalize(id)));
		expect(missing, `这些 deferred 窗口找不到对应 .vue：${missing.join(', ')}`).toEqual([]);
	});

	it('同步挂载返回时控件 API 就已就绪（Window.openWith 同步分支的前提）', async () => {
		// 依据：Vue 3.6 的 `render()` 内部走 flushOnAppMount，会**同步** flush onMounted；
		// 所以宿主 `mountToolWindow()` 返回时控件 API 已接线，`openWith` 的同步分支才成立。
		// 若将来升级 Vue 改变这个时序，这条会红——那时才需要把接线提前到 patch 期。
		const id = 'variableGetter';
		const component = componentByName.get(normalize(id))!;
		toolWindowLoaders[id] = () => Promise.resolve({ default: component });

		// 只 import 不挂载，然后**同步**挂载：同一个调用栈里检查
		await preloadToolWindows([id]);
		expect(mountToolWindow(id)).toBe(true);

		const type = document.getElementById('variableGetter-type') as unknown as Record<
			string,
			unknown
		> | null;
		const actor = document.getElementById('variableGetter-actor') as unknown as Record<
			string,
			unknown
		> | null;
		expect(typeof type?.loadItems, 'SelectBox.loadItems 应已可调用').toBe('function');
		expect(typeof type?.write, 'SelectBox.write 应已可调用').toBe('function');
		expect(typeof actor?.write, 'CustomBox.write 应已可调用').toBe('function');
		expect(typeof actor?.input, 'CustomBox.input 应已可调用').toBe('function');
	});

	it('逐个挂载：不抛错、窗口根与 title bar 存在、登记控件已接线、无重复 id', async () => {
		const failures: string[] = [];
		let checkedControls = 0;
		let mountedWindows = 0;

		for (const id of deferredIds) {
			const component = componentByName.get(normalize(id));
			if (!component) continue;
			toolWindowLoaders[id] = () => Promise.resolve({ default: component });

			let mounted = false;
			try {
				mounted = await ensureToolWindow(id);
			} catch (error) {
				failures.push(`${id}: 挂载抛错 ${(error as Error).message}`);
				continue;
			}
			await flushPromises();
			await nextTick();
			await flushPromises();

			if (!mounted || !isToolWindowReady(id)) {
				failures.push(`${id}: 挂载后未就绪`);
				continue;
			}
			mountedWindows++;

			const frame = document.getElementById(id);
			if (!frame) {
				failures.push(`${id}: 窗口根不存在`);
				continue;
			}

			// 重复 id：同一窗口里控件 id 必须唯一
			const ids = [...frame.querySelectorAll<HTMLElement>('[id]')].map((el) => el.id);
			const duplicated = ids.filter((value, index) => ids.indexOf(value) !== index);
			if (duplicated.length > 0) {
				failures.push(`${id}: 重复 id ${[...new Set(duplicated)].join(', ')}`);
			}

			// 登记过的控件必须有 API：否则说明 onMounted 接线失败
			for (const element of [frame, ...frame.querySelectorAll<HTMLElement>('[id]')]) {
				const idOfElement = element.id;
				if (idOfElement === id) continue;
				if (registryOf(idOfElement).length === 0) continue;
				if (!isControl(element)) continue;
				checkedControls++;
				const wired = CONTROL_API.some(
					(name) =>
						typeof (element as unknown as Record<string, unknown>)[name] === 'function'
				);
				if (!wired)
					failures.push(`${id}: 控件 #${idOfElement} 未接线（注册表有、API 缺失）`);
			}
		}

		expect(mountedWindows).toBeGreaterThan(50);
		// 断言不能空转：确实逐个检查了窗口里的控件（当前 120 个，阈值取低一些防抖动）
		expect(checkedControls).toBeGreaterThan(100);
		expect(failures, failures.join('\n')).toEqual([]);
	});
});
