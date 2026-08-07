import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIWindow = {
		owner: UI,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	UIWindow.initialize = function (this: any) {
		if (!$('#uiWindow-layout')) return;
		$('#uiWindow-layout').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Horizontal Grid', value: 'horizontal-grid' },
			{ name: 'Vertical Grid', value: 'vertical-grid' }
		]);

		$('#uiWindow-layout')
			.enableHiddenMode()
			.relate([
				{
					case: 'normal',
					targets: [$('#uiWindow-scrollX'), $('#uiWindow-scrollY')]
				},
				{
					case: ['horizontal-grid', 'vertical-grid'],
					targets: [
						$('#uiWindow-scrollX'),
						$('#uiWindow-scrollY'),
						$('#uiWindow-gridWidth'),
						$('#uiWindow-gridHeight'),
						$('#uiWindow-gridGapX'),
						$('#uiWindow-gridGapY'),
						$('#uiWindow-paddingX'),
						$('#uiWindow-paddingY')
					]
				}
			]);

		$('#uiWindow-overflow').loadItems([
			{ name: 'Visible', value: 'visible' },
			{ name: 'Hidden', value: 'hidden' }
		]);

		const elements = document.querySelectorAll(`#uiWindow-layout,
    #uiWindow-scrollX, #uiWindow-scrollY, #uiWindow-gridWidth,
    #uiWindow-gridHeight, #uiWindow-gridGapX, #uiWindow-gridGapY,
    #uiWindow-paddingX, #uiWindow-paddingY, #uiWindow-overflow`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			(el as HTMLElement).on('blur', Inspector.inputBlur!(this, UI))
		);
	};

	UIWindow.create = function (this: any) {
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

	UIWindow.open = function (this: any, node: any) {
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

	UIWindow.close = function (this: any) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIWindow.update = function (this: any, node: any, key: any, value: any) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'layout':
			case 'overflow':
				if (node[key] !== value) {
					node[key] = value;
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

	UIWindow.paramInput = function (this: any, event: any) {
		UIWindow.update!(UIWindow.target, Inspector.getKey!(this), read(this));
	};

	Inspector.uiWindow = UIWindow;
}
