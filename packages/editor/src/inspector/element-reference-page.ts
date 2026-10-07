import { inspectorEls } from './element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner } from './ui-owner.ts';

{
	interface UIReferenceData {
		instance: {
			historyEnabled: boolean;
		};
		instances: {
			setProperty(key: string, value: unknown): void;
		};
		[k: string]: unknown;
	}
	interface UIReferenceShape {
		target: UIReferenceData | null;
		update: ((node: UIReferenceData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const UIReference: UIReferenceShape = {
		owner: UIOwner,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	UIReference.initialize = function (this: typeof UIReference) {};

	UIReference.create = function (this: typeof UIReference) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'reference',
			name: 'Reference',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			prefabId: '',
			synchronous: false,
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIReference.open = function (this: typeof UIReference, node: UIReferenceData) {
		if (this.target !== node) {
			this.target = node;
			Inspector.uiElement.open(node);
			(
				inspectorEls.get('uiReference-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIReference.close = function (this: typeof UIReference) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIReference.update = function (
		this: typeof UIReference,
		node: UIReferenceData,
		key: string,
		value: unknown
	) {
		getUIStore().planToSave();
		switch (key) {
			case 'prefabId':
				if (node[key] !== value) {
					node[key] = value;
					node.instance.historyEnabled = true;
					node.instances.setProperty(key, value);
					node.instance.historyEnabled = false;
					const uiList = getUIStore().elements.list;
					if (uiList) uiList.update();
				}
				break;
			case 'synchronous':
				if (node[key] !== value) {
					node[key] = value;
					node.instance.historyEnabled = true;
					node.instances.setProperty(key, value);
					node.instance.historyEnabled = false;
				}
				break;
		}
		getUIStore().requestRendering();
	};

	Inspector.uiReference = UIReference;
}
