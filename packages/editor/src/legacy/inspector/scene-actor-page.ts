import { $, getElementWriter } from '@/util/dom.ts';
import { clear, hide, show, write } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	interface SceneActorPlayer {
		destroy(): void;
		setAngle(angle: number): void;
		setScale(scale: number): void;
	}
	interface SceneActorData {
		player?: SceneActorPlayer;
		data?: { scale?: number };
		[k: string]: unknown;
	}
	interface SceneActorShape {
		target: SceneActorData | null;
		update: ((actor: SceneActorData, key: string, value: unknown) => void) | null;
		typeWrite: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const SceneActor: SceneActorShape = {
		owner: Scene,
		target: null,
		nameBox: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		datachange: null,
		typeWrite: null
	};

	SceneActor.initialize = function (this: typeof SceneActor) {
		if (!$('#sceneActor-name')) return;
		this.nameBox = $('#sceneActor-name');
		$('#sceneActor-type')?.loadItems?.([
			{ name: 'Local Actor', value: 'local' },
			{ name: 'Global Actor', value: 'global' }
		]);

		$('#sceneActor-conditions')?.bind?.(new ConditionListInterface(this, Scene));

		$('#sceneActor-events')?.bind?.(new EventListInterface(this, Scene));

		$('#sceneActor-scripts')?.bind?.(
			new ScriptListInterface(this as unknown as { target?: { id: string } }, Scene)
		);

		$('#sceneActor-parameter-pane')?.bind?.($('#sceneActor-scripts'));

		$('#sceneActor-angle-slider')?.synchronize?.($('#sceneActor-angle'));
		$('#sceneActor-scale-slider')?.synchronize?.($('#sceneActor-scale'));

		window.addEventListener('datachange', this.datachange as unknown as EventListener);
		const elements =
			document.querySelectorAll(`#sceneActor-name, #sceneActor-type, #sceneActor-actorId, #sceneActor-teamId,
    #sceneActor-x, #sceneActor-y, #sceneActor-angle, #sceneActor-scale`);
		const sliders = document.querySelectorAll(
			'#sceneActor-angle-slider, #sceneActor-scale-slider'
		);
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
			.querySelectorAll('#sceneActor-conditions, #sceneActor-events, #sceneActor-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

	SceneActor.create = function (this: typeof SceneActor) {
		return {
			class: 'actor',
			name: 'Actor',
			type: 'local',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			actorId: '',
			teamId: Data.teams.list[0].id,
			x: 0,
			y: 0,
			angle: 0,
			scale: 1,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneActor.open = function (this: typeof SceneActor, actor: SceneActorData) {
		if (this.target !== actor) {
			this.target = actor;

			const elTeamId = $('#sceneActor-teamId');
			elTeamId.loadItems(Data.createTeamItems!());

			const write = getElementWriter('sceneActor', actor);
			write('conditions');
			write('events');
			write('scripts');
			($('#sceneActor-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	SceneActor.close = function (this: typeof SceneActor) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear($('#sceneActor-conditions'));
			clear($('#sceneActor-events'));
			clear($('#sceneActor-scripts'));
			clear($('#sceneActor-parameter-pane'));
		}
	};

	SceneActor.write = function (this: typeof SceneActor, options: Record<string, unknown>) {
		if (options.x !== undefined) {
			write($('#sceneActor-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneActor-y'), options.y);
		}
		if (options.angle !== undefined) {
			write($('#sceneActor-angle'), options.angle);
		}
	};

	SceneActor.update = function (
		this: typeof SceneActor,
		actor: SceneActorData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (actor.name !== value) {
					actor.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(actor);
				}
				break;
			case 'type':
			case 'x':
			case 'y':
				if (actor[key] !== value) {
					actor[key] = value;
				}
				break;
			case 'actorId':
				if (actor.actorId !== value) {
					actor.actorId = value;
					actor.player!.destroy();
					delete actor.data;
					delete actor.player;
					Scene.loadActorContext!(actor);
				}
				break;
			case 'teamId':
				if (actor.teamId !== value) {
					actor.teamId = value;
					Scene.list.update();
				}
				break;
			case 'angle':
				if (actor.angle !== value) {
					actor.angle = value;
					if (actor.player) {
						actor.player.setAngle(Math.radians(value as number));
					}
				}
				break;
			case 'scale':
				if (actor.scale !== value) {
					actor.scale = value;
					actor.player!.setScale((value as number) * (actor.data?.scale ?? 1));
				}
				break;
		}
		Scene.requestRendering!();
	};

	SceneActor.datachange = function (this: typeof SceneActor, event: Event & { key: string }) {
		if (this.target && event.key === 'teams') {
			const elTeamId = $('#sceneActor-teamId');
			elTeamId.loadItems(Data.createTeamItems!());
			this.target.teamId = '';
			elTeamId.update();
			elTeamId.dispatchEvent(new Event('input'));
		}
	}.bind(SceneActor);

	SceneActor.typeWrite = function (this: typeof SceneActor, event: Event & { value: unknown }) {
		switch (event.value) {
			case 'local':
				show($('#sceneActor-scripts-detail'));
				show($('#sceneActor-parameter-pane'));
				break;
			case 'global':
				hide($('#sceneActor-scripts-detail'));
				hide($('#sceneActor-parameter-pane'));
				break;
		}
	};

	Inspector.sceneActor = SceneActor;
}
