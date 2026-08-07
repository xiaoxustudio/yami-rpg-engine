import { $, getElementWriter } from '@/util/dom.ts';
import { clear, disable, enable, hide, read, show, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIElement = {
		owner: UI,
		target: null as any,
		synchronous: false,
		nameBox: null as any,
		pointerEvents: null as any,
		generalGroup: null as any,
		transformGroup: null as any,
		eventsGroup: null as any,
		scriptsGroup: null as any,
		parameterPane: null as any,
		initialize: null as any,
		createTransform: null as any,
		lockSizeInputs: null as any,
		unlockSizeInputs: null as any,
		open: null as any,
		close: null as any,
		write: null as any,
		update: null as any,
		pageSwitch: null as any,
		alignmentClick: null as any,
		paramInput: null as any
	};

	UIElement.initialize = function (this: any) {
		if (!$('#uiElement-name')) return;
		this.nameBox = $('#uiElement-name');
		this.pointerEvents = $('#uiElement-pointerEvents');
		this.generalGroup = $('#uiElement-general-group');
		this.transformGroup = $('#uiElement-transform-group');
		this.eventsGroup = $('#uiElement-events-group');
		this.scriptsGroup = $('#uiElement-scripts-group');
		this.parameterPane = $('#uiElement-parameter-pane');
		this.pointerEvents.loadItems([
			{ name: 'Enabled', value: 'enabled' },
			{ name: 'Disabled', value: 'disabled' },
			{ name: 'Skipped', value: 'skipped' }
		]);

		$('#uiElement-events').bind(new EventListInterface(this, UI));

		$('#uiElement-scripts').bind(new ScriptListInterface(this, UI));

		this.parameterPane.bind($('#uiElement-scripts'));

		// this.generalGroup.remove() this.transformGroup.remove() this.eventsGroup.remove() this.scriptsGroup.remove()

		Inspector.manager.on('switch', this.pageSwitch);
		const alignElements = $('.uiElement-transform-align');
		(alignElements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('click', this.alignmentClick)
		);
		// 18 控件 input 经 Vue 模板转发（UIImagePage.vue @input → UIElement.paramInput）
		const otherElements = document.querySelectorAll(`#uiElement-name,
    #uiElement-pointerEvents, #uiElement-transform-anchorX, #uiElement-transform-anchorY,
    #uiElement-transform-x, #uiElement-transform-x2, #uiElement-transform-y, #uiElement-transform-y2,
    #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
    #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
    #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`);
		(otherElements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		(otherElements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			(el as HTMLElement).on('blur', Inspector.inputBlur!(this, UI))
		);
		document
			.querySelectorAll('#uiElement-events, #uiElement-scripts')
			.forEach((el) => (el as HTMLElement).on('change', UI.listChange));
	};

	UIElement.createTransform = function (this: any) {
		return {
			anchorX: 0,
			anchorY: 0,
			x: 0,
			x2: 0,
			y: 0,
			y2: 0,
			width: 0,
			width2: 0,
			height: 0,
			height2: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			skewY: 0,
			opacity: 1
		};
	};

	UIElement.lockSizeInputs = function (this: any) {
		if (!this.synchronous) {
			this.synchronous = true;
			disable(
				document.querySelectorAll(`#uiElement-transform-anchorX, #uiElement-transform-anchorY,
      #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
      #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
      #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`)
			);
		}
	};

	UIElement.unlockSizeInputs = function (this: any) {
		if (this.synchronous) {
			this.synchronous = false;
			enable(
				document.querySelectorAll(`#uiElement-transform-anchorX, #uiElement-transform-anchorY,
      #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
      #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
      #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`)
			);
		}
	};

	UIElement.open = function (this: any, node: any) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiElement', node);
			write('name');
			if (node.pointerEvents) {
				show(this.pointerEvents);
				show(this.pointerEvents.previousElementSibling);
				write('pointerEvents');
			} else {
				hide(this.pointerEvents);
				hide(this.pointerEvents.previousElementSibling);
			}
			if (node.class === 'reference' && node.synchronous) {
				this.lockSizeInputs();
			} else {
				this.unlockSizeInputs();
			}
			write('transform-anchorX');
			write('transform-anchorY');
			write('transform-x');
			write('transform-x2');
			write('transform-y');
			write('transform-y2');
			write('transform-width');
			write('transform-width2');
			write('transform-height');
			write('transform-height2');
			write('transform-rotation');
			write('transform-scaleX');
			write('transform-scaleY');
			write('transform-skewX');
			write('transform-skewY');
			write('transform-opacity');
			write('events');
			write('scripts');
		}
	};

	UIElement.close = function (this: any) {
		if (this.target) {
			this.target = null;
			clear($('#uiElement-events'));
			clear($('#uiElement-scripts'));
			clear($('#uiElement-parameter-pane'));
		}
	};

	UIElement.write = function (this: any, options: any) {
		if (options.anchorX !== undefined) {
			write($('#uiElement-transform-anchorX'), options.anchorX);
		}
		if (options.anchorY !== undefined) {
			write($('#uiElement-transform-anchorY'), options.anchorY);
		}
		if (options.x !== undefined) {
			write($('#uiElement-transform-x'), options.x);
		}
		if (options.x2 !== undefined) {
			write($('#uiElement-transform-x2'), options.x2);
		}
		if (options.y !== undefined) {
			write($('#uiElement-transform-y'), options.y);
		}
		if (options.y2 !== undefined) {
			write($('#uiElement-transform-y2'), options.y2);
		}
		if (options.width !== undefined) {
			write($('#uiElement-transform-width'), options.width);
		}
		if (options.width2 !== undefined) {
			write($('#uiElement-transform-width2'), options.width2);
		}
		if (options.height !== undefined) {
			write($('#uiElement-transform-height'), options.height);
		}
		if (options.height2 !== undefined) {
			write($('#uiElement-transform-height2'), options.height2);
		}
		if (options.rotation !== undefined) {
			write($('#uiElement-transform-rotation'), options.rotation);
		}
		if (options.scaleX !== undefined) {
			write($('#uiElement-transform-scaleX'), options.scaleX);
		}
		if (options.scaleY !== undefined) {
			write($('#uiElement-transform-scaleY'), options.scaleY);
		}
		if (options.skewX !== undefined) {
			write($('#uiElement-transform-skewX'), options.skewX);
		}
		if (options.skewY !== undefined) {
			write($('#uiElement-transform-skewY'), options.skewY);
		}
		if (options.opacity !== undefined) {
			write($('#uiElement-transform-opacity'), options.opacity);
		}
	};

	UIElement.update = function (this: any, node: any, key: any, value: any) {
		UI.planToSave!();
		const transform = node.transform;
		switch (key) {
			case 'name':
				if (node.name !== value) {
					node.name = value;
					UI.list.updateItemName(node);
				}
				break;
			case 'pointerEvents':
				if (node.pointerEvents !== value) {
					node.pointerEvents = value;
				}
				break;
			case 'transform-anchorX':
			case 'transform-anchorY':
			case 'transform-x':
			case 'transform-x2':
			case 'transform-y':
			case 'transform-y2':
			case 'transform-width':
			case 'transform-width2':
			case 'transform-height':
			case 'transform-height2':
			case 'transform-rotation':
			case 'transform-scaleX':
			case 'transform-scaleY':
			case 'transform-skewX':
			case 'transform-skewY':
			case 'transform-opacity': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (transform[property] !== value) {
					// transform[property] = value element.resize()
					node.instances.setProperty(key, value);
					node.instances.resize();
				}
				break;
			}
		}
		UI.requestRendering!();
	};

	UIElement.pageSwitch = function (this: any, event: any) {
		switch (event.value) {
			case 'uiImage':
			case 'uiText':
			case 'uiTextBox':
			case 'uiDialogBox':
			case 'uiProgressBar':
			case 'uiButton':
			case 'uiAnimation':
			case 'uiVideo':
			case 'uiWindow':
			case 'uiContainer':
			case 'uiReference': {
				const page = Inspector.manager.active;
				page.insertBefore(this.transformGroup, page.firstChild);
				page.insertBefore(this.generalGroup, page.firstChild);
				page.appendChild(this.eventsGroup);
				page.appendChild(this.scriptsGroup);
				page.appendChild(this.parameterPane);
				break;
			}
		}
	}.bind(UIElement);

	UIElement.alignmentClick = function (this: any, event: any) {
		let x;
		let y;
		switch (this.getAttribute('value')) {
			case 'left':
				x = 0;
				break;
			case 'center':
				x = 0.5;
				break;
			case 'right':
				x = 1;
				break;
			case 'top':
				y = 0;
				break;
			case 'middle':
				y = 0.5;
				break;
			case 'bottom':
				y = 1;
				break;
		}
		const node = UIElement.target;
		const elements = node.instances;
		const transform = node.transform;
		const changes = [] as any[];
		if (x !== undefined) {
			if (transform.anchorX !== x) {
				const input = $('#uiElement-transform-anchorX');
				changes.push({
					input: input,
					oldValue: transform.anchorX,
					newValue: x
				});
				// transform.anchorX = x
				elements.setProperty('transform-anchorX', x);
				write(input, x);
			}
			if (transform.x !== 0) {
				const input = $('#uiElement-transform-x');
				changes.push({
					input: input,
					oldValue: transform.x,
					newValue: 0
				});
				// transform.x = 0
				elements.setProperty('transform-x', 0);
				write(input, 0);
			}
			if (transform.x2 !== x) {
				const input = $('#uiElement-transform-x2');
				changes.push({
					input: input,
					oldValue: transform.x2,
					newValue: x
				});
				// transform.x2 = x
				elements.setProperty('transform-x2', x);
				write(input, x);
			}
		}
		if (y !== undefined) {
			if (transform.anchorY !== y) {
				const input = $('#uiElement-transform-anchorY');
				changes.push({
					input: input,
					oldValue: transform.anchorY,
					newValue: y
				});
				// transform.anchorY = y
				elements.setProperty('transform-anchorY', y);
				write(input, y);
			}
			if (transform.y !== 0) {
				const input = $('#uiElement-transform-y');
				changes.push({
					input: input,
					oldValue: transform.y,
					newValue: 0
				});
				// transform.y = 0
				elements.setProperty('transform-y', 0);
				write(input, 0);
			}
			if (transform.y2 !== y) {
				const input = $('#uiElement-transform-y2');
				changes.push({
					input: input,
					oldValue: transform.y2,
					newValue: y
				});
				// transform.y2 = y
				elements.setProperty('transform-y2', y);
				write(input, y);
			}
		}
		if (changes.length !== 0) {
			elements.resize();
			UI.planToSave!();
			UI.requestRendering!();
			UI.history.save({
				type: 'inspector-change',
				editor: UIElement,
				target: UIElement.target,
				changes: changes
			});
		}
	};

	UIElement.paramInput = function (this: any, event: any) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (element.id.startsWith('uiElement-')) break;
			element = element.parentElement;
		}
		UIElement.update(UIElement.target, Inspector.getKey!(element), read(element));
	};

	Inspector.uiElement = UIElement;
}
