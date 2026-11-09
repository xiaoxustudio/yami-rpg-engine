import { $, getElementWriter } from '@app/utils/dom';
import { getUiElementControls } from '@app/composables/ui-element-page-controls';
import { controlRoot, type ControlApi } from '@app/composables/control-refs';
import { inspectorPageSync } from '@app/composables/inspector-page-sync';
import { clear, disable, enable, hide, on, show } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner, type UIOwnerShape } from './ui-owner.ts';
import type { UIElementTransform } from '@app/engine/ui/element-classes.ts';
import type { YamiElement } from '@app/types/element-api';

const SIZE_INPUT_IDS = [
	'uiElement-transform-anchorX',
	'uiElement-transform-anchorY',
	'uiElement-transform-width',
	'uiElement-transform-width2',
	'uiElement-transform-height',
	'uiElement-transform-height2',
	'uiElement-transform-rotation',
	'uiElement-transform-scaleX',
	'uiElement-transform-scaleY',
	'uiElement-transform-skewX',
	'uiElement-transform-skewY',
	'uiElement-transform-opacity'
];

/**
 * 页面控件表（section 挂载时填进来）；未挂载时返回 null，调用点照旧判空。
 *
 * 表里存的是**控件实例**（`defineExpose`），所以这里分两把：能力调用走 `controlOf`，
 * 需要 DOM 的站点（`show` / `hide` / `disable` / 挂载分组）走 `elOf` 取根元素 —— 直接把实例
 * 传给 DOM 助手的后果是 `classList` 读不到，控件静默不隐藏、控制台刷警告。
 */
const controlOf = (id: string): ControlApi | null => getUiElementControls()?.[id] ?? null;

const elOf = (id: string): YamiElement | null => controlRoot(controlOf(id)) as YamiElement | null;

const elsOf = (ids: string[]): YamiElement[] =>
	ids.map((id) => elOf(id)).filter((el): el is YamiElement => el != null);

/** 共享分组（事件 / 脚本 / 参数）只写在 uiImage 页模板里；切到其它 UI 页时要靠 pageSwitch 搬过去。 */
const UI_ELEMENT_PAGE_TYPES = new Set([
	'uiImage',
	'uiText',
	'uiTextBox',
	'uiDialogBox',
	'uiProgressBar',
	'uiButton',
	'uiAnimation',
	'uiVideo',
	'uiWindow',
	'uiContainer',
	'uiReference'
]);

{
	interface UIElementShape {
		owner: UIOwnerShape;
		target: UIElementData | null;
		synchronous: boolean;
		nameBox: YamiElement | null;
		pointerEvents: YamiElement | null;
		generalGroup: YamiElement | null;
		transformGroup: YamiElement | null;
		eventsGroup: YamiElement | null;
		scriptsGroup: YamiElement | null;
		parameterPane: YamiElement | null;
		initialize: (() => void) | null;
		createTransform: (() => UIElementTransform) | null;
		lockSizeInputs: (() => void) | null;
		unlockSizeInputs: (() => void) | null;
		open: ((node: UIElementData) => void) | null;
		close: (() => void) | null;
		update: ((node: UIElementData, key: string, value: unknown) => void) | null;
		pageSwitch: ((event: Event & { value?: string }) => void) | null;
		alignmentClick: ((event: Event) => void) | null;
		_elementInitialized?: boolean;
		_openRetry?: number;
	}
	interface UIElementData {
		id: string;
		name: unknown;
		pointerEvents?: unknown;
		class?: string;
		synchronous?: boolean;
		transform: UIElementTransform;
		instances: { setProperty(key: string, value: unknown): void; resize(): void };
		[k: string]: unknown;
	}
	const UIElement: UIElementShape = {
		owner: UIOwner,
		target: null,
		synchronous: false,
		nameBox: null,
		pointerEvents: null,
		generalGroup: null,
		transformGroup: null,
		eventsGroup: null,
		scriptsGroup: null,
		parameterPane: null,
		initialize: null,
		createTransform: null,
		lockSizeInputs: null,
		unlockSizeInputs: null,
		open: null,
		close: null,
		update: null,
		pageSwitch: null,
		alignmentClick: null
	};

	UIElement.initialize = function (this: typeof UIElement) {
		if (this._elementInitialized) return;
		if (!elOf('uiElement-name')) return;
		this._elementInitialized = true;
		this.nameBox = elOf('uiElement-name');
		this.pointerEvents = elOf('uiElement-pointerEvents');
		this.generalGroup = elOf('uiElement-general-group');
		this.transformGroup = elOf('uiElement-transform-group');
		this.eventsGroup = elOf('uiElement-events-group');
		this.scriptsGroup = elOf('uiElement-scripts-group');
		this.parameterPane = elOf('uiElement-parameter-pane');
		controlOf('uiElement-pointerEvents')?.loadItems?.([
			{ name: 'Enabled', value: 'enabled' },
			{ name: 'Disabled', value: 'disabled' },
			{ name: 'Skipped', value: 'skipped' }
		]);

		controlOf('uiElement-events')?.bind?.(new EventListInterface(this, UIOwner));

		controlOf('uiElement-scripts')?.bind?.(new ScriptListInterface(this, UIOwner));

		controlOf('uiElement-parameter-pane')?.bind?.(elOf('uiElement-scripts'));

		on(Inspector.manager, 'switch', this.pageSwitch!);
		// 首次选中 UI 元素时，`Inspector.open` 的 `manager.switch(type)` 往往早于这里注册监听；
		// 只等下一次 switch 的话，共享分组会留在 uiImage 页里 —— 表现就是「事件栏不出现，
		// 先点父级再点回来才出现」。按当前页补搬一次，与 switch 事件的顺序解耦。
		const currentType = Inspector.type;
		if (typeof currentType === 'string' && UI_ELEMENT_PAGE_TYPES.has(currentType)) {
			this.pageSwitch!({ value: currentType } as Event & { value?: string });
		}
		const alignElements = $('.uiElement-transform-align');
		alignElements.forEach((el) => on(el, 'click', this.alignmentClick!));
		const otherElements = elsOf([
			'uiElement-name',
			'uiElement-pointerEvents',
			'uiElement-transform-anchorX',
			'uiElement-transform-anchorY',
			'uiElement-transform-x',
			'uiElement-transform-x2',
			'uiElement-transform-y',
			'uiElement-transform-y2',
			'uiElement-transform-width',
			'uiElement-transform-width2',
			'uiElement-transform-height',
			'uiElement-transform-height2',
			'uiElement-transform-rotation',
			'uiElement-transform-scaleX',
			'uiElement-transform-scaleY',
			'uiElement-transform-skewX',
			'uiElement-transform-skewY',
			'uiElement-transform-opacity'
		]);
		otherElements.forEach((el) => on(el, 'focus', Inspector.inputFocus));
		otherElements.forEach((el: HTMLElement) =>
			on(el, 'blur', Inspector.inputBlur!(this, UIOwner))
		);
		elsOf(['uiElement-events', 'uiElement-scripts']).forEach((el) =>
			on(el, 'change', getUIStore().listChange)
		);
	};

	UIElement.createTransform = function (this: typeof UIElement) {
		return {
			anchorX: 0,
			anchorY: 0,
			x: 0,
			x2: 0,
			y: 0,
			y2: 0,
			width: 0,
			width2: 0,
			height: 0,
			height2: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			skewY: 0,
			opacity: 1
		};
	};

	UIElement.lockSizeInputs = function (this: typeof UIElement) {
		if (!this.synchronous) {
			this.synchronous = true;
			for (const el of elsOf(SIZE_INPUT_IDS)) disable(el);
		}
	};

	UIElement.unlockSizeInputs = function (this: typeof UIElement) {
		if (this.synchronous) {
			this.synchronous = false;
			for (const el of elsOf(SIZE_INPUT_IDS)) enable(el);
		}
	};

	UIElement.open = function (this: typeof UIElement, node: UIElementData) {
		this.initialize!();
		if (!this.pointerEvents) {
			if ((this._openRetry ?? 0) < 10) {
				this._openRetry = (this._openRetry ?? 0) + 1;
				setTimeout(() => this.open!(node), 0);
			}
			return;
		}
		this._openRetry = 0;
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiElement', node);
			if (node.pointerEvents) {
				show(this.pointerEvents);
				show(this.pointerEvents?.previousElementSibling);
			} else {
				hide(this.pointerEvents);
				hide(this.pointerEvents?.previousElementSibling);
			}
			if (node.class === 'reference' && node.synchronous) {
				this.lockSizeInputs!();
			} else {
				this.unlockSizeInputs!();
			}
			write('events');
			write('scripts');
			// 页面按最新 target 重渲染：控件表迁移后 `sync` 走页桥，不再挂在 `#uiImage-vue-mount` 上。
			inspectorPageSync.uiImage.get()?.sync();
		}
	};

	UIElement.close = function (this: typeof UIElement) {
		if (this.target) {
			this.target = null;
			clear(elOf('uiElement-events'));
			clear(elOf('uiElement-scripts'));
			clear(elOf('uiElement-parameter-pane'));
		}
	};

	UIElement.update = function (
		this: typeof UIElement,
		node: UIElementData,
		key: string,
		value: unknown
	) {
		getUIStore().planToSave();
		const transform = node.transform;
		switch (key) {
			case 'name':
				if (node.name !== value) {
					node.name = value;
					const uiList = getUIStore().elements.list;
					if (uiList) uiList.updateItemName(node);
				}
				break;
			case 'pointerEvents':
				if (node.pointerEvents !== value) {
					node.pointerEvents = value;
				}
				break;
			case 'transform-anchorX':
			case 'transform-anchorY':
			case 'transform-x':
			case 'transform-x2':
			case 'transform-y':
			case 'transform-y2':
			case 'transform-width':
			case 'transform-width2':
			case 'transform-height':
			case 'transform-height2':
			case 'transform-rotation':
			case 'transform-scaleX':
			case 'transform-scaleY':
			case 'transform-skewX':
			case 'transform-skewY':
			case 'transform-opacity': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (transform[property] !== value) {
					node.instances.setProperty(key, value);
					node.instances.resize();
				}
				break;
			}
		}
		getUIStore().requestRendering();
	};

	UIElement.pageSwitch = function (this: typeof UIElement, event: Event & { value?: string }) {
		if (!event.value || !UI_ELEMENT_PAGE_TYPES.has(event.value)) return;
		const page = Inspector.manager?.active;
		if (!(page instanceof HTMLElement)) return;
		const { transformGroup, generalGroup, eventsGroup, scriptsGroup, parameterPane } = this;
		if (!transformGroup || !generalGroup || !eventsGroup || !scriptsGroup || !parameterPane) {
			return;
		}
		page.insertBefore(transformGroup, page.firstChild);
		page.insertBefore(generalGroup, page.firstChild);
		page.appendChild(eventsGroup);
		page.appendChild(scriptsGroup);
		page.appendChild(parameterPane);
	}.bind(UIElement);

	UIElement.alignmentClick = function (this: HTMLElement, _event: Event) {
		let x;
		let y;
		switch (this.getAttribute('value')) {
			case 'left':
				x = 0;
				break;
			case 'center':
				x = 0.5;
				break;
			case 'right':
				x = 1;
				break;
			case 'top':
				y = 0;
				break;
			case 'middle':
				y = 0.5;
				break;
			case 'bottom':
				y = 1;
				break;
		}
		const node = UIElement.target!;
		const elements = node.instances;
		const transform = node.transform;
		const changes: { input: HTMLElement | null; oldValue: number; newValue: number }[] = [];
		if (x !== undefined) {
			if (transform.anchorX !== x) {
				const input = elOf('uiElement-transform-anchorX');
				changes.push({
					input: input,
					oldValue: transform.anchorX,
					newValue: x
				});
				elements.setProperty('transform-anchorX', x);
			}
			if (transform.x !== 0) {
				const input = elOf('uiElement-transform-x');
				changes.push({
					input: input,
					oldValue: transform.x,
					newValue: 0
				});
				elements.setProperty('transform-x', 0);
			}
			if (transform.x2 !== x) {
				const input = elOf('uiElement-transform-x2');
				changes.push({
					input: input,
					oldValue: transform.x2,
					newValue: x
				});
				elements.setProperty('transform-x2', x);
			}
		}
		if (y !== undefined) {
			if (transform.anchorY !== y) {
				const input = elOf('uiElement-transform-anchorY');
				changes.push({
					input: input,
					oldValue: transform.anchorY,
					newValue: y
				});
				elements.setProperty('transform-anchorY', y);
			}
			if (transform.y !== 0) {
				const input = elOf('uiElement-transform-y');
				changes.push({
					input: input,
					oldValue: transform.y,
					newValue: 0
				});
				elements.setProperty('transform-y', 0);
			}
			if (transform.y2 !== y) {
				const input = elOf('uiElement-transform-y2');
				changes.push({
					input: input,
					oldValue: transform.y2,
					newValue: y
				});
				elements.setProperty('transform-y2', y);
			}
		}
		if (changes.length !== 0) {
			elements.resize();
			getUIStore().planToSave();
			getUIStore().requestRendering();
			getUIStore().history!.save({
				type: 'inspector-change',
				editor: UIElement,
				target: UIElement.target,
				changes: changes
			});
			inspectorPageSync.uiImage.get()?.sync();
		}
	};

	Inspector.uiElement = UIElement;
}
