import { inspectorPageSync } from '@app/composables/inspector-page-sync';
import { getElementWriter } from '@app/utils/dom';
import { getSceneActorMeta } from '@app/composables/inspector-section-bridges';
import { sceneActorNodes } from '@app/composables/inspector-page-nodes';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import { radians } from '@app/utils/math';

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
		typeWrite: ((event: YamiEvent) => void) | null;
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

	SceneActor.initialize = function () {};

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

			const elTeamId = sceneActorNodes.pick('teamId') as YamiElement;
			elTeamId.loadItems(Data.createTeamItems!());

			const write = getElementWriter('sceneActor', actor);
			write('conditions');
			write('events');
			write('scripts');
			inspectorPageSync.sceneActor.get()?.sync();
		}
	};

	SceneActor.close = function (this: typeof SceneActor) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			getSceneActorMeta()?.clearLists();
		}
	};

	SceneActor.write = function (this: typeof SceneActor, _options: Record<string, unknown>) {
		inspectorPageSync.sceneActor.get()?.sync();
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
						actor.player.setAngle(radians(value as number));
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
			const elTeamId = sceneActorNodes.pick('teamId') as YamiElement;
			elTeamId.loadItems(Data.createTeamItems!());
			this.target.teamId = '';
			elTeamId.update();
			elTeamId.dispatchEvent(new Event('input'));
		}
	}.bind(SceneActor);

	SceneActor.typeWrite = function (this: typeof SceneActor, event: YamiEvent) {
		switch (event.value) {
			case 'local':
				getSceneActorMeta()?.setScriptsDetailVisible(true);
				break;
			case 'global':
				getSceneActorMeta()?.setScriptsDetailVisible(false);
				break;
		}
	};

	Inspector.sceneActor = SceneActor;
}
