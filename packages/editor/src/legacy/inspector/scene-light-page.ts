import { $, getElementWriter } from '@/util/dom.ts';
import { clear, read, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	interface SceneLightShape {
		target: SceneLightData | null;
		update: ((light: SceneLightData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
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
		update: null,
		paramInput: null
	};

	SceneLight.initialize = function (this: typeof SceneLight) {
		if (!$('#sceneLight-name')) return;
		this.nameBox = $('#sceneLight-name');
		$('#sceneLight-type')?.loadItems?.([
			{ name: 'Point', value: 'point' },
			{ name: 'Area', value: 'area' }
		]);

		$('#sceneLight-blend')?.loadItems?.([
			{ name: 'Screen', value: 'screen' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' },
			{ name: 'Max', value: 'max' }
		]);

		const elLightType = $('#sceneLight-type');
		if (elLightType)
			elLightType.enableHiddenMode().relate([
				{
					case: 'point',
					targets: [$('#sceneLight-range-box'), $('#sceneLight-intensity-box')]
				},
				{
					case: 'area',
					targets: [
						$('#sceneLight-mask'),
						$('#sceneLight-anchorX-box'),
						$('#sceneLight-anchorY-box'),
						$('#sceneLight-width-box'),
						$('#sceneLight-height-box'),
						$('#sceneLight-angle-box')
					]
				}
			]);

		$('#sceneLight-conditions')?.bind?.(new ConditionListInterface(this, Scene));

		$('#sceneLight-events')?.bind?.(new EventListInterface(this, Scene));

		$('#sceneLight-scripts')?.bind?.(
			new ScriptListInterface(this as unknown as { target?: { id: string } }, Scene)
		);

		$('#sceneLight-parameter-pane')?.bind?.($('#sceneLight-scripts'));

		$('#sceneLight-range-slider')?.synchronize?.($('#sceneLight-range'));
		$('#sceneLight-intensity-slider')?.synchronize?.($('#sceneLight-intensity'));
		$('#sceneLight-anchorX-slider')?.synchronize?.($('#sceneLight-anchorX'));
		$('#sceneLight-anchorY-slider')?.synchronize?.($('#sceneLight-anchorY'));
		$('#sceneLight-width-slider')?.synchronize?.($('#sceneLight-width'));
		$('#sceneLight-height-slider')?.synchronize?.($('#sceneLight-height'));
		$('#sceneLight-angle-slider')?.synchronize?.($('#sceneLight-angle'));
		$('#sceneLight-red-slider')?.synchronize?.($('#sceneLight-red'));
		$('#sceneLight-green-slider')?.synchronize?.($('#sceneLight-green'));
		$('#sceneLight-blue-slider')?.synchronize?.($('#sceneLight-blue'));
		$('#sceneLight-direct-slider')?.synchronize?.($('#sceneLight-direct'));

		const elements = document.querySelectorAll(`
    #sceneLight-name, #sceneLight-type,
    #sceneLight-blend, #sceneLight-x, #sceneLight-y,
    #sceneLight-range, #sceneLight-intensity,
    #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY,
    #sceneLight-width, #sceneLight-height, #sceneLight-angle,
    #sceneLight-red, #sceneLight-green, #sceneLight-blue, #sceneLight-direct`);
		const sliders = document.querySelectorAll(`
    #sceneLight-range-slider, #sceneLight-intensity-slider,
    #sceneLight-anchorX-slider, #sceneLight-anchorY-slider,
    #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider,
    #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider, #sceneLight-direct-slider`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Scene))
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);
		document
			.querySelectorAll('#sceneLight-conditions, #sceneLight-events, #sceneLight-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

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
			write('name');
			write('type');
			write('blend');
			write('x');
			write('y');
			write('range');
			write('intensity');
			write('mask');
			write('anchorX');
			write('anchorY');
			write('width');
			write('height');
			write('angle');
			write('red');
			write('green');
			write('blue');
			write('direct');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneLight.close = function (this: typeof SceneLight) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear($('#sceneLight-conditions'));
			clear($('#sceneLight-events'));
			clear($('#sceneLight-scripts'));
			clear($('#sceneLight-parameter-pane'));
		}
	};

	SceneLight.write = function (this: typeof SceneLight, options: Record<string, unknown>) {
		if (options.x !== undefined) {
			write($('#sceneLight-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneLight-y'), options.y);
		}
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

	SceneLight.paramInput = function (this: typeof SceneLight, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneLight-').test(element.id)) break;
			element = element.parentElement;
		}
		SceneLight.update!(
			SceneLight.target as SceneLightData,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.sceneLight = SceneLight;
}
