import { inspectorEls } from './element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner } from './ui-owner.ts';
import { registryElement } from '@app/utils/element-registry';

{
	interface UITextBoxShape {
		target: UITextBoxData | null;
		update: ((node: UITextBoxData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	/**
	 * `uiTextBox-number` 登记的是 `YMNumberBox` 的根元素：`decimals` 由该 SFC 自己
	 * `defineProperty(el, 'decimals', …)` 定义（组件内部状态），**不是** P4b 的元素数据
	 * ——所以这里给局部形状，而不是继续靠 `global.d.ts` 的 `interface HTMLElement` 兜底。
	 */
	interface NumberBoxHostElement extends HTMLElement {
		input?: HTMLElement;
		decimals?: number;
	}
	interface UITextBoxData {
		type: string;
		align: string;
		text: string;
		maxLength: number;
		number: number;
		min: string;
		max: string;
		decimals: number;
		padding: number;
		size: number;
		font: string;
		color: string;
		selectionColor: string;
		selectionBgColor: string;
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UITextBox: UITextBoxShape = {
		owner: UIOwner,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	UITextBox.initialize = function (this: typeof UITextBox) {};

	UITextBox.create = function (this: typeof UITextBox) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'textbox',
			name: 'TextBox',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			type: 'text',
			align: 'left',
			text: 'Content',
			maxLength: 16,
			number: 0,
			min: 0,
			max: 0,
			decimals: 0,
			padding: 4,
			size: 16,
			font: '',
			color: 'ffffffff',
			selectionColor: 'ffffffff',
			selectionBgColor: '0090ccff',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UITextBox.open = function (this: typeof UITextBox, node: UITextBoxData) {
		if (this.target !== node) {
			this.target = node;

			const number = inspectorEls.get('uiTextBox-number') as NumberBoxHostElement;
			(number.input! as HTMLInputElement).min = node.min;
			(number.input! as HTMLInputElement).max = node.max;
			number.decimals = node.decimals;
			Inspector.uiElement.open(node);

			(
				inspectorEls.get('uiTextBox-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UITextBox.close = function (this: typeof UITextBox) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UITextBox.update = function (
		this: typeof UITextBox,
		node: UITextBoxData,
		key: string,
		value: unknown
	) {
		getUIStore().planToSave();
		// const element = node.instance
		switch (key) {
			case 'type':
			case 'align':
			case 'maxLength':
			case 'padding':
			case 'size':
			case 'font':
			case 'color':
			case 'selectionColor':
			case 'selectionBgColor':
				if (node[key] !== value) {
					(node as Record<string, unknown>)[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'text':
			case 'number':
				if (node[key] !== value) {
					(node as Record<string, unknown>)[key] = value;
					// element.content = value.toString()
					node.instances.setProperty(
						'content',
						(value as { toString(): string }).toString()
					);
				}
				break;
			case 'min':
			case 'max':
				if (node[key] !== value) {
					(node as Record<string, unknown>)[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
					const numberEl = registryElement<
						NumberBoxHostElement & { input?: Record<string, unknown> }
					>(inspectorEls, 'uiTextBox-number');
					if (numberEl?.input) numberEl.input[key] = value;
				}
				break;
			case 'decimals':
				if (node.decimals !== value) {
					node.decimals = value as number;
					// element.decimals = value
					node.instances.setProperty(key, value);
					(inspectorEls.get('uiTextBox-number') as NumberBoxHostElement).decimals =
						value as number;
				}
				break;
		}
		getUIStore().requestRendering();
	};

	Inspector.uiTextBox = UITextBox;
}
