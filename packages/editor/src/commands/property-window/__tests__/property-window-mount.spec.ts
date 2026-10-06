import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Component } from 'vue';
import { Window } from '@app/tools/window-object';
import { dataItemsOf } from '@app/__tests__/element-data-read';
import SetAnimationProperty from '@app/components/tools/SetAnimationProperty.vue';
import SetButtonProperty from '@app/components/tools/SetButtonProperty.vue';
import SetDialogBoxProperty from '@app/components/tools/SetDialogBoxProperty.vue';
import SetImageProperty from '@app/components/tools/SetImageProperty.vue';
import SetProgressBarProperty from '@app/components/tools/SetProgressBarProperty.vue';
import SetTextBoxProperty from '@app/components/tools/SetTextBoxProperty.vue';
import SetTextProperty from '@app/components/tools/SetTextProperty.vue';
import SetVideoProperty from '@app/components/tools/SetVideoProperty.vue';
import SetWindowProperty from '@app/components/tools/SetWindowProperty.vue';
import MoveElementProperty from '@app/components/tools/MoveElementProperty.vue';
import MoveLightProperty from '@app/components/tools/MoveLightProperty.vue';
import { AnimationProperty } from '../set-animation-property-window';
import { ButtonProperty } from '../set-button-property-window';
import { DialogBoxProperty } from '../set-dialog-property-window';
import { ImageProperty } from '../set-image-property-window';
import { ProgressBarProperty } from '../set-progress-property-window';
import { TextBoxProperty } from '../set-textbox-property-window';
import { TextProperty } from '../set-text-property-window';
import { VideoProperty } from '../set-video-property-window';
import { WindowProperty } from '../set-window-property-window';
import { TransformProperty } from '../move-element-property-window';
import { LightProperty } from '../move-light-property-window';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

/** 属性窗口工厂对外只暴露行为，这里按用到的成员做结构化声明。 */
interface PropertyWindowLike {
	target: (Record<string, unknown> & { save?: (() => unknown) | null }) | null;
	open: ((data?: { key: string; value: unknown }) => void) | null;
	confirm: ((event: Event) => unknown) | null;
}

interface PropertyWindowCase {
	name: string;
	/** 窗口根 id，确认按钮为 `<windowId>-confirm` */
	windowId: string;
	component: Component;
	property: PropertyWindowLike;
	/** key 下拉应有的项数（= 窗口 keys 数） */
	keyCount: number;
	/** 用例选中的属性 key 与其值 */
	key: string;
	value: unknown;
	/** 选中该 key 后应可见/应被隐藏的字段控件 id */
	visible: string;
	hidden: string[];
	/** init() 负责加载的二级下拉（id → 项数） */
	lists?: Array<{ id: string; count: number }>;
}

/**
 * 属性窗口族的懒挂载契约（回归自 fe1d0444「改用 SFC 控件注册表」）：
 * 工厂的 ensureSetup 以 `fields.get('<prefix>-property-key')` 为门槛——**任一窗口漏登记
 * key 控件，整个窗口就会静默早退**：key 下拉空白、init() 里的二级下拉（类型/显示/翻转/混合…）
 * 不加载、key↔字段显隐联动不生效（所有字段一起显示）。
 * 同一批提交里 moveElement/moveLight 还漏了 `@confirm`，确认按钮点了没反应。
 */
const cases: PropertyWindowCase[] = [
	{
		name: 'setTextBox（设置文本框）',
		windowId: 'setTextBox-property',
		component: SetTextBoxProperty,
		property: TextBoxProperty,
		keyCount: 7,
		key: 'text',
		value: 'hello',
		visible: 'setTextBox-property-text',
		hidden: [
			'setTextBox-property-type',
			'setTextBox-property-number',
			'setTextBox-property-decimals',
			'setTextBox-property-color'
		],
		lists: [{ id: 'setTextBox-property-type', count: 2 }]
	},
	{
		name: 'setText（设置文本）',
		windowId: 'setText-property',
		component: SetTextProperty,
		property: TextProperty,
		keyCount: 8,
		key: 'size',
		value: 16,
		visible: 'setText-property-size',
		hidden: ['setText-property-content', 'setText-property-effect-type'],
		lists: [
			{ id: 'setText-property-effect-type', count: 4 },
			{ id: 'setText-property-blend', count: 3 }
		]
	},
	{
		name: 'setDialogBox（设置对话框）',
		windowId: 'setDialogBox-property',
		component: SetDialogBoxProperty,
		property: DialogBoxProperty,
		keyCount: 9,
		key: 'interval',
		value: 0,
		visible: 'setDialogBox-property-interval',
		hidden: ['setDialogBox-property-content', 'setDialogBox-property-effect-type'],
		lists: [
			{ id: 'setDialogBox-property-effect-type', count: 4 },
			{ id: 'setDialogBox-property-blend', count: 3 }
		]
	},
	{
		name: 'setImage（设置图片）',
		windowId: 'setImage-property',
		component: SetImageProperty,
		property: ImageProperty,
		keyCount: 10,
		key: 'display',
		value: 'stretch',
		visible: 'setImage-property-display',
		hidden: ['setImage-property-image', 'setImage-property-flip', 'setImage-property-clip-0'],
		lists: [
			{ id: 'setImage-property-display', count: 4 },
			{ id: 'setImage-property-flip', count: 4 },
			{ id: 'setImage-property-blend', count: 4 }
		]
	},
	{
		name: 'setVideo（设置视频）',
		windowId: 'setVideo-property',
		component: SetVideoProperty,
		property: VideoProperty,
		keyCount: 5,
		key: 'flip',
		value: 'none',
		visible: 'setVideo-property-flip',
		hidden: ['setVideo-property-video', 'setVideo-property-loop'],
		lists: [
			{ id: 'setVideo-property-loop', count: 2 },
			{ id: 'setVideo-property-flip', count: 4 },
			{ id: 'setVideo-property-blend', count: 3 }
		]
	},
	{
		name: 'setProgressBar（设置进度条）',
		windowId: 'setProgressBar-property',
		component: SetProgressBarProperty,
		property: ProgressBarProperty,
		keyCount: 12,
		key: 'display',
		value: 'stretch',
		visible: 'setProgressBar-property-display',
		hidden: ['setProgressBar-property-image', 'setProgressBar-property-progress'],
		lists: [
			{ id: 'setProgressBar-property-display', count: 2 },
			{ id: 'setProgressBar-property-blend', count: 3 }
		]
	},
	{
		name: 'setButton（设置按钮）',
		windowId: 'setButton-property',
		component: SetButtonProperty,
		property: ButtonProperty,
		keyCount: 13,
		key: 'normalClip',
		value: [1, 2, 3, 4],
		visible: 'setButton-property-clip-box',
		hidden: ['setButton-property-image', 'setButton-property-tint-box']
	},
	{
		name: 'setAnimation（设置动画）',
		windowId: 'setAnimation-property',
		component: SetAnimationProperty,
		property: AnimationProperty,
		keyCount: 5,
		key: 'motion',
		value: '',
		visible: 'setAnimation-property-motion',
		hidden: ['setAnimation-property-animation']
	},
	{
		name: 'setWindow（设置窗口）',
		windowId: 'setWindow-property',
		component: SetWindowProperty,
		property: WindowProperty,
		keyCount: 8,
		key: 'scrollX',
		value: 0,
		visible: 'setWindow-property-scrollX',
		hidden: ['setWindow-property-scrollY']
	},
	{
		name: 'moveElement（移动元素）',
		windowId: 'moveElement-property',
		component: MoveElementProperty,
		property: TransformProperty,
		keyCount: 16,
		key: 'x',
		value: 10,
		visible: 'moveElement-property-x',
		hidden: ['moveElement-property-anchorX', 'moveElement-property-opacity']
	},
	{
		name: 'moveLight（移动光源）',
		windowId: 'moveLight-property',
		component: MoveLightProperty,
		property: LightProperty,
		keyCount: 12,
		key: 'range',
		value: 4,
		visible: 'moveLight-property-range',
		hidden: ['moveLight-property-intensity', 'moveLight-property-blue']
	}
];

const el = (id: string): HTMLElement => document.getElementById(id)!;
/** 窗口根 id → 其 key 下拉 id */
const keyListId = (windowId: string): string => windowId.replace(/-property$/, '-property-key');

describe('属性窗口懒挂载初始化（ensureSetup）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	for (const c of cases) {
		it(`${c.name}：key 选项/二级下拉/字段联动/确认按钮`, async () => {
			const wrapper = mount(c.component, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();

			// 关键回归点：属性窗口是懒挂载的，ParamList.bind 时的 initialize 早退后，
			// 组件 onMounted 的 ensureSetup 必须补齐 key 选项与字段显隐联动（key 控件漏登记 → 整窗早退）
			expect(dataItemsOf(el(keyListId(c.windowId))), 'key 下拉选项').toHaveLength(c.keyCount);
			for (const list of c.lists ?? []) {
				expect(dataItemsOf(el(list.id)), `${list.id} 选项`).toHaveLength(list.count);
			}

			c.property.open!({ key: c.key, value: c.value });
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();

			// 当前 key 对应的控件可见，其余字段（含其标签）应被隐藏模式收起
			expect(el(c.visible).style.display, `${c.visible} 应可见`).not.toBe('none');
			for (const id of c.hidden) {
				expect(el(id).style.display, `${id} 应隐藏`).toBe('none');
			}

			// 确认按钮必须接线（曾经 moveElement/moveLight 漏了 @confirm → 点了没反应）
			const target = { save: vi.fn(() => ({ key: c.key, value: c.value })) };
			c.property.target = target;
			el(`${c.windowId}-confirm`).click();
			expect(target.save).toHaveBeenCalledTimes(1);

			wrapper.unmount();
		});
	}
});
