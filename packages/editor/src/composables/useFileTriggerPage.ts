import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface TriggerForm {
	selector: string;
	onHitWalls: string;
	onHitActors: string;
	hitCount: number;
	speed: number;
	hitMode: string;
	hitInterval: number;
	initialDelay: number;
	effectiveTime: number;
	duration: number;
	inherit: string;
	animationId: string;
	motion: string;
	priority: number;
	offsetY: number;
	rotatable: boolean;
	shapeType: string;
	shapeWidth: number;
	shapeHeight: number;
	shapeAnchor: number;
	shapeRadius: number;
	shapeCentralAngle: number;
}

const TRIGGER_KEYS: (keyof TriggerTarget)[] = [
	'selector',
	'onHitWalls',
	'onHitActors',
	'hitCount',
	'speed',
	'hitMode',
	'hitInterval',
	'initialDelay',
	'effectiveTime',
	'duration',
	'inherit',
	'animationId',
	'motion',
	'priority',
	'offsetY',
	'rotatable'
];

interface TriggerTarget {
	selector: string;
	onHitWalls: string;
	onHitActors: string;
	hitCount: number;
	speed: number;
	hitMode: string;
	hitInterval: number;
	initialDelay: number;
	effectiveTime: number;
	duration: number;
	inherit: string;
	animationId: string;
	motion: string;
	priority: number;
	offsetY: number;
	rotatable: boolean;
	shape: {
		type: string;
		width?: number;
		height?: number;
		anchor?: number;
		radius?: number;
		centralAngle?: number;
	};
}

export function useFileTriggerPage() {
	const form = reactive<Partial<TriggerForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileTrigger?.target as TriggerTarget | null | undefined;
		if (!target) return;
		for (const key of TRIGGER_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
		form.shapeType = target.shape?.type;
		form.shapeWidth = target.shape?.width ?? 1;
		form.shapeHeight = target.shape?.height ?? 1;
		form.shapeAnchor = target.shape?.anchor ?? 0.5;
		form.shapeRadius = target.shape?.radius ?? 0.5;
		form.shapeCentralAngle = target.shape?.centralAngle ?? 90;
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileTrigger-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileTrigger.update(
				Inspector.fileTrigger.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
