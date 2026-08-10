import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

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
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const UIReference: UIReferenceShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIReference.initialize = function (this: typeof UIReference) {
		if (!$('#uiReference-prefabId')) return;
		const elements = document.querySelectorAll(
			'#uiReference-prefabId, #uiReference-synchronous'
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, UI))
		);
	};

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

			const write = getElementWriter('uiReference', node);
			write('prefabId');
			write('synchronous');
			Inspector.uiElement.open(node);
		}
	};

	UIReference.close = function (this: typeof UIReference) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
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
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'prefabId':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instance.historyEnabled = true;
					node.instances.setProperty(key, value);
					node.instance.historyEnabled = false;
					UI.list.updateIcon(node);
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
		UI.requestRendering!();
	};

	UIReference.paramInput = function (this: typeof UIReference, event: Event) {
		UIReference.update!(
			UIReference.target as UIReferenceData,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.uiReference = UIReference;
}
