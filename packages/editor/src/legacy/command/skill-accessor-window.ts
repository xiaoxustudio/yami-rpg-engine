import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const SkillGetter = {
	target: null as any,
	initialize: null as any,
	open: null as any,
	checkDataForPlugin: null as any,
	createDefaultForPlugin: null as any,
	confirm: null as any
};

SkillGetter.initialize = function (this: any) {
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

	on($('#skillGetter-confirm'), 'click', this.confirm);
};

SkillGetter.open = function (this: any, target: any) {
	this.target = target;
	getWindow().open('skillGetter');

	$('#skillGetter-key').loadItems(Enum.getStringItems('shortcut-key'));

	let actor = { type: 'trigger' };
	let key = Enum.getDefStringId('shortcut-key');
	let skillId = '';
	let variable = { type: 'local', key: '' };
	const skill = target.dataValue;
	switch (skill.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-key':
			actor = skill.actor;
			key = skill.key;
			break;
		case 'by-id':
			actor = skill.actor;
			skillId = skill.skillId;
			break;
		case 'variable':
			variable = skill.variable;
			break;
	}
	write($('#skillGetter-type'), skill.type);
	write($('#skillGetter-actor'), actor);
	write($('#skillGetter-key'), key);
	write($('#skillGetter-skillId'), skillId);
	write($('#skillGetter-variable'), variable);
	getFocus($('#skillGetter-type'));
};

SkillGetter.checkDataForPlugin = function (this: any, data: any) {
	if (data instanceof Object) {
		return data.getter === 'skill';
	}
	return false;
};

SkillGetter.createDefaultForPlugin = function (this: any) {
	return { getter: 'skill', type: 'trigger' };
};

SkillGetter.confirm = function (this: any, event: any) {
	const read = getElementReader('skillGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-key': {
			const actor = read('actor');
			const key = read('key');
			if (key === '') {
				return getFocus($('#skillGetter-key'));
			}
			getter = { type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = read('actor');
			const skillId = read('skillId');
			if (skillId === '') {
				return getFocus($('#skillGetter-skillId'));
			}
			getter = { type, actor, skillId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#skillGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target.isPluginInput) {
		getter = { getter: 'skill', ...getter };
	}
	this.target.input(getter);
	getWindow().close('skillGetter');
}.bind(SkillGetter);
