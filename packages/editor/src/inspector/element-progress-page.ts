import { inspectorEls } from './element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner } from './ui-owner.ts';

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
		owner: UIOwner,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	UIProgressBar.initialize = function (this: typeof UIProgressBar) {};

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

			Inspector.uiElement.open(node);

			(
				inspectorEls.get('uiProgressBar-vue-mount') as unknown as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIProgressBar.close = function (this: typeof UIProgressBar) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
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
		getUIStore().planToSave();
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
		getUIStore().requestRendering();
	};

	Inspector.uiProgressBar = UIProgressBar;
}
