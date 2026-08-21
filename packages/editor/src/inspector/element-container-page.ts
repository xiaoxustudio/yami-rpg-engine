import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';

{
	interface UIContainerShape {
		[k: string]: any;
	}
	interface UIContainerData {
		class: string;
		name: string;
		enabled: boolean;
		expanded: boolean;
		hidden: boolean;
		locked: boolean;
		presetId: string;
		pointerEvents: string;
		transform: unknown;
		events: unknown[];
		scripts: unknown[];
		children: unknown[];
		[k: string]: unknown;
	}
	const UIContainer: UIContainerShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null
	};

	UIContainer.initialize = function (this: typeof UIContainer) {};

	UIContainer.create = function (this: typeof UIContainer): UIContainerData {
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

	UIContainer.open = function (this: typeof UIContainer, node: UIContainerData) {
		if (this.target !== node) {
			this.target = node;
			Inspector.uiElement.open(node);
		}
	};

	UIContainer.close = function (this: typeof UIContainer) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	Inspector.uiContainer = UIContainer;
}
