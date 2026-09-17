import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { clear } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';

{
	interface SceneLightShape {
		target: SceneLightData | null;
		update: ((light: SceneLightData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface SceneLightData {
		instance: { measure(): void };
		[k: string]: unknown;
	}
	const SceneLight: SceneLightShape = {
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

	SceneLight.initialize = function () {};

	SceneLight.create = function (this: typeof SceneLight) {
		return {
			class: 'light',
			name: 'Light',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			type: 'point',
			blend: 'screen',
			x: 0,
			y: 0,
			range: 4,
			intensity: 0,
			mask: '',
			anchorX: 0.5,
			anchorY: 0.5,
			width: 1,
			height: 1,
			angle: 0,
			red: 255,
			green: 255,
			blue: 255,
			direct: 0.5,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneLight.open = function (this: typeof SceneLight, light: SceneLightData) {
		if (this.target !== light) {
			this.target = light;

			const write = getElementWriter('sceneLight', light);
			write('conditions');
			write('events');
			write('scripts');
			(
				inspectorEls.get('sceneLight-vue-mount') as unknown as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	SceneLight.close = function (this: typeof SceneLight) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear(inspectorEls.get('sceneLight-conditions'));
			clear(inspectorEls.get('sceneLight-events'));
			clear(inspectorEls.get('sceneLight-scripts'));
			clear(inspectorEls.get('sceneLight-parameter-pane'));
		}
	};

	SceneLight.write = function (this: typeof SceneLight, _options: Record<string, unknown>) {
		(
			inspectorEls.get('sceneLight-vue-mount') as unknown as HTMLElement & {
				sync?: () => void;
			}
		)?.sync?.();
	};

	SceneLight.update = function (
		this: typeof SceneLight,
		light: SceneLightData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (light.name !== value) {
					light.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(light);
				}
				break;
			case 'type':
				if (light.type !== value) {
					light.type = value;
					light.instance.measure();
				}
				break;
			case 'blend':
			case 'x':
			case 'y':
			case 'range':
			case 'intensity':
			case 'mask':
				if (light[key] !== value) {
					light[key] = value;
				}
				break;
			case 'anchorX':
			case 'anchorY':
			case 'width':
			case 'height':
			case 'angle':
				if (light[key] !== value) {
					light[key] = value;
					light.instance.measure();
				}
				break;
			case 'red':
			case 'green':
			case 'blue':
				if (light[key] !== value) {
					light[key] = value;
					Scene.list.update();
				}
				break;
			case 'direct':
				if (light[key] !== value) {
					light[key] = value;
				}
				break;
		}
		Scene.requestRendering!();
	};

	Inspector.sceneLight = SceneLight;
}
