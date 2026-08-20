import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

export interface SetListForm {
	variable: { type: string; key: string };
	operation: string;
	numbers: number[];
	strings: string[];
	index: number;
	boolean: boolean;
	number: number;
	string: string;
	operand: { type: string; key: string };
	separator: string;
	attributeGroupId: string;
	enumGroupId: string;
	actor: { type: string };
	indexSkipCheck: boolean;
}

Command.cases.setList = new CommandSchema({
	name: 'setList',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'operation', default: 'set-empty' },
		{ key: 'numbers', default: [] },
		{ key: 'strings', default: [] },
		{ key: 'index', default: 0 },
		{ key: 'boolean', default: false },
		{ key: 'number', default: 0 },
		{ key: 'string', default: '' },
		{ key: 'operand', default: { type: 'local', key: '' } },
		{ key: 'separator', default: '' },
		{ key: 'attributeGroupId', domId: 'attribute-groupId', default: '' },
		{ key: 'enumGroupId', domId: 'enum-groupId', default: '' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'indexSkipCheck', domId: 'index-skip-check', default: true }
	],
	customParse({
		variable,
		operation,
		list,
		index,
		constant,
		operand,
		separator,
		groupId,
		actor,
		skipCheck = true
	}: {
		variable: unknown;
		operation: string;
		list: unknown[];
		index: unknown;
		constant: unknown;
		operand: unknown;
		separator: unknown;
		groupId: unknown;
		actor: unknown;
		skipCheck: unknown;
	}) {
		let info;
		let isLeftValue = true;
		switch (operation) {
			case 'set-boolean':
			case 'set-number':
			case 'set-string':
			case 'set-variable':
			case 'push':
			case 'remove':
				isLeftValue = false;
				break;
		}
		const varName = Command.parseVariable!(variable, 'object', isLeftValue);
		const equal = Command.setOperatorColor!('=');
		switch (operation) {
			case 'set-empty':
				info = `${varName} ${equal} ${Token('[') + Token(']')}`;
				break;
			case 'set-numbers': {
				let values = '';
				if (list.length !== 0) {
					for (const number of list) {
						if (values !== '') {
							values += Token(', ');
						}
						values += Command.setNumberColor!(number);
					}
				}
				info = `${varName} ${equal} ${Token('[') + values + Token(']')}`;
				break;
			}
			case 'set-strings': {
				let values = '';
				if (list.length !== 0) {
					for (const string of list) {
						if (values !== '') {
							values += Token(', ');
						}
						values += Command.setStringColor!(`"${string}"`);
					}
					values = Command.parseMultiLineString!(values);
				}
				info = `${varName} ${equal} ${Token('[') + values + Token(']')}`;
				break;
			}
			case 'set-boolean':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber!(index) + Token(']')
				} ${equal} ${Command.setBooleanColor!(constant)}`;
				if (skipCheck) {
					info += `, ${t('command.setList.skipCheck')}`;
				}
				break;
			case 'set-number':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber!(index) + Token(']')
				} ${equal} ${Command.setNumberColor!(constant)}`;
				if (skipCheck) {
					info += `, ${t('command.setList.skipCheck')}`;
				}
				break;
			case 'set-string': {
				const string = Command.setStringColor!(
					'"' + Command.parseMultiLineString!(constant) + '"'
				);
				info = `${varName}${
					Token('[') + Command.parseVariableNumber!(index) + Token(']')
				} ${equal} ${string}`;
				if (skipCheck) {
					info += `, ${t('command.setList.skipCheck')}`;
				}
				break;
			}
			case 'set-variable':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber!(index) + Token(']')
				} ${equal} ${Command.parseVariable!(operand, 'any')}`;
				if (skipCheck) {
					info += `, ${t('command.setList.skipCheck')}`;
				}
				break;
			case 'split-string': {
				const label = t('command.setList.split-string');
				const text1 = Command.parseVariable!(operand, 'string');
				const text2 = Command.parseVariableString!(separator);
				const comma = Command.setDelimiterColor!(', ');
				info = `${varName} ${equal} ${label}${Token(
					'('
				)}${text1}${comma}${text2}${Token(')')}`;
				break;
			}
			case 'push':
				info = `${varName} ${Command.setOperatorColor!(
					'+='
				)} ${Command.parseVariable!(operand, 'any')}`;
				break;
			case 'remove':
				info = `${varName} ${Command.setOperatorColor!(
					'-='
				)} ${Command.parseVariable!(operand, 'any')}`;
				break;
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const label = t('command.setList.' + operation);
				const group = Command.parseAttributeGroup!(groupId);
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`;
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const label = t('command.setList.' + operation);
				const group = Command.parseEnumGroup!(groupId);
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`;
				break;
			}
			case 'get-actor-targets': {
				const label = t('command.setList.' + operation);
				const actorInfo = Command.parseActor!(actor);
				info = `${varName} ${equal} ${label}${Token('(')}${actorInfo}${Token(')')}`;
				break;
			}
		}
		return [
			{ color: 'variable' },
			{ text: t('command.setList.alias') + ' ' },
			{ color: 'restore' },
			{ text: info }
		];
	}
});
