import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
	onInitialize() {
		$('#setList-operation')?.loadItems?.([
			{ name: 'Set to Empty', value: 'set-empty' },
			{ name: 'Set Numbers', value: 'set-numbers' },
			{ name: 'Set Strings', value: 'set-strings' },
			{ name: 'Set Boolean', value: 'set-boolean' },
			{ name: 'Set Number', value: 'set-number' },
			{ name: 'Set String', value: 'set-string' },
			{ name: 'Set Variable', value: 'set-variable' },
			{ name: 'Split String', value: 'split-string' },
			{ name: 'Push', value: 'push' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Get Attribute Names', value: 'get-attribute-names' },
			{ name: 'Get Attribute Keys', value: 'get-attribute-keys' },
			{ name: 'Get Enumeration Names', value: 'get-enum-names' },
			{ name: 'Get Enumeration Values', value: 'get-enum-values' },
			{ name: 'Get Actor Targets', value: 'get-actor-targets' }
		]);
		$('#setList-operation')
			?.enableHiddenMode?.()
			?.relate?.([
				{ case: 'set-numbers', targets: [$('#setList-numbers')] },
				{ case: 'set-strings', targets: [$('#setList-strings')] },
				{
					case: 'set-boolean',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-boolean')
					]
				},
				{
					case: 'set-number',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-number')
					]
				},
				{
					case: 'set-string',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-string')
					]
				},
				{
					case: 'set-variable',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-operand')
					]
				},
				{
					case: 'split-string',
					targets: [$('#setList-operand'), $('#setList-separator')]
				},
				{ case: ['push', 'remove'], targets: [$('#setList-operand')] },
				{
					case: ['get-attribute-names', 'get-attribute-keys'],
					targets: [$('#setList-attribute-groupId')]
				},
				{
					case: ['get-enum-names', 'get-enum-values'],
					targets: [$('#setList-enum-groupId')]
				},
				{ case: 'get-actor-targets', targets: [$('#setList-actor')] }
			]);
		$('#setList-boolean')?.loadItems?.([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
	},
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
					info += `, ${Local.get!('command.setList.skipCheck')}`;
				}
				break;
			case 'set-number':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber!(index) + Token(']')
				} ${equal} ${Command.setNumberColor!(constant)}`;
				if (skipCheck) {
					info += `, ${Local.get!('command.setList.skipCheck')}`;
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
					info += `, ${Local.get!('command.setList.skipCheck')}`;
				}
				break;
			}
			case 'set-variable':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber!(index) + Token(']')
				} ${equal} ${Command.parseVariable!(operand, 'any')}`;
				if (skipCheck) {
					info += `, ${Local.get!('command.setList.skipCheck')}`;
				}
				break;
			case 'split-string': {
				const label = Local.get!('command.setList.split-string');
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
				const label = Local.get!('command.setList.' + operation);
				const group = Command.parseAttributeGroup!(groupId);
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`;
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const label = Local.get!('command.setList.' + operation);
				const group = Command.parseEnumGroup!(groupId);
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`;
				break;
			}
			case 'get-actor-targets': {
				const label = Local.get!('command.setList.' + operation);
				const actorInfo = Command.parseActor!(actor);
				info = `${varName} ${equal} ${label}${Token('(')}${actorInfo}${Token(')')}`;
				break;
			}
		}
		return [
			{ color: 'variable' },
			{ text: Local.get!('command.setList.alias') + ' ' },
			{ color: 'restore' },
			{ text: info }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operation = 'set-empty',
		list = [],
		index = 0,
		constant = 0 as number | string | boolean,
		operand = { type: 'local', key: '' },
		separator = '',
		groupId = '',
		actor = { type: 'trigger' },
		skipCheck = true
	}: {
		variable: unknown;
		operation: string;
		list: number[] | string[];
		index: unknown;
		constant: number | string | boolean;
		operand: unknown;
		separator: unknown;
		groupId: string;
		actor: unknown;
		skipCheck: unknown;
	}) {
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
		const setForm = (
			$('#setList') as
				| (HTMLElement & { setForm?: (data: Partial<SetListForm>) => void })
				| null
		)?.setForm;
		setForm?.({
			variable: variable as { type: string; key: string },
			operation,
			numbers,
			strings,
			index: index as number,
			boolean: boolVal,
			number: numVal,
			string: strVal,
			operand: operand as { type: string; key: string },
			separator: separator as string,
			attributeGroupId: attrGroupId,
			enumGroupId: enumGroupId,
			actor: actor as { type: string },
			indexSkipCheck: skipCheck as boolean
		});
		getFocus($('#setList-variable'));
	},
	customSave() {
		const getForm = ($('#setList') as (HTMLElement & { getForm?: () => SetListForm }) | null)
			?.getForm;
		const form = getForm?.() ?? ({} as SetListForm);
		const variable = form.variable;
		if (VariableGetter.isNone!(variable)) {
			return getFocus($('#setList-variable'));
		}
		const operation = form.operation;
		switch (operation) {
			case 'set-empty':
				Command.save!({ variable, operation });
				break;
			case 'set-numbers': {
				const list = form.numbers;
				if (list.length === 0) {
					return getFocus($('#setList-numbers'));
				}
				Command.save!({ variable, operation, list });
				break;
			}
			case 'set-strings': {
				const list = form.strings;
				if (list.length === 0) {
					return getFocus($('#setList-strings'));
				}
				Command.save!({ variable, operation, list });
				break;
			}
			case 'set-boolean': {
				const index = form.index;
				const skipCheck = form.indexSkipCheck;
				const constant = form.boolean;
				Command.save!({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-number': {
				const index = form.index;
				const skipCheck = form.indexSkipCheck;
				const constant = form.number;
				Command.save!({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-string': {
				const index = form.index;
				const skipCheck = form.indexSkipCheck;
				const constant = form.string;
				Command.save!({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-variable': {
				const index = form.index;
				const skipCheck = form.indexSkipCheck;
				const operand = form.operand;
				if (VariableGetter.isNone!(operand)) {
					return getFocus($('#setList-operand'));
				}
				Command.save!({ variable, operation, index, operand, skipCheck });
				break;
			}
			case 'split-string': {
				const operand = form.operand;
				if (VariableGetter.isNone!(operand)) {
					return getFocus($('#setList-operand'));
				}
				const separator = form.separator;
				Command.save!({ variable, operation, operand, separator });
				break;
			}
			case 'push':
			case 'remove': {
				const operand = form.operand;
				if (VariableGetter.isNone!(operand)) {
					return getFocus($('#setList-operand'));
				}
				Command.save!({ variable, operation, operand });
				break;
			}
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const groupId = form.attributeGroupId;
				if (groupId === '') {
					return getFocus($('#setList-attribute-groupId'));
				}
				Command.save!({ variable, operation, groupId });
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const groupId = form.enumGroupId;
				if (groupId === '') {
					return getFocus($('#setList-enum-groupId'));
				}
				Command.save!({ variable, operation, groupId });
				break;
			}
			case 'get-actor-targets': {
				const actor = form.actor;
				Command.save!({ variable, operation, actor });
				break;
			}
		}
	}
});
