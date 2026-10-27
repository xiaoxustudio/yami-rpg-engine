import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { createApp, nextTick } from 'vue';
import VariableGetter from '@app/components/tools/VariableGetter.vue';
import { vFocus } from '@app/directives/focus';
import { initYamiI18n } from '@app/i18n';
import { toolWindowLoaders } from '@app/tools/tool-window-loaders';
import {
	ensureToolWindow,
	isToolWindowMounted,
	onToolWindowMounted,
	setToolWindowHostContext
} from '@app/tools/tool-window-host';
import { useVariableGetterWindow } from '@app/composables/useVariableGetterWindow';
import { composableEls } from '@app/composables/element-registry';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { elementDataOf } from '@app/utils/element-data';

/**
 * 回归：变量窗口是**按需挂载**的（`tool-window-host`），首次 `open()` 常常早于挂载，
 * 那时控件注册表是空的 —— 旧实现只在挂载前跑一次 `loadItems` / `initialize`，
 * 于是类型项丢失（下拉退回红色原始值 `local`）、隐藏行关系也没装上，
 * 十个字段全挤在 146px 高的窗口里，确定/取消按钮压在字段上。
 *
 * 修复后：`open()` 发现控件不在注册表时先挂载窗口，等控件接线完成后再应用同样的参数。
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

// 懒加载装配走的是真实 host；测试里用静态引入的 SFC 顶掉 Vite 动态 import
toolWindowLoaders.variableGetter = () => Promise.resolve({ default: VariableGetter });

type TypeControl = HTMLElement & { write(value: unknown): void };

const typeControl = (): TypeControl => composableEls.get('variableGetter-type') as TypeControl;

const rowOf = (id: string): { control: string; label: string } => {
	const control = composableEls.get(id) as HTMLElement | null;
	const label = control?.previousElementSibling as HTMLElement | null;
	return { control: control?.style.display ?? '未登记', label: label?.style.display ?? '' };
};

const openGetter = (type: string): void => {
	useVariableGetterWindow().open({
		filter: 'deletable',
		read: () => ({ type, key: '' }),
		input: vi.fn()
	} as never);
};

describe('变量窗口：首次 open 早于挂载（懒加载回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		// 真机里 `Window.open` 负责把懒加载窗口挂上；这里去掉 Layout/Title 那些副作用，
		// 只保留「打开 = 挂载」这一步。
		Window.open = vi.fn((id: string) => {
			void ensureToolWindow(id);
		}) as never;
		Window.close = vi.fn();
		Window.isWindowOpen = vi.fn(() => false);
	});

	it('先 open 后挂载：类型项与隐藏行关系依然装上，类型不再退回原始值', async () => {
		expect(isToolWindowMounted('variableGetter')).toBe(false);

		openGetter('local');
		await flushPromises();
		await nextTick();
		await flushPromises();

		const typeEl = typeControl();
		expect(typeEl, '窗口应当被挂载并登记控件').toBeTruthy();

		const typeData = elementDataOf<{ dataItems?: { value: string }[]; invalid?: boolean }>(
			typeEl
		);
		expect((typeData.dataItems ?? []).map((item) => item.value)).toEqual([
			'local',
			'actor',
			'skill',
			'state',
			'equipment',
			'element'
		]);
		// invalid = 下拉找不到当前值 ⇒ 显示红色原始值。修复后必须命中类型项。
		expect(typeData.invalid).toBe(false);
		expect(typeEl.textContent).not.toBe('local');
		// 窗口是挂载后才打开的，不是「先开半个空窗口」
		expect(Window.open).toHaveBeenCalledWith('variableGetter');
	});

	it('deletable + local 只留「类型 / 变量」两行，其余行连同标签一起隐藏', async () => {
		openGetter('local');
		await nextTick();

		expect(rowOf('variableGetter-common-key').control).not.toBe('none');
		expect(rowOf('variableGetter-common-key').label).not.toBe('none');

		for (const id of [
			'variableGetter-actor',
			'variableGetter-skill',
			'variableGetter-state',
			'variableGetter-equipment',
			'variableGetter-item',
			'variableGetter-element',
			'variableGetter-preset-key',
			'variableGetter-global-key'
		]) {
			expect(rowOf(id).control, `${id} 应当隐藏`).toBe('none');
			expect(rowOf(id).label, `${id} 的标签应当隐藏`).toBe('none');
		}
	});

	it('切到角色属性时只留相关的三行', async () => {
		// 角色属性键来自属性表，测试里没有工程数据，直接给出固定清单
		Attribute.getDefAttributeId = vi.fn(() => 'atk') as never;
		Attribute.getAttributeItems = vi.fn(() => [{ name: 'ATK', value: 'atk' }]) as never;

		openGetter('actor');
		await nextTick();
		await nextTick();

		expect(rowOf('variableGetter-actor').control).not.toBe('none');
		expect(rowOf('variableGetter-preset-key').control).not.toBe('none');
		expect(rowOf('variableGetter-common-key').control).toBe('none');
		expect(rowOf('variableGetter-global-key').control).toBe('none');

		openGetter('local');
		await nextTick();
		await nextTick();

		expect(rowOf('variableGetter-common-key').control).not.toBe('none');
		expect(rowOf('variableGetter-actor').control).toBe('none');
	});

	it('挂载回调在窗口挂载后才执行，且只执行一次', async () => {
		const calls: string[] = [];
		onToolWindowMounted('variableGetter', () => calls.push('mounted'));
		expect(calls, '已挂载的窗口不回放').toEqual([]);

		toolWindowLoaders.testWindow = () =>
			Promise.resolve({
				default: { render: () => null } as never
			});
		const late: string[] = [];
		onToolWindowMounted('testWindow', () => late.push('late'));
		expect(late).toEqual([]);
		expect(await ensureToolWindow('testWindow')).toBe(true);
		await nextTick();
		await nextTick();
		expect(late).toEqual(['late']);

		onToolWindowMounted('testWindow', () => late.push('again'));
		await nextTick();
		expect(late).toEqual(['late']);
	});

	it('窗口挂载失败（没有装载器）时 open 不抛错，也不会打开别的窗口', async () => {
		(Window.open as unknown as { mockClear(): void }).mockClear();
		expect(() =>
			useVariableGetterWindow().open(
				{
					filter: 'deletable',
					read: () => ({ type: 'local', key: '' }),
					input: vi.fn()
				} as never,
				{ prefix: 'no-such-window' }
			)
		).not.toThrow();
		await flushPromises();
		expect(Window.open).toHaveBeenCalledWith('no-such-window');
		expect(Window.open).not.toHaveBeenCalledWith('variableGetter');
	});
});
