import { $, getElementReader } from '@/util/dom.ts';
import { read, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UIButtonShape {
		[k: string]: any;
	}
	interface UIButtonData {
		textEffect: {
			type?: unknown;
			shadowOffsetX?: unknown;
			shadowOffsetY?: unknown;
			strokeWidth?: unknown;
			color?: unknown;
			[k: string]: unknown;
		};
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIButton: UIButtonShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIButton.initialize = function (this: typeof UIButton) {
		if (!$('#uiButton-display')) return;
		$('#uiButton-display')?.loadItems?.([
			{ name: 'Stretch', value: 'stretch' },
			{ name: 'Tile', value: 'tile' },
			{ name: 'Clip', value: 'clip' },
			{ name: 'Slice', value: 'slice' }
		]);

		const elDisplay = $('#uiButton-display');
		if (elDisplay)
			elDisplay.enableHiddenMode().relate([
				{
					case: ['stretch', 'tile'],
					targets: [$('#uiButton-flip')]
				},
				{
					case: 'clip',
					targets: [
						$('#uiButton-flip'),
						$('#uiButton-normalClip'),
						$('#uiButton-hoverClip'),
						$('#uiButton-activeClip')
					]
				},
				{
					case: 'slice',
					targets: [
						$('#uiButton-normalClip'),
						$('#uiButton-hoverClip'),
						$('#uiButton-activeClip'),
						$('#uiButton-border')
					]
				}
			]);

		$('#uiButton-flip')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		$('#uiButton-imageEffect')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Tint', value: 'tint-1' },
			{ name: 'Tint (Normal, Hover)', value: 'tint-2' },
			{ name: 'Tint (Normal, Hover, Active)', value: 'tint-3' }
		]);

		const elImageEffect = $('#uiButton-imageEffect');
		if (elImageEffect)
			elImageEffect.enableHiddenMode().relate([
				{
					case: 'tint-1',
					targets: [$('#uiButton-normalTint-box')]
				},
				{
					case: 'tint-2',
					targets: [$('#uiButton-normalTint-box'), $('#uiButton-hoverTint-box')]
				},
				{
					case: 'tint-3',
					targets: [
						$('#uiButton-normalTint-box'),
						$('#uiButton-hoverTint-box'),
						$('#uiButton-activeTint-box')
					]
				}
			]);

		$('#uiButton-direction')?.loadItems?.([
			{ name: 'Horizontal', value: 'horizontal-tb' },
			{ name: 'Vertical', value: 'vertical-lr' }
		]);

		$('#uiButton-typeface')?.loadItems?.([
			{ name: 'Regular', value: 'regular' },
			{ name: 'Bold', value: 'bold' },
			{ name: 'Italic', value: 'italic' },
			{ name: 'Bold Italic', value: 'bold-italic' }
		]);

		$('#uiButton-textEffect-type')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);

		const elTextEffectType = $('#uiButton-textEffect-type');
		if (elTextEffectType)
			elTextEffectType.enableHiddenMode().relate([
				{
					case: 'shadow',
					targets: [
						$('#uiButton-textEffect-shadowOffsetX'),
						$('#uiButton-textEffect-shadowOffsetY'),
						$('#uiButton-textEffect-color')
					]
				},
				{
					case: 'stroke',
					targets: [
						$('#uiButton-textEffect-strokeWidth'),
						$('#uiButton-textEffect-color')
					]
				},
				{
					case: 'outline',
					targets: [$('#uiButton-textEffect-color')]
				}
			]);

		$('#uiButton-imagePadding-slider')?.synchronize?.($('#uiButton-imagePadding'));
		$('#uiButton-imageOpacity-slider')?.synchronize?.($('#uiButton-imageOpacity'));
		$('#uiButton-size-slider')?.synchronize?.($('#uiButton-size'));
		$('#uiButton-letterSpacing-slider')?.synchronize?.($('#uiButton-letterSpacing'));
		$('#uiButton-textPadding-slider')?.synchronize?.($('#uiButton-textPadding'));

		const elements = document.querySelectorAll(`#uiButton-display,
    #uiButton-normalImage, #uiButton-normalClip,
    #uiButton-hoverImage, #uiButton-hoverClip,
    #uiButton-activeImage, #uiButton-activeClip,
    #uiButton-flip, #uiButton-border, #uiButton-imagePadding, #uiButton-imageOpacity, #uiButton-imageEffect,
    #uiButton-normalTint-0, #uiButton-normalTint-1, #uiButton-normalTint-2, #uiButton-normalTint-3,
    #uiButton-hoverTint-0, #uiButton-hoverTint-1, #uiButton-hoverTint-2, #uiButton-hoverTint-3,
    #uiButton-activeTint-0, #uiButton-activeTint-1, #uiButton-activeTint-2, #uiButton-activeTint-3,
    #uiButton-direction, #uiButton-horizontalAlign, #uiButton-verticalAlign,
    #uiButton-content, #uiButton-size, #uiButton-letterSpacing, #uiButton-textPadding,
    #uiButton-font, #uiButton-typeface, #uiButton-textEffect-type, #uiButton-textEffect-shadowOffsetX,
    #uiButton-textEffect-shadowOffsetY, #uiButton-textEffect-strokeWidth, #uiButton-textEffect-color,
    #uiButton-normalColor, #uiButton-hoverColor, #uiButton-activeColor,
    #uiButton-hoverSound, #uiButton-clickSound`);
		const sliders =
			document.querySelectorAll(`#uiButton-imagePadding-slider, #uiButton-imageOpacity-slider,
    #uiButton-size-slider, #uiButton-letterSpacing-slider, #uiButton-textPadding-slider`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, UI))
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);
	};

	UIButton.create = function (this: typeof UIButton) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'button',
			name: 'Button',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			display: 'stretch',
			normalImage: '',
			normalClip: [0, 0, 32, 32],
			hoverImage: '',
			hoverClip: [0, 0, 32, 32],
			activeImage: '',
			activeClip: [0, 0, 32, 32],
			flip: 'none',
			clip: [0, 0, 32, 32],
			border: 1,
			imagePadding: 0,
			imageOpacity: 1,
			imageEffect: 'none',
			normalTint: [0, 0, 0, 0],
			hoverTint: [0, 0, 0, 0],
			activeTint: [0, 0, 0, 0],
			direction: 'horizontal-tb',
			horizontalAlign: 'center',
			verticalAlign: 'middle',
			content: 'New Button',
			size: 16,
			letterSpacing: 0,
			textPadding: 0,
			font: '',
			typeface: 'regular',
			textEffect: { type: 'none' },
			normalColor: 'ffffffff',
			hoverColor: 'ffffffff',
			activeColor: 'ffffffff',
			hoverSound: '',
			clickSound: '',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIButton.open = function (this: typeof UIButton, node: UIButtonData) {
		if (this.target !== node) {
			this.target = node;

			write($('#uiButton-horizontalAlign'), node.horizontalAlign);
			write($('#uiButton-verticalAlign'), node.verticalAlign);
			Inspector.uiElement.open(node);

			($('#uiButton-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	UIButton.close = function (this: typeof UIButton) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIButton.update = function (
		this: typeof UIButton,
		node: UIButtonData,
		key: string,
		value: unknown
	) {
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
										return $('#uiButton-horizontalAlign');
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
										return $('#uiButton-verticalAlign');
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
			case 'normalImage':
			case 'normalClip':
			case 'hoverImage':
			case 'hoverClip':
			case 'activeImage':
			case 'activeClip':
			case 'normalColor':
			case 'hoverColor':
			case 'activeColor':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value element.state = 'changed'
					node.instances.setProperty(key, value);
					node.instances.setProperty('state', 'changed');
				}
				break;
			case 'content':
				// 闂佺儵鏅涢悺銊ф暜鐎涙ê绶炵€广儱鎳庨悡鎴︽煥濞戞ɑ婀版繛鎻掓健瀵剟骞忓畝濠傛闁荤喎鐨濋崑鎾绘煕閺嵮勫櫢闁煎灚鍨块幆鍐礋椤愩垺鏆ラ柣?
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'display':
			case 'flip':
			case 'clip':
			case 'border':
			case 'imagePadding':
			case 'imageOpacity':
			case 'imageEffect':
			case 'direction':
			case 'size':
			case 'letterSpacing':
			case 'textPadding':
			case 'font':
			case 'typeface':
			case 'hoverSound':
			case 'clickSound':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'normalTint-0':
			case 'normalTint-1':
			case 'normalTint-2':
			case 'normalTint-3':
			case 'hoverTint-0':
			case 'hoverTint-1':
			case 'hoverTint-2':
			case 'hoverTint-3':
			case 'activeTint-0':
			case 'activeTint-1':
			case 'activeTint-2':
			case 'activeTint-3': {
				const [property, index] = key.split('-');
				if ((node[property] as unknown[])[Number(index)] !== value) {
					(node[property] as unknown[])[Number(index)] = value;
					// element[property][index] = value element.state = 'changed'
					node.instances.setProperty(key, value);
					node.instances.setProperty('state', 'changed');
				}
				break;
			}
			case 'textEffect-type':
				if (node.textEffect.type !== value) {
					const read = getElementReader('uiButton-textEffect');
					const textEffect: Record<string, unknown> = { type: value };
					switch (value) {
						case 'none':
							break;
						case 'shadow':
							textEffect.shadowOffsetX = read('shadowOffsetX');
							textEffect.shadowOffsetY = read('shadowOffsetY');
							textEffect.color = read('color');
							break;
						case 'stroke':
							textEffect.strokeWidth = read('strokeWidth');
							textEffect.color = read('color');
							break;
						case 'outline':
							textEffect.color = read('color');
							break;
					}
					node.textEffect = textEffect;
					// element.textEffect = textEffect
					node.instances.setProperty('textEffect', textEffect);
				}
				break;
			case 'textEffect-shadowOffsetX':
			case 'textEffect-shadowOffsetY':
			case 'textEffect-strokeWidth':
			case 'textEffect-color': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (node.textEffect[property] !== value) {
					node.textEffect[property] = value;
					// element.textEffect = node.textEffect
					node.instances.setProperty('textEffect', node.textEffect);
				}
				break;
			}
		}
		UI.requestRendering!();
	};

	UIButton.paramInput = function (this: HTMLElement & { [k: string]: unknown }, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiButton-').test(element.id)) break;
			element = element.parentElement;
		}
		UIButton.update(
			UIButton.target,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.uiButton = UIButton;
}
