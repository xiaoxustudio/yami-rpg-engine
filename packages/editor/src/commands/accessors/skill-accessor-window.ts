import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@app/types/shapes.ts';

interface SkillGetterShape extends AccessorBaseShape {
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const SkillGetter: SkillGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

SkillGetter.initialize = function (this: SkillGetterShape) {
	if (!$('#skillGetter-type')) return;
	$('#skillGetter-type').loadItems([
		{ name: 'Event Trigger Skill', value: 'trigger' },
		{ name: 'Latest Skill', value: 'latest' },
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Skill ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#skillGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-key',
				targets: [$('#skillGetter-actor'), $('#skillGetter-key')]
			},
			{
				case: 'by-id',
				targets: [$('#skillGetter-actor'), $('#skillGetter-skillId')]
			},
			{ case: 'variable', targets: [$('#skillGetter-variable')] }
		]);

	on($('#skillGetter-confirm'), 'click', this.confirm!);
};

SkillGetter.open = function (this: SkillGetterShape, target: AccessorTarget) {
	this.target = target;
	const key = Enum.getDefStringId('shortcut-key');
	$('#skillGetter-key').loadItems(Enum.getStringItems('shortcut-key'));
	useSkillGetterWindow().open(target, { key });
};

SkillGetter.checkDataForPlugin = function (this: SkillGetterShape, data: unknown) {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'skill';
	}
	return false;
};

SkillGetter.createDefaultForPlugin = function (this: SkillGetterShape) {
	return { getter: 'skill', type: 'trigger' };
};

SkillGetter.confirm = function (this: SkillGetterShape, event: Event) {
	useSkillGetterWindow().confirm();
};
