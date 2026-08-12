import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UITextShape {
		target: UITextData | null;
		update: ((node: UITextData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	interface UITextData {
		effect: Record<string, unknown>;
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIText: UITextShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIText.initialize = function (this: typeof UIText) {
		if (!$('#uiText-direction')) return;
		$('#uiText-direction')?.loadItems?.([
			{ name: 'Horizontal - TB', value: 'horizontal-tb' },
			{ name: 'Vertical - LR', value: 'vertical-lr' },
			{ name: 'Vertical - RL', value: 'vertical-rl' }
		]);

		$('#uiText-typeface')?.loadItems?.([
			{ name: 'Regular', value: 'regular' },
			{ name: 'Bold', value: 'bold' },
			{ name: 'Italic', value: 'italic' },
			{ name: 'Bold Italic', value: 'bold-italic' }
		]);

		$('#uiText-effect-type')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);

		$('#uiText-overflow')?.loadItems?.([
			{ name: 'Visible', value: 'visible' },
			{ name: 'Wrap', value: 'wrap' },
			{ name: 'Truncate', value: 'truncate' },
			{ name: 'Wrap Truncate', value: 'wrap-truncate' }
		]);

		$('#uiText-blend')?.loadItems?.([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#uiText-size-slider')?.synchronize?.($('#uiText-size'));
		$('#uiText-lineSpacing-slider')?.synchronize?.($('#uiText-lineSpacing'));
		$('#uiText-letterSpacing-slider')?.synchronize?.($('#uiText-letterSpacing'));

		const elEffectType = $('#uiText-effect-type');
		if (elEffectType)
			elEffectType.enableHiddenMode().relate([
				{
					case: 'shadow',
					targets: [
						$('#uiText-effect-shadowOffsetX'),
						$('#uiText-effect-shadowOffsetY'),
						$('#uiText-effect-color')
					]
				},
				{
					case: 'stroke',
					targets: [$('#uiText-effect-strokeWidth'), $('#uiText-effect-color')]
				},
				{ case: 'outline', targets: [$('#uiText-effect-color')] }
			]);

		const elements =
			document.querySelectorAll(`#uiText-direction, #uiText-horizontalAlign, #uiText-verticalAlign,
    #uiText-content, #uiText-size, #uiText-lineSpacing, #uiText-letterSpacing, #uiText-color, #uiText-font,
    #uiText-typeface, #uiText-effect-type, #uiText-effect-shadowOffsetX, #uiText-effect-shadowOffsetY,
    #uiText-effect-strokeWidth, #uiText-effect-color, #uiText-overflow, #uiText-blend`);
		const sliders = $(
			'#uiText-size-slider, #uiText-lineSpacing-slider, #uiText-letterSpacing-slider'
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

	UIText.create = function (this: typeof UIText) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'text',
			name: 'Text',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			direction: 'horizontal-tb',
			horizontalAlign: 'left',
			verticalAlign: 'middle',
			content: 'New Text',
			size: 16,
			lineSpacing: 0,
			letterSpacing: 0,
			color: 'ffffffff',
			font: '',
			typeface: 'regular',
			effect: { type: 'none' },
			overflow: 'visible',
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIText.open = function (this: typeof UIText, node: UITextData) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiText', node);
			write('direction');
			write('horizontalAlign');
			write('verticalAlign');
			write('content');
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
			write('overflow');
			write('blend');
			Inspector.uiElement.open(node);
		}
	};

	UIText.close = function (this: typeof UIText) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIText.update = function (this: typeof UIText, node: UITextData, key: string, value: unknown) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'horizontalAlign':
				if (node.horizontalAlign !== value) {
					const event = window.event;
					if (event && event.type === 'input' && event.value !== undefined) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									get input() {
										return $('#uiText-horizontalAlign');
									},
									oldValue: node.horizontalAlign,
									newValue: value
								}
							]
						});
					}
					node.horizontalAlign = value;
					// element.horizontalAlign = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'verticalAlign':
				if (node.verticalAlign !== value) {
					const event = window.event;
					if (event && event.type === 'input' && event.value !== undefined) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									get input() {
										return $('#uiText-verticalAlign');
									},
									oldValue: node.verticalAlign,
									newValue: value
								}
							]
						});
					}
					node.verticalAlign = value;
					// element.verticalAlign = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'content':
				// 闂佺儵鏅涢悺銊ф暜鐎涙ê绶炵€广儱鎳庨悡鎴︽煥濞戞ɑ婀版繛鎻掓健瀵剟骞忓畝濠傛闁荤喎鐨濋崑鎾绘煕閺嵮勫櫢闁煎灚鍨块幆鍐礋椤愩垺鏆ラ柣?
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'direction':
			case 'size':
			case 'lineSpacing':
			case 'letterSpacing':
			case 'color':
			case 'typeface':
			case 'overflow':
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
					const read = getElementReader('uiText-effect');
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

	UIText.paramInput = function (this: typeof UIText, event: Event) {
		UIText.update!(UIText.target as UITextData, Inspector.getKey!(this), read(this));
	};

	Inspector.uiText = UIText;
}
