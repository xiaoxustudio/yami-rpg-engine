import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { createApp, nextTick } from 'vue';
import InsertImage from '@app/components/tools/InsertImage.vue';
import Condition from '@app/components/tools/Condition.vue';
import { vFocus } from '@app/directives/focus';
import { initYamiI18n } from '@app/i18n';
import { toolWindowLoaders } from '@app/tools/tool-window-loaders';
import {
	ensureToolWindow,
	isToolWindowReady,
	setToolWindowHostContext
} from '@app/tools/tool-window-host';
import { ConditionListInterface, form } from '@app/tools/condition-list';
import { Selection } from '@app/tools/text-capture';
import { Window } from '@app/tools/window-object.ts';
import { elementDataOf } from '@app/utils/element-data';

/**
 * 同一类回归：工具窗口懒挂载，而**启动期初始化**与**open() 时写控件**都可能在挂载之前跑，
 * 于是下拉项丢失（显示红色原始值）、隐藏行关系不装（字段全铺开压住按钮），甚至取到 undefined。
 *
 * 约定：`open()` 时写控件一律走 `Window.openWith(id, prepare)`；
 * 启动期初始化则用 `onToolWindowMounted(id, fn)` 在挂载后补跑一次。
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

// 真实 host 挂载；用静态引入的 SFC 顶掉 Vite 动态 import（测试环境下动态 import SFC 不返回）
toolWindowLoaders.insertImage = () => Promise.resolve({ default: InsertImage });
toolWindowLoaders.condition = () => Promise.resolve({ default: Condition });

type DataControl = HTMLElement & { dataItems?: { value: unknown }[]; invalid?: boolean };

/** 注册表为空时按 DOM id 兜底：控件仍在 DOM 里，只是不再进注册表（textCaptureEls 已删除）。 */
const controlOf = (registry: Map<string, unknown> | null, id: string): DataControl =>
	((registry?.get(id) ?? document.getElementById(id)) as DataControl) ?? ({} as DataControl);

const rowOf = (
	registry: Map<string, unknown> | null,
	id: string
): { control: string; label: string } => {
	const control = (registry?.get(id) ?? document.getElementById(id)) as HTMLElement | null;
	const label = control?.previousElementSibling as HTMLElement | null;
	return { control: control?.style.display ?? '未登记', label: label?.style.display ?? '' };
};

describe('懒挂载窗口：初始化与 open 后的控件写入', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn((id: string) => {
			void ensureToolWindow(id);
		}) as never;
		Window.close = vi.fn();
	});

	it('Window.openWith：控件可用后才执行 prepare，且先 prepare 后显示窗口', async () => {
		const events: string[] = [];
		toolWindowLoaders.deferredProbe = () =>
			Promise.resolve({ default: { render: () => null } as never });
		Window.open = vi.fn((id: string) => {
			events.push(`open:${id}`);
		}) as never;

		expect(isToolWindowReady('deferredProbe')).toBe(false);
		Window.openWith!('deferredProbe', () => events.push('prepare'));
		// 未就绪：既不执行 prepare，也不显示窗口
		expect(events).toEqual([]);

		await flushPromises();
		await nextTick();
		await flushPromises();
		expect(isToolWindowReady('deferredProbe')).toBe(true);
		expect(events).toEqual(['prepare', 'open:deferredProbe']);

		// 已就绪：同步 prepare → 打开
		Window.openWith!('deferredProbe', () => events.push('prepare2'));
		expect(events).toEqual(['prepare', 'open:deferredProbe', 'prepare2', 'open:deferredProbe']);
	});

	it('插入图片窗口：启动期 initialize 早于挂载，仍要装上 mode 选项与隐藏行关系', async () => {
		expect(isToolWindowReady('insertImage')).toBe(false);

		Selection.image.open!({
			mode: 'image-size',
			image: '',
			clip: [0, 0, 64, 64],
			width: 64,
			height: 64
		});
		await flushPromises();
		await nextTick();
		await flushPromises();

		const mode = controlOf(null, 'insertImage-mode');
		expect(mode, '窗口应当被挂载并登记控件').toBeTruthy();
		const data = elementDataOf<{ dataItems?: { value: string }[]; invalid?: boolean }>(mode);
		expect((data.dataItems ?? []).map((item) => item.value)).toEqual([
			'image',
			'image-size',
			'image-clip',
			'image-clip-size'
		]);
		expect(data.invalid).toBe(false);

		// image-size：图片 + 宽高可见，裁剪不可见
		expect(rowOf(null, 'insertImage-image').control).not.toBe('none');
		expect(rowOf(null, 'insertImage-width').control).not.toBe('none');
		expect(rowOf(null, 'insertImage-height').control).not.toBe('none');
		expect(rowOf(null, 'insertImage-clip').control).toBe('none');
		expect(rowOf(null, 'insertImage-clip').label).toBe('none');
	});

	it('条件窗口：启动期 initialize 早于挂载，仍要装上类型选项并按当前类型折叠行', async () => {
		expect(isToolWindowReady('condition')).toBe(false);
		form.type = 'global-number';
		// 启动期初始化：此时控件还不存在
		ConditionListInterface.initialize();

		expect(Window.isWindowOpen).toBeTypeOf('function');
		Window.open!('condition');
		await flushPromises();
		await nextTick();
		await flushPromises();

		const type = controlOf(null, 'condition-type');
		expect(type, '窗口应当被挂载并登记控件').toBeTruthy();
		const data = elementDataOf<{ dataItems?: { value: string }[]; invalid?: boolean }>(type);
		expect((data.dataItems ?? []).map((item) => item.value)).toContain('global-number');
		expect(data.invalid).toBe(false);

		// global-number：变量 + 数字运算符/值可见，布尔与字符串行折叠
		expect(rowOf(null, 'condition-key').control).not.toBe('none');
		expect(rowOf(null, 'condition-number-value').control).not.toBe('none');
		expect(rowOf(null, 'condition-boolean-value').control).toBe('none');
		expect(rowOf(null, 'condition-boolean-value').label).toBe('none');
		expect(rowOf(null, 'condition-string-value').control).toBe('none');
	});
});
