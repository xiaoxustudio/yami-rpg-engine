import { $ } from '@/util/dom.ts';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@/types/legacy-shapes.ts';

interface ActorGetterShape extends AccessorBaseShape {
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const ActorGetter: ActorGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

ActorGetter.initialize = function (this: ActorGetterShape) {
	if (!$('#actorGetter-type')) return;
	$('#actorGetter-type').loadItems([
		{ name: 'Event Trigger Actor', value: 'trigger' },
		{ name: 'Skill Caster', value: 'caster' },
		{ name: 'Latest Actor', value: 'latest' },
		{ name: 'Target Actor', value: 'target' },
		{ name: 'Player Actor', value: 'player' },
		{ name: 'Party Member', value: 'member' },
		{ name: 'Global Actor', value: 'global' },
		{ name: 'By Actor ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#actorGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'member', targets: [$('#actorGetter-memberId')] },
			{ case: 'global', targets: [$('#actorGetter-actorId')] },
			{ case: 'by-id', targets: [$('#actorGetter-presetId')] },
			{ case: 'variable', targets: [$('#actorGetter-variable')] }
		]);
};

ActorGetter.open = function (this: ActorGetterShape, target: AccessorTarget) {
	this.target = target;
	useActorGetterWindow().open(target, {
		presetId: PresetObject.getDefaultPresetId('actor')
	});
};

ActorGetter.checkDataForPlugin = function (this: ActorGetterShape, data: unknown) {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'actor';
	}
	return false;
};

ActorGetter.createDefaultForPlugin = function (this: ActorGetterShape) {
	return { getter: 'actor', type: 'trigger' };
};

ActorGetter.confirm = function (this: ActorGetterShape, event: Event) {
	useActorGetterWindow().confirm();
};
