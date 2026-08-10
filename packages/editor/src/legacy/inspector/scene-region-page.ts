import { $, getElementWriter } from '@/util/dom.ts';
import { clear, read, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	interface SceneRegionShape {
		target: Record<string, unknown> | null;
		update: ((region: Record<string, unknown>, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const SceneRegion: SceneRegionShape = {
		owner: Scene,
		target: null,
		nameBox: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	SceneRegion.initialize = function (this: typeof SceneRegion) {
		if (!$('#sceneRegion-name')) return;
		this.nameBox = $('#sceneRegion-name');
		$('#sceneRegion-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneRegion-events').bind(new EventListInterface(this, Scene));

		$('#sceneRegion-scripts').bind(
			new ScriptListInterface(this as unknown as { target?: { id: string } }, Scene)
		);

		$('#sceneRegion-parameter-pane').bind($('#sceneRegion-scripts'));

		const elements = document.querySelectorAll(`#sceneRegion-name, #sceneRegion-color,
    #sceneRegion-x, #sceneRegion-y, #sceneRegion-width, #sceneRegion-height`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Scene))
		);
		document
			.querySelectorAll('#sceneRegion-conditions, #sceneRegion-events, #sceneRegion-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

	SceneRegion.create = function (this: typeof SceneRegion) {
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

	SceneRegion.open = function (this: typeof SceneRegion, region: Record<string, unknown>) {
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

	SceneRegion.close = function (this: typeof SceneRegion) {
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

	SceneRegion.write = function (this: typeof SceneRegion, options: Record<string, unknown>) {
		if (options.x !== undefined) {
			write($('#sceneRegion-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneRegion-y'), options.y);
		}
	};

	SceneRegion.update = function (
		this: typeof SceneRegion,
		region: Record<string, unknown>,
		key: string,
		value: unknown
	) {
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

	SceneRegion.paramInput = function (this: typeof SceneRegion, event: Event) {
		SceneRegion.update!(
			SceneRegion.target as Record<string, unknown>,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.sceneRegion = SceneRegion;
}
