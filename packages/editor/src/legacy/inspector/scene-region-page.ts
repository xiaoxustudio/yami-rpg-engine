import { $, getElementWriter } from '@/util/dom.ts';
import { clear, read, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const SceneRegion = {
		owner: Scene,
		target: null as any,
		nameBox: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		write: null as any,
		update: null as any,
		paramInput: null as any
	};

	SceneRegion.initialize = function (this: any) {
		if (!$('#sceneRegion-name')) return;
		this.nameBox = $('#sceneRegion-name');
		$('#sceneRegion-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneRegion-events').bind(new EventListInterface(this, Scene));

		$('#sceneRegion-scripts').bind(new ScriptListInterface(this, Scene));

		$('#sceneRegion-parameter-pane').bind($('#sceneRegion-scripts'));

		const elements = $(`#sceneRegion-name, #sceneRegion-color,
    #sceneRegion-x, #sceneRegion-y, #sceneRegion-width, #sceneRegion-height`);
		elements.forEach((el: HTMLElement) => el.addEventListener('input', this.paramInput!));
		elements.forEach((el: HTMLElement) => el.addEventListener('focus', Inspector.inputFocus));
		elements.forEach((el: HTMLElement) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Scene))
		);
		$('#sceneRegion-conditions, #sceneRegion-events, #sceneRegion-scripts').forEach(
			(el: HTMLElement) => el.addEventListener('change', Scene.listChange)
		);
	};

	SceneRegion.create = function (this: any) {
		return {
			class: 'region',
			name: 'Region',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			color: '00000080',
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneRegion.open = function (this: any, region: any) {
		if (this.target !== region) {
			this.target = region;

			const write = getElementWriter('sceneRegion', region);
			write('name');
			write('color');
			write('x');
			write('y');
			write('width');
			write('height');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneRegion.close = function (this: any) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear($('#sceneRegion-conditions'));
			clear($('#sceneRegion-events'));
			clear($('#sceneRegion-scripts'));
			clear($('#sceneRegion-parameter-pane'));
		}
	};

	SceneRegion.write = function (this: any, options: any) {
		if (options.x !== undefined) {
			write($('#sceneRegion-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneRegion-y'), options.y);
		}
	};

	SceneRegion.update = function (this: any, region: any, key: any, value: any) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (region.name !== value) {
					region.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(region);
				}
				break;
			case 'x':
			case 'y':
			case 'width':
			case 'height':
				if (region[key] !== value) {
					region[key] = value;
				}
				break;
			case 'color':
				if (region.color !== value) {
					region.color = value;
					Scene.list.updateIcon!(region);
				}
				break;
		}
		Scene.requestRendering!();
	};

	SceneRegion.paramInput = function (this: any, event: any) {
		SceneRegion.update(SceneRegion.target, Inspector.getKey!(this), read(this));
	};

	Inspector.sceneRegion = SceneRegion;
}
