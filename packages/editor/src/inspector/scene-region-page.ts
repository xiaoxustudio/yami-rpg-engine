import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { clear } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';

{
	interface SceneRegionShape {
		target: Record<string, unknown> | null;
		update: ((region: Record<string, unknown>, key: string, value: unknown) => void) | null;
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
		update: null
	};

	SceneRegion.initialize = function () {};

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
			write('conditions');
			write('events');
			write('scripts');
			(
				inspectorEls.get('sceneRegion-vue-mount') as HTMLElement & { sync?: () => void }
			)?.sync?.();
		}
	};

	SceneRegion.close = function (this: typeof SceneRegion) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear(inspectorEls.get('sceneRegion-conditions'));
			clear(inspectorEls.get('sceneRegion-events'));
			clear(inspectorEls.get('sceneRegion-scripts'));
			clear(inspectorEls.get('sceneRegion-parameter-pane'));
		}
	};

	SceneRegion.write = function (this: typeof SceneRegion, _options: Record<string, unknown>) {
		(
			inspectorEls.get('sceneRegion-vue-mount') as HTMLElement & { sync?: () => void }
		)?.sync?.();
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
					Scene.list.update();
				}
				break;
		}
		Scene.requestRendering!();
	};

	Inspector.sceneRegion = SceneRegion;
}
