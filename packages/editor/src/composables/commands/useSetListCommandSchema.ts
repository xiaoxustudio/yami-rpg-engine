import '@app/legacy/module/command/setList.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetListCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('setList', {
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
		const variable = read(document.getElementById('setList-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			return getFocus(document.getElementById('setList-variable'));
		}
		const operation = (read(document.getElementById('setList-operation')) ??
			form.operation) as string;
		switch (operation) {
			case 'set-empty':
				commit({ variable, operation });
				break;
			case 'set-numbers': {
				const list = (read(document.getElementById('setList-numbers')) ??
					form.numbers) as number[];
				if (list.length === 0) {
					return getFocus(document.getElementById('setList-numbers'));
				}
				commit({ variable, operation, list });
				break;
			}
			case 'set-strings': {
				const list = (read(document.getElementById('setList-strings')) ??
					form.strings) as string[];
				if (list.length === 0) {
					return getFocus(document.getElementById('setList-strings'));
				}
				commit({ variable, operation, list });
				break;
			}
			case 'set-boolean': {
				const index = (read(document.getElementById('setList-index')) ??
					form.index) as number;
				const skipCheck = (read(document.getElementById('setList-index-skip-check')) ??
					form.indexSkipCheck) as boolean;
				const constant = read(document.getElementById('setList-boolean')) ?? form.boolean;
				commit({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-number': {
				const index = (read(document.getElementById('setList-index')) ??
					form.index) as number;
				const skipCheck = (read(document.getElementById('setList-index-skip-check')) ??
					form.indexSkipCheck) as boolean;
				const constant = read(document.getElementById('setList-number')) ?? form.number;
				commit({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-string': {
				const index = (read(document.getElementById('setList-index')) ??
					form.index) as number;
				const skipCheck = (read(document.getElementById('setList-index-skip-check')) ??
					form.indexSkipCheck) as boolean;
				const constant = read(document.getElementById('setList-string')) ?? form.string;
				commit({ variable, operation, index, constant, skipCheck });
				break;
			}
			case 'set-variable': {
				const index = (read(document.getElementById('setList-index')) ??
					form.index) as number;
				const skipCheck = (read(document.getElementById('setList-index-skip-check')) ??
					form.indexSkipCheck) as boolean;
				const operand = read(document.getElementById('setList-operand')) ?? form.operand;
				if (VariableGetter.isNone!(operand)) {
					return getFocus(document.getElementById('setList-operand'));
				}
				commit({ variable, operation, index, operand, skipCheck });
				break;
			}
			case 'split-string': {
				const operand = read(document.getElementById('setList-operand')) ?? form.operand;
				if (VariableGetter.isNone!(operand)) {
					return getFocus(document.getElementById('setList-operand'));
				}
				const separator = (read(document.getElementById('setList-separator')) ??
					form.separator) as string;
				commit({ variable, operation, operand, separator });
				break;
			}
			case 'push':
			case 'remove': {
				const operand = read(document.getElementById('setList-operand')) ?? form.operand;
				if (VariableGetter.isNone!(operand)) {
					return getFocus(document.getElementById('setList-operand'));
				}
				commit({ variable, operation, operand });
				break;
			}
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const groupId = (read(document.getElementById('setList-attribute-groupId')) ??
					form.attributeGroupId) as string;
				if (groupId === '') {
					return getFocus(document.getElementById('setList-attribute-groupId'));
				}
				commit({ variable, operation, groupId });
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const groupId = (read(document.getElementById('setList-enum-groupId')) ??
					form.enumGroupId) as string;
				if (groupId === '') {
					return getFocus(document.getElementById('setList-enum-groupId'));
				}
				commit({ variable, operation, groupId });
				break;
			}
			case 'get-actor-targets': {
				const actor = read(document.getElementById('setList-actor')) ?? form.actor;
				commit({ variable, operation, actor });
				break;
			}
		}
	};
	Command.cases.setList.customLoad = onLoad;
	Command.cases.setList.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
