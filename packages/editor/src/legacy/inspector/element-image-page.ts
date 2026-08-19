import { getElementWriter } from '@app/utils/dom';
import { Inspector } from './inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { read } from '@app/utils/element-utils.ts';

{
	interface UIImageShape {
		target: UIImageData | null;
		update: ((node: UIImageData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface UIImageData {
		instances: { setProperty(key: string, value: unknown): void };
		tint: Record<string, unknown>;
		[k: string]: unknown;
	}
	const UIImage: UIImageShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIImage.initialize = function (this: typeof UIImage) {};

	UIImage.create = function (this: typeof UIImage) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'image',
			name: 'Image',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			image: '',
			display: 'stretch',
			flip: 'none',
			blend: 'normal',
			shiftX: 0,
			shiftY: 0,
			clip: [0, 0, 32, 32],
			border: 1,
			tint: [0, 0, 0, 0],
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIImage.open = function (this: typeof UIImage, node: UIImageData) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiImage', node);
			write('image');
			write('display');
			write('flip');
			write('blend');
			write('shiftX');
			write('shiftY');
			write('clip');
			write('border');
			write('tint-0');
			write('tint-1');
			write('tint-2');
			write('tint-3');
			Inspector.uiElement.open(node);
		}
	};

	UIImage.close = function (this: typeof UIImage) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIImage.update = function (
		this: typeof UIImage,
		node: UIImageData,
		key: string,
		value: unknown
	) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'image':
			case 'display':
			case 'flip':
			case 'blend':
			case 'shiftX':
			case 'shiftY':
			case 'clip':
			case 'border':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'tint-0':
			case 'tint-1':
			case 'tint-2':
			case 'tint-3': {
				const index = key.indexOf('-') + 1;
				const color = key.slice(index);
				if (node.tint[color] !== value) {
					node.tint[color] = value;
					// element.tint[color] = value
					node.instances.setProperty(key, value);
				}
				break;
			}
		}
		UI.requestRendering!();
	};

	UIImage.paramInput = function (this: typeof UIImage, event: Event) {
		UIImage.update!(UIImage.target as UIImageData, Inspector.getKey!(this), read(this));
	};

	Inspector.uiImage = UIImage;
}
