import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { clear, read, write } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import type { TriggerForm } from '@app/composables/useFileTriggerPage';
import type { YamiElement } from '@app/types/element-api';
import { registryElement } from '@app/utils/element-registry';

{
	interface FileTriggerShape {
		target: FileTriggerData | null;
		meta: { file: unknown } | null;
		motions: unknown;
		update: ((trigger: FileTriggerData, key: string, value: unknown) => void) | null;
		listChange: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	interface FileTriggerData {
		selector: string;
		animationId: string;
		guid?: string;
		events?: unknown;
		shape: {
			type: string;
			width?: unknown;
			height?: unknown;
			anchor?: unknown;
			radius?: unknown;
			centralAngle?: unknown;
		};
		[k: string]: unknown;
	}
	const FileTrigger: FileTriggerShape = {
		target: null,
		meta: null,
		motions: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		animationIdWrite: null,
		listChange: null
	};

	FileTrigger.initialize = function () {};

	FileTrigger.create = function (this: typeof FileTrigger) {
		return {
			selector: 'enemy',
			onHitWalls: 'penetrate',
			onHitActors: 'penetrate',
			hitCount: 2,
			shape: {
				type: 'circle',
				radius: 0.5
			},
			speed: 0,
			hitMode: 'once',
			hitInterval: 0,
			initialDelay: 0,
			effectiveTime: 0,
			duration: 0,
			inherit: '',
			animationId: '',
			motion: '',
			priority: 0,
			offsetY: 0,
			rotatable: true,
			events: [],
			scripts: []
		};
	};

	FileTrigger.open = function (
		this: typeof FileTrigger,
		trigger: FileTriggerData,
		meta: { file: unknown }
	) {
		if (this.meta !== meta) {
			this.target = trigger;
			this.meta = meta;

			const write = getElementWriter('fileTrigger', trigger);
			write('events');
			write('scripts');
			(
				inspectorEls.get('fileTrigger-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	FileTrigger.close = function (this: typeof FileTrigger) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.motions = null;
			clear(inspectorEls.get('fileTrigger-events'));
			clear(inspectorEls.get('fileTrigger-scripts'));
			clear(inspectorEls.get('fileTrigger-parameter-pane'));
		}
	};

	FileTrigger.update = function (
		this: typeof FileTrigger,
		trigger: FileTriggerData,
		key: string,
		value: unknown
	) {
		File.planToSave!(this.meta);
		switch (key) {
			case 'selector':
			case 'onHitWalls':
			case 'onHitActors':
			case 'hitCount':
			case 'speed':
			case 'hitMode':
			case 'hitInterval':
			case 'initialDelay':
			case 'effectiveTime':
			case 'duration':
			case 'inherit':
				if ((trigger as Record<string, unknown>)[key] !== value) {
					(trigger as Record<string, unknown>)[key] = value;
				}
				break;
			case 'shape-type':
				if (trigger.shape.type !== value) {
					const form = registryElement<HTMLElement & { form?: TriggerForm }>(
						inspectorEls,
						'fileTrigger-vue-mount'
					)?.form;
					switch (value) {
						case 'rectangle':
							trigger.shape = {
								type: 'rectangle',
								width: form?.shapeWidth,
								height: form?.shapeHeight,
								anchor: form?.shapeAnchor
							};
							break;
						case 'circle':
							trigger.shape = {
								type: 'circle',
								radius: form?.shapeRadius
							};
							break;
						case 'sector':
							trigger.shape = {
								type: 'sector',
								radius: form?.shapeRadius,
								centralAngle: form?.shapeCentralAngle
							};
							break;
					}
				}
				break;
			case 'shape-width':
			case 'shape-height':
			case 'shape-anchor':
			case 'shape-radius':
			case 'shape-centralAngle': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index) as
					| 'width'
					| 'height'
					| 'anchor'
					| 'radius'
					| 'centralAngle';
				if (trigger.shape[property] !== value) {
					trigger.shape[property] = value;
				}
				break;
			}
			case 'animationId':
				if (trigger.animationId !== value) {
					trigger.animationId = value as string;
					FileTrigger.motions = null;
				}
				break;
			case 'motion':
			case 'priority':
			case 'offsetY':
			case 'rotatable':
				if (trigger[key] !== value) {
					trigger[key] = value;
				}
				break;
		}
	};

	FileTrigger.animationIdWrite = function (
		this: typeof FileTrigger,
		event: Event & { value?: string }
	) {
		if (!event.value) return;
		const elMotion = inspectorEls.get('fileTrigger-motion') as YamiElement;
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		write(elMotion, read(elMotion));
	};

	FileTrigger.listChange = function (this: typeof FileTrigger, _event: Event) {
		File.planToSave!(FileTrigger.meta);
	};

	Inspector.fileTrigger = FileTrigger;
}
