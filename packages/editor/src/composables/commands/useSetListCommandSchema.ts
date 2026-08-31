/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
						values += Command.setStringColor!(`"${String(string)}"`);
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

export function useSetListCommandSchema() {
	const { form, load, commit } = useCommandSchema('setList', {
		onLoad() {
			getFocus(document.getElementById('setList-variable'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const variable = params.variable ?? { type: 'local', key: '' };
		const operation = (params.operation ?? 'set-empty') as string;
		const list = (params.list ?? []) as number[] | string[];
		const index = (params.index ?? 0) as number;
		const constant = (params.constant ?? 0) as number | string | boolean;
		const operand = params.operand ?? { type: 'local', key: '' };
		const separator = (params.separator ?? '') as string;
		const groupId = (params.groupId ?? '') as string;
		const actor = params.actor ?? { type: 'trigger' };
		const skipCheck = (params.skipCheck ?? true) as boolean;
		let numbers: number[] = [];
		let strings: string[] = [];
		let boolVal = false;
		let numVal = 0;
		let strVal = '';
		let attrGroupId = '';
		let enumGroupId = '';
		switch (operation) {
			case 'set-numbers':
				numbers = list as number[];
				break;
			case 'set-strings':
				strings = list as string[];
				break;
			case 'set-boolean':
				boolVal = constant as boolean;
				break;
			case 'set-number':
				numVal = constant as number;
				break;
			case 'set-string':
				strVal = constant as string;
				break;
			case 'get-attribute-names':
			case 'get-attribute-keys':
				attrGroupId = groupId;
				break;
			case 'get-enum-names':
			case 'get-enum-values':
				enumGroupId = groupId;
				break;
		}
		load({
			variable: variable as { type: string; key: string },
			operation,
			numbers,
			strings,
			index,
			boolean: boolVal,
			number: numVal,
			string: strVal,
			operand: operand as { type: string; key: string },
			separator,
			attributeGroupId: attrGroupId,
			enumGroupId: enumGroupId,
			actor: actor as { type: string },
			indexSkipCheck: skipCheck
		});
	};
	const onSave = (): void => {
		const variable = form.variable;
		if (VariableGetter.isNone!(variable as { key: string })) {
			return getFocus(document.getElementById('setList-variable'));
		}
		const operation = form.operation as string;
		switch (operation) {
			case 'set-empty':
				commit({ variable, operation });
				break;
			case 'set-numbers': {
				const list = form.numbers as number[];
				if (list.length === 0) {
					return getFocus(document.getElementById('setList-numbers'));
				}
				commit({ variable, operation, list });
				break;
			}
			case 'set-strings': {
				const list = form.strings as string[];
				if (list.length === 0) {
					return getFocus(document.getElementById('setList-strings'));
				}
				commit({ variable, operation, list });
				break;
			}
			case 'set-boolean': {
				const index = form.index as number;
				const skipCheck = form.indexSkipCheck as boolean;
				const constant = form.boolean;
				commit({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-number': {
				const index = form.index as number;
				const skipCheck = form.indexSkipCheck as boolean;
				const constant = form.number;
				commit({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-string': {
				const index = form.index as number;
				const skipCheck = form.indexSkipCheck as boolean;
				const constant = form.string;
				commit({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-variable': {
				const index = form.index as number;
				const skipCheck = form.indexSkipCheck as boolean;
				const operand = form.operand;
				if (VariableGetter.isNone!(operand as { key: string })) {
					return getFocus(document.getElementById('setList-operand'));
				}
				commit({ variable, operation, index, operand, skipCheck });
				break;
			}
			case 'split-string': {
				const operand = form.operand;
				if (VariableGetter.isNone!(operand as { key: string })) {
					return getFocus(document.getElementById('setList-operand'));
				}
				const separator = form.separator as string;
				commit({ variable, operation, operand, separator });
				break;
			}
			case 'push':
			case 'remove': {
				const operand = form.operand;
				if (VariableGetter.isNone!(operand as { key: string })) {
					return getFocus(document.getElementById('setList-operand'));
				}
				commit({ variable, operation, operand });
				break;
			}
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const groupId = form.attributeGroupId as string;
				if (groupId === '') {
					return getFocus(document.getElementById('setList-attribute-groupId'));
				}
				commit({ variable, operation, groupId });
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const groupId = form.enumGroupId as string;
				if (groupId === '') {
					return getFocus(document.getElementById('setList-enum-groupId'));
				}
				commit({ variable, operation, groupId });
				break;
			}
			case 'get-actor-targets': {
				const actor = form.actor;
				commit({ variable, operation, actor });
				break;
			}
		}
	};
	Command.cases.setList.customLoad = onLoad;
	Command.cases.setList.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
