import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UIProgressBarShape {
		target: UIProgressBarData | null;
		update: ((node: UIProgressBarData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface UIProgressBarData {
		color: { [k: string]: unknown };
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIProgressBar: UIProgressBarShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIProgressBar.initialize = function (this: typeof UIProgressBar) {
		if (!$('#uiProgressBar-display')) return;
		$('#uiProgressBar-display').loadItems([
			{ name: 'Stretch', value: 'stretch' },
			{ name: 'Clip', value: 'clip' }
		]);

		$('#uiProgressBar-display')
			.enableHiddenMode()
			.relate([{ case: 'clip', targets: [$('#uiProgressBar-clip')] }]);

		$('#uiProgressBar-type').loadItems([
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Round', value: 'round' }
		]);

		$('#uiProgressBar-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'round',
					targets: [
						$('#uiProgressBar-centerX'),
						$('#uiProgressBar-centerY'),
						$('#uiProgressBar-startAngle'),
						$('#uiProgressBar-centralAngle')
					]
				}
			]);

		$('#uiProgressBar-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#uiProgressBar-colorMode').loadItems([
			{ name: 'Texture Sampling', value: 'texture' },
			{ name: 'Fixed', value: 'fixed' }
		]);

		$('#uiProgressBar-colorMode')
			.enableHiddenMode()
			.relate([
				{
					case: 'fixed',
					targets: [
						$('#uiProgressBar-color-0-box'),
						$('#uiProgressBar-color-1-box'),
						$('#uiProgressBar-color-2-box'),
						$('#uiProgressBar-color-3-box')
					]
				}
			]);

		$('#uiProgressBar-color-0-slider').synchronize($('#uiProgressBar-color-0'));
		$('#uiProgressBar-color-1-slider').synchronize($('#uiProgressBar-color-1'));
		$('#uiProgressBar-color-2-slider').synchronize($('#uiProgressBar-color-2'));
		$('#uiProgressBar-color-3-slider').synchronize($('#uiProgressBar-color-3'));

		const elements = document.querySelectorAll(`#uiProgressBar-image,
    #uiProgressBar-display, #uiProgressBar-clip,
    #uiProgressBar-type, #uiProgressBar-centerX, #uiProgressBar-centerY,
    #uiProgressBar-startAngle, #uiProgressBar-centralAngle, #uiProgressBar-step,
    #uiProgressBar-progress, #uiProgressBar-blend, #uiProgressBar-colorMode,
    #uiProgressBar-color-0, #uiProgressBar-color-1,
    #uiProgressBar-color-2, #uiProgressBar-color-3`);
		const sliders = document.querySelectorAll(`
    #uiProgressBar-color-0-slider, #uiProgressBar-color-1-slider,
    #uiProgressBar-color-2-slider, #uiProgressBar-color-3-slider`);
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

	UIProgressBar.create = function (this: typeof UIProgressBar) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'progressbar',
			name: 'ProgressBar',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			image: '',
			display: 'stretch',
			clip: [0, 0, 32, 32],
			type: 'horizontal',
			centerX: 0.5,
			centerY: 0.5,
			startAngle: -90,
			centralAngle: 360,
			step: 0,
			progress: 1,
			blend: 'normal',
			colorMode: 'texture',
			color: [0, 0, 0, 0],
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIProgressBar.open = function (this: typeof UIProgressBar, node: UIProgressBarData) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiProgressBar', node);
			write('image');
			write('display');
			write('clip');
			write('type');
			write('centerX');
			write('centerY');
			write('startAngle');
			write('centralAngle');
			write('step');
			write('progress');
			write('blend');
			write('colorMode');
			write('color-0');
			write('color-1');
			write('color-2');
			write('color-3');
			Inspector.uiElement.open(node);
		}
	};

	UIProgressBar.close = function (this: typeof UIProgressBar) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIProgressBar.update = function (
		this: typeof UIProgressBar,
		node: UIProgressBarData,
		key: string,
		value: unknown
	) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'image':
			case 'display':
			case 'clip':
			case 'type':
			case 'centerX':
			case 'centerY':
			case 'startAngle':
			case 'centralAngle':
			case 'step':
			case 'progress':
			case 'blend':
			case 'colorMode':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'color-0':
			case 'color-1':
			case 'color-2':
			case 'color-3': {
				const index = key.indexOf('-') + 1;
				const color = key.slice(index);
				if (node.color[color] !== value) {
					node.color[color] = value;
					// element.color[color] = value
					node.instances.setProperty(key, value);
				}
				break;
			}
		}
		UI.requestRendering!();
	};

	UIProgressBar.paramInput = function (
		this: HTMLElement & { [k: string]: unknown },
		event: Event
	) {
		UIProgressBar.update!(
			UIProgressBar.target as UIProgressBarData,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.uiProgressBar = UIProgressBar;
}
