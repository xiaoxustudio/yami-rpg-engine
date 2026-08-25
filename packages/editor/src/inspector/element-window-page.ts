import { getElementWriter } from '@app/utils/dom';
import { read } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';

{
	interface UIWindowShape {
		target: UIWindowData | null;
		update: ((node: UIWindowData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface UIWindowData {
		layout: string;
		overflow: string;
		instances: { setProperty(key: string, value: unknown): void; resize(): void };
		[k: string]: unknown;
	}
	const UIWindow: UIWindowShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIWindow.initialize = function (this: typeof UIWindow) {};

	UIWindow.create = function (this: typeof UIWindow) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'window',
			name: 'Window',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			layout: 'normal',
			scrollX: 0,
			scrollY: 0,
			gridWidth: 0,
			gridHeight: 0,
			gridGapX: 0,
			gridGapY: 0,
			paddingX: 0,
			paddingY: 0,
			overflow: 'visible',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIWindow.open = function (this: typeof UIWindow, node: UIWindowData) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiWindow', node);
			write('layout');
			write('scrollX');
			write('scrollY');
			write('gridWidth');
			write('gridHeight');
			write('gridGapX');
			write('gridGapY');
			write('paddingX');
			write('paddingY');
			write('overflow');
			Inspector.uiElement.open(node);
		}
	};

	UIWindow.close = function (this: typeof UIWindow) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIWindow.update = function (
		this: typeof UIWindow,
		node: UIWindowData,
		key: string,
		value: unknown
	) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'layout':
			case 'overflow':
				if (node[key] !== value) {
					(node as Record<string, unknown>)[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'scrollX':
			case 'scrollY':
			case 'gridWidth':
			case 'gridHeight':
			case 'gridGapX':
			case 'gridGapY':
			case 'paddingX':
			case 'paddingY':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value element.resize()
					node.instances.setProperty(key, value);
					node.instances.resize();
				}
				break;
		}
		UI.requestRendering!();
	};

	UIWindow.paramInput = function (this: HTMLElement & { [k: string]: unknown }, _event: Event) {
		UIWindow.update!(UIWindow.target as UIWindowData, Inspector.getKey!(this), read(this));
	};

	Inspector.uiWindow = UIWindow;
}
