import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

export interface ForEachForm {
	data: string;
	list: { type: string; key: string };
	actor: { type: string };
	element: { type: string };
	attributeGroupId: string;
	enumGroupId: string;
	variable: { type: string; key: string };
	saveIndex: { type: string; key: string };
	touchId: { type: string; key: string };
}

Command.cases.forEach = new CommandSchema({
	name: 'forEach',
	onInitialize() {
		$('#forEach-data')?.loadItems?.([
			{ name: 'List', value: 'list' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Inventory', value: 'inventory' },
			{ name: 'Element', value: 'element' },
			{ name: 'Party Member', value: 'member' },
			{ name: 'Attribute Key', value: 'attribute' },
			{ name: 'Enumeration Value', value: 'enum' },
			{ name: 'Save Data', value: 'save' },
			{ name: 'Touch Point', value: 'touch' },
			{ name: 'Changed Touch Point', value: 'changed-touch' }
		]);
		$('#forEach-data')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'list',
					targets: [$('#forEach-list'), $('#forEach-variable')]
				},
				{
					case: ['skill', 'state', 'equipment', 'inventory'],
					targets: [$('#forEach-actor'), $('#forEach-variable')]
				},
				{
					case: 'element',
					targets: [$('#forEach-element'), $('#forEach-variable')]
				},
				{ case: 'member', targets: [$('#forEach-variable')] },
				{
					case: 'attribute',
					targets: [$('#forEach-attribute-groupId'), $('#forEach-variable')]
				},
				{
					case: 'enum',
					targets: [$('#forEach-enum-groupId'), $('#forEach-variable')]
				},
				{ case: 'save', targets: [$('#forEach-saveIndex')] },
				{
					case: ['touch', 'changed-touch'],
					targets: [$('#forEach-touchId')]
				}
			]);
		$('#forEach')?.on?.('closed', () => {
			this.commands = null;
		});
	},
	customParse({
		data,
		list,
		actor,
		element,
		groupId,
		variable,
		saveIndex,
		touchId,
		commands
	}: {
		data: string;
		list: unknown;
		actor: unknown;
		element: unknown;
		groupId: unknown;
		variable: unknown;
		saveIndex: unknown;
		touchId: unknown;
		commands: unknown;
	}) {
		const dataInfo = Local.get!('command.forEach.' + data);
		const words = Command.words;
		switch (data) {
			case 'list': {
				const varName = Command.parseVariable!(variable, 'any', true);
				const listName = Command.parseVariable!(list, 'object');
				words.push(varName + Token(' = ') + listName + Token(' -> ') + dataInfo);
				break;
			}
			case 'skill':
			case 'state':
			case 'equipment':
			case 'inventory': {
				const varName = Command.parseVariable!(variable, 'object', true);
				const actorInfo = Command.parseActor!(actor);
				words.push(varName + Token(' = ') + actorInfo + Token(' -> ') + dataInfo);
				break;
			}
			case 'element': {
				const varName = Command.parseVariable!(variable, 'object', true);
				const elInfo = Command.parseElement!(element);
				words.push(varName + Token(' = ') + elInfo + Token(' -> ') + dataInfo);
				break;
			}
			case 'member': {
				const varName = Command.parseVariable!(variable, 'object', true);
				words.push(varName + Token(' = ') + dataInfo);
				break;
			}
			case 'attribute': {
				const varName = Command.parseVariable!(variable, 'string', true);
				const group = Command.parseAttributeGroup!(groupId);
				words.push(varName + Token(' = ') + group + Token(' -> ') + dataInfo);
				break;
			}
			case 'enum': {
				const varName = Command.parseVariable!(variable, 'string', true);
				const group = Command.parseEnumGroup!(groupId);
				words.push(varName + Token(' = ') + group + Token(' -> ') + dataInfo);
				break;
			}
			case 'save': {
				const varName = Command.parseVariable!(saveIndex, 'number', true);
				words.push(
					Token('{') +
						varName +
						Command.setDelimiterColor!(', ...}') +
						Token(' = ') +
						dataInfo
				);
				break;
			}
			case 'touch':
			case 'changed-touch': {
				const varName = Command.parseVariable!(touchId, 'number', true);
				words.push(varName + Token(' = ') + dataInfo);
				break;
			}
		}
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get!('command.forEach') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get!('command.forEach.end') }
		];
	},
	customLoad({
		data = 'list',
		list = { type: 'local', key: '' },
		actor = { type: 'trigger' },
		element = { type: 'trigger' },
		groupId = '',
		variable = { type: 'local', key: '' },
		saveIndex = { type: 'local', key: '' },
		touchId = { type: 'local', key: '' },
		commands = []
	}: {
		data: string;
		groupId: string;
		list: unknown;
		actor: unknown;
		element: unknown;
		variable: unknown;
		saveIndex: unknown;
		touchId: unknown;
		commands: unknown;
	}) {
		let attrGroupId = '';
		let enumGroupId = '';
		switch (data) {
			case 'attribute':
				attrGroupId = groupId;
				break;
			case 'enum':
				enumGroupId = groupId;
				break;
		}
		const setForm = (
			$('#forEach') as
				| (HTMLElement & { setForm?: (data: Partial<ForEachForm>) => void })
				| null
		)?.setForm;
		setForm?.({
			data,
			list: list as { type: string; key: string },
			actor: actor as { type: string },
			element: element as { type: string },
			attributeGroupId: attrGroupId,
			enumGroupId: enumGroupId,
			variable: variable as { type: string; key: string },
			saveIndex: saveIndex as { type: string; key: string },
			touchId: touchId as { type: string; key: string }
		});
		this.commands = commands;
		getFocus($('#forEach-data'));
	},
	customSave() {
		const getForm = ($('#forEach') as (HTMLElement & { getForm?: () => ForEachForm }) | null)
			?.getForm;
		const form = getForm?.() ?? ({} as ForEachForm);
		const data = form.data;
		const commands = this.commands;
		switch (data) {
			case 'list': {
				const list = form.list;
				if (VariableGetter.isNone!(list)) {
					return getFocus($('#forEach-list'));
				}
				const variable = form.variable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#forEach-variable'));
				}
				Command.save!({ data, list, variable, commands });
				break;
			}
			case 'skill':
			case 'state':
			case 'equipment':
			case 'inventory': {
				const actor = form.actor;
				const variable = form.variable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#forEach-variable'));
				}
				Command.save!({ data, actor, variable, commands });
				break;
			}
			case 'element': {
				const element = form.element;
				const variable = form.variable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#forEach-variable'));
				}
				Command.save!({ data, element, variable, commands });
				break;
			}
			case 'member':
				const variable = form.variable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#forEach-variable'));
				}
				Command.save!({ data, variable, commands });
				break;
			case 'attribute': {
				const groupId = form.attributeGroupId;
				if (groupId === '') {
					return getFocus($('#forEach-attribute-groupId'));
				}
				const variable = form.variable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#forEach-variable'));
				}
				Command.save!({ data, groupId, variable, commands });
				break;
			}
			case 'enum': {
				const groupId = form.enumGroupId;
				if (groupId === '') {
					return getFocus($('#forEach-enum-groupId'));
				}
				const variable = form.variable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#forEach-variable'));
				}
				Command.save!({ data, groupId, variable, commands });
				break;
			}
			case 'save': {
				const saveIndex = form.saveIndex;
				if (VariableGetter.isNone!(saveIndex)) {
					return getFocus($('#forEach-saveIndex'));
				}
				Command.save!({ data, saveIndex, commands });
				break;
			}
			case 'touch':
			case 'changed-touch': {
				const touchId = form.touchId;
				if (VariableGetter.isNone!(touchId)) {
					return getFocus($('#forEach-touchId'));
				}
				Command.save!({ data, touchId, commands });
				break;
			}
		}
	}
});
