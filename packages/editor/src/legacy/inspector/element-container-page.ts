import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface UIContainerShape {
		[k: string]: any;
	}
	const UIContainer: UIContainerShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null
	};

	UIContainer.initialize = function (this: any) {};

	UIContainer.create = function (this: any) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'container',
			name: 'Container',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIContainer.open = function (this: any, node: any) {
		if (this.target !== node) {
			this.target = node;
			Inspector.uiElement.open(node);
		}
	};

	UIContainer.close = function (this: any) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	Inspector.uiContainer = UIContainer;
}
