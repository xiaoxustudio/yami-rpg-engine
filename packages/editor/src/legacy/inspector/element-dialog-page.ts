import { $, getElementReader } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UIDialogBoxShape {
		target: UIDialogBoxData | null;
		update: ((node: UIDialogBoxData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface UIDialogBoxData {
		effect: Record<string, unknown>;
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIDialogBox: UIDialogBoxShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	UIDialogBox.initialize = function (this: typeof UIDialogBox) {};

	UIDialogBox.create = function (this: typeof UIDialogBox) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'dialogbox',
			name: 'DialogBox',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			content: 'Content',
			interval: 16.6666,
			size: 16,
			lineSpacing: 0,
			letterSpacing: 0,
			color: 'ffffffff',
			font: '',
			typeface: 'regular',
			effect: { type: 'none' },
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIDialogBox.open = function (this: typeof UIDialogBox, node: UIDialogBoxData) {
		if (this.target !== node) {
			this.target = node;
			Inspector.uiElement.open(node);
			($('#uiDialogBox-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	UIDialogBox.close = function (this: typeof UIDialogBox) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIDialogBox.update = function (
		this: typeof UIDialogBox,
		node: UIDialogBoxData,
		key: string,
		value: unknown
	) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'content':
				// 闂佺儵鏅涢悺銊ф暜鐎涙ê绶炵€广儱鎳庨悡鎴︽煥濞戞ɑ婀版繛鎻掓健瀵剟骞忓畝濠傛闁荤喎鐨濋崑鎾绘煕閺嵮勫櫢闁煎灚鍨块幆鍐礋椤愩垺鏆ラ柣?
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'interval':
			case 'size':
			case 'lineSpacing':
			case 'letterSpacing':
			case 'color':
			case 'typeface':
			case 'blend':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'font': {
				const font = (value as string).trim();
				if (node.font !== font) {
					node.font = font;
					// element.font = font
					node.instances.setProperty(key, font);
				}
				break;
			}
			case 'effect-type':
				if (node.effect.type !== value) {
					const read = getElementReader('uiDialogBox-effect');
					const effect: Record<string, unknown> = { type: value };
					switch (value) {
						case 'none':
							break;
						case 'shadow':
							effect.shadowOffsetX = read('shadowOffsetX');
							effect.shadowOffsetY = read('shadowOffsetY');
							effect.color = read('color');
							break;
						case 'stroke':
							effect.strokeWidth = read('strokeWidth');
							effect.color = read('color');
							break;
						case 'outline':
							effect.color = read('color');
							break;
					}
					node.effect = effect;
					// element.effect = effect
					node.instances.setProperty('effect', effect);
				}
				break;
			case 'effect-shadowOffsetX':
			case 'effect-shadowOffsetY':
			case 'effect-strokeWidth':
			case 'effect-color': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (node.effect[property] !== value) {
					node.effect[property] = value;
					// element.effect = node.effect
					node.instances.setProperty('effect', node.effect);
				}
				break;
			}
		}
		UI.requestRendering!();
	};

	Inspector.uiDialogBox = UIDialogBox;
}
