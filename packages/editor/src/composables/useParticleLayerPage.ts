import '@app/inspector/particle-layer-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

export interface ParticleForm {
	name: string;
	area: {
		type: string;
		x: number;
		y: number;
		width: number;
		height: number;
		radius: number;
	};
	count: number;
	delay: number;
	interval: number;
	lifetime: number;
	lifetimeDev: number;
	fadeout: number;
	anchor: {
		x: number[];
		y: number[];
		speedX: number[];
		speedY: number[];
	};
	movement: {
		angle: number[];
		speed: number[];
		accelAngle: number[];
		accel: number[];
	};
	rotation: {
		angle: number[];
		speed: number[];
		accel: number[];
	};
	hRotation: {
		radius: number[];
		expansionSpeed: number[];
		expansionAccel: number[];
		angle: number[];
		angularSpeed: number[];
		angularAccel: number[];
	};
	scale: {
		factor: number[];
		speed: number[];
		accel: number[];
	};
	image: string;
	blend: string;
	light: string;
	sort: string;
	sprite: {
		mode: string;
		hframes: number;
		vframes: number;
		interval: number;
	};
	color: {
		mode: string;
		rgba: number[];
		min: number[];
		max: number[];
		easingId: string;
		startMin: number[];
		startMax: number[];
		endMin: number[];
		endMax: number[];
		tint: number[];
	};
}

const SIMPLE_KEYS: (keyof ParticleForm)[] = [
	'name',
	'count',
	'delay',
	'interval',
	'lifetime',
	'lifetimeDev',
	'fadeout',
	'image',
	'blend',
	'light',
	'sort'
];

export function useParticleLayerPage() {
	const form = reactive<ParticleForm>({
		name: '',
		area: { type: 'point', x: 0, y: 0, width: 64, height: 64, radius: 32 },
		count: 0,
		delay: 0,
		interval: 40,
		lifetime: 1000,
		lifetimeDev: 0,
		fadeout: 200,
		anchor: { x: [0, 0], y: [0, 0], speedX: [0, 0], speedY: [0, 0] },
		movement: { angle: [0, 0], speed: [0, 0], accelAngle: [0, 0], accel: [0, 0] },
		rotation: { angle: [0, 0], speed: [0, 0], accel: [0, 0] },
		hRotation: {
			radius: [0, 0],
			expansionSpeed: [0, 0],
			expansionAccel: [0, 0],
			angle: [0, 0],
			angularSpeed: [0, 0],
			angularAccel: [0, 0]
		},
		scale: { factor: [1, 1], speed: [0, 0], accel: [0, 0] },
		image: '',
		blend: 'additive',
		light: 'raw',
		sort: 'youngest-in-front',
		sprite: { mode: 'random', hframes: 1, vframes: 1, interval: 100 },
		color: {
			mode: 'texture',
			rgba: [255, 255, 255, 255],
			min: [0, 0, 0, 255],
			max: [255, 255, 255, 255],
			easingId: '',
			startMin: [0, 0, 0, 255],
			startMax: [255, 255, 255, 255],
			endMin: [0, 0, 0, 255],
			endMax: [255, 255, 255, 255],
			tint: [0, 0, 0, 0]
		}
	});

	const sync = (): void => {
		const target = Inspector?.particleLayer?.target as Partial<ParticleForm> | null | undefined;
		if (!target) return;
		for (const key of SIMPLE_KEYS) {
			const value = target[key];
			if (value !== undefined) {
				(form as Record<string, unknown>)[key] = value;
			}
		}
		form.area = {
			type: target.area?.type ?? 'point',
			x: target.area?.x ?? 0,
			y: target.area?.y ?? 0,
			width: target.area?.width ?? 64,
			height: target.area?.height ?? 64,
			radius: target.area?.radius ?? 32
		};
		form.anchor = {
			x: [target.anchor?.x?.[0] ?? 0, target.anchor?.x?.[1] ?? 0],
			y: [target.anchor?.y?.[0] ?? 0, target.anchor?.y?.[1] ?? 0],
			speedX: [target.anchor?.speedX?.[0] ?? 0, target.anchor?.speedX?.[1] ?? 0],
			speedY: [target.anchor?.speedY?.[0] ?? 0, target.anchor?.speedY?.[1] ?? 0]
		};
		form.movement = {
			angle: [target.movement?.angle?.[0] ?? 0, target.movement?.angle?.[1] ?? 0],
			speed: [target.movement?.speed?.[0] ?? 0, target.movement?.speed?.[1] ?? 0],
			accelAngle: [
				target.movement?.accelAngle?.[0] ?? 0,
				target.movement?.accelAngle?.[1] ?? 0
			],
			accel: [target.movement?.accel?.[0] ?? 0, target.movement?.accel?.[1] ?? 0]
		};
		form.rotation = {
			angle: [target.rotation?.angle?.[0] ?? 0, target.rotation?.angle?.[1] ?? 0],
			speed: [target.rotation?.speed?.[0] ?? 0, target.rotation?.speed?.[1] ?? 0],
			accel: [target.rotation?.accel?.[0] ?? 0, target.rotation?.accel?.[1] ?? 0]
		};
		form.hRotation = {
			radius: [target.hRotation?.radius?.[0] ?? 0, target.hRotation?.radius?.[1] ?? 0],
			expansionSpeed: [
				target.hRotation?.expansionSpeed?.[0] ?? 0,
				target.hRotation?.expansionSpeed?.[1] ?? 0
			],
			expansionAccel: [
				target.hRotation?.expansionAccel?.[0] ?? 0,
				target.hRotation?.expansionAccel?.[1] ?? 0
			],
			angle: [target.hRotation?.angle?.[0] ?? 0, target.hRotation?.angle?.[1] ?? 0],
			angularSpeed: [
				target.hRotation?.angularSpeed?.[0] ?? 0,
				target.hRotation?.angularSpeed?.[1] ?? 0
			],
			angularAccel: [
				target.hRotation?.angularAccel?.[0] ?? 0,
				target.hRotation?.angularAccel?.[1] ?? 0
			]
		};
		form.scale = {
			factor: [target.scale?.factor?.[0] ?? 1, target.scale?.factor?.[1] ?? 1],
			speed: [target.scale?.speed?.[0] ?? 0, target.scale?.speed?.[1] ?? 0],
			accel: [target.scale?.accel?.[0] ?? 0, target.scale?.accel?.[1] ?? 0]
		};
		form.sprite = {
			mode: target.sprite?.mode ?? 'random',
			hframes: target.sprite?.hframes ?? 1,
			vframes: target.sprite?.vframes ?? 1,
			interval: target.sprite?.interval ?? 100
		};
		form.color = {
			mode: target.color?.mode ?? 'texture',
			rgba: [
				target.color?.rgba?.[0] ?? 255,
				target.color?.rgba?.[1] ?? 255,
				target.color?.rgba?.[2] ?? 255,
				target.color?.rgba?.[3] ?? 255
			],
			min: [
				target.color?.min?.[0] ?? 0,
				target.color?.min?.[1] ?? 0,
				target.color?.min?.[2] ?? 0,
				target.color?.min?.[3] ?? 255
			],
			max: [
				target.color?.max?.[0] ?? 255,
				target.color?.max?.[1] ?? 255,
				target.color?.max?.[2] ?? 255,
				target.color?.max?.[3] ?? 255
			],
			easingId:
				target.color?.easingId ??
				(Inspector?.particleLayer?.easingDefaultId as string | undefined) ??
				'',
			startMin: [
				target.color?.startMin?.[0] ?? 0,
				target.color?.startMin?.[1] ?? 0,
				target.color?.startMin?.[2] ?? 0,
				target.color?.startMin?.[3] ?? 255
			],
			startMax: [
				target.color?.startMax?.[0] ?? 255,
				target.color?.startMax?.[1] ?? 255,
				target.color?.startMax?.[2] ?? 255,
				target.color?.startMax?.[3] ?? 255
			],
			endMin: [
				target.color?.endMin?.[0] ?? 0,
				target.color?.endMin?.[1] ?? 0,
				target.color?.endMin?.[2] ?? 0,
				target.color?.endMin?.[3] ?? 255
			],
			endMax: [
				target.color?.endMax?.[0] ?? 255,
				target.color?.endMax?.[1] ?? 255,
				target.color?.endMax?.[2] ?? 255,
				target.color?.endMax?.[3] ?? 255
			],
			tint: [
				target.color?.tint?.[0] ?? 0,
				target.color?.tint?.[1] ?? 0,
				target.color?.tint?.[2] ?? 0,
				target.color?.tint?.[3] ?? 0
			]
		};
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^particleLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.particleLayer.update(
				Inspector.particleLayer.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
