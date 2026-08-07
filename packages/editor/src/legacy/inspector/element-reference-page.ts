import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIReference = {
		owner: UI,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	UIReference.initialize = function (this: any) {
		if (!$('#uiReference-prefabId')) return;
		const elements = document.querySelectorAll(
			'#uiReference-prefabId, #uiReference-synchronous'
		);
		elements.forEach((el: any) => el.addEventListener('input', this.paramInput));
		elements.forEach((el: any) => el.addEventListener('focus', Inspector.inputFocus));
		elements.forEach((el: any) => el.addEventListener('blur', Inspector.inputBlur!(this, UI)));
	};

	UIReference.create = function (this: any) {
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

	UIReference.open = function (this: any, node: any) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiReference', node);
			write('prefabId');
			write('synchronous');
			Inspector.uiElement.open(node);
		}
	};

	UIReference.close = function (this: any) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIReference.update = function (this: any, node: any, key: any, value: any) {
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

	UIReference.paramInput = function (this: any, event: any) {
		UIReference.update!(UIReference.target, Inspector.getKey!(this), read(this));
	};

	Inspector.uiReference = UIReference;
}
