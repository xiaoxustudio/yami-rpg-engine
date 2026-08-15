import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { clear, read, write } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

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
		[k: string]: any;
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

	FileTrigger.initialize = function (this: typeof FileTrigger) {
		if (!$('#fileTrigger-selector')) return;
		$('#fileTrigger-selector')?.loadItems?.([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		]);

		$('#fileTrigger-onHitWalls')?.loadItems?.([
			{ name: 'Penetrate', value: 'penetrate' },
			{ name: 'Destroy', value: 'destroy' }
		]);

		$('#fileTrigger-onHitActors')?.loadItems?.([
			{ name: 'Penetrate', value: 'penetrate' },
			{ name: 'Destroy', value: 'destroy' },
			{ name: 'Destroy After Multiple Hits', value: 'penetrate-destroy' }
		]);

		const elOnHitActors = $('#fileTrigger-onHitActors');
		if (elOnHitActors)
			elOnHitActors.enableHiddenMode().relate([
				{
					case: 'penetrate-destroy',
					targets: [$('#fileTrigger-hitCount')]
				}
			]);

		$('#fileTrigger-shape-type')?.loadItems?.([
			{ name: 'Rectangle', value: 'rectangle' },
			{ name: 'Circle', value: 'circle' },
			{ name: 'Sector', value: 'sector' }
		]);

		const elShapeType = $('#fileTrigger-shape-type');
		if (elShapeType)
			elShapeType.enableHiddenMode().relate([
				{
					case: 'rectangle',
					targets: [
						$('#fileTrigger-shape-width'),
						$('#fileTrigger-shape-height'),
						$('#fileTrigger-shape-anchor')
					]
				},
				{ case: 'circle', targets: [$('#fileTrigger-shape-radius')] },
				{
					case: 'sector',
					targets: [$('#fileTrigger-shape-radius'), $('#fileTrigger-shape-centralAngle')]
				}
			]);

		$('#fileTrigger-hitMode')?.loadItems?.([
			{ name: 'Once', value: 'once' },
			{ name: 'Once On Overlap', value: 'once-on-overlap' },
			{ name: 'Repeat', value: 'repeat' }
		]);

		const elHitMode = $('#fileTrigger-hitMode');
		if (elHitMode)
			elHitMode
				.enableHiddenMode()
				.relate([{ case: 'repeat', targets: [$('#fileTrigger-hitInterval')] }]);

		$('#fileTrigger-rotatable')?.loadItems?.([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);

		$('#fileTrigger-events')?.bind?.(new EventListInterface(this));

		$('#fileTrigger-scripts')?.bind?.(new ScriptListInterface());

		$('#fileTrigger-parameter-pane')?.bind?.($('#fileTrigger-scripts'));
	};

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
			($('#fileTrigger-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	FileTrigger.close = function (this: typeof FileTrigger) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.motions = null;
			clear($('#fileTrigger-events'));
			clear($('#fileTrigger-scripts'));
			clear($('#fileTrigger-parameter-pane'));
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
				if (trigger[key] !== value) {
					trigger[key] = value;
				}
				break;
			case 'shape-type':
				if (trigger.shape.type !== value) {
					const read = getElementReader('fileTrigger-shape');
					switch (value) {
						case 'rectangle':
							trigger.shape = {
								type: 'rectangle',
								width: read('width'),
								height: read('height'),
								anchor: read('anchor')
							};
							break;
						case 'circle':
							trigger.shape = {
								type: 'circle',
								radius: read('radius')
							};
							break;
						case 'sector':
							trigger.shape = {
								type: 'sector',
								radius: read('radius'),
								centralAngle: read('centralAngle')
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
		const elMotion = $('#fileTrigger-motion');
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		write(elMotion, read(elMotion));
	};

	FileTrigger.listChange = function (this: typeof FileTrigger, event: Event) {
		File.planToSave!(FileTrigger.meta);
	};

	Inspector.fileTrigger = FileTrigger;
}
