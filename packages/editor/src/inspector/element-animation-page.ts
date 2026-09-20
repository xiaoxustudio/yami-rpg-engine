import { inspectorEls } from './element-registry.ts';
import { read, write } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner } from './ui-owner.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';

{
	interface UIAnimationShape {
		target: UIAnimationData | null;
		update: ((node: UIAnimationData, key: string, value: unknown) => void) | null;
		paramInput: ((event: YamiEvent) => void) | null;
		animationIdWrite: ((event: YamiEvent) => void) | null;
		[k: string]: unknown;
	}
	interface UIAnimationData {
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIAnimation: UIAnimationShape = {
		owner: UIOwner,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null,
		animationIdWrite: null
	};

	UIAnimation.initialize = function (this: typeof UIAnimation) {};

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

			Inspector.uiElement.open(node);
			(
				inspectorEls.get('uiAnimation-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIAnimation.close = function (this: typeof UIAnimation) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
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
		getUIStore().planToSave();
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
		getUIStore().requestRendering();
	};

	UIAnimation.paramInput = function (this: typeof UIAnimation, event: YamiEvent) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiAnimation-').test(element.id)) break;
			element = element.parentElement;
		}
		UIAnimation.update!(
			UIAnimation.target as UIAnimationData,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	UIAnimation.animationIdWrite = function (this: typeof UIAnimation, event: YamiEvent) {
		const elMotion = inspectorEls.get('uiAnimation-motion') as YamiElement;
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		write(elMotion, read(elMotion));
	};

	Inspector.uiAnimation = UIAnimation;
}
