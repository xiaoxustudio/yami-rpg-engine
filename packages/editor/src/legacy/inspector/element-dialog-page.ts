import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UIDialogBoxShape {
		target: UIDialogBoxData | null;
		update: ((node: UIDialogBoxData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
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
		update: null,
		paramInput: null
	};

	UIDialogBox.initialize = function (this: typeof UIDialogBox) {
		if (!$('#uiDialogBox-typeface')) return;
		$('#uiDialogBox-typeface')?.loadItems?.([
			{ name: 'Regular', value: 'regular' },
			{ name: 'Bold', value: 'bold' },
			{ name: 'Italic', value: 'italic' },
			{ name: 'Bold Italic', value: 'bold-italic' }
		]);

		$('#uiDialogBox-effect-type')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);

		$('#uiDialogBox-blend')?.loadItems?.([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#uiDialogBox-size-slider')?.synchronize?.($('#uiDialogBox-size'));
		$('#uiDialogBox-lineSpacing-slider')?.synchronize?.($('#uiDialogBox-lineSpacing'));
		$('#uiDialogBox-letterSpacing-slider')?.synchronize?.($('#uiDialogBox-letterSpacing'));

		const elEffectType = $('#uiDialogBox-effect-type');
		if (elEffectType)
			elEffectType.enableHiddenMode().relate([
				{
					case: 'shadow',
					targets: [
						$('#uiDialogBox-effect-shadowOffsetX'),
						$('#uiDialogBox-effect-shadowOffsetY'),
						$('#uiDialogBox-effect-color')
					]
				},
				{
					case: 'stroke',
					targets: [$('#uiDialogBox-effect-strokeWidth'), $('#uiDialogBox-effect-color')]
				},
				{
					case: 'outline',
					targets: [$('#uiDialogBox-effect-color')]
				}
			]);

		const elements =
			document.querySelectorAll(`#uiDialogBox-content, #uiDialogBox-interval, #uiDialogBox-size,
    #uiDialogBox-lineSpacing, #uiDialogBox-letterSpacing, #uiDialogBox-color, #uiDialogBox-font,
    #uiDialogBox-typeface, #uiDialogBox-effect-type, #uiDialogBox-effect-shadowOffsetX, #uiDialogBox-effect-shadowOffsetY,
    #uiDialogBox-effect-strokeWidth, #uiDialogBox-effect-color, #uiDialogBox-blend`);
		const sliders = $(
			'#uiDialogBox-size-slider, #uiDialogBox-lineSpacing-slider, #uiDialogBox-letterSpacing-slider'
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			(el as HTMLElement).on('blur', Inspector.inputBlur!(this, UI))
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('blur', Inspector.sliderBlur)
		);
	};

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

			const write = getElementWriter('uiDialogBox', node);
			write('content');
			write('interval');
			write('size');
			write('lineSpacing');
			write('letterSpacing');
			write('color');
			write('font');
			write('typeface');
			write('effect-type');
			write('effect-shadowOffsetX', node.effect.shadowOffsetX || 1);
			write('effect-shadowOffsetY', node.effect.shadowOffsetY || 1);
			write('effect-strokeWidth', node.effect.strokeWidth || 1);
			write('effect-color', node.effect.color || '000000ff');
			write('blend');
			Inspector.uiElement.open(node);
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

	UIDialogBox.paramInput = function (this: typeof UIDialogBox, event: Event) {
		UIDialogBox.update!(
			UIDialogBox.target as UIDialogBoxData,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.uiDialogBox = UIDialogBox;
}
