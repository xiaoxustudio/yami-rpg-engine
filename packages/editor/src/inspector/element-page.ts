import { $, getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { clear, disable, enable, hide, on, show } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner, type UIOwnerShape } from './ui-owner.ts';
import type { YamiElement } from '@app/types/element-api';

/** P1b：尺寸/变换控件的 id 列表（原先用 `document.querySelectorAll` 批量取） */
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
		/** 不在字面量初值里（首值为 `undefined`）⇒ 声明为可选，免得为了类型去改运行时 */
		_elementInitialized?: boolean;
		_openRetry?: number;
	}
	interface UIElementTransform {
		anchorX: number;
		anchorY: number;
		x: number;
		x2: number;
		y: number;
		y2: number;
		width: number;
		width2: number;
		height: number;
		height2: number;
		rotation: number;
		scaleX: number;
		scaleY: number;
		skewX: number;
		skewY: number;
		opacity: number;
		[k: string]: unknown;
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

	/**
	 * 初始化：**幂等**，且允许在「控件还没登记」时被调用（早退时不置位，之后可重试）。
	 *
	 * 因为 inspector 的控件由 SFC **挂载时**登记（见 `element-registry.ts`），而页面是**按需渲染**的
	 * —— 首次 `open()` 往往早于该页挂载。若把初始化当作一次性的，早退后就再也不补，
	 * 之后每次 `open()` 都会在 `this.pointerEvents.previousElementSibling` 上抛
	 * `Cannot read properties of null`。补初始化/重试的责任在 `open()`。
	 */
	UIElement.initialize = function (this: typeof UIElement) {
		if (this._elementInitialized) return;
		if (!inspectorEls.get('uiElement-name')) return;
		this._elementInitialized = true;
		this.nameBox = inspectorEls.get('uiElement-name') as YamiElement;
		this.pointerEvents = inspectorEls.get('uiElement-pointerEvents') as YamiElement;
		this.generalGroup = inspectorEls.get('uiElement-general-group') as YamiElement;
		this.transformGroup = inspectorEls.get('uiElement-transform-group') as YamiElement;
		this.eventsGroup = inspectorEls.get('uiElement-events-group') as YamiElement;
		this.scriptsGroup = inspectorEls.get('uiElement-scripts-group') as YamiElement;
		this.parameterPane = inspectorEls.get('uiElement-parameter-pane') as YamiElement;
		this.pointerEvents.loadItems([
			{ name: 'Enabled', value: 'enabled' },
			{ name: 'Disabled', value: 'disabled' },
			{ name: 'Skipped', value: 'skipped' }
		]);

		inspectorEls.get('uiElement-events')?.bind?.(new EventListInterface(this, UIOwner));

		inspectorEls.get('uiElement-scripts')?.bind?.(new ScriptListInterface(this, UIOwner));

		this.parameterPane.bind(inspectorEls.get('uiElement-scripts'));

		// this.generalGroup.remove() this.transformGroup.remove() this.eventsGroup.remove() this.scriptsGroup.remove()

		on(Inspector.manager, 'switch', this.pageSwitch!);
		const alignElements = $('.uiElement-transform-align');
		(alignElements as unknown as HTMLElement[]).forEach((el) =>
			on(el, 'click', this.alignmentClick!)
		);
		// 18 闂備胶顢婇惌鍥磼濞戝崬浠?input 缂?Vue 婵犵妲呴崹顏堝礈濠靛棭鐔嗘俊顖滅帛婵粍銇勯幒鍡椾壕閻熸粍婢橀崐鍧楀极瀹ュ鎹堕柣顐ゆ敘magePage.vue @input 闂?UIElement.paramInput闂?
		// P1b：控件批量绑定焦点/失焦——改按 id 列表读 inspectorEls（原先 document.querySelectorAll）
		const otherElements = registryElements(inspectorEls, [
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
		registryElements(inspectorEls, ['uiElement-events', 'uiElement-scripts']).forEach((el) =>
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
			disable(registryElements(inspectorEls, SIZE_INPUT_IDS));
		}
	};

	UIElement.unlockSizeInputs = function (this: typeof UIElement) {
		if (this.synchronous) {
			this.synchronous = false;
			enable(registryElements(inspectorEls, SIZE_INPUT_IDS));
		}
	};

	UIElement.open = function (this: typeof UIElement, node: UIElementData) {
		// 控件由 SFC 挂载时才登记，而 inspector 页面按需渲染 ⇒ 首次 open 可能早于挂载。
		// 先在「打开时」补一次初始化（幂等）；若仍未就绪，下一个宏任务（Vue 的挂载刷新之后）
		// 再试一次 —— 绝不在元素为 null 的情况下继续往下读。
		this.initialize!();
		if (!this.pointerEvents) {
			// `_openRetry` 首值是 `undefined`，而 `undefined < 10` 为 false —— `?? NaN` 保持这个既有语义
			// （即「第一次 open 不重试」），不在类型轮里改变它。
			if ((this._openRetry ?? NaN) < 10) {
				this._openRetry = (this._openRetry ?? 0) + 1;
				setTimeout(() => this.open!(node), 0);
			}
			return;
		}
		this._openRetry = 0;
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiElement', node);
			// `previousElementSibling` 的读取对 null 不安全（`show`/`hide` 本身对 null 是安全的），
			// 这里再兜一层：即使 pointerEvents 真的缺失也只是不显示行，不会抛错。
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
			(
				inspectorEls.get('uiImage-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIElement.close = function (this: typeof UIElement) {
		if (this.target) {
			this.target = null;
			clear(inspectorEls.get('uiElement-events'));
			clear(inspectorEls.get('uiElement-scripts'));
			clear(inspectorEls.get('uiElement-parameter-pane'));
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
					// transform[property] = value element.resize()
					node.instances.setProperty(key, value);
					node.instances.resize();
				}
				break;
			}
		}
		getUIStore().requestRendering();
	};

	UIElement.pageSwitch = function (this: typeof UIElement, event: Event & { value?: string }) {
		switch (event.value) {
			case 'uiImage':
			case 'uiText':
			case 'uiTextBox':
			case 'uiDialogBox':
			case 'uiProgressBar':
			case 'uiButton':
			case 'uiAnimation':
			case 'uiVideo':
			case 'uiWindow':
			case 'uiContainer':
			case 'uiReference': {
				const page = Inspector.manager.active;
				page.insertBefore(this.transformGroup, page.firstChild);
				page.insertBefore(this.generalGroup, page.firstChild);
				page.appendChild(this.eventsGroup);
				page.appendChild(this.scriptsGroup);
				page.appendChild(this.parameterPane);
				break;
			}
		}
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
		const changes: { input: HTMLElement; oldValue: number; newValue: number }[] = [];
		if (x !== undefined) {
			if (transform.anchorX !== x) {
				const input = inspectorEls.get('uiElement-transform-anchorX') as YamiElement;
				changes.push({
					input: input,
					oldValue: transform.anchorX,
					newValue: x
				});
				// transform.anchorX = x
				elements.setProperty('transform-anchorX', x);
			}
			if (transform.x !== 0) {
				const input = inspectorEls.get('uiElement-transform-x') as YamiElement;
				changes.push({
					input: input,
					oldValue: transform.x,
					newValue: 0
				});
				// transform.x = 0
				elements.setProperty('transform-x', 0);
			}
			if (transform.x2 !== x) {
				const input = inspectorEls.get('uiElement-transform-x2') as YamiElement;
				changes.push({
					input: input,
					oldValue: transform.x2,
					newValue: x
				});
				// transform.x2 = x
				elements.setProperty('transform-x2', x);
			}
		}
		if (y !== undefined) {
			if (transform.anchorY !== y) {
				const input = inspectorEls.get('uiElement-transform-anchorY') as YamiElement;
				changes.push({
					input: input,
					oldValue: transform.anchorY,
					newValue: y
				});
				// transform.anchorY = y
				elements.setProperty('transform-anchorY', y);
			}
			if (transform.y !== 0) {
				const input = inspectorEls.get('uiElement-transform-y') as YamiElement;
				changes.push({
					input: input,
					oldValue: transform.y,
					newValue: 0
				});
				// transform.y = 0
				elements.setProperty('transform-y', 0);
			}
			if (transform.y2 !== y) {
				const input = inspectorEls.get('uiElement-transform-y2') as YamiElement;
				changes.push({
					input: input,
					oldValue: transform.y2,
					newValue: y
				});
				// transform.y2 = y
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
			(
				inspectorEls.get('uiImage-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	Inspector.uiElement = UIElement;
}
