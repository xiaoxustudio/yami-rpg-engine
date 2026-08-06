import { $, getElementWriter } from '@/util/dom.ts';
import { read, write } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIAnimation = {
		owner: UI,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any,
		animationIdWrite: null as any
	};

	UIAnimation.initialize = function (this: any) {
		if (!$('#uiAnimation-animation')) return;
		$('#uiAnimation-animation').on('write', this.animationIdWrite);
		const elements = $(`#uiAnimation-animation, #uiAnimation-motion,
    #uiAnimation-autoplay, #uiAnimation-rotatable, #uiAnimation-angle,
    #uiAnimation-frame, #uiAnimation-offsetX, #uiAnimation-offsetY`);
		elements.forEach((el: HTMLElement) => el.addEventListener('input', this.paramInput!));
		elements.forEach((el: HTMLElement) => el.addEventListener('focus', Inspector.inputFocus));
		elements.forEach((el: HTMLElement) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, UI))
		);
	};

	UIAnimation.create = function (this: any) {
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

	UIAnimation.open = function (this: any, node: any) {
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

	UIAnimation.close = function (this: any) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIAnimation.update = function (this: any, node: any, key: any, value: any) {
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

	UIAnimation.paramInput = function (this: any, event: any) {
		UIAnimation.update!(UIAnimation.target, Inspector.getKey!(this), read(this));
	};

	UIAnimation.animationIdWrite = function (this: any, event: any) {
		const elMotion = $('#uiAnimation-motion');
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		write(elMotion, read(elMotion));
	};

	Inspector.uiAnimation = UIAnimation;
}
