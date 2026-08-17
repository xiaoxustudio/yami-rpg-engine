import '@app/legacy/module/command/setBoolean.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});

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
	form.variable = variable;
	form.operation = operation;
	form['operand-type'] = operand.type;
	form['constant-value'] = constantValue;
	form['common-variable'] = commonVariable;
	form['list-index'] = listIndex;
	form['parameter-key'] = parameterKey;
	form.script = script;
	write($('#setBoolean-variable'), form.variable);
	write($('#setBoolean-operation'), form.operation);
	write($('#setBoolean-operand-type'), form['operand-type']);
	write($('#setBoolean-constant-value'), form['constant-value']);
	write($('#setBoolean-common-variable'), form['common-variable']);
	write($('#setBoolean-list-index'), form['list-index']);
	write($('#setBoolean-parameter-key'), form['parameter-key']);
	write($('#setBoolean-script'), form.script);
	getFocus($('#setBoolean-variable'));
};

const save = (): unknown => {
	const variable = read($('#setBoolean-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable as any)) {
		return getFocus($('#setBoolean-variable'));
	}
	const operation = read($('#setBoolean-operation')) ?? form.operation;
	const type = read($('#setBoolean-operand-type')) ?? form['operand-type'];
	let operand;
	switch (type) {
		case 'constant': {
			const value = read($('#setBoolean-constant-value')) ?? form['constant-value'];
			operand = { type, value };
			break;
		}
		case 'variable': {
			const commonVariable =
				read($('#setBoolean-common-variable')) ?? form['common-variable'];
			if (VariableGetter.isNone!(commonVariable as any)) {
				return getFocus($('#setBoolean-common-variable'));
			}
			operand = { type, variable: commonVariable };
			break;
		}
		case 'list': {
			const commonVariable =
				read($('#setBoolean-common-variable')) ?? form['common-variable'];
			if (VariableGetter.isNone!(commonVariable as any)) {
				return getFocus($('#setBoolean-common-variable'));
			}
			const index = read($('#setBoolean-list-index')) ?? form['list-index'];
			operand = { type, variable: commonVariable, index };
			break;
		}
		case 'parameter': {
			const key = read($('#setBoolean-parameter-key')) ?? form['parameter-key'];
			if (key === '') {
				return getFocus($('#setBoolean-parameter-key'));
			}
			operand = { type, key };
			break;
		}
		case 'script': {
			const script = ((read($('#setBoolean-script')) ?? form.script) as string).trim();
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
