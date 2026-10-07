import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner } from './ui-owner.ts';
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
		owner: UIOwner,
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

			Inspector.uiElement.open(node);
		}
	};

	UIImage.close = function (this: typeof UIImage) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
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
		getUIStore().planToSave();
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
					node.instances.setProperty(key, value);
				}
				break;
			}
		}
		getUIStore().requestRendering();
	};

	UIImage.paramInput = function (this: typeof UIImage, _event: Event) {
		UIImage.update!(UIImage.target as UIImageData, Inspector.getKey!(this), read(this));
	};

	Inspector.uiImage = UIImage;
}
