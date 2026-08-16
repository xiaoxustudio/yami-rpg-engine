import '@/module/command/setBoolean.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';

const writeHandler = (event: { value: string }): void => {
	let filter = 'all';
	switch (event.value) {
		case 'variable':
			filter = 'boolean';
			break;
		case 'list':
			filter = 'object';
			break;
	}
	const element = $('#setBoolean-common-variable');
	if (element) {
		element.filter = filter;
	}
};

const load = ({
	variable = { type: 'local', key: '' },
	operation = 'set',
	operand = { type: 'constant', value: false }
}: {
	variable?: unknown;
	operation?: string;
	operand?: {
		type: string;
		value?: boolean;
		variable?: { type: string; key: string };
		index?: number;
		key?: string;
		script?: string;
	};
} = {}): void => {
	const write = getElementWriter('setBoolean');
	let constantValue = false;
	let commonVariable = { type: 'local', key: '' };
	let listIndex = 0;
	let parameterKey = '';
	let script = '';
	const op = operand ?? ({ type: 'constant', value: false } as typeof operand);
	switch (op.type) {
		case 'constant':
			constantValue = op.value!;
			break;
		case 'variable':
			commonVariable = op.variable!;
			break;
		case 'list':
			commonVariable = op.variable!;
			listIndex = op.index!;
			break;
		case 'parameter':
			parameterKey = op.key!;
			break;
		case 'script':
			script = op.script!;
			break;
	}
	write('variable', variable);
	write('operation', operation);
	write('operand-type', operand.type);
	write('constant-value', constantValue);
	write('common-variable', commonVariable);
	write('list-index', listIndex);
	write('parameter-key', parameterKey);
	write('script', script);
	getFocus($('#setBoolean-variable'));
};

const save = (): unknown => {
	const read = getElementReader('setBoolean');
	const variable = read('variable');
	if (VariableGetter.isNone!(variable)) {
		return getFocus($('#setBoolean-variable'));
	}
	const operation = read('operation');
	const type = read('operand-type');
	let operand;
	switch (type) {
		case 'constant': {
			const value = read('constant-value');
			operand = { type, value };
			break;
		}
		case 'variable': {
			const commonVariable = read('common-variable');
			if (VariableGetter.isNone!(commonVariable)) {
				return getFocus($('#setBoolean-common-variable'));
			}
			operand = { type, variable: commonVariable };
			break;
		}
		case 'list': {
			const commonVariable = read('common-variable');
			if (VariableGetter.isNone!(commonVariable)) {
				return getFocus($('#setBoolean-common-variable'));
			}
			const index = read('list-index');
			operand = { type, variable: commonVariable, index };
			break;
		}
		case 'parameter': {
			const key = read('parameter-key');
			if (key === '') {
				return getFocus($('#setBoolean-parameter-key'));
			}
			operand = { type, key };
			break;
		}
		case 'script': {
			const script = read('script').trim();
			if (script === '') {
				return getFocus($('#setBoolean-script'));
			}
			operand = { type, script };
			break;
		}
	}
	Command.save?.({ variable, operation, operand });
};

const schema = Command.cases.setBoolean;
schema.writeHandler = writeHandler;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSetBooleanCommandSchema() {
	return { load, save, writeHandler };
}
