import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
		const dataInfo = t('command.forEach.' + data);
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
			{ text: t('command.forEach') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: t('command.forEach.end') }
		];
	}
});
