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
	runWhenToolWindowReady,
	setToolWindowHostContext
} from '@app/tools/tool-window-host';
import { conditionEls, ConditionListInterface, form } from '@app/tools/condition-list';
import { Selection, textCaptureEls } from '@app/tools/text-capture';
import { Window } from '@app/tools/window-object.ts';
import { elementDataOf } from '@app/utils/element-data';

/**
 * 同一类回归：工具窗口懒挂载，而**启动期初始化**与**open() 时写控件**都可能在挂载之前跑，
 * 于是下拉项丢失（显示红色原始值）、隐藏行关系不装（字段全铺开压住按钮），甚至取到 undefined。
 *
 * 修复后统一走 `runWhenToolWindowReady`：已就绪立即执行，否则等窗口挂载后再执行一次。
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

const controlOf = (registry: Map<string, unknown>, id: string): DataControl =>
	registry.get(id) as DataControl;

const rowOf = (registry: Map<string, unknown>, id: string): { control: string; label: string } => {
	const control = registry.get(id) as HTMLElement | null;
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

	it('runWhenToolWindowReady：未挂载时延迟到挂载后执行，已就绪时立即执行', async () => {
		const calls: string[] = [];
		toolWindowLoaders.deferredProbe = () =>
			Promise.resolve({ default: { render: () => null } as never });

		expect(isToolWindowReady('deferredProbe')).toBe(false);
		runWhenToolWindowReady('deferredProbe', () => calls.push('mounted'));
		expect(calls).toEqual([]);

		expect(await ensureToolWindow('deferredProbe')).toBe(true);
		await nextTick();
		await nextTick();
		expect(isToolWindowReady('deferredProbe')).toBe(true);
		expect(calls).toEqual(['mounted']);

		// 已就绪：同步执行，不再排队
		runWhenToolWindowReady('deferredProbe', () => calls.push('ready'));
		expect(calls).toEqual(['mounted', 'ready']);
	});

	it('插入图片窗口：启动期 initialize 早于挂载，仍要装上 mode 选项与隐藏行关系', async () => {
		expect(isToolWindowReady('insertImage')).toBe(false);
		// 启动期初始化：此时控件还不存在
		Selection.image.initialize!();

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

		const mode = controlOf(textCaptureEls, 'insertImage-mode');
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
		expect(rowOf(textCaptureEls, 'insertImage-image').control).not.toBe('none');
		expect(rowOf(textCaptureEls, 'insertImage-width').control).not.toBe('none');
		expect(rowOf(textCaptureEls, 'insertImage-height').control).not.toBe('none');
		expect(rowOf(textCaptureEls, 'insertImage-clip').control).toBe('none');
		expect(rowOf(textCaptureEls, 'insertImage-clip').label).toBe('none');
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

		const type = controlOf(conditionEls, 'condition-type');
		expect(type, '窗口应当被挂载并登记控件').toBeTruthy();
		const data = elementDataOf<{ dataItems?: { value: string }[]; invalid?: boolean }>(type);
		expect((data.dataItems ?? []).map((item) => item.value)).toContain('global-number');
		expect(data.invalid).toBe(false);

		// global-number：变量 + 数字运算符/值可见，布尔与字符串行折叠
		expect(rowOf(conditionEls, 'condition-key').control).not.toBe('none');
		expect(rowOf(conditionEls, 'condition-number-value').control).not.toBe('none');
		expect(rowOf(conditionEls, 'condition-boolean-value').control).toBe('none');
		expect(rowOf(conditionEls, 'condition-boolean-value').label).toBe('none');
		expect(rowOf(conditionEls, 'condition-string-value').control).toBe('none');
	});
});
