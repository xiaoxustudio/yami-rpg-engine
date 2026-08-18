import { $ } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UITextBoxShape {
		target: UITextBoxData | null;
		update: ((node: UITextBoxData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
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
		owner: UI,
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

			const number = $('#uiTextBox-number');
			(number.input! as HTMLInputElement).min = node.min;
			(number.input! as HTMLInputElement).max = node.max;
			number.decimals = node.decimals;
			Inspector.uiElement.open(node);

			($('#uiTextBox-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	UITextBox.close = function (this: typeof UITextBox) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
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
		UI.planToSave!();
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
					($('#uiTextBox-number').input! as Record<string, unknown>)[key] = value;
				}
				break;
			case 'decimals':
				if (node.decimals !== value) {
					node.decimals = value as number;
					// element.decimals = value
					node.instances.setProperty(key, value);
					$('#uiTextBox-number').decimals = value as number;
				}
				break;
		}
		UI.requestRendering!();
	};

	Inspector.uiTextBox = UITextBox;
}
