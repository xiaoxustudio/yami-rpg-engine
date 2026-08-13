import { $, getElementWriter } from '@/util/dom.ts';
import { clear, read, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	interface SceneParticleData {
		emitter: {
			angle: number;
			opacity: unknown;
			scale: unknown;
			speed: unknown;
		};
		[k: string]: unknown;
	}
	interface SceneParticleShape {
		target: SceneParticleData | null;
		update: ((particle: SceneParticleData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const SceneParticle: SceneParticleShape = {
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

	SceneParticle.initialize = function (this: typeof SceneParticle) {
		if (!$('#sceneParticle-name')) return;
		this.nameBox = $('#sceneParticle-name');
		$('#sceneParticle-conditions')?.bind?.(new ConditionListInterface(this, Scene));

		$('#sceneParticle-events')?.bind?.(new EventListInterface(this, Scene));

		$('#sceneParticle-scripts')?.bind?.(
			new ScriptListInterface(this as unknown as { target?: { id: string } }, Scene)
		);

		$('#sceneParticle-parameter-pane')?.bind?.($('#sceneParticle-scripts'));

		$('#sceneParticle-angle-slider')?.synchronize?.($('#sceneParticle-angle'));
		$('#sceneParticle-scale-slider')?.synchronize?.($('#sceneParticle-scale'));
		$('#sceneParticle-speed-slider')?.synchronize?.($('#sceneParticle-speed'));
		$('#sceneParticle-opacity-slider')?.synchronize?.($('#sceneParticle-opacity'));
		$('#sceneParticle-priority-slider')?.synchronize?.($('#sceneParticle-priority'));

		const elements = document.querySelectorAll(`#sceneParticle-name, #sceneParticle-particleId,
    #sceneParticle-x, #sceneParticle-y, #sceneParticle-angle,
    #sceneParticle-scale, #sceneParticle-speed, #sceneParticle-opacity, #sceneParticle-priority`);
		const sliders = document.querySelectorAll(`#sceneParticle-angle-slider,
    #sceneParticle-scale-slider, #sceneParticle-speed-slider,
    #sceneParticle-opacity-slider, #sceneParticle-priority-slider`);
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
			.querySelectorAll(
				'#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts'
			)
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

	SceneParticle.create = function (this: typeof SceneParticle) {
		return {
			class: 'particle',
			name: 'Particle',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			particleId: '',
			x: 0,
			y: 0,
			angle: 0,
			scale: 1,
			speed: 1,
			opacity: 1,
			priority: 0,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneParticle.open = function (this: typeof SceneParticle, particle: SceneParticleData) {
		if (this.target !== particle) {
			this.target = particle;

			const write = getElementWriter('sceneParticle', particle);
			write('name');
			write('particleId');
			write('x');
			write('y');
			write('angle');
			write('scale');
			write('speed');
			write('opacity');
			write('priority');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneParticle.close = function (this: typeof SceneParticle) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear($('#sceneParticle-conditions'));
			clear($('#sceneParticle-events'));
			clear($('#sceneParticle-scripts'));
			clear($('#sceneParticle-parameter-pane'));
		}
	};

	SceneParticle.write = function (this: typeof SceneParticle, options: Record<string, unknown>) {
		if (options.x !== undefined) {
			write($('#sceneParticle-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneParticle-y'), options.y);
		}
	};

	SceneParticle.update = function (
		this: typeof SceneParticle,
		particle: SceneParticleData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (particle.name !== value) {
					particle.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(particle);
				}
				break;
			case 'particleId':
				if (particle.particleId !== value) {
					particle.particleId = value;
					Scene.loadParticleContext!(particle);
					Scene.list.update();
				}
				break;
			case 'x':
			case 'y':
			case 'priority':
				if (particle[key] !== value) {
					// const {x, y} = particle
					particle[key] = value;
					// particle.emitter?.shift(Scene.getConvertedCoords!({ x: particle.x - x, y: particle.y - y, }))
				}
				break;
			case 'angle':
				if (particle.angle !== value) {
					particle.angle = value;
					if (particle.emitter) {
						particle.emitter.angle = Math.radians(value as number);
					}
				}
				break;
			case 'scale':
				if (particle.scale !== value) {
					particle.scale = value;
					if (particle.emitter) {
						particle.emitter.scale = value;
					}
				}
				break;
			case 'speed':
				if (particle.speed !== value) {
					particle.speed = value;
					if (particle.emitter) {
						particle.emitter.speed = value;
					}
				}
				break;
			case 'opacity':
				if (particle.opacity !== value) {
					particle.opacity = value;
					if (particle.emitter) {
						particle.emitter.opacity = value;
					}
				}
				break;
		}
		Scene.requestRendering!();
	};

	SceneParticle.paramInput = function (this: typeof SceneParticle, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^sceneParticle-').test(element.id)) break;
			element = element.parentElement;
		}
		SceneParticle.update!(
			SceneParticle.target as SceneParticleData,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.sceneParticle = SceneParticle;
}
