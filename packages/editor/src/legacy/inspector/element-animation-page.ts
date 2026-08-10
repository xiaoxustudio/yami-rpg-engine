import { $, getElementWriter } from '@/util/dom.ts';
import { read, write } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UIAnimationShape {
		target: UIAnimationData | null;
		update: ((node: UIAnimationData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		animationIdWrite: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	interface UIAnimationData {
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIAnimation: UIAnimationShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null,
		animationIdWrite: null
	};

	UIAnimation.initialize = function (this: typeof UIAnimation) {
		if (!$('#uiAnimation-animation')) return;
		$('#uiAnimation-animation').on('write', this.animationIdWrite);
		const elements = document.querySelectorAll(`#uiAnimation-animation, #uiAnimation-motion,
    #uiAnimation-autoplay, #uiAnimation-rotatable, #uiAnimation-angle,
    #uiAnimation-frame, #uiAnimation-offsetX, #uiAnimation-offsetY`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, UI))
		);
	};

	UIAnimation.create = function (this: typeof UIAnimation) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'animation',
			name: 'Animation',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			animation: '',
			motion: '',
			autoplay: true,
			rotatable: false,
			angle: 0,
			frame: 0,
			offsetX: 0,
			offsetY: 0,
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIAnimation.open = function (this: typeof UIAnimation, node: UIAnimationData) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiAnimation', node);
			write('animation');
			write('motion');
			write('autoplay');
			write('rotatable');
			write('angle');
			write('frame');
			write('offsetX');
			write('offsetY');
			Inspector.uiElement.open(node);
		}
	};

	UIAnimation.close = function (this: typeof UIAnimation) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIAnimation.update = function (
		this: typeof UIAnimation,
		node: UIAnimationData,
		key: string,
		value: unknown
	) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'animation':
			case 'motion':
			case 'autoplay':
			case 'rotatable':
			case 'angle':
			case 'frame':
			case 'offsetX':
			case 'offsetY':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
		}
		UI.requestRendering!();
	};

	UIAnimation.paramInput = function (this: typeof UIAnimation, event: Event) {
		UIAnimation.update!(
			UIAnimation.target as UIAnimationData,
			Inspector.getKey!(this),
			read(this)
		);
	};

	UIAnimation.animationIdWrite = function (this: typeof UIAnimation, event: Event) {
		const elMotion = $('#uiAnimation-motion');
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		write(elMotion, read(elMotion));
	};

	Inspector.uiAnimation = UIAnimation;
}
